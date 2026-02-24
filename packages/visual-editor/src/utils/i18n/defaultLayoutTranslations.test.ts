import { describe, expect, it } from "vitest";
import { defaultLayoutData } from "../../vite-plugin/defaultLayoutData.ts";
import { processTemplateLayoutData } from "./defaultLayoutTranslations.ts";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import { getTranslations } from "./getTranslations.ts";
import type { Data } from "@puckeditor/core";

type TestLayout = Record<string, any>;

const buildLayoutDataWithSkippedLocales = (locales: unknown): Data =>
  asData({
    root: {
      props: {
        skipDefaultTranslations: locales,
      },
    },
    content: [],
  });

const buildLabelLayout = (
  labelOverrides: Record<string, string> = {}
): TestLayout => ({
  root: {
    props: {
      label: {
        hasLocalizedValue: "true",
        en: "Button",
        ...labelOverrides,
      },
    },
  },
});

const asData = (value: unknown): Data => value as Data;

const getComponentDefaultText = async (
  locale: string,
  key: string
): Promise<string> => {
  const translations = (await getTranslations(locale, "platform")) as Record<
    string,
    any
  >;
  return translations.componentDefaults[key];
};

describe("defaultLayoutTranslations", () => {
  it("seeds skipDefaultTranslations for all default layouts", () => {
    const mainLayout = JSON.parse(defaultLayoutData.main);
    const directoryLayout = JSON.parse(defaultLayoutData.directory);
    const locatorLayout = JSON.parse(defaultLayoutData.locator);

    expect(mainLayout.root.props.skipDefaultTranslations).toEqual(["en"]);
    expect(directoryLayout.root.props.skipDefaultTranslations).toEqual(["en"]);
    expect(locatorLayout.root.props.skipDefaultTranslations).toEqual(["en"]);
  });

  it("does not inject when skipDefaultTranslations marker is missing", async () => {
    const layoutData = asData({ root: { props: {} }, content: [] });
    const processedLayout = asData(buildLabelLayout());
    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "main",
      targetLocale: "fr",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect((processed as TestLayout).root.props.skipDefaultTranslations).toBe(
      undefined
    );
  });

  it("injects rich text locale when marker exists and target locale is valid", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData({
      root: {
        props: {
          body: {
            hasLocalizedValue: "true",
            en: getDefaultRTF("Banner Text"),
          },
        },
      },
    });

    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "main",
      targetLocale: "fr",
      buildProcessedLayout: async () => processedLayout,
    });

    const expectedText = await getComponentDefaultText("fr", "bannerText");
    const frBody = (
      (processed as TestLayout).root.props.body as Record<string, any>
    ).fr;
    expect(frBody).toBeDefined();
    expect(frBody.html).toContain(expectedText);
    expect(frBody.json).toContain(expectedText);
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("injects regional locales using stripped-locale defaults", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());

    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "main",
      targetLocale: "fr-CA",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label["fr-CA"]).toBe(
      await getComponentDefaultText("fr", "button")
    );
    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr-CA"]);
  });

  it("skips injection when target locale is missing", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData({
      ...buildLabelLayout(),
      root: {
        props: {
          ...buildLabelLayout().root.props,
          skipDefaultTranslations: ["en"],
        },
      },
    });

    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en"]);
  });

  it("skips injection when target locale is unsupported", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData({
      ...buildLabelLayout(),
      root: {
        props: {
          ...buildLabelLayout().root.props,
          skipDefaultTranslations: ["en"],
        },
      },
    });
    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "main",
      targetLocale: "zz",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.zz).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en"]);
  });

  it("skips injection when locale is already tracked in marker", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en", "fr"]);
    const processedLayout = asData({
      ...buildLabelLayout(),
      root: {
        props: {
          ...buildLabelLayout().root.props,
          skipDefaultTranslations: ["en", "fr"],
        },
      },
    });
    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "main",
      targetLocale: "fr",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("still marks locale as skipped when rich text shape is not recognized", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData({
      root: {
        props: {
          body: {
            hasLocalizedValue: "true",
            en: {
              html: "<p><em>Banner Text</em></p>",
              json: "{}",
            },
          },
        },
      },
    });

    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "main",
      targetLocale: "fr",
      buildProcessedLayout: async () => processedLayout,
    });

    expect(
      ((processed as TestLayout).root.props.body as Record<string, any>).fr
    ).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("supports sync buildProcessedLayout", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());
    const processedPromise = processTemplateLayoutData({
      layoutData,
      templateId: "main",
      targetLocale: "fr",
      buildProcessedLayout: () => processedLayout,
    });

    expect(processedPromise).toBeInstanceOf(Promise);
    const processed = await processedPromise;
    expect(processed).toBe(processedLayout);
    expect((processed as TestLayout).root.props.label.fr).toBe(
      await getComponentDefaultText("fr", "button")
    );
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("is a no-op for unknown template ids", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());
    const processed = await processTemplateLayoutData({
      layoutData,
      templateId: "unknown-template",
      targetLocale: "fr",
      buildProcessedLayout: async () => processedLayout,
    });

    expect(processed).toBe(processedLayout);
    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect((processed as TestLayout).root.props.skipDefaultTranslations).toBe(
      undefined
    );
  });
});
