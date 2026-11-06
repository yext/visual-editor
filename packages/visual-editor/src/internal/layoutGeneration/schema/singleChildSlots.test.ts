// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toPuckFields, type YextFields } from "../../../fields/fields.ts";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { validateAuthored } from "../shared/authoredValues.ts";
import { editTask } from "../testing/editFixtures.ts";
import {
  materializeSectionEdit,
  structuralEditResult,
} from "../workflows/edits/applyEditsToLayout.ts";
import { compileGenerationSchema } from "../workflows/fullPageGeneration/pageSchema.ts";
import { compileFullPageUpdateSchema } from "../workflows/fullPageUpdate/pageSchema.ts";
import { createGenerationSchemaCompiler } from "./compiler.ts";

const heading = (text = "Heading") => ({ type: "Heading", props: { text } });
const fixedSlot = {
  type: "slot" as const,
  visible: false,
  allow: ["Heading"],
  generation: { singleChild: true as const },
};
const fixture = (adapted = false) => {
  const fields: YextFields = {
    showHeading: {
      type: "radio",
      options: [
        { label: "Hide", value: false },
        { label: "Show", value: true },
      ],
    },
    slots: {
      type: "object",
      visible: false,
      objectFields: { HeadingSlot: fixedSlot },
    },
    groups: {
      type: "array",
      defaultItemProps: { child: [heading()] },
      arrayFields: { child: fixedSlot },
    },
  };
  return createPuckGenerationCatalog(
    {
      Section: {
        fields: adapted ? toPuckFields(fields) : fields,
        defaultProps: {
          showHeading: false,
          slots: { HeadingSlot: [heading()] },
          groups: [],
        },
      },
      Heading: {
        nestedOnly: true,
        fields: { text: { type: "text" } },
        defaultProps: { text: "Heading" },
      },
      Other: { nestedOnly: true, fields: {} },
    },
    { rootAllowedComponentIds: ["Section"] }
  );
};
const section = (children = [heading()]) => ({
  type: "Section",
  props: { showHeading: false, slots: { HeadingSlot: children }, groups: [] },
});

