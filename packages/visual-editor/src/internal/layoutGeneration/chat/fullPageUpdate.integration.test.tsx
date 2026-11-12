import React from "react";
import { Puck, useGetPuck } from "@puckeditor/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { chatConfig, layout } from "../testing/chatFixtures.tsx";
import { LayoutGenerationChatBridge } from "./LayoutGenerationChatBridge.tsx";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import {
  LayoutGenerationChatContext,
  LayoutGenerationChatUiContext,
} from "./contexts.tsx";
import {
  CardContextProvider,
  useCardContext,
} from "../../../hooks/useCardContext.tsx";
import { slottedFixture } from "../testing/slottedFixtures.ts";
import { validateAuthored } from "../shared/authoredValues.ts";
import { LayoutPuckOverride } from "../../components/LayoutPuckOverride.tsx";
import { TemplatePropsContext } from "../../../hooks/useDocument.tsx";
import { ErrorProvider } from "../../../contexts/ErrorContext.tsx";
import { IntentPageGenerationChatContext } from "./useIntentPageGeneration.ts";
import { IntentPageGenerationWorkflow } from "../workflows/intentPageGeneration/IntentPageGenerationWorkflow.ts";
import { layoutGenerationChatPlugin } from "./LayoutGenerationChatPlugin.tsx";

it("shows Building on the original section before replacing it, then Ready on the result", async () => {
  const canvas = new LayoutGenerationChatCanvas();
  let finishResolution!: () => void;
  let pauseResolution = true;
  const config = {
    ...chatConfig,
    components: {
      ...chatConfig.components,
      Heading: {
        ...chatConfig.components.Heading,
        resolveData: async (data: any) => {
          if (data.props.text === "Updated" && pauseResolution) {
            pauseResolution = false;
            await new Promise<void>((resolve) => {
              finishResolution = resolve;
            });
          }
          return data;
        },
      },
    },
  };
  render(
    <LayoutGenerationChatContext.Provider value={canvas}>
      <Puck config={config} data={layout()} iframe={{ enabled: false }}>
        <LayoutGenerationChatBridge streamDocument={{ locale: "en" }} />
        <Puck.Preview />
      </Puck>
    </LayoutGenerationChatContext.Provider>
  );
  await waitFor(() => expect(canvas.ready).toBe(true));
  act(() => {
    canvas.begin();
    canvas.beginFullPageUpdate();
  });
  let pending!: Promise<void>;
  const controller = new AbortController();
  act(() => {
    pending = canvas.applyFullPageUpdate(
      {
        kind: "replace",
        sectionId: "heading",
        sections: [
          { type: "Heading", props: { id: "updated", text: "Updated" } },
        ],
      },
      0,
      controller.signal
    );
  });
  await waitFor(() => expect(finishResolution).toBeDefined());
  expect(screen.getByText("Original")).toBeTruthy();
  expect(screen.queryByText("Updated")).toBeNull();
  await waitFor(() => {
    expect(
      document.querySelector(".local-editor-generation-section")?.textContent
    ).toContain("Building section");
  });
  await act(async () => {
    finishResolution();
    await pending;
  });
  expect(screen.queryByText("Original")).toBeNull();
  expect(screen.getByText("Updated")).toBeTruthy();
  await waitFor(() => {
    expect(
      document.querySelector(".local-editor-generation-section")?.textContent
    ).toBe("Ready");
  });
  act(() => canvas.finish());
});

