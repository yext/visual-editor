import { expect, it, vi } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import type { Content } from "../../shared/authoredValues.ts";
import { applyRegenerationStep } from "./applyRegenerationStep.ts";
import type { RegenerationStep } from "./contracts.ts";
import { compileRegenerationSchema } from "./pageSchema.ts";

// Match the representation choices used by the standard library, including
// localized defaults and copy authored in manual section slots.
const rich = z.strictObject({
  html: z.string().optional(),
  json: z.string().optional(),
});
const localized = (value: z.ZodType) =>
  z
    .object({
      defaultValue: value.optional(),
      hasLocalizedValue: z.literal("true").optional(),
    })
    .catchall(value.optional());
const text = z.union([z.string(), localized(z.string())]);
const richText = z.union([
  z.string(),
  localized(z.union([z.string(), rich])),
  rich,
]);
const source = (value: z.ZodType) =>
  z.object({
    field: z.string(),
    constantValue: value,
    constantValueEnabled: z.boolean(),
  });
const copy = (value: unknown) => ({
  field: "",
  constantValue: value,
  constantValueEnabled: true,
});
const defaultMarker = { $default: true };
const slot = (value: unknown) => ({
  type: "TextSlot",
  props: { data: { text: copy(value) }, styles: defaultMarker },
});
const fixture = () => {
  const catalog = createPuckGenerationCatalog(
    {
      BannerSection: {
        generation: {
          props: z.object({ data: z.object({ text: source(richText) }) }),
        },
        defaultProps: {
          data: {
            text: copy({
              defaultValue: {
                html: "<p>Banner Text</p>",
                json: "old document",
              },
            }),
          },
        },
      },
      PromoSection: {
        generation: {
          props: z.object({
            data: z.object({
              promo: source(
                z.object({
                  title: text.optional(),
                  description: text.optional(),
                })
              ).describe(
                "In constant mode author copy in child slots; source data is used only for entity-linked content."
              ),
            }),
            styles: z.object({ variant: z.enum(["classic", "compact"]) }),
            slots: z.object({
              HeadingSlot: z.array(z.unknown()),
              DescriptionSlot: z.array(z.unknown()),
              CTASlot: z.array(z.unknown()),
            }),
          }),
        },
        fields: {
          slots: {
            type: "object",
            objectFields: {
              HeadingSlot: { type: "slot", allow: ["TextSlot"] },
              DescriptionSlot: { type: "slot", allow: ["TextSlot"] },
              CTASlot: { type: "slot", allow: ["TextSlot"] },
            },
          },
        },
        defaultProps: {
          data: { promo: copy({}) },
          styles: { variant: "classic" },
          slots: Object.fromEntries(
            ["HeadingSlot", "DescriptionSlot", "CTASlot"].map((name) => [
              name,
              [
                {
                  type: "TextSlot",
                  props: {
                    id: `template-${name}`,
                    data: { text: copy({ defaultValue: "Text" }) },
                    styles: { align: "left" },
                  },
                },
              ],
            ])
          ),
        },
      },
      TextSlot: {
        nestedOnly: true,
        generation: {
          props: z.object({
            data: z.object({ text: source(text) }),
            styles: z.object({ align: z.enum(["left", "center"]) }),
          }),
        },
        defaultProps: {
          data: { text: copy({ defaultValue: "Text" }) },
          styles: { align: "left" },
        },
      },
      PlainText: {
        generation: { props: z.object({ text: z.string() }) },
        fields: { text: { type: "text" } },
        defaultProps: { text: "Text" },
      },
    },
    { defaultGenerationSectionIds: ["PromoSection"] }
  );
  const baseline: Content = {
    content: [
      {
        type: "BannerSection",
        props: {
          id: "banner",
          ...catalog.data.components.BannerSection.defaultProps,
        },
      },
    ],
  };
  const compile = () =>
    compileRegenerationSchema(catalog, ["en", "es"], baseline);
  return { catalog, baseline, compile };
};
const response = (sections: unknown[]) =>
  JSON.stringify({
    translationMode: "defaultOnly",
    result: {
      action: "regenerate",
      steps: [{ kind: "replace", sectionId: "banner", sections }],
    },
    text: "Regenerated.",
  });
const promotion = () => ({
  type: "PromoSection",
  props: {
    data: {
      promo: copy({ title: { $unset: true }, description: { $unset: true } }),
    },
    styles: defaultMarker,
    slots: {
      HeadingSlot: [slot("Pumpkin Spice, your way")],
      DescriptionSlot: [
        slot(
          "Explore a warming seasonal coffee and find your next café visit."
        ),
      ],
      CTASlot: [slot("Explore the seasonal menu")],
    },
  },
});

