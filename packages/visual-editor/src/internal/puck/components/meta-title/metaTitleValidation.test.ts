import { describe, expect, it } from "vitest";
import { getMetaTitleMissingLocales } from "./metaTitleValidation.ts";
import { getPageSetLocales } from "../../../../utils/pageSetLocales.ts";
import { type StreamDocument } from "../../../../utils/types/StreamDocument.ts";
import { type YextEntityField } from "../../../../editor/YextEntityFieldSelector.tsx";
import { type TranslatableString } from "../../../../types/types.ts";

const makeTitleField = (
  value: Partial<YextEntityField<TranslatableString>>
): YextEntityField<TranslatableString> => ({
  field: "name",
  constantValue: "",
  constantValueEnabled: false,
  ...value,
});

describe("metaTitleValidation", () => {
  it("returns pageset locales when available", () => {
    const streamDocument = {
      _pageset: JSON.stringify({ scope: { locales: ["en", "fr"] } }),
    } as StreamDocument;

    expect(getPageSetLocales(streamDocument)).toEqual(["en", "fr"]);
  });

  it("falls back to en when no locales are available", () => {
    const streamDocument = { _pageset: "" } as StreamDocument;

    expect(getPageSetLocales(streamDocument)).toEqual(["en"]);
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
