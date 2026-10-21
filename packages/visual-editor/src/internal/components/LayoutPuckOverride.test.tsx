import { useGetPuck } from "@puckeditor/core";
import { act, render, waitFor } from "@testing-library/react";
import React from "react";
import { expect, it } from "vitest";
import { migrationRegistry } from "../../components/migrations/migrationRegistry.ts";
import { LayoutGenerationChatCanvas } from "../generation/chat/LayoutGenerationChatCanvas.ts";
import { LayoutGenerationChatContext } from "../generation/chat/contexts.tsx";
import {
  clone,
  validateAuthored,
} from "../generation/shared/authoredValues.ts";
import { ChatHarness } from "../generation/testing/chatFixtures.tsx";
import { slottedFixture } from "../generation/testing/slottedFixtures.ts";

it("keeps generated cards valid after automatic Puck synchronization and allows a follow-up reorder", async () => {
  const f = slottedFixture();
  let canvas!: LayoutGenerationChatCanvas;
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Capture = () => {
    canvas = React.useContext(LayoutGenerationChatContext)!;
    return null;
  };
  const Section = ({ slots: { CardSlot } }: any) => {
    getPuck = useGetPuck();
    return <CardSlot />;
  };
  const Card = (props: any) => {
    const getPuck = useGetPuck();
    React.useEffect(() => {
      if (props.index < 3 || props.styles.color === "blue") {
        return;
      }
      const { dispatch, getSelectorForId, getItemBySelector } = getPuck();
      const selector = getSelectorForId(props.id)!;
      const savedProps = getItemBySelector(selector)!.props;
      dispatch({
        type: "replace",
        destinationZone: selector.zone,
        destinationIndex: selector.index,
        data: {
          type: "FAQCard",
          props: {
            ...savedProps,
            styles: { color: "blue" },
            slots: {
              BodySlot: savedProps.slots.BodySlot.map((child: any) => ({
                ...child,
                props: { ...child.props, text: "Synchronized body" },
              })),
            },
          },
        },
      });
    }, [getPuck, props.id, props.index, props.styles.color]);
    return null;
  };
  f.components.Section.render = Section;
  f.components.FAQCard.render = Card;
  const initialData = {
    content: f.materialize().content,
    root: { props: { title: "", version: migrationRegistry.length } },
  };
  render(
    <ChatHarness
      config={{ components: f.components }}
      initialData={initialData}
    >
      <Capture />
    </ChatHarness>
  );
  await waitFor(() => expect(canvas.ready).toBe(true));
  canvas.begin();
  canvas.beginCreation();
  await act(async () => {
    await canvas.revealCreation(
      f.materialize([
        f.section(Array.from({ length: 5 }, (_, i) => f.card(`Card ${i}`))),
      ]),
      new AbortController().signal
    );
    canvas.finishCreation();
  });
  await waitFor(() => {
    const data = getPuck().appState.data;
    const props = data.content[0].props;
    expect(props.slots.CardSlot).toHaveLength(5);
    expect(props.slots.CardSlot[3].props.styles.color).toBe("blue");
    expect(props.slots.CardSlot[4].props.slots.BodySlot[0].props.text).toBe(
      "Synchronized body"
    );
    expect(props.manualSlots.CardSlot).toEqual(props.slots.CardSlot);
    expect(() => validateAuthored(f.catalog, data)).not.toThrow();
  });
  const beforeMove = clone(getPuck().appState.data);
  const section = beforeMove.content[0];
  const lastCardId = section.props.slots.CardSlot[4].props.id;
  const historyLength = getPuck().history.histories.length;
  expect(() => validateAuthored(f.catalog, canvas.begin())).not.toThrow();
  await act(async () => {
    await canvas.commitSection({
      taskId: "move-card",
      sectionId: section.props.id,
      targetComponentIds: [lastCardId],
      instructions: "Move the last card to the beginning",
      structuralOperations: [
        {
          kind: "reorder",
          componentId: lastCardId,
          anchor: { position: "start" },
        },
      ],
      dependsOn: [],
    });
  });
  const moved = getPuck().appState.data;
  expect(moved.content[0].props.slots.CardSlot[0].props.id).toBe(lastCardId);
  expect(() => validateAuthored(f.catalog, moved)).not.toThrow();
  expect(getPuck().history.histories).toHaveLength(historyLength + 1);
  canvas.finish();
  await act(async () => getPuck().history.back());
  expect(getPuck().appState.data.content).toEqual(beforeMove.content);
  await act(async () => getPuck().history.forward());
  expect(() =>
    validateAuthored(f.catalog, getPuck().appState.data)
  ).not.toThrow();
  expect(
    getPuck().appState.data.content[0].props.slots.CardSlot[0].props.id
  ).toBe(lastCardId);
});