it("keeps the generated banner copy instead of the localized template fallback", () => {
  const { catalog, baseline, compile } = fixture();
  const authored = {
    html: "<p>Meet Pumpkin Spice at [[name]]</p>",
    json: "new document",
  };
  const output = compile().parseResponse(
    response([
      { type: "BannerSection", props: { data: { text: copy(authored) } } },
    ])
  );
  const next = applyRegenerationStep(catalog, baseline, output.result.steps[0]);
  expect(next.content[0].props.data.text.constantValue).toEqual({
    defaultValue: authored,
  });
});

it("requires real slot copy while retaining style defaults and business bindings", () => {
  const { catalog, baseline, compile } = fixture();
  const section = promotion();
  section.props.slots.HeadingSlot[0].props.data.text = {
    field: "name",
    constantValue: "Business name fallback",
    constantValueEnabled: false,
  };
  const output = compile().parseResponse(response([section]));
  const next = applyRegenerationStep(catalog, baseline, output.result.steps[0]);
  const props = next.content[0].props;
  expect(props.styles.variant).toBe("classic");
  expect(props.slots.HeadingSlot[0].props.data.text.field).toBe("name");
  expect(props.slots.HeadingSlot[0].props.data.text.constantValueEnabled).toBe(
    false
  );
  expect(
    props.slots.DescriptionSlot[0].props.data.text.constantValue.defaultValue
  ).toContain("seasonal coffee");
  expect(
    props.slots.CTASlot[0].props.data.text.constantValue.defaultValue
  ).toBe("Explore the seasonal menu");
});

it.each([
  "fallback",
  "localizedFallback",
  "missingFallback",
  "textData",
  "childSlot",
  "allSlots",
])(
  "rejects placeholder defaults selected through %s before streaming the section",
  async (location) => {
    const section: any = promotion();
    const props = section.props;
    if (location === "fallback")
      props.slots.HeadingSlot[0].props.data.text.constantValue = defaultMarker;
    if (location === "localizedFallback")
      props.slots.HeadingSlot[0].props.data.text.constantValue = {
        defaultValue: defaultMarker,
        hasLocalizedValue: { $unset: true },
        en: { $unset: true },
        es: { $unset: true },
      };
    if (location === "missingFallback")
      props.slots.HeadingSlot[0].props.data.text.constantValue = {
        defaultValue: { $unset: true },
        hasLocalizedValue: { $unset: true },
        en: { $unset: true },
        es: { $unset: true },
      };
    if (location === "textData")
      props.slots.HeadingSlot[0].props.data = defaultMarker;
    if (location === "childSlot") props.slots.HeadingSlot = defaultMarker;
    if (location === "allSlots") props.slots = defaultMarker;
    // Copy in a parent source does not make defaulted visible slots acceptable.
    props.data.promo.constantValue = {
      title: "Pumpkin Spice",
      description: "Seasonal drinks",
    };
    const compiled = fixture().compile();
    const onStep = vi.fn(async (_step: RegenerationStep) => {});
    const stream = compiled.streamRegeneration(onStep);
    await expect(stream.write(response([section]))).rejects.toThrow();
    expect(onStep).not.toHaveBeenCalled();
  }
);

it("also requires explicit plain text editor fields", () => {
  expect(() =>
    fixture()
      .compile()
      .parseResponse(
        response([{ type: "PlainText", props: { text: defaultMarker } }])
      )
  ).toThrow();
});

it("sends regeneration guidance and a compact section inventory alongside the complete layout", () => {
  const { compile, baseline } = fixture();
  const authoredBaseline = structuredClone(baseline);
  baseline.content[0].props.parentData = { text: "Duplicate resolved copy" };
  const compiled = compile();
  expect(compiled.instructions).not.toContain(
    "Create a native nested Puck page"
  );
  expect(compiled.instructions).not.toContain(
    "Default sections for fresh generation"
  );
  expect(compiled.instructions).toContain("insert missing content");
  expect(compiled.context.layout).toEqual(authoredBaseline);
  expect(baseline.content[0].props.parentData.text).toBe(
    "Duplicate resolved copy"
  );
  const descriptions = JSON.parse(
    compiled.instructions.split("Component descriptions and defaults:\n")[1]
  );
  expect(descriptions.PromoSection.defaults).toEqual({
    styles: { variant: "classic" },
  });
  expect(descriptions.TextSlot.defaults).not.toHaveProperty("data");
  expect(compiled.context.inventory.components[0]).not.toHaveProperty(
    "authoredValues"
  );
});

it("instructs regeneration to bind the business name instead of inventing branding", () => {
  const { instructions } = fixture().compile();
  expect(instructions).toContain(
    "use [[name]] wherever the business name appears"
  );
  expect(instructions).toContain(
    'field: "name" with constantValueEnabled: false'
  );
  expect(instructions).toContain(
    "Do not invent a business name or adopt sample branding from component defaults or template content"
  );
});
