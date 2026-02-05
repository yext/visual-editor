import { describe, expect, it } from "vitest";
import {
  getMetaTitleMissingLocales,
  getRelevantLocales,
} from "./metaTitleValidation.ts";
import { type TemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";
import { type YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import { type TranslatableString } from "../types/types.ts";

const baseTemplateMetadata: TemplateMetadata = {
  siteId: 1,
  templateId: "test-template",
  assignment: "ALL",
  isDevMode: false,
  devOverride: false,
  isxYextDebug: false,
  isThemeMode: false,
  entityCount: 1,
  totalEntityCount: 1,
  entityTypeDisplayName: "Entity",
  locales: ["en"],
  layoutTaskApprovals: false,
};

const makeTitleField = (
  value: Partial<YextEntityField<TranslatableString>>
): YextEntityField<TranslatableString> => ({
  field: "name",
  constantValue: "",
  constantValueEnabled: false,
  ...value,
});

describe("metaTitleValidation", () => {
  it("prefers template metadata locales over pageset locales", () => {
    const templateMetadata = {
      ...baseTemplateMetadata,
      locales: ["en", "es"],
    };
    const streamDocument = {
      _pageset: JSON.stringify({ scope: { locales: ["en", "fr"] } }),
    } as StreamDocument;

    expect(getRelevantLocales(templateMetadata, streamDocument)).toEqual([
      "en",
      "es",
    ]);
  });

  it("falls back to pageset locales when template metadata has none", () => {
    const templateMetadata = {
      ...baseTemplateMetadata,
      locales: [] as string[],
    };
    const streamDocument = {
      _pageset: JSON.stringify({ scope: { locales: ["en", "fr"] } }),
    } as StreamDocument;

    expect(getRelevantLocales(templateMetadata, streamDocument)).toEqual([
      "en",
      "fr",
    ]);
  });

  it("falls back to en when no locales are available", () => {
    const templateMetadata = {
      ...baseTemplateMetadata,
      locales: [] as string[],
    };
    const streamDocument = { _pageset: "" } as StreamDocument;

    expect(getRelevantLocales(templateMetadata, streamDocument)).toEqual([
      "en",
    ]);
  });

  it("requires all locales when constant value is enabled", () => {
    const titleField = makeTitleField({
      constantValueEnabled: true,
      constantValue: {
        hasLocalizedValue: "true",
        en: "Hello",
        es: "",
      },
    });

    expect(getMetaTitleMissingLocales(titleField, ["en", "es"])).toEqual([
      "es",
    ]);
  });

  it("treats empty string constant value as missing for all locales", () => {
    const titleField = makeTitleField({
      constantValueEnabled: true,
      constantValue: "   ",
    });

    expect(getMetaTitleMissingLocales(titleField, ["en", "fr"])).toEqual([
      "en",
      "fr",
    ]);
  });

  it("returns no missing locales when constant value is disabled", () => {
    const titleField = makeTitleField({
      constantValueEnabled: false,
      constantValue: {
        hasLocalizedValue: "true",
        en: "",
      },
    });

    expect(getMetaTitleMissingLocales(titleField, ["en"])).toEqual([]);
  });
});
