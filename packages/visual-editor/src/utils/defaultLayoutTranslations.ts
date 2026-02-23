import type { Data } from "@puckeditor/core";
import { getDefaultRTF } from "../editor/TranslatableRichTextField.tsx";
import { defaultLayoutData } from "../vite-plugin/defaultLayoutData.ts";
import { isDeepEqual } from "./deepEqual.ts";
import {
  componentDefaultRegistry,
  isPlainObject,
} from "./i18n/componentDefaultRegistry.ts";
import { normalizeLocale } from "./normalizeLocale.ts";
import type { StreamDocument } from "./types/StreamDocument.ts";
import { DEFAULT_LOCALE } from "./pageSetLocales.ts";

type LocalizedObject = {
  hasLocalizedValue: "true";
  [key: string]: unknown;
};

export type VisualEditorTemplateId = "main" | "directory" | "locator";

const defaultLayoutsByTemplate: Record<VisualEditorTemplateId, unknown> = {
  main: JSON.parse(defaultLayoutData.main),
  directory: JSON.parse(defaultLayoutData.directory),
  locator: JSON.parse(defaultLayoutData.locator),
};

const enDefaults = componentDefaultRegistry[DEFAULT_LOCALE] ?? {};
const enValueToKeys = new Map<string, string[]>();

for (const [key, value] of Object.entries(enDefaults)) {
  const currentKeys = enValueToKeys.get(value) ?? [];
  currentKeys.push(key);
  enValueToKeys.set(value, currentKeys);
}

