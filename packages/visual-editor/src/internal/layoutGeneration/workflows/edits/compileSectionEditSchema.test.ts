// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import { resolveComponentData } from "../../../../utils/resolveComponentData.tsx";
import { clone, type Content } from "../../shared/authoredValues.ts";
import {
  defaults,
  editGenerationFixture,
  editPlan,
  planningResponse,
  editResponse,
  editTask,
  insertedCard,
  unset,
} from "../../testing/editFixtures.ts";
import { slottedFixture } from "../../testing/slottedFixtures.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "./applyEditsToLayout.ts";
import { compileEditPlanningSchema } from "./sectionEditPlanningSchema.ts";
import { compileSectionEditSchema } from "./compileSectionEditSchema.ts";

describe("section edit targets and values", () => {
  it.each([
    {
      selectedColor: "palette-primary-dark",
      contrastingColor: "white",
      isDarkColor: true,
    },
    {
      selectedColor: "[#FDE8E7]",
      contrastingColor: "black",
      isDarkColor: false,
    },
  ])("enforces a complete color union for $selectedColor", (nextColor) => {
    const color = z.union([
      z.object({
        selectedColor: z.literal("white"),
        contrastingColor: z.literal("black"),
        isDarkColor: z.boolean().optional(),
      }),
      z.object({
        selectedColor: z.literal("palette-primary-dark"),
        contrastingColor: z.literal("white"),
        isDarkColor: z.literal(true),
      }),
      z.object({
        selectedColor: z.string().regex(/^\[#[0-9A-Fa-f]{6}\]$/),
        contrastingColor: z.literal("black"),
        isDarkColor: z.literal(false),
      }),
    ]);
    const catalog = createPuckGenerationCatalog({
      Banner: {
        generation: {
          props: z.object({
            text: z.string(),
            styles: z.object({ backgroundColor: color }),
          }),
        },
      },
    });
    const data = {
      root: { props: { theme: "Keep" } },
      zones: { legacy: [] },
      content: [
        {
          type: "Banner",
          props: {
            id: "banner",
            text: "Keep banner text",
            metadata: "Private",
            styles: {
              backgroundColor: {
                selectedColor: "white",
                contrastingColor: "black",
              },
            },
          },
        },
      ],
    };
    const before = clone(data);
    const task = editTask("banner", ["banner"]);
    const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
    const response = (value: unknown, path = "/styles/backgroundColor") =>
      JSON.stringify({
        taskId: task.taskId,
        sectionId: "banner",
        insertions: [],
        updates: [
          {
            kind: "update",
            componentId: "banner",
            changes: [
              {
                kind: "set",
                path,
                value,
              },
            ],
          },
        ],
      });
    const schema = JSON.stringify(compiled.jsonSchema);
    expect(schema).not.toContain('"/styles/backgroundColor/selectedColor"');
    expect(schema).toContain("isDarkColor");
    expect(() =>
      compiled.parseResponse(
        response({
          selectedColor: "[#FDE8E7]",
          contrastingColor: "black",
        })
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        response({
          selectedColor: "[#FDE8E7]",
          contrastingColor: "black",
          isDarkColor: true,
        })
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        response({
          selectedColor: "#FDE8E7",
          contrastingColor: "black",
          isDarkColor: false,
        })
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        response("[#FDE8E7]", "/styles/backgroundColor/selectedColor")
      )
    ).toThrow();
    const result = compiled.parseResponse(response(nextColor));
    const applied = materializeSectionEdit(catalog, data, task, result);
    const expected = clone(before);
    expected.content[0].props.styles.backgroundColor = nextColor;
    expect(applied).toEqual(expected);
    expect(data).toEqual(before);
  });

  it("limits output to concrete targets and preserves unrelated data", () => {
    const fixture = editGenerationFixture();
    const before = clone(fixture.data);
    const task = editTask();
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task,
      "Use consistent copy"
    );
    const schema = JSON.stringify(compiled.jsonSchema);
    expect(schema).toContain('"first-a"');
    expect(schema).not.toContain('"first-b"');
    expect(schema).not.toContain("unrelatedValue");
    expect(schema).not.toContain("editorMetadata");
    expect(compiled.context.sharedIntent).toBe("Use consistent copy");
    expect(
      compiled.context.section.some((item) => item.componentId === "first-b")
    ).toBe(true);
    expect(
      compiled.context.section.some((item) => item.componentId === "second-a")
    ).toBe(false);
    const result = compiled.parseResponse(JSON.stringify(editResponse(task)));
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    const expected = clone(before);
    expected.content[1].props.content[0].props.cards[0].props.text.defaultValue =
      "Updated";
    expect(candidate).toEqual(expected);
    expect(fixture.data).toEqual(before);
  });

  it.each(["/id", "/editorMetadata", "/missing", "/cards", "/binding/missing"])(
    "does not offer undeclared or structural update path %s",
    (path) => {
      const fixture = editGenerationFixture();
      const compiled = compileSectionEditSchema(
        fixture.catalog,
        ["en", "fr"],
        fixture.data,
        editTask()
      );
      expect(() =>
        compiled.parseResponse(JSON.stringify(editResponse(editTask(), path)))
      ).toThrow();
    }
  );

  it("distinguishes set, null, unset and preservation without permitting top-level markers", () => {
    const fixture = editGenerationFixture();
    const task = { ...editTask(), translationMode: "translate" as const };
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const nulled = compiled.parseResponse(
      JSON.stringify(editResponse(task, "/optional", null))
    );
    expect(nulled.operations[0]).toMatchObject({
      changes: [{ kind: "set", path: "/optional", value: null }],
    });
    const response = {
      ...editResponse(task),
      updates: [
        {
          kind: "update",
          componentId: "first-a",
          changes: [
            { kind: "unset", path: "/optional" },
            { kind: "unset", path: "/text/fr" },
          ],
        },
      ],
    };
    const removed = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      compiled.parseResponse(JSON.stringify(response))
    );
    expect(
      removed.content[1].props.content[0].props.cards[0].props.optional
    ).toBeUndefined();
    expect(
      removed.content[1].props.content[0].props.cards[0].props.text.fr
    ).toBeUndefined();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/optional", unset))
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/optional", defaults))
      )
    ).toThrow();
  });

  it("replaces authored arrays without inheriting by index or component type", () => {
    const fixture = editGenerationFixture();
    const task = editTask();
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const result = compiled.parseResponse(
      JSON.stringify(
        editResponse(task, "/rows", [{ label: "Replacement", note: unset }])
      )
    );
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    expect(
      candidate.content[1].props.content[0].props.cards[0].props.rows
    ).toEqual([{ label: "Replacement" }]);
  });

  it("excludes read-only values and rejects invalid output, duplicates and scope changes", () => {
    const fixture = editGenerationFixture();
    fixture.data.content[1].props.content[0].props.cards[0].readOnly = {
      binding: true,
    };
    const task = editTask();
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    expect(JSON.stringify(compiled.jsonSchema)).not.toContain("/binding/field");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/binding/field", "address"))
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...editResponse(task), updates: [] })
      )
    ).toThrow("no changes");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...editResponse(task),
          updates: [
            ...editResponse(task).updates,
            ...editResponse(task).updates,
          ],
        })
      )
    ).toThrow("only once");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...editResponse(task), sectionId: "second" })
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...editResponse(task),
          updates: [
            { ...editResponse(task).updates[0], componentId: "first-b" },
          ],
        })
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/style/color", "green"))
      )
    ).toThrow();
  });

  it("prepares pure removal and reorder results without a generation call", () => {
    const fixture = editGenerationFixture();
    const task = {
      ...editTask(
        "first",
        ["first-a"],
        [
          {
            kind: "reorder" as const,
            componentId: "first-a",
            anchor: { position: "after" as const, componentId: "first-b" },
          },
        ]
      ),
      generateContent: false,
    };
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    expect(compiled.localResult).toEqual({
      taskId: task.taskId,
      sectionId: task.sectionId,
      operations: task.structuralOperations,
    });
    expect(JSON.stringify(compiled.jsonSchema)).not.toContain(
      "/text/defaultValue"
    );
  });

  it("plans and applies removal without duplicating structural targets as content targets", () => {
    const fixture = editGenerationFixture();
    const task = {
      ...editTask("first", [], [{ kind: "remove", componentId: "first" }]),
      generateContent: false,
    };
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en"],
      fixture.data
    );
    const output = planningResponse(
      editPlan([task]),
      fixture.catalog,
      fixture.data
    );
    expect(
      z.fromJSONSchema(compiled.jsonSchema).safeParse(output).success
    ).toBe(true);
    const plan = compiled.parseResponse(JSON.stringify(output));
    const section = compileSectionEditSchema(
      fixture.catalog,
      ["en"],
      fixture.data,
      plan.tasks[0]
    );
    expect(section.localResult).toBeTruthy();
    const applied = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      plan.tasks[0],
      section.localResult!
    );
    expect(
      applied.content[1].props.content.map((item: any) => item.props.id)
    ).toEqual(["second"]);
    expect(fixture.data.content[1].props.content).toHaveLength(2);
  });

  it("rejects protected and cross-section structural targets even without content targets", () => {
    const fixture = editGenerationFixture();
    for (const componentId of ["main", "second"]) {
      const task = {
        ...editTask("first", [], [{ kind: "remove", componentId }]),
        generateContent: false,
      };
      expect(() =>
        compileSectionEditSchema(fixture.catalog, ["en"], fixture.data, task)
      ).toThrow();
    }
    fixture.components.Section.permissions = { delete: false };
    const task = {
      ...editTask("first", [], [{ kind: "remove", componentId: "first" }]),
      generateContent: false,
    };
    expect(() =>
      compileSectionEditSchema(fixture.catalog, ["en"], fixture.data, task)
    ).toThrow("protected content");
  });

  it("reorders without duplicate targets and rejects structure beneath a removed parent", () => {
    const fixture = editGenerationFixture();
    const task = {
      ...editTask(
        "first",
        [],
        [
          {
            kind: "reorder",
            componentId: "first-a",
            anchor: { position: "after", componentId: "first-b" },
          },
        ]
      ),
      generateContent: false,
    };
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en"],
      fixture.data,
      task
    );
    const applied = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      compiled.localResult!
    );
    expect(
      applied.content[1].props.content[0].props.cards.map(
        (card: any) => card.props.id
      )
    ).toEqual(["first-b", "first-a"]);
    const conflicting = {
      ...task,
      structuralOperations: [
        { kind: "remove" as const, componentId: "first" },
        ...task.structuralOperations,
      ],
    };
    expect(() =>
      compileSectionEditSchema(
        fixture.catalog,
        ["en"],
        fixture.data,
        conflicting
      )
    ).toThrow("descendant");
  });

  it("carries parent and child visibility guidance through planning and section execution", () => {
    const parentGuidance =
      "Controls HeadingSlot. Enable when writing a marketing headline.";
    const slotGuidance =
      "Marketing headline; requires styles.showHeading, even on a topic page.";
    const childGuidance =
      "Render the secondary CTA when writing its label and link.";
    const catalog = createPuckGenerationCatalog({
      Header: {
        generation: {
          props: z.object({
            styles: z.object({
              showHeading: z.boolean().describe(parentGuidance),
            }),
            slots: z.object({
              HeadingSlot: z
                .array(z.unknown())
                .length(1)
                .describe(slotGuidance),
              SecondaryCTASlot: z
                .array(z.unknown())
                .length(1)
                .describe("Enable the child CTA's data.show."),
            }),
          }),
        },
        fields: {
          slots: {
            type: "object",
            objectFields: {
              HeadingSlot: { type: "slot", allow: ["Heading"] },
              SecondaryCTASlot: { type: "slot", allow: ["CTA"] },
            },
          },
        },
      },
      Heading: { generation: { props: z.object({ text: z.string() }) } },
      CTA: {
        generation: {
          props: z.object({
            data: z.object({
              show: z.boolean().optional().describe(childGuidance),
              label: z.string(),
              link: z.string(),
            }),
          }),
        },
      },
    });
    const data = {
      content: [
        {
          type: "Header",
          props: {
            id: "header",
            styles: { showHeading: false },
            slots: {
              HeadingSlot: [
                {
                  type: "Heading",
                  props: { id: "heading", text: "Old headline" },
                },
              ],
              SecondaryCTASlot: [
                {
                  type: "CTA",
                  props: {
                    id: "cta",
                    data: { show: false, label: "Placeholder", link: "#" },
                  },
                },
              ],
            },
          },
        },
      ],
    };
    const planning = compileEditPlanningSchema(catalog, ["en"], data);
    expect(planning.context.capabilities.Header.authoredPaths).toContainEqual({
      path: "/styles/showHeading",
      set: true,
      unset: false,
      description: parentGuidance,
    });
    expect(planning.context.capabilities.Header.slots).toContainEqual({
      path: "/slots/HeadingSlot",
      allow: ["Heading"],
      disallow: [],
      description: slotGuidance,
    });
    expect(planning.context.capabilities.CTA.authoredPaths).toContainEqual({
      path: "/data/show",
      set: true,
      unset: true,
      description: childGuidance,
    });
    const task = editTask("header", ["header", "heading", "cta"]);
    const planned = planning.parseResponse(
      JSON.stringify(planningResponse(editPlan([task]), catalog, data))
    );
    const section = compileSectionEditSchema(
      catalog,
      ["en"],
      data,
      planned.tasks[0]
    );
    expect(JSON.stringify(section.jsonSchema)).toContain(parentGuidance);
    expect(JSON.stringify(section.jsonSchema)).toContain(childGuidance);
    const response = {
      taskId: task.taskId,
      sectionId: task.sectionId,
      insertions: [],
      updates: [
        {
          kind: "update",
          componentId: "header",
          changes: [{ kind: "set", path: "/styles/showHeading", value: true }],
        },
        {
          kind: "update",
          componentId: "heading",
          changes: [{ kind: "set", path: "/text", value: "Shop fall boots" }],
        },
        {
          kind: "update",
          componentId: "cta",
          changes: [
            { kind: "set", path: "/data/show", value: true },
            { kind: "set", path: "/data/label", value: "Find your fit" },
            { kind: "set", path: "/data/link", value: "/boots" },
          ],
        },
      ],
    };
    const applied = materializeSectionEdit(
      catalog,
      data,
      task,
      section.parseResponse(JSON.stringify(response))
    );
    expect(applied.content[0].props.styles.showHeading).toBe(true);
    expect(
      applied.content[0].props.slots.SecondaryCTASlot[0].props.data
    ).toEqual({ show: true, label: "Find your fit", link: "/boots" });
    expect(data.content[0].props.styles.showHeading).toBe(false);
    expect(
      data.content[0].props.slots.SecondaryCTASlot[0].props.data.show
    ).toBe(false);
  });
});