it("previews progressive full-page update through Puck and keeps a single undo/redo entry on stop", async () => {
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
  canvas.beginFullPageUpdate();
  const controller = new AbortController();
  await act(async () => {
    await canvas.applyFullPageUpdate(
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
    await canvas.applyFullPageUpdate(
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

it("opens the assistant once for a pending intent generation", async () => {
  const canvas = new LayoutGenerationChatCanvas();
  const workflow = new IntentPageGenerationWorkflow("2", vi.fn(), vi.fn());
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Capture = () => {
    getPuck = useGetPuck();
    return null;
  };
  const renderEditor = (status: "PENDING" | "COMPLETED") => (
    <LayoutGenerationChatContext.Provider value={canvas}>
      <IntentPageGenerationChatContext.Provider
        value={{ workflow, state: workflow.state, eligible: true, status }}
      >
        <Puck
          config={chatConfig}
          data={layout()}
          iframe={{ enabled: false }}
          plugins={[layoutGenerationChatPlugin]}
        >
          <LayoutGenerationChatBridge streamDocument={{ locale: "en" }} />
          <Capture />
        </Puck>
      </IntentPageGenerationChatContext.Provider>
    </LayoutGenerationChatContext.Provider>
  );
  const view = render(renderEditor("PENDING"));
  await waitFor(() => {
    expect(getPuck().appState.ui.plugin.current).toBe(
      layoutGenerationChatPlugin.name
    );
    expect(getPuck().appState.ui.leftSideBarVisible).toBe(true);
  });
  act(() =>
    getPuck().dispatch({
      type: "setUi",
      ui: { plugin: { current: "blocks" }, leftSideBarVisible: false },
    })
  );
  view.rerender(renderEditor("PENDING"));
  expect(getPuck().appState.ui.leftSideBarVisible).toBe(false);
  view.rerender(renderEditor("COMPLETED"));
  expect(getPuck().appState.ui.plugin.current).toBe("blocks");
});

it("keeps shared card effects from racing streamed updates and resumes manual backup synchronization", async () => {
  const f = slottedFixture();
  const canvas = new LayoutGenerationChatCanvas();
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Section = ({ slots: { CardSlot } }: any) => {
    getPuck = useGetPuck();
    return (
      <CardContextProvider>
        <CardSlot />
      </CardContextProvider>
    );
  };
  // Match section-library cards: publish styles to context and replace siblings
  // when shared styles change. Generation must own its authored styles instead.
  const Card = (props: any) => {
    const getPuck = useGetPuck();
    const { sharedCardProps, setSharedCardProps } = useCardContext<{
      color: string;
    }>();
    React.useEffect(() => {
      if (!sharedCardProps || sharedCardProps.color === props.styles.color)
        return;
      const { dispatch, getSelectorForId, getItemBySelector } = getPuck();
      const selector = getSelectorForId(props.id)!;
      const saved = getItemBySelector(selector)!;
      dispatch({
        type: "replace",
        destinationZone: selector.zone,
        destinationIndex: selector.index,
        data: {
          ...saved,
          props: { ...saved.props, styles: { color: sharedCardProps.color } },
        },
      });
    }, [sharedCardProps]);
    React.useEffect(() => {
      if (sharedCardProps?.color === props.styles.color) return;
      setSharedCardProps({ color: props.styles.color });
    }, [props.styles.color]);
    return null;
  };
  f.components.Section.render = Section;
  f.components.FAQCard.render = Card;
  const initial = { root: { props: {} }, content: f.materialize().content };
  const streamDocument = { locale: "en" };
  const config = { components: f.components };
  const tree = (active: boolean) => (
    <ErrorProvider>
      <TemplatePropsContext.Provider value={{ document: streamDocument }}>
        <LayoutGenerationChatUiContext.Provider
          value={
            { chat: { isGeneratingPage: active, isStreaming: active } } as any
          }
        >
          <LayoutGenerationChatContext.Provider value={canvas}>
            <Puck
              config={config}
              data={initial}
              iframe={{ enabled: false }}
              overrides={{ puck: LayoutPuckOverride }}
            />
          </LayoutGenerationChatContext.Provider>
        </LayoutGenerationChatUiContext.Provider>
      </TemplatePropsContext.Provider>
    </ErrorProvider>
  );
  const view = render(tree(false));
  await waitFor(() => expect(canvas.ready).toBe(true));
  view.rerender(tree(true));
  act(() => {
    canvas.begin();
    canvas.beginFullPageUpdate();
  });
  const replacement = f.materialize([
    f.section(
      Array.from({ length: 5 }, (_, index) =>
        f.card(`Card ${index}`, index < 3 ? "pink" : "green")
      )
    ),
  ]).content[0];
  const signal = new AbortController().signal;
  const sectionId = getPuck().appState.data.content[0].props.id;
  await act(async () => {
    await canvas.applyFullPageUpdate(
      { kind: "replace", sectionId, sections: [replacement] },
      0,
      signal
    );
  });
  const props = getPuck().appState.data.content[0].props;
  expect(
    props.slots.CardSlot.map((card: any) => card.props.styles.color)
  ).toEqual(["pink", "pink", "pink", "green", "green"]);
  expect(props.manualSlots.CardSlot).toEqual(props.slots.CardSlot);
  await act(async () => {
    await canvas.applyFullPageUpdate(
      { kind: "keep", sectionId: replacement.props.id },
      1,
      signal
    );
    canvas.finish();
  });
  await act(async () => view.rerender(tree(false)));
  await waitFor(() => {
    const current = getPuck().appState.data.content[0].props;
    expect(current.manualSlots.CardSlot).toEqual(current.slots.CardSlot);
    expect(() =>
      validateAuthored(f.catalog, getPuck().appState.data)
    ).not.toThrow();
  });
  // A real style edit after generation still propagates and updates backups.
  await act(async () => {
    const { dispatch, getSelectorForId, getItemBySelector } = getPuck();
    const selector = getSelectorForId(props.slots.CardSlot[0].props.id)!;
    const saved = getItemBySelector(selector)!;
    dispatch({
      type: "replace",
      destinationZone: selector.zone,
      destinationIndex: selector.index,
      data: {
        ...saved,
        props: { ...saved.props, styles: { color: "purple" } },
      },
    });
  });
  await waitFor(() => {
    const current = getPuck().appState.data.content[0].props;
    expect(
      current.slots.CardSlot.map((card: any) => card.props.styles.color)
    ).toEqual(Array(5).fill("purple"));
    expect(current.manualSlots.CardSlot).toEqual(current.slots.CardSlot);
    expect(() =>
      validateAuthored(f.catalog, getPuck().appState.data)
    ).not.toThrow();
  });
});
