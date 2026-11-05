// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { compileGenerationSchema } from "../workflows/fullPageGeneration/pageSchema.ts";
import { materializeSectionEdit } from "../workflows/edits/applyEditsToLayout.ts";
import { task } from "../testing/materializerFixtures.ts";
import {
  clone,
  collectAuthoredIds,
  extractAuthored,
  validateAuthored,
  type Content,
} from "./authoredValues.ts";

const fixture = () => {
  const catalog = createPuckGenerationCatalog(
    {
      Section: {
        fields: {
          hidden: {
            type: "array",
            generation: { exclude: true },
            arrayFields: {
              slots: {
                type: "object",
                objectFields: { child: { type: "slot" } },
              },
            },
          },
        },
        defaultProps: {
          hidden: [
            {
              slots: {
                child: [
                  {
                    type: "Hidden",
                    props: {
                      id: "template-child",
                      children: [{ type: "Leaf", props: {} }],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      Hidden: {
        layoutGenerationMetadata: { exclude: true },
        fields: { children: { type: "slot" } },
      },
      Leaf: { layoutGenerationMetadata: { exclude: true } },
    },
    { rootAllowedComponentIds: ["Section"] }
  );
  const data: Content = {
    content: [
      {
        type: "Section",
        props: {
          id: "section",
          ...clone(catalog.data.components.Section.defaultProps),
        },
      },
    ],
  };
  return { catalog, data };
};

const hiddenChildren = (data: Content) => {
  const child = data.content[0].props.hidden[0].slots.child[0];
  return [child, child.props.children[0]];
};

describe("excluded slot identities", () => {
  it("keeps excluded slots out of generation and extraction but validates descendant identities", () => {
    const { catalog, data } = fixture();
    expect(
      catalog.data.components.Section.generation!.props.shape
    ).not.toHaveProperty("hidden");
    expect(extractAuthored(catalog, data).content[0].props).toEqual({
      id: "section",
    });
    expect(() => validateAuthored(catalog, data)).toThrow(
      "missing component Id"
    );
    const [child, leaf] = hiddenChildren(data);
    leaf.props.id = child.props.id;
    expect(() => validateAuthored(catalog, data)).toThrow(
      "duplicate component Id"
    );
    leaf.props.id = "leaf";
    expect(collectAuthoredIds(catalog, data)).toEqual(
      new Set(["section", "template-child", "leaf"])
    );
  });

  it("assigns fresh identities throughout excluded defaults during generation", () => {
    const { catalog } = fixture();
    const compiled = compileGenerationSchema(catalog, []);
    const response = {
      text: "Created",
      translationMode: "defaultOnly",
      result: {
        action: "create",
        content: [{ type: "Section", props: {} }],
      },
    };
    const data = compiled.materialize(response).spec!;
    const ids = collectAuthoredIds(catalog, data);
    expect(ids.size).toBe(3);
    expect(ids.has("template-child")).toBe(false);
    expect(
      collectAuthoredIds(catalog, compiled.materialize(response).spec!)
    ).toEqual(ids);
  });

  it("assigns fresh descendant identities when inserting a section", () => {
    const { catalog } = fixture();
    const plan = {
      kind: "insert" as const,
      insertionKey: "new-section",
      collection: { ownerId: null, slotPath: null },
      anchor: { position: "end" as const },
    };
    const data = materializeSectionEdit<Content>(
      catalog,
      { content: [] },
      task(
        [],
        [
          {
            ...plan,
            componentType: "Section",
          },
        ],
        "reserved-section"
      ),
      {
        taskId: "task-reserved-section",
        sectionId: "reserved-section",
        operations: [
          {
            ...plan,
            component: { type: "Section", authoredValues: {}, slots: [] },
          },
        ],
      }
    );
    expect(data.content[0].props.id).toBe("reserved-section");
    for (const child of hiddenChildren(data)) {
      expect(child.props.id).toMatch(/^generated-/);
    }
    expect(collectAuthoredIds(catalog, data).size).toBe(3);
  });
});
