import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { materializeSectionEdit } from "../workflows/edits/applyEditsToLayout.ts";
import type {
  PlannedStructureEdit,
  SectionEditOperation,
  SectionEditTask,
} from "../workflows/edits/types.ts";
import type { SavedComponent } from "../shared/authoredValues.ts";

export const catalog = () =>
  createPuckGenerationCatalog({
    Header: { generation: { props: z.object({ text: z.string() }) } },
    Footer: { generation: { props: z.object({ text: z.string() }) } },
    Section: {
      generation: {
        props: z.object({ title: z.string(), cards: z.array(z.unknown()) }),
      },
      fields: { cards: { type: "slot", allow: ["Card", "Opaque", "Unknown"] } },
      defaultProps: { title: "Default section", cards: [] },
    },
    Card: {
      nestedOnly: true,
      generation: {
        props: z.object({
          text: z
            .object({ defaultValue: z.string(), fr: z.string().optional() })
            .catchall(z.string()),
          binding: z.object({
            field: z.string(),
            constantValueEnabled: z.boolean(),
          }),
          optional: z.string().nullable().optional(),
          links: z.array(z.object({ label: z.string(), url: z.string() })),
        }),
      },
      defaultProps: {
        text: { defaultValue: "Default card", fr: "Défaut" },
        binding: { field: "name", constantValueEnabled: false },
        links: [],
      },
    },
    Opaque: {},
  });
export const card = (id: string): SavedComponent => ({
  type: "Card",
  props: {
    id,
    text: { defaultValue: id, fr: "Traduction", de: "Übersetzung" },
    binding: { field: "name", constantValueEnabled: false },
    optional: "Old",
    links: [{ label: "Old", url: "/old", hidden: "Do not inherit" }],
    parentData: { id: "parent", untouched: true },
    hidden: { deep: [1, 2] },
  },
  readOnly: { binding: true },
});
const section = (
  id: string,
  cards = [card(`${id}-a`), card(`${id}-b`)]
): SavedComponent => ({
  type: "Section",
  props: { id, title: id, cards, editorOwned: "Keep" },
});
export const page = () => ({
  root: { props: { theme: "Keep", version: 12 } },
  zones: { empty: [] },
  content: [
    { type: "Header", props: { id: "header", text: "Header" } },
    {
      type: "MainContent",
      props: { id: "main", content: [section("first"), section("second")] },
    },
    { type: "Footer", props: { id: "footer", text: "Footer" } },
  ],
});
export const task = (
  targets = ["first-a"],
  structuralOperations: PlannedStructureEdit[] = [],
  sectionId = "first"
): SectionEditTask => ({
  taskId: `task-${sectionId}`,
  sectionId,
  targetComponentIds: targets,
  instructions: "Edit the section",
  structuralOperations,
  dependsOn: [],
});
export const update = (
  componentId = "first-a",
  path = "/text/defaultValue",
  value: unknown = "Updated"
): SectionEditOperation => ({
  kind: "update",
  componentId,
  changes: [{ kind: "set", path, value }],
});
export const apply = (
  data = page(),
  editTask = task(),
  operations = [update()]
) =>
  materializeSectionEdit(catalog(), data, editTask, {
    taskId: editTask.taskId,
    sectionId: editTask.sectionId,
    operations,
  });
export const find = (
  data: ReturnType<typeof page>,
  componentId: string
): SavedComponent => {
  const visit = (items: SavedComponent[]): SavedComponent | undefined => {
    for (const item of items) {
      if (item.props.id === componentId) {
        return item;
      }
      const child = visit(item.props.content ?? item.props.cards ?? []);
      if (child) {
        return child;
      }
    }
  };
  return visit(data.content)!;
};