const hasOwn = (obj: object, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

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

const getTemplateLayout = (templateId: string): unknown | undefined => {
  if (!isVisualEditorTemplateId(templateId)) {
    return undefined;
  }
  return defaultLayoutsByTemplate[templateId];
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
 * Parses `_pageset` and returns the raw `scope.locales` array when available.
 *
 * Returns an empty array when locales are missing or not an array.
 * JSON parsing errors are handled by callers.
 */
const parsePagesetLocales = (streamDocument: StreamDocument): unknown[] => {
  const parsedPageset = JSON.parse(streamDocument?._pageset ?? "{}");
  const pagesetLocales = parsedPageset?.scope?.locales;
  return Array.isArray(pagesetLocales) ? pagesetLocales : [];
};

/**
 * Filters unknown locale input down to strings and normalizes each locale.
 */
const normalizeStringLocales = (locales: unknown[]): string[] => {
  return locales
    .filter((locale: unknown): locale is string => typeof locale === "string")
    .map((locale) => normalizeLocale(locale));
};

/**
 * Expands each locale to include both regional and base locale variants.
 *
 * Example: `es-MX` expands to `es-MX` and `es`.
 */
const expandWithBaseLocales = (locales: string[]): string[] => {
  // Include both regional and base locales (for example, "es-MX" and "es").
  const expandedLocales = new Set<string>();
  for (const locale of locales) {
    expandedLocales.add(locale);
    expandedLocales.add(locale.split("-")[0]);
  }
  return [...expandedLocales];
};

/**
 * Determines target locales for default translation injection.
 *
 * Fallback behavior:
 * - invalid/missing `_pageset` JSON -> `[DEFAULT_LOCALE]`
 * - missing/invalid `scope.locales` -> `[DEFAULT_LOCALE]`
 * - no valid string locales after normalization -> `[DEFAULT_LOCALE]`
 */
const getTargetLocales = (streamDocument: StreamDocument): string[] => {
  try {
    const pagesetLocales = parsePagesetLocales(streamDocument);
    if (pagesetLocales.length === 0) {
      return [DEFAULT_LOCALE];
    }

    const normalizedLocales = normalizeStringLocales(pagesetLocales);
    if (normalizedLocales.length === 0) {
      return [DEFAULT_LOCALE];
    }

    return expandWithBaseLocales(normalizedLocales);
  } catch {
    return [DEFAULT_LOCALE];
  }
};

const getLocaleDefaultMap = (locale: string): Record<string, string> => {
  const normalizedLocale = normalizeLocale(locale);
  const baseLocale = normalizedLocale.split("-")[0];

  return (
    componentDefaultRegistry[normalizedLocale] ??
    componentDefaultRegistry[baseLocale] ??
    {}
  );
};

/**
 * Resolves a localized default string for an English source value.
 *
 * A single English string can map to multiple default keys; injection is skipped
 * if any key is missing in the target locale or if mapped locale values disagree.
 */
const getLocalizedDefaultText = (
  locale: string,
  enValue: string
): string | undefined => {
  const keys = enValueToKeys.get(enValue);
  if (!keys || keys.length === 0) {
    return undefined;
  }

  const localeDefaults = getLocaleDefaultMap(locale);
  const candidateValues = new Set<string>();

  // One English string may map to multiple default keys.
  // If locale values disagree across keys, skip injection to avoid guessing.
  for (const key of keys) {
    const value = localeDefaults[key];
    if (value === undefined) {
      return undefined;
    }
    candidateValues.add(value);
  }

  if (candidateValues.size !== 1) {
    return undefined;
  }

  return candidateValues.values().next().value;
};

/**
 * Extracts text and style metadata from known default rich text HTML.
 *
 * Only `<strong>...</strong>` and `<span>...</span>` wrappers are supported.
 * Non-matching rich text shapes are ignored.
 */
const extractDefaultRichTextInfo = (
  value: unknown
): { text: string; isBold: boolean } | undefined => {
  if (!isPlainObject(value) || typeof value.html !== "string") {
    return undefined;
  }

  const match = value.html.match(/<(strong|span)>(.*?)<\/\1>/i);
  if (!match) {
    return undefined;
  }

  return {
    isBold: match[1].toLowerCase() === "strong",
    text: match[2],
  };
};

/**
 * Injects missing locale keys into a localized object.
 *
 * Existing locale values are never overwritten.
 */
const injectMissingLocaleValues = (
  node: LocalizedObject,
  locales: string[],
  resolveValue: (locale: string) => unknown
): void => {
  for (const locale of locales) {
    if (hasOwn(node, locale)) {
      continue;
    }

    const value = resolveValue(locale);
    if (value !== undefined) {
      node[locale] = value;
    }
  }
};

/**
 * Injects string defaults for missing locales when a deterministic mapping exists.
 */
const injectStringDefaultIfEligible = (
  localizedNode: LocalizedObject,
  locales: string[],
  enValue: string
): void => {
  injectMissingLocaleValues(localizedNode, locales, (locale) => {
    return getLocalizedDefaultText(locale, enValue);
  });
};

/**
 * Injects rich text defaults for missing locales when the source rich text shape
 * is recognized and the localized plain text mapping is deterministic.
 */
const injectRichTextDefaultIfEligible = (
  localizedNode: LocalizedObject,
  locales: string[],
  enValue: unknown
): void => {
  const richTextInfo = extractDefaultRichTextInfo(enValue);
  if (!richTextInfo) {
    return;
  }

  injectMissingLocaleValues(localizedNode, locales, (locale) => {
    const localizedText = getLocalizedDefaultText(locale, richTextInfo.text);
    return localizedText === undefined
      ? undefined
      : getDefaultRTF(localizedText, { isBold: richTextInfo.isBold });
  });
};

/**
 * Applies locale injection for a single node marked with `hasLocalizedValue`.
 */
const injectNodeLocalizedValues = (
  localizedNode: LocalizedObject,
  locales: string[]
): void => {
  if (localizedNode.hasLocalizedValue !== "true") {
    return;
  }

  const enValue = localizedNode.en;
  if (typeof enValue === "string") {
    injectStringDefaultIfEligible(localizedNode, locales, enValue);
    return;
  }

  injectRichTextDefaultIfEligible(localizedNode, locales, enValue);
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

  injectNodeLocalizedValues(node as LocalizedObject, locales);

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
  if (getTemplateLayout(templateId) === undefined) {
    return layout;
  }

  const locales = getTargetLocales(streamDocument);
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
