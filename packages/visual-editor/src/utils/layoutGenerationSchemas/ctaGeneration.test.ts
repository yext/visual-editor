// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createPuckGenerationCatalog } from "../createPuckGenerationCatalog.ts";
import { getCTAType } from "../../internal/utils/ctaFieldUtils.ts";
import { compileEditPlanningSchema } from "../../internal/layoutGeneration/workflows/edits/sectionEditPlanningSchema.ts";
import { toPuckFields } from "../../fields/fields.ts";
import { compileGenerationSchema } from "../../internal/layoutGeneration/workflows/fullPageGeneration/pageSchema.ts";
import { compileSectionEditSchema } from "../../internal/layoutGeneration/workflows/edits/compileSectionEditSchema.ts";
import { materializeSectionEdit } from "../../internal/layoutGeneration/workflows/edits/applyEditsToLayout.ts";
import {
  editTask,
  unset,
} from "../../internal/layoutGeneration/testing/editFixtures.ts";
import { comprehensiveCtaZodSchema } from "./yextFieldSchemas.ts";

const catalog = createPuckGenerationCatalog({
  CTA: {
    fields: toPuckFields({
      cta: { type: "ctaSelector", generation: { required: true } },
      presetImage: {
        type: "basicSelector",
        options: "PRESET_IMAGE",
        generation: { required: true },
      },
    }),
  },
});

const source = (manual: boolean) => ({
  field: manual ? "" : "c_appCTA",
  constantValueEnabled: manual,
  constantValue: {
    label: "Download",
    link: "/app",
    ctaType: "textAndLink" as const,
  },
  selectedType: "textAndLink" as const,
});

describe("preset CTA generation contracts", () => {
  it("keeps mode and companion-field guidance in generation and edit planning", () => {
    const json = JSON.stringify(
      compileGenerationSchema(catalog, ["en"]).jsonSchema
    );
    expect(json).toContain("selectedType is ignored in constant value mode");
    expect(json).toContain(
      "Constant value CTAs instead require constantValue.ctaType"
    );
    const planning = compileEditPlanningSchema(catalog, ["en"], {
      content: [
        {
          type: "CTA",
          props: {
            id: "cta",
            cta: source(true),
            presetImage: "app-store",
          },
        },
      ],
    });
    const paths = planning.context.capabilities.CTA.authoredPaths;
    expect(
      paths.find(({ path }) => path === "/cta/constantValue/ctaType")
        ?.description
    ).toContain("constantValueEnabled: true");
    expect(
      paths.find(({ path }) => path === "/cta/selectedType")?.description
    ).toContain("constantValueEnabled false or absent");
    expect(
      comprehensiveCtaZodSchema.shape.data.shape.actionType.description
    ).toContain("Use link for preset icons");
    expect(
      comprehensiveCtaZodSchema.shape.styles.shape.presetImage.description
    ).toContain("Changing this field alone does not activate the icon");
  });

  it.each([true, false])(
    "generates preset artwork in manual mode %s",
    (manual) => {
      const cta = source(manual);
      const page = compileGenerationSchema(catalog, ["en"]).materialize({
        text: "Created",
        translationMode: "defaultOnly",
        result: {
          action: "create",
          content: [
            {
              type: "CTA",
              props: {
                cta: {
                  ...cta,
                  selectedType: manual ? "textAndLink" : "presetImage",
                  constantValue: {
                    ...cta.constantValue,
                    ctaType: manual ? "presetImage" : "textAndLink",
                    linkType: unset,
                    normalizeLink: unset,
                    openInNewTab: unset,
                  },
                },
                presetImage: "uber-eats",
              },
            },
          ],
        },
      }).spec!;
      expect(getCTAType(page.content[0].props.cta).ctaType).toBe("presetImage");
      expect(page.content[0].props.presetImage).toBe("uber-eats");
      expect(page.content[0].props.cta.field).toBe(cta.field);
    }
  );

  it.each([true, false])(
    "edits preset artwork in manual mode %s while preserving the source",
    (manual) => {
      const data = {
        content: [
          {
            type: "CTA",
            props: {
              id: "cta",
              cta: source(manual),
              presetImage: "app-store",
            },
          },
        ],
      };
      const before = structuredClone(data);
      const task = editTask("cta", ["cta"]);
      const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
      const result = compiled.parseResponse(
        JSON.stringify({
          taskId: task.taskId,
          sectionId: "cta",
          insertions: [],
          updates: [
            {
              kind: "update",
              componentId: "cta",
              changes: [
                {
                  kind: "set",
                  path: manual
                    ? "/cta/constantValue/ctaType"
                    : "/cta/selectedType",
                  value: "presetImage",
                },
                { kind: "set", path: "/presetImage", value: "google-play" },
              ],
            },
          ],
        })
      );
      const applied = materializeSectionEdit(catalog, data, task, result);
      const props = applied.content[0].props;
      expect(getCTAType(props.cta).ctaType).toBe("presetImage");
      expect(props.presetImage).toBe("google-play");
      expect(props.cta.field).toBe(before.content[0].props.cta.field);
      expect(props.cta.constantValue.link).toEqual(
        before.content[0].props.cta.constantValue.link
      );
      expect(props.cta.constantValueEnabled).toBe(manual);
      expect(data).toEqual(before);
    }
  );
});
