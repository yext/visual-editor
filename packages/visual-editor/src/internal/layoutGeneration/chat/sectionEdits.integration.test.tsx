import { Puck, useGetPuck, type Config } from "@puckeditor/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  SectionEditResult,
  SectionEditTask,
} from "../workflows/edits/types.ts";
import { chatConfig, layout } from "../testing/chatFixtures.tsx";
import { LayoutGenerationChatBridge } from "./LayoutGenerationChatBridge.tsx";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { LayoutGenerationChatContext } from "./contexts.tsx";

const task = (taskId: string, sectionId = "heading"): SectionEditTask => ({
  taskId,
  sectionId,
  targetComponentIds: [sectionId],
  instructions: "Update copy",
  structuralOperations: [],
  dependsOn: [],
});
const result = (task: SectionEditTask, text: string): SectionEditResult => ({
  taskId: task.taskId,
  sectionId: task.sectionId,
  operations: [
    {
      kind: "update",
      componentId: task.sectionId,
      changes: [{ kind: "set", path: "/text", value: text }],
    },
  ],
});
const mountEditor = async (config: Config = chatConfig) => {
  const canvas = new LayoutGenerationChatCanvas();
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Capture = () => {
    getPuck = useGetPuck();
    return null;
  };
  const data = layout();
  data.content[0].props.content.push({
    type: "Heading",
    props: { id: "second", text: "Second" },
  });
  render(
    <LayoutGenerationChatContext.Provider value={canvas}>
      <Puck config={config} data={data} iframe={{ enabled: false }}>
        <LayoutGenerationChatBridge streamDocument={{ locale: "en" }} />
        <Puck.Preview />
        <Capture />
      </Puck>
    </LayoutGenerationChatContext.Provider>
  );
  await waitFor(() => expect(canvas.ready).toBe(true));
  return { canvas, puck: () => getPuck() };
};

describe("section edits through the Puck bridge", () => {
  it("keeps successive section commits and gives each its own undo and redo step", async () => {
    const { canvas, puck } = await mountEditor();
    const first = task("first");
    const second = task("second", "second");
    canvas.begin();
    await act(async () => {
      await Promise.all([
        canvas.commitSection(first, result(first, "First applied")),
        canvas.commitSection(second, result(second, "Second applied")),
      ]);
    });
    expect(screen.getByText("First applied")).toBeTruthy();
    expect(screen.getByText("Second applied")).toBeTruthy();
    expect(puck().history.histories).toHaveLength(3);
    expect(puck().history.index).toBe(2);
    canvas.finish();
    await act(async () => puck().history.back());
    expect(screen.getByText("First applied")).toBeTruthy();
    expect(screen.getByText("Second")).toBeTruthy();
    await act(async () => puck().history.back());
    expect(screen.getByText("Original")).toBeTruthy();
    await act(async () => puck().history.forward());
    await act(async () => puck().history.forward());
    expect(screen.getByText("First applied")).toBeTruthy();
    expect(screen.getByText("Second applied")).toBeTruthy();
  });

  it("reads selected descendants before commits clear selection and labels repeated sections by position", async () => {
    const { canvas, puck } = await mountEditor();
    await act(async () =>
      puck().dispatch({
        type: "setUi",
        ui: { itemSelector: { zone: "main:content", index: 1 } },
      })
    );
    expect(canvas.selectedComponentId).toBe("second");
    expect(canvas.sectionLabels).toEqual({
      heading: "Section 1 · Heading",
      second: "Section 2 · Heading",
    });
    const selected = canvas.selectedComponentId;
    canvas.begin();
    const edit = task("first");
    await act(async () => canvas.commitSection(edit, result(edit, "Applied")));
    expect(canvas.selectedComponentId).toBeNull();
    expect(selected).toBe("second");
    canvas.finish();
  });

  it("preserves earlier history when a later section resolver fails", async () => {
    const { canvas, puck } = await mountEditor({
      components: {
        ...chatConfig.components,
        Heading: {
          ...chatConfig.components.Heading,
          resolveData: (data) => {
            if (data.props.text === "Fail") {
              throw new Error("Section resolver failed");
            }
            return { props: data.props };
          },
        },
      },
    });
    const first = task("first");
    const second = task("failed", "second");
    canvas.begin();
    await act(async () => {
      await canvas.commitSection(first, result(first, "Applied"));
    });
    await act(async () => {
      await expect(
        canvas.commitSection(second, result(second, "Fail"))
      ).rejects.toThrow("Section resolver failed");
    });
    expect(screen.getByText("Applied")).toBeTruthy();
    expect(screen.getByText("Second")).toBeTruthy();
    expect(puck().history.histories).toHaveLength(2);
    expect(puck().history.index).toBe(1);
    canvas.finish();
  });

  it("deduplicates inserted sections", async () => {
    const { canvas, puck } = await mountEditor();
    const insertTask: SectionEditTask = {
      ...task("insert", "reserved-section"),
      targetComponentIds: [],
      structuralOperations: [
        {
          kind: "insert",
          insertionKey: "new-heading",
          componentType: "Heading",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
        },
      ],
    };
    const insertResult: SectionEditResult = {
      taskId: insertTask.taskId,
      sectionId: insertTask.sectionId,
      operations: [
        {
          kind: "insert",
          insertionKey: "new-heading",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
          component: {
            type: "Heading",
            authoredValues: { text: "Inserted" },
            slots: [],
          },
        },
      ],
    };
    canvas.begin();
    await act(async () => {
      expect(await canvas.commitSection(insertTask, insertResult)).toBe(true);
      expect(await canvas.commitSection(insertTask, insertResult)).toBe(false);
    });
    expect(screen.getAllByText("Inserted")).toHaveLength(1);
    expect(puck().history.histories).toHaveLength(2);
    canvas.finish();
  });

  it("rejects updates disabled by the editor's component permissions", async () => {
    const { canvas, puck } = await mountEditor({
      components: {
        ...chatConfig.components,
        Heading: {
          ...chatConfig.components.Heading,
          permissions: { edit: false },
        },
      },
    });
    const editTask = task("protected");
    canvas.begin();
    await act(async () => {
      await expect(
        canvas.commitSection(editTask, result(editTask, "Forbidden"))
      ).rejects.toThrow("permission denied");
    });
    expect(screen.getByText("Original")).toBeTruthy();
    expect(puck().history.histories).toHaveLength(1);
    canvas.finish();
  });
});

vi.mock(
  "../../../local-editor/generationDiagnostics.ts",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../local-editor/generationDiagnostics.ts")
    >()),
    reportChatDiagnostic: vi.fn(),
  })
);
