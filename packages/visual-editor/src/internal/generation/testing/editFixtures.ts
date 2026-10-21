import { z } from "zod";
import {
  createPuckGenerationCatalog,
  type GenerationComponent,
} from "../../../utils/generationCatalog.ts";
import type { PlannedStructureEdit, SectionEditTask } from "../edits/types.ts";
import type { Content, SavedComponent } from "../shared/authoredValues.ts";

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
  translationMode: "defaultOnly",
});

/** Build a planning response without generated component values. */
export const editPlan = (tasks = [editTask()]) => ({
  intent: "content" as const,
  text: "Planned",
  clarification: null,
  globalStyleGuidance: null,
  limitations: null,
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

/** Model-facing fresh-page responses include every required wire field. */
export const creationResponse = (
  content: any[],
  translationMode: "defaultOnly" | "translate" = "defaultOnly"
) => ({
  text: "Created",
  translationMode,
  result: { action: "create", content },
});

export const clarificationResponse = (question: string) => ({
  text: question,
  translationMode: "defaultOnly" as const,
  result: { action: "clarification", question },
});

export const defaults = { $default: true };
export const unset = { $unset: true };
export const insertedCard = () => ({
  type: "Card",
  props: {
    text: defaults,
    binding: defaults,
    optional: unset,
    rows: [{ label: "New row", note: unset }],
    style: defaults,
  },
});