describe("section edit localization", () => {
  it.each([false, true])(
    "changes fallback text and only explicitly approved locale values (approved %s)",
    (explicit) => {
      const catalog = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({
              data: z.object({
                text: z.object({
                  field: z.string(),
                  constantValueEnabled: z.boolean(),
                  constantValue: z.union([
                    z.string(),
                    z
                      .object({
                        defaultValue: z.string().optional(),
                        hasLocalizedValue: z.literal("true").optional(),
                      })
                      .catchall(z.string().optional()),
                  ]),
                }),
              }),
            }),
          },
        },
      });
      const data = {
        content: [
          {
            type: "Heading",
            props: {
              id: "heading",
              data: {
                text: {
                  field: "address.city",
                  constantValueEnabled: true,
                  constantValue: {
                    defaultValue: "Your neighborhood experts.",
                    hasLocalizedValue: "true" as const,
                    en: "Your neighborhood experts.",
                    fr: "Vos experts de quartier.",
                    de: "Your neighborhood experts.",
                  },
                },
              },
            },
          },
        ],
      };
      const before = clone(data);
      const task = {
        ...editTask("heading", ["heading"]),
        translationMode: explicit
          ? ("translate" as const)
          : ("defaultOnly" as const),
      };
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      const changes = [
        {
          kind: "set",
          path: "/data/text/constantValue/defaultValue",
          value: "Local care, made simple",
        },
      ];
      if (explicit) {
        changes.push({
          kind: "set",
          path: "/data/text/constantValue/en",
          value: "Your explicit English headline",
        });
      }
      const result = compiled.parseResponse(
        JSON.stringify({
          taskId: task.taskId,
          sectionId: task.sectionId,
          updates: [{ kind: "update", componentId: "heading", changes }],
          insertions: [],
        })
      );
      const applied = materializeSectionEdit(catalog, data, task, result);
      const text = applied.content[0].props.data.text;
      expect(resolveComponentData(text, "en")).toBe(
        explicit
          ? "Your explicit English headline"
          : "Your neighborhood experts."
      );
      expect(resolveComponentData(text, "fr")).toBe("Vos experts de quartier.");
      expect(text.constantValue).toMatchObject({
        defaultValue: "Local care, made simple",
        de: "Your neighborhood experts.",
        hasLocalizedValue: "true",
      });
      expect(text.field).toBe("address.city");
      expect(text.constantValueEnabled).toBe(true);
      expect(data).toEqual(before);
    }
  );

  it("preserves all rich-text overrides when the fallback changes", () => {
    const richText = z.object({ html: z.string(), json: z.string() });
    const catalog = createPuckGenerationCatalog({
      Heading: {
        generation: {
          props: z.object({
            text: z
              .object({
                defaultValue: richText,
              })
              .catchall(richText),
          }),
        },
      },
    });
    const original = { html: "<p>Old</p>", json: "old serialized document" };
    const translated = { html: "<p>Ancien</p>", json: "translated document" };
    const data = {
      content: [
        {
          type: "Heading",
          props: {
            id: "heading",
            text: {
              defaultValue: original,
              en: clone(original),
              fr: translated,
            },
          },
        },
      ],
    };
    const task = editTask("heading", ["heading"]);
    const compiled = compileSectionEditSchema(
      catalog,
      ["en", "fr"],
      data,
      task
    );
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        insertions: [],
        updates: [
          {
            kind: "update",
            componentId: "heading",
            changes: [
              {
                kind: "set",
                path: "/text/defaultValue/html",
                value: "<p>New</p>",
              },
              {
                kind: "set",
                path: "/text/defaultValue/json",
                value: "new serialized document",
              },
            ],
          },
        ],
      })
    );
    const applied = materializeSectionEdit(catalog, data, task, result);
    expect(applied.content[0].props.text).toEqual({
      defaultValue: { html: "<p>New</p>", json: "new serialized document" },
      en: original,
      fr: translated,
    });
  });

  it.each(["text", "a/b", "a~b"])(
    "protects translations from fallback-only ancestor replacements (%s)",
    (field) => {
      const localized = z
        .object({ defaultValue: z.string() })
        .catchall(z.string());
      const catalog = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({
              wrapper: z
                .object({
                  [field]: z
                    .union([z.string(), localized])
                    .nullable()
                    .optional(),
                })
                .nullable()
                .optional(),
            }),
          },
        },
      });
      const data: Content = {
        content: [
          {
            type: "Heading",
            props: {
              id: "heading",
              wrapper: {
                [field]: { defaultValue: "Hello", en: "Hello", fr: "Bonjour" },
              },
            },
          },
        ],
      };
      const before = clone(data);
      const task = editTask("heading", ["heading"]);
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      const wire = z.fromJSONSchema(compiled.jsonSchema);
      const path = `/wrapper/${field.replaceAll("~", "~0").replaceAll("/", "~1")}`;
      const response = (change: object) => ({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [
          { kind: "update", componentId: "heading", changes: [change] },
        ],
        insertions: [],
      });
      for (const change of [
        { kind: "set", path, value: "Updated" },
        { kind: "set", path, value: null },
        { kind: "unset", path },
        { kind: "set", path: "/wrapper", value: null },
        { kind: "unset", path: "/wrapper" },
      ]) {
        const output = response(change);
        expect(() => compiled.parseResponse(JSON.stringify(output))).toThrow(
          "Translation approval"
        );
      }
      const output = response({
        kind: "set",
        path: `${path}/defaultValue`,
        value: "Updated",
      });
      expect(wire.safeParse(output).success).toBe(true);
      const result = compiled.parseResponse(JSON.stringify(output));
      expect(
        materializeSectionEdit(catalog, data, task, result).content[0].props
          .wrapper[field]
      ).toEqual({
        defaultValue: "Updated",
        en: "Hello",
        fr: "Bonjour",
      });
      expect(data).toEqual(before);
      // Plain text can still be edited by authoring its localized fallback.
      data.content[0].props.wrapper[field] = "Hello";
      const plain = compileSectionEditSchema(catalog, ["en", "fr"], data, task);
      expect(
        materializeSectionEdit(
          catalog,
          data,
          task,
          plain.parseResponse(JSON.stringify(output))
        ).content[0].props.wrapper[field]
      ).toEqual({ defaultValue: "Updated" });
    }
  );

  it.each(["array", "objectUnion"] as const)(
    "discovers and protects translations inside whole-value %s edits",
    (kind) => {
      const rich = z.object({ html: z.string(), json: z.string() });
      const localized = z.object({ defaultValue: rich }).catchall(rich);
      const valueSchema =
        kind === "array"
          ? z.array(z.object({ text: localized }))
          : z.union([rich, localized]);
      const catalog = createPuckGenerationCatalog({
        Heading: { generation: { props: z.object({ value: valueSchema }) } },
      });
      const old = { html: "Hello", json: "original" };
      const translated = { html: "Bonjour", json: "French" };
      const updated = { html: "Updated", json: "new" };
      const wrap = (value: object) =>
        kind === "array" ? [{ text: value }] : value;
      const data: Content = {
        content: [
          {
            type: "Heading",
            props: {
              id: "heading",
              value: wrap({
                defaultValue: old,
                en: clone(old),
                fr: translated,
              }),
            },
          },
        ],
      };
      const before = clone(data);
      const task = editTask("heading", ["heading"]);
      const localePath = kind === "array" ? "/value/0/text" : "/value";
      const planning = compileEditPlanningSchema(catalog, ["en", "fr"], data);
      expect(
        planning.context.localizedText[
          planning.context.inventory.components[0].componentId
        ]
      ).toContainEqual({
        path: localePath,
        overrideLocales: ["en", "fr"],
      });
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      const output = (fr: object) =>
        editResponse(
          task,
          "/value",
          wrap({ defaultValue: updated, en: clone(old), fr })
        );
      expect(() =>
        compiled.parseResponse(
          JSON.stringify(output({ html: "Unapproved", json: "Unapproved" }))
        )
      ).toThrow("Translation approval");
      if (kind === "array") {
        expect(() =>
          compiled.parseResponse(JSON.stringify(output({ $unset: true })))
        ).toThrow("Translation approval");
      } else {
        // Object patches preserve omitted keys; an unset marker must not erase a translation.
        const retained = materializeSectionEdit(
          catalog,
          data,
          task,
          compiled.parseResponse(JSON.stringify(output({ $unset: true })))
        );
        expect(retained.content[0].props.value.fr).toEqual(translated);
      }
      const result = compiled.parseResponse(JSON.stringify(output(translated)));
      const applied = materializeSectionEdit(catalog, data, task, result);
      expect(applied.content[0].props.value).toEqual(
        wrap({ defaultValue: updated, en: old, fr: translated })
      );
      expect(data).toEqual(before);
      // Replacing an unlocalized value must not create unapproved locale overrides either.
      const unlocalized: Content = clone(data);
      unlocalized.content[0].props.value = wrap({ defaultValue: old });
      const fresh = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        unlocalized,
        task
      );
      expect(() =>
        fresh.parseResponse(JSON.stringify(output(translated)))
      ).toThrow("Translation approval");
      // Explicitly approved translations still use the full replacement contract.
      const approved = { ...task, translationMode: "translate" as const };
      const allowed = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        approved
      );
      const french = { html: "Nouveau", json: "French update" };
      expect(
        materializeSectionEdit(
          catalog,
          data,
          approved,
          allowed.parseResponse(JSON.stringify(output(french)))
        ).content[0].props.value
      ).toEqual(wrap({ defaultValue: updated, en: old, fr: french }));
    }
  );

  it.each(["string", "richText"] as const)(
    "requires a fallback for new localized %s introduced by array replacement",
    (kind) => {
      const rich = z.object({ html: z.string(), json: z.string() });
      const value = kind === "string" ? z.string() : rich;
      const localized = z
        .object({ defaultValue: value.optional() })
        .catchall(value.optional());
      const catalog = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({
              rows: z.array(z.object({ text: z.union([value, localized]) })),
            }),
          },
        },
      });
      const data: Content = {
        content: [{ type: "Heading", props: { id: "heading", rows: [] } }],
      };
      const before = clone(data);
      for (const translationMode of ["defaultOnly", "translate"] as const) {
        const task = { ...editTask("heading", ["heading"]), translationMode };
        const compiled = compileSectionEditSchema(
          catalog,
          ["en", "fr"],
          data,
          task
        );
        const translated =
          kind === "string"
            ? "Bonjour"
            : { html: "<p>Bonjour</p>", json: "French document" };
        const fallback =
          kind === "string"
            ? "Hello"
            : { html: "<p>Hello</p>", json: "English document" };
        const row = {
          text: {
            defaultValue: unset,
            en: unset,
            fr: translationMode === "translate" ? translated : unset,
          },
        };
        const output = editResponse(task, "/rows", [row]);
        expect(
          z.fromJSONSchema(compiled.jsonSchema).safeParse(output).success
        ).toBe(true);
        expect(() => compiled.parseResponse(JSON.stringify(output))).toThrow(
          "requires defaultValue"
        );
        const valid = editResponse(task, "/rows", [
          { text: { ...row.text, defaultValue: fallback } },
        ]);
        expect(
          materializeSectionEdit(
            catalog,
            data,
            task,
            compiled.parseResponse(JSON.stringify(valid))
          ).content[0].props.rows
        ).toEqual([
          {
            text: {
              defaultValue: fallback,
              ...(translationMode === "translate" ? { fr: translated } : {}),
            },
          },
        ]);
      }
      expect(data).toEqual(before);
    }
  );

  it("requires a fallback when edits introduce a localized field or remove its fallback", () => {
    const localized = z
      .object({ defaultValue: z.string().optional() })
      .catchall(z.string().optional());
    const catalog = createPuckGenerationCatalog({
      Heading: {
        generation: {
          props: z.object({
            text: z.union([z.string(), localized]).optional(),
          }),
        },
      },
    });
    const task = {
      ...editTask("heading", ["heading"]),
      translationMode: "translate" as const,
    };
    for (const text of [
      undefined,
      "Hello",
      { defaultValue: "Hello", fr: "Bonjour" },
    ]) {
      const data: Content = {
        content: [{ type: "Heading", props: { id: "heading", text } }],
      };
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      const output = editResponse(task, "/text/fr", "Bonjour");
      if (typeof text === "object") {
        (output.updates[0].changes as object[]).push({
          kind: "unset",
          path: "/text/defaultValue",
        });
      }
      expect(() => compiled.parseResponse(JSON.stringify(output))).toThrow(
        "requires defaultValue"
      );
      const valid = editResponse(task);
      valid.updates[0].changes = [
        { kind: "set", path: "/text/defaultValue", value: "Hello" },
        { kind: "set", path: "/text/fr", value: "Bonjour" },
      ];
      expect(() => compiled.parseResponse(JSON.stringify(valid))).not.toThrow();
    }
  });

  it.each(["defaultOnly", "translate"] as const)(
    "preserves and reorders existing locale-only text without allowing new copies (%s)",
    (translationMode) => {
      const localized = z
        .object({ defaultValue: z.string().optional() })
        .catchall(z.string().optional());
      const catalog = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({
              title: z.string(),
              rows: z.array(z.object({ text: localized })),
            }),
          },
        },
      });
      const legacy = { text: { fr: "Bonjour" } };
      const current = { text: { defaultValue: "Hello", fr: "Autre" } };
      const data: Content = {
        content: [
          {
            type: "Heading",
            props: {
              id: "heading",
              title: "Before",
              rows: [legacy, current, clone(legacy)],
            },
          },
        ],
      };
      const before = clone(data);
      const task = { ...editTask("heading", ["heading"]), translationMode };
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      expect(() =>
        compiled.parseResponse(
          JSON.stringify(editResponse(task, "/title", "After"))
        )
      ).not.toThrow();
      const wireRows = [current, legacy, clone(legacy)].map((row) => ({
        text: { defaultValue: unset, en: unset, ...row.text },
      }));
      const output = (rows: object[]) =>
        JSON.stringify(editResponse(task, "/rows", rows));
      expect(
        materializeSectionEdit(
          catalog,
          data,
          task,
          compiled.parseResponse(output(wireRows))
        ).content[0].props.rows
      ).toEqual([current, legacy, legacy]);
      // Approval to translate does not permit extra copies with no fallback.
      if (translationMode === "translate") {
        expect(() =>
          compiled.parseResponse(output([...wireRows, wireRows[1]]))
        ).toThrow("requires defaultValue");
        expect(() =>
          compiled.parseResponse(
            output([
              wireRows[0],
              { text: { ...wireRows[1].text, fr: "Nouveau" } },
              wireRows[2],
            ])
          )
        ).toThrow("requires defaultValue");
      }
      expect(data).toEqual(before);
    }
  );

  it.each(["defaultOnly", "translate"] as const)(
    "preserves older locales during full-array replacements in %s mode",
    (translationMode) => {
      const localized = z
        .object({ defaultValue: z.string() })
        .catchall(z.string());
      const catalog = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({ rows: z.array(z.object({ text: localized })) }),
          },
        },
      });
      const data = {
        content: [
          {
            type: "Heading",
            props: {
              id: "heading",
              rows: [
                { text: { defaultValue: "Hello", fr: "Bonjour", de: "Hallo" } },
              ],
            },
          },
        ],
      };
      const before = clone(data);
      const task = { ...editTask("heading", ["heading"]), translationMode };
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      const response = (de: unknown) =>
        JSON.stringify(
          editResponse(task, "/rows", [
            {
              text: {
                defaultValue: "New",
                en: unset,
                fr: translationMode === "translate" ? "Nouveau" : "Bonjour",
                de,
              },
            },
          ])
        );
      const result = compiled.parseResponse(response("Hallo"));
      expect(
        materializeSectionEdit(catalog, data, task, result).content[0].props
          .rows
      ).toEqual([
        {
          text: {
            defaultValue: "New",
            fr: translationMode === "translate" ? "Nouveau" : "Bonjour",
            de: "Hallo",
          },
        },
      ]);
      for (const de of [unset, "Changed"]) {
        expect(() => compiled.parseResponse(response(de))).toThrow(
          translationMode === "translate"
            ? "outside the layout"
            : "Translation approval"
        );
      }
      expect(data).toEqual(before);
    }
  );

  it("allows whole-array reorders while preserving complete override bundles and duplicate counts", () => {
    const localized = z
      .object({ defaultValue: z.string() })
      .catchall(z.string());
    const catalog = createPuckGenerationCatalog({
      Heading: {
        generation: {
          props: z.object({ rows: z.array(z.object({ text: localized })) }),
        },
      },
    });
    const a = { text: { defaultValue: "A", fr: "French A", de: "German A" } };
    const b = { text: { defaultValue: "B", fr: "French B", de: "German B" } };
    const data = {
      content: [
        { type: "Heading", props: { id: "heading", rows: [a, b, clone(a)] } },
      ],
    };
    const task = editTask("heading", ["heading"]);
    const compiled = compileSectionEditSchema(catalog, ["fr"], data, task);
    const response = (rows: object[]) =>
      JSON.stringify(editResponse(task, "/rows", rows));
    const rows = [b, a, clone(a)];
    expect(
      materializeSectionEdit(
        catalog,
        data,
        task,
        compiled.parseResponse(response(rows))
      ).content[0].props.rows
    ).toEqual(rows);
    // Neither losing a duplicate nor recombining locale values preserves a bundle.
    for (const invalid of [
      [b, a],
      [b, b, a],
      [
        { text: { ...a.text, de: b.text.de } },
        { text: { ...b.text, de: a.text.de } },
        a,
      ],
    ]) {
      expect(() => compiled.parseResponse(response(invalid))).toThrow(
        "Translation approval"
      );
    }
  });

  it.each(["unset", "null", "replace"] as const)(
    "allows %s of optional plain text with no locale overrides",
    (kind) => {
      const localized = z
        .object({ defaultValue: z.string() })
        .catchall(z.string());
      const catalog = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({
              text: z.union([z.string(), localized]).nullable().optional(),
            }),
          },
        },
      });
      const task = editTask("heading", ["heading"]);
      for (const text of [
        "Plain",
        { defaultValue: "Fallback with no overrides" },
      ]) {
        const data: Content = {
          content: [{ type: "Heading", props: { id: "heading", text } }],
        };
        const compiled = compileSectionEditSchema(
          catalog,
          ["en", "fr"],
          data,
          task
        );
        const output = editResponse(
          task,
          "/text",
          kind === "null" ? null : "Replacement"
        );
        if (kind === "unset") {
          (output.updates[0].changes as object[]) = [
            { kind: "unset", path: "/text" },
          ];
        }
        const result = compiled.parseResponse(JSON.stringify(output));
        const applied = materializeSectionEdit(catalog, data, task, result);
        expect(applied.content[0].props.text).toEqual(
          kind === "unset" ? undefined : kind === "null" ? null : "Replacement"
        );
      }
    }
  );

  it.each(["defaultOnly", "translate"] as const)(
    "allows locale overrides only after translation approval (%s)",
    (translationMode) => {
      const fixture = editGenerationFixture();
      const task = { ...editTask(), translationMode };
      const compiled = compileSectionEditSchema(
        fixture.catalog,
        ["en", "fr"],
        fixture.data,
        task
      );
      const output = JSON.stringify(
        editResponse(task, "/text/fr", "Nouveau texte")
      );
      if (translationMode === "defaultOnly") {
        expect(() => compiled.parseResponse(output)).toThrow();
        expect(() =>
          compiled.parseResponse(
            JSON.stringify(editResponse(task, "/text/en", "New text"))
          )
        ).toThrow();
        const fallback = compiled.parseResponse(
          JSON.stringify(editResponse(task, "/text/defaultValue", "New text"))
        );
        const applied = materializeSectionEdit(
          fixture.catalog,
          fixture.data,
          task,
          fallback
        );
        expect(
          applied.content[1].props.content[0].props.cards[0].props.text.fr
        ).toBe("Traduction");
      } else {
        const applied = materializeSectionEdit(
          fixture.catalog,
          fixture.data,
          task,
          compiled.parseResponse(output)
        );
        expect(
          applied.content[1].props.content[0].props.cards[0].props.text.fr
        ).toBe("Nouveau texte");
      }
    }
  );
});

