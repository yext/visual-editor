import { describe, expect, it } from "vitest";
import { defaultLayoutData } from "../../vite-plugin/defaultLayoutData.ts";
import { processTemplateLayoutData } from "./defaultLayoutTranslations.ts";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import { componentDefaultRegistry } from "./componentDefaultRegistry.ts";
import type { StreamDocument } from "../types/StreamDocument.ts";
import type { Data } from "@puckeditor/core";

type TestLayout = Record<string, any>;
type TestStreamDocument = Pick<StreamDocument, "_pageset">;

const buildStreamDocument = (locales: string[]): TestStreamDocument => ({
  _pageset: JSON.stringify({
    scope: { locales },
  }),
});

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
const asStreamDocument = (value: TestStreamDocument): StreamDocument =>
  value as StreamDocument;

describe("defaultLayoutTranslations", () => {
  it("seeds skipDefaultTranslations for all canonical default layouts", () => {
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
    const streamDocument = asStreamDocument(buildStreamDocument(["fr"]));
    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument,
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect((processed as TestLayout).root.props.skipDefaultTranslations).toBe(
      undefined
    );
  });

  it("injects rich text locales from default content translations when marker exists", async () => {
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
      streamDocument: asStreamDocument(buildStreamDocument(["fr"])),
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    const expectedText =
      componentDefaultRegistry.fr["componentDefaults.bannerText"];
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

  it("injects regional locales using stripped-locale defaults when marker exists", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());

    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument: asStreamDocument(buildStreamDocument(["fr-CA"])),
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label["fr-CA"]).toBe(
      componentDefaultRegistry.fr["componentDefaults.button"]
    );
    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr-CA"]);
  });

  it("does not inject locales without translations but still marks them as skipped", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());
    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument: asStreamDocument(buildStreamDocument(["zz"])),
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.zz).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "zz"]);
  });

  it("falls back to en when pageset is invalid and marker exists", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());

    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument: asStreamDocument({ _pageset: "not-json" }),
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.en).toBe("Button");
    expect(
      Object.keys((processed as TestLayout).root.props.label).sort()
    ).toEqual(["en", "hasLocalizedValue"]);
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en"]);
  });

  it("skips rich text injection when en rich text shape is not recognized", async () => {
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
      streamDocument: asStreamDocument(buildStreamDocument(["fr"])),
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect(
      ((processed as TestLayout).root.props.body as Record<string, any>).fr
    ).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("processTemplateLayoutData supports sync buildProcessedLayout", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());
    const streamDocument = asStreamDocument(buildStreamDocument(["fr"]));
    const processedPromise = processTemplateLayoutData({
      layoutData,
      streamDocument,
      templateId: "main",
      buildProcessedLayout: () => processedLayout,
    });
    expect(processedPromise).toBeInstanceOf(Promise);
    const processed = await processedPromise;

    expect(processed).toBe(processedLayout);
    expect((processed as TestLayout).root.props.label.fr).toBe(
      componentDefaultRegistry.fr["componentDefaults.button"]
    );
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("processTemplateLayoutData injects on edited layouts when marker exists", async () => {
    const layoutData = JSON.parse(defaultLayoutData.main) as Data;
    (layoutData.root.props as Record<string, unknown>).skipDefaultTranslations =
      ["en"];
    (layoutData.content as Array<any>)[0].props.styles.maxWidth = "wide";
    const processedLayout = asData(buildLabelLayout());
    const streamDocument = asStreamDocument(buildStreamDocument(["fr"]));
    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument,
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.fr).toBe(
      componentDefaultRegistry.fr["componentDefaults.button"]
    );
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("processTemplateLayoutData skips locales already tracked in marker", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en", "fr"]);
    const processedLayout = asData(buildLabelLayout());
    const streamDocument = asStreamDocument(buildStreamDocument(["en", "fr"]));
    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument,
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect(
      (processed as TestLayout).root.props.skipDefaultTranslations
    ).toEqual(["en", "fr"]);
  });

  it("processTemplateLayoutData is a no-op for unknown template ids", async () => {
    const layoutData = buildLayoutDataWithSkippedLocales(["en"]);
    const processedLayout = asData(buildLabelLayout());
    const streamDocument = asStreamDocument(buildStreamDocument(["fr"]));
    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument,
      templateId: "unknown-template",
      buildProcessedLayout: async () => processedLayout,
    });

    expect(processed).toBe(processedLayout);
    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
    expect((processed as TestLayout).root.props.skipDefaultTranslations).toBe(
      undefined
    );
  });
});