describe("declarative single-child slots", () => {
  it.each([false, true])(
    "preserves hidden nested slots and array item constraints through adaptation: %s",
    (adapted) => {
      const catalog = fixture(adapted);
      const schema = catalog.data.components.Section.generation!.props;
      expect(schema.safeParse(section().props).success).toBe(true);
      for (const children of [[], [heading(), heading()]]) {
        expect(schema.safeParse(section(children).props).success).toBe(false);
        expect(
          schema.safeParse({
            ...section().props,
            groups: [{ child: children }],
          }).success
        ).toBe(false);
      }
      expect(
        schema.safeParse({
          ...section().props,
          groups: [{ child: [heading()] }],
        }).success
      ).toBe(true);
      const wire = createGenerationSchemaCompiler(catalog, []).element(
        "Section"
      ).wire;
      expect(wire.safeParse(section()).success).toBe(true);
      expect(
        wire.safeParse(section([{ type: "Other", props: {} } as any])).success
      ).toBe(false);
      expect(
        wire.safeParse(
          section([{ type: "Heading", props: { text: 42 } } as any])
        ).success
      ).toBe(false);
      expect(catalog.data.components.Section.fields.slots).toMatchObject({
        objectFields: { HeadingSlot: fixedSlot },
      });
    }
  );

  it("validates default layouts, creation, full-page updates and follow-up edits while hidden", () => {
    const catalog = fixture();
    const creation = compileGenerationSchema(catalog, []);
    const create = (content: unknown[]) =>
      creation.materialize({
        text: "Created",
        translationMode: "defaultOnly",
        result: { action: "create", content },
      }).spec!;
    const defaults = create([
      {
        type: "Section",
        props: {
          showHeading: { $default: true },
          slots: { $default: true },
          groups: { $default: true },
        },
      },
    ]);
    validateAuthored(catalog, defaults);
    expect(defaults.content[0].props.slots.HeadingSlot).toHaveLength(1);
    const page = create([section()]);
    validateAuthored(catalog, page);
    for (const children of [[], [heading(), heading()]]) {
      expect(() => create([section(children)])).toThrow();
    }
    const sectionId = page.content[0].props.id;
    const fullPage = compileFullPageUpdateSchema(catalog, [], page);
    const update = (children: ReturnType<typeof heading>[]) =>
      fullPage.parseResponse(
        JSON.stringify({
          text: "Updated",
          translationMode: "defaultOnly",
          result: {
            action: "fullPageUpdate",
            steps: [
              { kind: "replace", sectionId, sections: [section(children)] },
            ],
          },
        })
      );
    expect(
      update([heading("Updated")]).result.steps[0].sections[0].props.slots
        .HeadingSlot
    ).toHaveLength(1);
    expect(() => update([])).toThrow();
    expect(() => update([heading(), heading()])).toThrow();
    const childId = page.content[0].props.slots.HeadingSlot[0].props.id;
    const task = editTask(sectionId, [sectionId, childId]);
    const edited = materializeSectionEdit(catalog, page, task, {
      taskId: task.taskId,
      sectionId,
      operations: [
        {
          kind: "update",
          componentId: childId,
          changes: [{ kind: "set", path: "/text", value: "Edited" }],
        },
        {
          kind: "update",
          componentId: sectionId,
          changes: [{ kind: "set", path: "/showHeading", value: false }],
        },
      ],
    });
    expect(edited.content[0].props.slots.HeadingSlot).toMatchObject([
      { props: { text: "Edited" } },
    ]);
    validateAuthored(catalog, edited);
    const removal = editTask(
      sectionId,
      [childId],
      [{ kind: "remove", componentId: childId }]
    );
    expect(() =>
      materializeSectionEdit(
        catalog,
        edited,
        removal,
        structuralEditResult(removal)
      )
    ).toThrow();
  });

  it.each([undefined, false] as const)(
    "keeps Grid slots variable-length for %s, regardless of defaults or allow list",
    (singleChild) => {
      const catalog = createPuckGenerationCatalog({
        Grid: {
          fields: {
            cards: {
              type: "slot",
              allow: ["Heading"],
              generation: { singleChild },
            },
          },
          defaultProps: { cards: [heading()] },
        },
        Heading: {
          fields: { text: { type: "text" } },
          defaultProps: { text: "Heading" },
        },
      });
      const wire = createGenerationSchemaCompiler(catalog, []).element(
        "Grid"
      ).wire;
      for (const cards of [[], [heading()], [heading(), heading()]]) {
        expect(wire.safeParse({ type: "Grid", props: { cards } }).success).toBe(
          true
        );
      }
    }
  );

  it("keeps explicit field and component schemas authoritative", () => {
    const props = z.object({ child: z.array(z.unknown()) });
    const catalog = createPuckGenerationCatalog({
      Field: {
        fields: {
          child: {
            ...fixedSlot,
            generation: { singleChild: true, schema: z.array(z.unknown()) },
          },
        },
      },
      Component: {
        fields: { child: fixedSlot },
        layoutGenerationMetadata: { props },
      },
    });
    expect(
      catalog.data.components.Field.generation!.props.safeParse({ child: [] })
        .success
    ).toBe(true);
    expect(catalog.data.components.Component.generation!.props).toBe(props);
  });

  it.each([true, false] as const)(
    "rejects singleChild %s on nested non-slot fields even with a complete schema",
    (singleChild) => {
      expect(() =>
        createPuckGenerationCatalog({
          Section: {
            layoutGenerationMetadata: { props: z.object({}) },
            fields: {
              groups: {
                type: "array",
                arrayFields: {
                  child: { type: "text", generation: { singleChild } },
                },
              },
            },
          },
        })
      ).toThrow(/Section.props.groups\[\].child.*only slots/);
    }
  );
});