describe("section edit insertion schemas", () => {
  it("generates only planned insertions with library defaults and explicit unsets", () => {
    const fixture = editGenerationFixture();
    const task = editTask(
      "first",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new-card",
          componentType: "Card",
          collection: { ownerId: "first", slotPath: "/cards" },
          anchor: { position: "after", componentId: "first-a" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const response = {
      taskId: task.taskId,
      sectionId: task.sectionId,
      updates: [],
      insertions: [{ insertionKey: "new-card", component: insertedCard() }],
    };
    const result = compiled.parseResponse(JSON.stringify(response));
    expect(JSON.stringify(result)).not.toContain('"id"');
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    const cards = candidate.content[1].props.content[0].props.cards;
    expect(cards.map((card: any) => card.props.text.defaultValue)).toEqual([
      "First card",
      "Default",
      "Second card",
    ]);
    expect(cards[1].props.id).toMatch(/^generated-/);
    expect(cards[1].props.optional).toBeUndefined();
    expect(cards[1].props.rows).toEqual([{ label: "New row" }]);
    expect(cards[1].props.text).toEqual({ defaultValue: "Default" });
    expect(cards[1].props).not.toHaveProperty("editorMetadata");
    expect(() =>
      compiled.parseResponse(JSON.stringify({ ...response, insertions: [] }))
    ).toThrow("omitted");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...response,
          insertions: [...response.insertions, ...response.insertions],
        })
      )
    ).toThrow("only once");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...response,
          insertions: [
            {
              ...response.insertions[0],
              component: { type: "Section", props: {} },
            },
          ],
        })
      )
    ).toThrow();
  });

  it.each(
    (["string", "richText"] as const).flatMap((kind) =>
      (["defaultOnly", "translate"] as const).flatMap((translationMode) =>
        [false, true].flatMap((nested) =>
          [false, true].map((useDefaults) => ({
            kind,
            translationMode,
            nested,
            useDefaults,
          }))
        )
      )
    )
  )(
    "round-trips normalized $kind insertions (mode $translationMode, nested $nested, defaults $useDefaults)",
    ({ kind, translationMode, nested, useDefaults }) => {
      const rich = z.object({ html: z.string(), json: z.string() });
      const value = kind === "string" ? z.string() : rich;
      const text = z.union([
        value,
        z.object({ defaultValue: value }).catchall(value),
      ]);
      const copy = (label: string) =>
        kind === "string" ? label : { html: `<p>${label}</p>`, json: label };
      const defaultText = {
        defaultValue: copy("Default"),
        fr: copy("French"),
        de: copy("German"),
        "pt/BR~legacy": copy("Portuguese"),
      };
      const binding = { field: "name", constantValueEnabled: false };
      const catalog = createPuckGenerationCatalog({
        Text: {
          generation: {
            props: z.object({
              "text/a~b": text,
              rows: z.array(z.object({ text })),
              binding: z.object({
                field: z.string(),
                constantValueEnabled: z.boolean(),
              }),
            }),
          },
          defaultProps: {
            "text/a~b": defaultText,
            rows: [{ text: clone(defaultText) }],
            binding,
            metadata: "Keep non-authored library defaults",
          },
        },
        Wrapper: {
          generation: {
            props: z.object({ children: z.array(z.unknown()) }),
          },
          fields: { children: { type: "slot", allow: ["Text"] } },
          defaultProps: { children: [] },
        },
      });
      const authoredText = {
        defaultValue: copy("Authored"),
        en: unset,
        fr: copy("Authored French"),
      };
      const input = {
        type: "Text",
        props: {
          "text/a~b": useDefaults ? defaults : authoredText,
          rows: useDefaults ? defaults : [{ text: authoredText }],
          binding: defaults,
        },
      };
      const component = nested
        ? { type: "Wrapper", props: { children: [input] } }
        : input;
      const task = {
        ...editTask(
          "reserved",
          [],
          [
            {
              kind: "insert",
              insertionKey: "new",
              componentType: component.type,
              collection: { ownerId: null, slotPath: null },
              anchor: { position: "end" },
            },
          ]
        ),
        translationMode,
      };
      const data: Content = { content: [] };
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      const output = {
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [{ insertionKey: "new", component }],
      };
      expect(
        z.fromJSONSchema(compiled.jsonSchema).safeParse(output).success
      ).toBe(true);
      const result = JSON.parse(
        JSON.stringify(compiled.parseResponse(JSON.stringify(output)))
      );
      const projected = nested
        ? result.operations[0].component.slots[0].components[0]
        : result.operations[0].component;
      expect(projected.unsetPaths).toContain("/text~1a~0b/de");
      expect(projected.unsetPaths).toContain("/text~1a~0b/pt~1BR~0legacy");
      const applied = materializeSectionEdit(catalog, data, task, result);
      const props = nested
        ? applied.content[0].props.children[0].props
        : applied.content[0].props;
      const expected = {
        defaultValue: copy(useDefaults ? "Default" : "Authored"),
        ...(translationMode === "translate"
          ? { fr: copy(useDefaults ? "French" : "Authored French") }
          : {}),
      };
      expect(props["text/a~b"]).toEqual(expected);
      expect(props.rows).toEqual([{ text: expected }]);
      expect(props.binding).toEqual(binding);
      expect(props.metadata).toBe("Keep non-authored library defaults");
      expect(props.id).toBeTruthy();
      expect(data).toEqual({ content: [] });
    }
  );

  it.each([
    { locale: "fr", translationMode: "defaultOnly", accepted: false },
    { locale: "fr", translationMode: "translate", accepted: true },
    { locale: "de", translationMode: "translate", accepted: false },
  ] as const)(
    "does not restore a required $locale override forbidden by $translationMode",
    ({ locale, translationMode, accepted }) => {
      const catalog = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({
              text: z.object({
                defaultValue: z.string(),
                [locale]: z.string(),
              }),
            }),
          },
          defaultProps: {
            text: { defaultValue: "Hello", [locale]: "Translation" },
          },
        },
      });
      const task = {
        ...editTask(
          "reserved",
          [],
          [
            {
              kind: "insert",
              insertionKey: "new",
              componentType: "Heading",
              collection: { ownerId: null, slotPath: null },
              anchor: { position: "end" },
            },
          ]
        ),
        translationMode,
      };
      const data: Content = { content: [] };
      const compiled = compileSectionEditSchema(
        catalog,
        ["en", "fr"],
        data,
        task
      );
      const output = JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [
          {
            insertionKey: "new",
            component: { type: "Heading", props: { text: defaults } },
          },
        ],
      });
      if (accepted) {
        expect(
          materializeSectionEdit(
            catalog,
            data,
            task,
            compiled.parseResponse(output)
          ).content[0].props.text
        ).toEqual({ defaultValue: "Hello", fr: "Translation" });
      } else {
        expect(() => compiled.parseResponse(output)).toThrow(
          "required after normalization"
        );
      }
    }
  );

  it("rejects unrepresentable locale removals instead of accepting restored defaults", () => {
    const catalog = createPuckGenerationCatalog({
      Heading: {
        generation: {
          props: z.object({
            text: z.object({
              defaultValue: z.string(),
              fr: z.string().optional(),
            }),
          }),
        },
        // The closed contract does not offer a path to remove this default.
        defaultProps: { text: { defaultValue: "Hello", de: "German" } },
      },
    });
    const task = editTask(
      "reserved",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new",
          componentType: "Heading",
          collection: { ownerId: null, slotPath: null },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      catalog,
      ["en", "fr"],
      { content: [] },
      task
    );
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          taskId: task.taskId,
          sectionId: task.sectionId,
          updates: [],
          insertions: [
            {
              insertionKey: "new",
              component: { type: "Heading", props: { text: defaults } },
            },
          ],
        })
      )
    ).toThrow("materialization restored localized defaults");
  });

  it("inserts cards whose default styles leave an optional union unset", () => {
    const fixture = editGenerationFixture();
    fixture.components.Card.generation!.props =
      fixture.components.Card.generation!.props.extend({
        style: z.object({
          color: z.enum(["red", "blue"]),
          border: z
            .union([
              z.object({ color: z.literal("black") }),
              z.object({ color: z.literal("white") }),
            ])
            .optional(),
        }),
      });
    fixture.components.Card.defaultProps!.style = {
      color: "blue",
      border: undefined,
    };
    const task = editTask(
      "first",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new-card",
          componentType: "Card",
          collection: { ownerId: "first", slotPath: "/cards" },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [{ insertionKey: "new-card", component: insertedCard() }],
      })
    );
    const inserted = result.operations.find(
      (operation) => operation.kind === "insert"
    )!;
    expect(inserted.component.unsetPaths).toContain("/style/border");
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    expect(
      candidate.content[1].props.content[0].props.cards[2].props.style
    ).toEqual({ color: "blue" });
    expect(candidate.content[1].props.content[0].props.cards[0]).toEqual(
      fixture.data.content[1].props.content[0].props.cards[0]
    );
  });

  it("decodes new section descendants into application-owned identities", () => {
    const fixture = editGenerationFixture();
    const task = editTask(
      "reserved-section",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new-section",
          componentType: "Section",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const response = {
      taskId: task.taskId,
      sectionId: task.sectionId,
      updates: [],
      insertions: [
        {
          insertionKey: "new-section",
          component: {
            type: "Section",
            props: { title: "New section", cards: [insertedCard()] },
          },
        },
      ],
    };
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      compiled.parseResponse(JSON.stringify(response))
    );
    const inserted = candidate.content[1].props.content.at(-1);
    expect(inserted.props.id).toBe("reserved-section");
    expect(inserted.props.cards[0].props.id).toMatch(/^generated-/);
    expect(inserted.props.cards[0].props.optional).toBeUndefined();
  });

  it("handles required arrays containing slots without using existing array members", () => {
    const catalog = createPuckGenerationCatalog({
      Group: {
        generation: {
          props: z.object({
            groups: z.array(
              z.object({ label: z.string(), children: z.array(z.unknown()) })
            ),
          }),
        },
        fields: {
          groups: {
            type: "array",
            arrayFields: {
              label: { type: "text" },
              children: { type: "slot", allow: ["Text"] },
            },
          },
        },
      },
      Text: {
        nestedOnly: true,
        generation: { props: z.object({ text: z.string() }) },
      },
    });
    const data: Content = {
      content: [{ type: "MainContent", props: { id: "main", content: [] } }],
    };
    const task = editTask(
      "new-group",
      [],
      [
        {
          kind: "insert",
          insertionKey: "group",
          componentType: "Group",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [
          {
            insertionKey: "group",
            component: {
              type: "Group",
              props: {
                groups: [
                  {
                    label: "One",
                    children: [{ type: "Text", props: { text: "Nested" } }],
                  },
                ],
              },
            },
          },
        ],
      })
    );
    const candidate = materializeSectionEdit(catalog, data, task, result);
    expect(
      candidate.content[0].props.content[0].props.groups[0].children[0].props
        .text
    ).toBe("Nested");
  });
});

