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
import { DEFAULT_LOCALE, getPageSetLocales } from "./pageSetLocales.ts";

type LocalizedObject = {
  hasLocalizedValue: "true";
  [key: string]: unknown;
};

export type VisualEditorTemplateId = keyof typeof defaultLayoutData;

const KNOWN_DEFAULT_RICH_TEXT_REGEX = /<span>(.*?)<\/span>/i;

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

const buildEnglishValueToKeysIndex = (): Map<string, string[]> => {
  const englishDefaults = componentDefaultRegistry[DEFAULT_LOCALE] ?? {};
  const index = new Map<string, string[]>();

  for (const [key, value] of Object.entries(englishDefaults)) {
    const existingKeys = index.get(value) ?? [];
    existingKeys.push(key);
    index.set(value, existingKeys);
  }

  return index;
};

const enValueToKeys = buildEnglishValueToKeysIndex();

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
 * Falls back to `[DEFAULT_LOCALE]` when pageset locales are missing/invalid.
 */
const getTargetLocales = (streamDocument: StreamDocument): string[] => {
  const normalizedLocales = getPageSetLocales(streamDocument).map((locale) =>
    normalizeLocale(locale)
  );
  if (normalizedLocales.length === 0) {
    return [DEFAULT_LOCALE];
  }

  return expandWithBaseLocales(normalizedLocales);
};

const getDefaultsForLocale = (locale: string): Record<string, string> => {
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
const resolveDeterministicLocalizedText = (
  locale: string,
  enValue: string
): string | undefined => {
  const keys = enValueToKeys.get(enValue);
  if (!keys || keys.length === 0) {
    return undefined;
  }

  const localeDefaults = getDefaultsForLocale(locale);
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
 * Extracts text from known default rich text HTML.
 *
 * Only `<span>...</span>` wrappers are supported.
 * Non-matching rich text shapes are ignored.
 */
const extractKnownDefaultRichTextText = (
  value: unknown
): string | undefined => {
  if (!isPlainObject(value) || typeof value.html !== "string") {
    return undefined;
  }

  const match = value.html.match(KNOWN_DEFAULT_RICH_TEXT_REGEX);
  if (!match) {
    return undefined;
  }

  return match[1];
};

/**
 * Resolves an injectable localized value for a locale based on the English value.
 * Returns `undefined` when the value is ineligible or ambiguous.
 */
const resolveLocalizedDefaultValue = (
  locale: string,
  enValue: unknown
): unknown => {
  if (typeof enValue === "string") {
    return resolveDeterministicLocalizedText(locale, enValue);
  }

  const enRichTextText = extractKnownDefaultRichTextText(enValue);
  if (!enRichTextText) {
    return undefined;
  }

  const localizedText = resolveDeterministicLocalizedText(
    locale,
    enRichTextText
  );
  return localizedText === undefined ? undefined : getDefaultRTF(localizedText);
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
      if (Object.prototype.hasOwnProperty.call(node, locale)) {
        continue;
      }

      const localizedValue = resolveLocalizedDefaultValue(locale, node.en);
      if (localizedValue !== undefined) {
        node[locale] = localizedValue;
      }
    }
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
