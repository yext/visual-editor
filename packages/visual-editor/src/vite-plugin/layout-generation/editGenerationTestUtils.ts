import { EventEmitter } from "node:events";
import { vi } from "vitest";
import { z } from "zod";
import type {
  Content,
  SavedComponent,
} from "../../internal/generation/authored.ts";
import type {
  PlannedStructureEdit,
  SectionEditTask,
} from "../../internal/generation/editProtocol.ts";
import {
  createPuckGenerationCatalog,
  type GenerationComponent,
} from "./puckGenerationCatalog.ts";

/** A repeated-card catalog with bindings, translations and opaque content. */
export const editGenerationFixture = () => {
  const components: Record<string, GenerationComponent> = {
    Header: {
      generation: { props: z.object({ text: z.string() }) },
      defaultProps: { text: "Header" },
    },
    Footer: {
      generation: { props: z.object({ text: z.string() }) },
      defaultProps: { text: "Footer" },
    },
    Section: {
      description: "A titled group of cards",
      generation: {
        props: z.object({ title: z.string(), cards: z.array(z.unknown()) }),
      },
      fields: { cards: { type: "slot", allow: ["Card", "Opaque"] } },
      defaultProps: { title: "Default section", cards: [] },
    },
    Card: {
      nestedOnly: true,
      description: "A card with localized copy and an entity binding",
      generation: {
        props: z.object({
          text: z.object({ defaultValue: z.string() }).catchall(z.string()),
          binding: z.object({
            field: z.string(),
            constantValueEnabled: z.boolean(),
          }),
          optional: z.string().nullable().optional(),
          rows: z.array(
            z.object({ label: z.string(), note: z.string().optional() })
          ),
          style: z.object({ color: z.enum(["red", "blue"]) }),
        }),
      },
      defaultProps: {
        text: { defaultValue: "Default", fr: "Défaut" },
        binding: { field: "name", constantValueEnabled: false },
        optional: "Library default",
        rows: [{ label: "Default row", note: "Default note", hidden: true }],
        style: { color: "blue" },
      },
    },
    Opaque: { description: "Existing opaque content" },
    Unrelated: {
      generation: { props: z.object({ unrelatedValue: z.string() }) },
    },
  };
  const card = (componentId: string, text: string): SavedComponent => ({
    type: "Card",
    props: {
      id: componentId,
      text: { defaultValue: text, fr: "Traduction" },
      binding: { field: "name", constantValueEnabled: false },
      optional: "Existing",
      rows: [
        { label: "Old row", note: "Old note", hidden: "Existing row metadata" },
      ],
      style: { color: "red" },
      editorMetadata: "Private",
    },
  });
  const data: Content & { root: { props: { theme: string } } } = {
    root: { props: { theme: "Private root setting" } },
    zones: { empty: [] },
    content: [
      { type: "Header", props: { id: "header", text: "Header" } },
      {
        type: "MainContent",
        props: {
          id: "main",
          content: [
            {
              type: "Section",
              props: {
                id: "first",
                title: "First section",
                cards: [
                  card("first-a", "First card"),
                  card("first-b", "Second card"),
                ],
              },
            },
            {
              type: "Section",
              props: {
                id: "second",
                title: "Second section",
                cards: [
                  card("second-a", "Third card"),
                  card("second-b", "Fourth card"),
                ],
              },
            },
          ],
        },
      },
      { type: "Footer", props: { id: "footer", text: "Footer" } },
    ],
  };
  return {
    components,
    data,
    get catalog() {
      return createPuckGenerationCatalog(components);
    },
  };
};

/** Make a content task, optionally including structural work. */
export const editTask = (
  sectionId = "first",
  targetComponentIds = ["first-a"],
  structuralOperations: PlannedStructureEdit[] = []
): SectionEditTask => ({
  taskId: `task-${sectionId}`,
  sectionId,
  targetComponentIds,
  structuralOperations,
  instructions: "Update the requested copy",
  description: "Improve the wording.",
  dependsOn: [],
  generateContent: true,
});

/** Build a planning response without generated component values. */
export const editPlan = (tasks = [editTask()]) => ({
  intent: "content" as const,
  text: "Planned",
  clarification: null,
  globalStyleGuidance: null,
  sharedIntent: "Consistent copy",
  tasks,
});

/** Build a section response for an explicit path assignment. */
export const editResponse = (
  task = editTask(),
  path = "/text/defaultValue",
  value: unknown = "Updated"
) => ({
  taskId: task.taskId,
  sectionId: task.sectionId,
  updates: [
    {
      kind: "update",
      componentId: task.targetComponentIds[0],
      changes: [{ kind: "set", path, value }],
    },
  ],
  insertions: [],
});

/** Complete a gateway request with the token counts used by integration tests. */
export const completed = (output: unknown) =>
  new Response(
    JSON.stringify({
      status: "completed",
      output_text: JSON.stringify(output),
      usage: {
        input_tokens: 20,
        input_tokens_details: { cached_tokens: 8 },
        output_tokens: 10,
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );

/** Model a middleware-parsed request with disconnect events. */
export const generationRequest = (body: unknown) =>
  Object.assign(new EventEmitter(), { method: "POST", headers: {}, body });

/** Capture headers and NDJSON output while retaining spies for server assertions. */
export const generationResponse = () => {
  const headers = new Headers();
  const lines: string[] = [];
  return Object.assign(new EventEmitter(), {
    statusCode: 0,
    destroyed: false,
    headers,
    lines,
    setHeader: vi.fn((key: string, value: string) => headers.set(key, value)),
    flushHeaders: vi.fn(),
    write: vi.fn((line: string) => {
      lines.push(line);
    }),
    end: vi.fn((line?: string) => {
      if (line) lines.push(line);
    }),
  });
};
