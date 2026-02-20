import { describe, expect, it } from "vitest";
import { defaultLayoutData } from "../vite-plugin/defaultLayoutData.ts";
import {
  injectTemplateLayoutDefaultTranslations,
  isDefaultTemplateLayout,
  processTemplateLayoutData,
} from "./defaultLayoutTranslations.ts";
import { getDefaultRTF } from "../editor/TranslatableRichTextField.tsx";
import { componentDefaultRegistry } from "./i18n/componentDefaultRegistry.ts";
import type { StreamDocument } from "./types/StreamDocument.ts";
import type { Data } from "@puckeditor/core";

type TestLayout = Record<string, any>;
type TestStreamDocument = Pick<StreamDocument, "_pageset">;

const buildStreamDocument = (locales: string[]): TestStreamDocument => ({
  _pageset: JSON.stringify({
    scope: { locales },
  }),
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
  it("detects untouched defaults for directory and locator templates", () => {
    const directoryLayout = JSON.parse(defaultLayoutData.directory);
    const locatorLayout = JSON.parse(defaultLayoutData.locator);

    expect(isDefaultTemplateLayout(directoryLayout, "directory")).toBe(true);
    expect(isDefaultTemplateLayout(locatorLayout, "locator")).toBe(true);
  });

  it("injects rich text locales from default content translations", () => {
    const layout = {
      root: {
        props: {
          body: {
            hasLocalizedValue: "true",
            en: getDefaultRTF("Banner Text"),
          },
        },
      },
    };

    injectTemplateLayoutDefaultTranslations(
      asData(layout),
      asStreamDocument(buildStreamDocument(["fr"])),
      "main"
    );

    const expectedText =
      componentDefaultRegistry.fr["componentDefaults.bannerText"];
    const frBody = (layout.root.props.body as Record<string, any>).fr;
    expect(frBody).toBeDefined();
    expect(frBody.html).toContain(expectedText);
    expect(frBody.json).toContain(expectedText);
  });

  it("does not inject english defaults for locales without translations", () => {
    const layout = buildLabelLayout();

    const result = injectTemplateLayoutDefaultTranslations(
      asData(layout),
      asStreamDocument(buildStreamDocument(["zz"])),
      "main"
    );
    expect(result).toBe(layout as unknown as Data);
    expect(layout.root.props.label.zz).toBeUndefined();
    expect(Object.keys(layout.root.props.label).sort()).toEqual([
      "en",
      "hasLocalizedValue",
    ]);
  });

  it("falls back to en when pageset is invalid", () => {
    const layout = buildLabelLayout();

    injectTemplateLayoutDefaultTranslations(
      asData(layout),
      asStreamDocument({ _pageset: "not-json" }),
      "main"
    );

    expect(layout.root.props.label.en).toBe("Button");
    expect(Object.keys(layout.root.props.label).sort()).toEqual([
      "en",
      "hasLocalizedValue",
    ]);
  });

  it("skips rich text injection when en rich text shape is not recognized", () => {
    const layout = {
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
    };

    injectTemplateLayoutDefaultTranslations(
      asData(layout),
      asStreamDocument(buildStreamDocument(["fr"])),
      "main"
    );

    expect((layout.root.props.body as Record<string, any>).fr).toBeUndefined();
  });

  it("processTemplateLayoutData injects defaults when raw layout is untouched", async () => {
    const layoutData = JSON.parse(defaultLayoutData.main) as Data;
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
  });

  it("processTemplateLayoutData supports sync buildProcessedLayout", () => {
    const layoutData = JSON.parse(defaultLayoutData.main) as Data;
    const processedLayout = asData(buildLabelLayout());
    const streamDocument = asStreamDocument(buildStreamDocument(["fr"]));
    const processed = processTemplateLayoutData({
      layoutData,
      streamDocument,
      templateId: "main",
      buildProcessedLayout: () => processedLayout,
    });

    expect(processed).toBe(processedLayout);
    expect((processed as TestLayout).root.props.label.fr).toBe(
      componentDefaultRegistry.fr["componentDefaults.button"]
    );
  });

  it("processTemplateLayoutData skips injection when raw layout is edited", async () => {
    const layoutData = JSON.parse(defaultLayoutData.main) as Data;
    (layoutData.content as Array<any>)[0].props.styles.maxWidth = "wide";
    const processedLayout = asData(buildLabelLayout());

    const streamDocument = asStreamDocument(buildStreamDocument(["fr"]));
    const processed = await processTemplateLayoutData({
      layoutData,
      streamDocument,
      templateId: "main",
      buildProcessedLayout: async () => processedLayout,
    });

    expect((processed as TestLayout).root.props.label.fr).toBeUndefined();
  });

  it("processTemplateLayoutData is a no-op for unknown template ids", async () => {
    const layoutData = JSON.parse(defaultLayoutData.main) as Data;
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
  });
});
