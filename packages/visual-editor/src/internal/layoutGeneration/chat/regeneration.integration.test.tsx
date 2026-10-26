import { Puck, useGetPuck } from "@puckeditor/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { chatConfig, layout } from "../testing/chatFixtures.tsx";
import { LayoutGenerationChatBridge } from "./LayoutGenerationChatBridge.tsx";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { LayoutGenerationChatContext } from "./contexts.tsx";

it("previews progressive regeneration through Puck and keeps a single undo/redo entry on stop", async () => {
  const canvas = new LayoutGenerationChatCanvas();
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Capture = () => {
    getPuck = useGetPuck();
    return null;
  };
  const initial = layout();
  initial.content[0].props.content.push(
    { type: "Heading", props: { id: "second", text: "Second" } },
    { type: "Heading", props: { id: "third", text: "Third" } }
  );
  render(
    <LayoutGenerationChatContext.Provider value={canvas}>
      <Puck config={chatConfig} data={initial} iframe={{ enabled: false }}>
        <LayoutGenerationChatBridge streamDocument={{ locale: "en" }} />
        <Puck.Preview />
        <Capture />
      </Puck>
    </LayoutGenerationChatContext.Provider>
  );
  await waitFor(() => expect(canvas.ready).toBe(true));
  canvas.begin();
  canvas.beginRegeneration();
  const controller = new AbortController();
  await act(async () => {
    await canvas.applyRegeneration(
      { kind: "remove", sectionId: "second" },
      0,
      controller.signal
    );
  });
  expect(screen.queryByText("Second")).toBeNull();
  expect(screen.getByText("Original")).toBeTruthy();
  expect(screen.getByText("Third")).toBeTruthy();
  expect(getPuck().history.index).toBe(0);
  await act(async () => {
    await canvas.applyRegeneration(
      {
        kind: "replace",
        sectionId: "heading",
        sections: [{ type: "Heading", props: { id: "new", text: "Product" } }],
      },
      1,
      controller.signal
    );
  });
  expect(screen.queryByText("Original")).toBeNull();
  expect(screen.getByText("Product")).toBeTruthy();
  expect(screen.getByText("Third")).toBeTruthy();
  act(() => {
    controller.abort();
    canvas.finish();
  });
  expect(getPuck().history.index).toBe(1);
  expect(getPuck().history.histories).toHaveLength(2);
  await act(async () => {
    getPuck().history.back();
  });
  expect(screen.getByText("Original")).toBeTruthy();
  expect(screen.getByText("Second")).toBeTruthy();
  expect(screen.queryByText("Product")).toBeNull();
  await act(async () => {
    getPuck().history.forward();
  });
  expect(screen.getByText("Product")).toBeTruthy();
  expect(screen.queryByText("Second")).toBeNull();
  expect(screen.getByText("Third")).toBeTruthy();
});
