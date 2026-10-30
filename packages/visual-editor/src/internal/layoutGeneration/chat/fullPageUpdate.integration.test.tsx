import { Puck, useGetPuck } from "@puckeditor/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { chatConfig, layout } from "../testing/chatFixtures.tsx";
import { LayoutGenerationChatBridge } from "./LayoutGenerationChatBridge.tsx";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { LayoutGenerationChatContext } from "./contexts.tsx";
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