describe("section edit slotted sources", () => {
  it("uses slotted-source helpers for new cards and preserves existing card identities", async () => {
    const fixture = slottedFixture();
    const data = fixture.materialize([
      fixture.section([fixture.card("Existing")]),
    ]);
    const section = data.content[0];
    const task = editTask(
      section.props.id,
      [],
      [
        {
          kind: "insert",
          insertionKey: "card",
          componentType: "FAQCard",
          collection: {
            ownerId: section.props.id,
            slotPath: "/slots/CardSlot",
          },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      data,
      task
    );
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [
          {
            insertionKey: "card",
            component: {
              type: "FAQCard",
              props: { data: defaults, styles: defaults, slots: defaults },
            },
          },
        ],
      })
    );
    const candidate = materializeSectionEdit(
      fixture.catalog,
      data,
      task,
      result
    );
    const cards = candidate.content[0].props.slots.CardSlot;
    expect(cards[0]).toEqual(section.props.slots.CardSlot[0]);
    expect(cards[1].props.slots.BodySlot[0].props.id).toBe(
      `${cards[1].props.id}-BodySlot-0`
    );
    const resolved = await fixture.resolve(candidate);
    expect(() =>
      preserveSectionEditResolution(fixture.catalog, resolved, candidate)
    ).not.toThrow();
  });

  it.each([
    { source: "library defaults", count: 3 },
    { source: "explicit empty cards", count: 0 },
    { source: "explicit cards", count: 1 },
  ])(
    "preserves $source in nested new source wrappers",
    async ({ source, count }) => {
      const fixture = slottedFixture();
      const data = fixture.materialize([
        fixture.section([fixture.card("Existing")]),
      ]);
      fixture.components.Outer = {
        generation: { props: z.object({ children: z.array(z.unknown()) }) },
        fields: { children: { type: "slot", allow: ["Section"] } },
        defaultProps: {
          children: [
            {
              type: "Section",
              props: clone(fixture.components.Section.defaultProps),
            },
          ],
        },
        render: () => null,
      };
      const task = editTask(
        "new-outer",
        [],
        [
          {
            kind: "insert",
            insertionKey: "outer",
            componentType: "Outer",
            collection: { ownerId: null, slotPath: null },
            anchor: { position: "end" },
          },
        ]
      );
      const compiled = compileSectionEditSchema(
        fixture.catalog,
        ["en", "fr"],
        data,
        task
      );
      const result = compiled.parseResponse(
        JSON.stringify({
          taskId: task.taskId,
          sectionId: task.sectionId,
          updates: [],
          insertions: [
            {
              insertionKey: "outer",
              component: {
                type: "Outer",
                props: {
                  children:
                    source === "library defaults"
                      ? defaults
                      : [
                          fixture.section(
                            source === "explicit cards"
                              ? [fixture.card("Nested question")]
                              : []
                          ),
                        ],
                },
              },
            },
          ],
        })
      );
      const candidate = materializeSectionEdit(
        fixture.catalog,
        data,
        task,
        result
      );
      expect(
        candidate.content[1].props.children[0].props.slots.CardSlot
      ).toHaveLength(count);
      if (source === "explicit cards") {
        expect(
          candidate.content[1].props.children[0].props.slots.CardSlot[0].props
            .data.question.defaultValue
        ).toBe("Nested question");
      }
      const resolved = await fixture.resolve(candidate);
      expect(() =>
        preserveSectionEditResolution(fixture.catalog, resolved, candidate)
      ).not.toThrow();
    }
  );
});
