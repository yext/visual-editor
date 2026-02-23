import type { Data } from "@puckeditor/core";
import { defaultLayoutData } from "../../vite-plugin/defaultLayoutData.ts";
import { isDeepEqual } from "../deepEqual.ts";
import { isPlainObject } from "./componentDefaultRegistry.ts";
import type { StreamDocument } from "../types/StreamDocument.ts";
import { getPageSetLocales } from "../pageSetLocales.ts";
import { resolveLocalizedComponentDefaultValue } from "./componentDefaultResolver.ts";

type LocalizedObject = {
  hasLocalizedValue: "true";
  [key: string]: unknown;
};

export type VisualEditorTemplateId = keyof typeof defaultLayoutData;

const defaultLayoutsByTemplate = Object.fromEntries(
  Object.entries(defaultLayoutData).map(([templateId, layout]) => [
    templateId,
    JSON.parse(layout),
  ])
) as Record<VisualEditorTemplateId, unknown>;

/**
 * Recursively removes generated string `id` fields from layout-like objects.
 *
 * This normalizes otherwise equivalent layouts so comparisons ignore
 * non-semantic identifier differences.
 */
const stripNonSemanticIds = (node: unknown): unknown => {
  if (Array.isArray(node)) {
    return node.map(stripNonSemanticIds);
  }

  if (!isPlainObject(node)) {
    return node;
  }

  const stripped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "id" && typeof value === "string") {
      continue;
    }
    stripped[key] = stripNonSemanticIds(value);
  }

  return stripped;
};

const normalizedDefaultLayoutsByTemplate: Record<
  VisualEditorTemplateId,
  unknown
> = Object.fromEntries(
  Object.entries(defaultLayoutsByTemplate).map(([templateId, layout]) => [
    templateId,
    stripNonSemanticIds(layout),
  ])
) as Record<VisualEditorTemplateId, unknown>;

/**
 * Ensure templateId is "main" | "directory" | "locator"
 */
const isVisualEditorTemplateId = (
  templateId: string
): templateId is VisualEditorTemplateId => {
  return templateId in defaultLayoutsByTemplate;
};

const getNormalizedTemplateLayout = (
  templateId: string
): unknown | undefined => {
  if (!isVisualEditorTemplateId(templateId)) {
    return undefined;
  }
  return normalizedDefaultLayoutsByTemplate[templateId];
};

/**
 * Type guard for nodes that use the `{ hasLocalizedValue: "true" }` shape.
 */
const isLocalizedObject = (value: unknown): value is LocalizedObject => {
  return isPlainObject(value) && value.hasLocalizedValue === "true";
};

/**
 * Recursively traverses layout data and mutates eligible localized nodes in place.
 */
const injectLocalizedValuesRecursively = (
  node: unknown,
  locales: string[]
): void => {
  if (Array.isArray(node)) {
    node.forEach((item) => injectLocalizedValuesRecursively(item, locales));
    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  if (isLocalizedObject(node)) {
    for (const locale of locales) {
      if (!(locale in node)) {
        const localizedValue = resolveLocalizedComponentDefaultValue(
          locale,
          node.en
        );
        if (localizedValue !== undefined) {
          node[locale] = localizedValue;
        }
      }
    }
    // No nested localizable structures exist inside this node, so we can exit early.
    return;
  }

  for (const value of Object.values(node)) {
    injectLocalizedValuesRecursively(value, locales);
  }
};

type ProcessTemplateLayoutDataOptions<TLayout extends Data> = {
  layoutData: Data;
  streamDocument: StreamDocument;
  templateId: string;
  buildProcessedLayout: () => TLayout | Promise<TLayout>;
};

/**
 * Checks whether a layout matches the canonical default layout for a template.
 *
 * Differences in generated string `id` fields are ignored.
 *
 * @param layout - Layout data to compare.
 * @param templateId - Template id (`main`, `directory`, or `locator`).
 * @returns `true` when the layout is semantically unchanged from the template default.
 */
export const isDefaultTemplateLayout = (
  layout: unknown,
  templateId: string
): boolean => {
  const defaultLayout = getNormalizedTemplateLayout(templateId);
  if (defaultLayout === undefined) {
    return false;
  }

  return isDeepEqual(stripNonSemanticIds(layout), defaultLayout);
};

/**
 * Injects missing localized values for known default template content.
 *
 * This mutates `layout` in place and also returns the same layout object.
 * Existing locale values are never overwritten.
 *
 * @param layout - Layout data to enrich.
 * @param streamDocument - Stream document used to determine target locales.
 * @param templateId - Template id (`main`, `directory`, or `locator`).
 * @returns The same `layout` object after injection.
 */
export const injectTemplateLayoutDefaultTranslations = (
  layout: Data,
  streamDocument: StreamDocument,
  templateId: string
): Data => {
  if (!isVisualEditorTemplateId(templateId)) {
    return layout;
  }

  const locales = getPageSetLocales(streamDocument);
  injectLocalizedValuesRecursively(layout, locales);
  return layout;
};

/**
 * Runs template layout processing and conditionally injects default translations.
 *
 * The default-layout check is performed against `layoutData` before running
 * `buildProcessedLayout`, and injection is applied only when the layout was
 * still untouched at that point.
 *
 * @param options.layoutData - layout before migration/resolution.
 * @param options.streamDocument - Stream document used for locale selection.
 * @param options.templateId - Template id (`main`, `directory`, or `locator`).
 * @param options.buildProcessedLayout - Function that returns the processed layout
 * (sync or async).
 * @returns Promise of processed layout, with injected default translations when eligible.
 */
export const processTemplateLayoutData = async <TLayout extends Data>({
  layoutData,
  streamDocument,
  templateId,
  buildProcessedLayout,
}: ProcessTemplateLayoutDataOptions<TLayout>): Promise<TLayout> => {
  const shouldInjectDefaultTranslations = isDefaultTemplateLayout(
    layoutData,
    templateId
  );

  const applyInjection = (processedLayout: TLayout): TLayout => {
    if (!shouldInjectDefaultTranslations) {
      return processedLayout;
    }

    return injectTemplateLayoutDefaultTranslations(
      processedLayout,
      streamDocument,
      templateId
    ) as TLayout;
  };

  const processedLayout = await Promise.resolve(buildProcessedLayout());
  return applyInjection(processedLayout);
};
