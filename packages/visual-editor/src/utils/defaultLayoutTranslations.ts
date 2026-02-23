import type { Data } from "@puckeditor/core";
import { getDefaultRTF } from "../editor/TranslatableRichTextField.tsx";
import { defaultLayoutData } from "../vite-plugin/defaultLayoutData.ts";
import { isDeepEqual } from "./deepEqual.ts";
import { componentDefaultRegistry } from "./i18n/componentDefaultRegistry.ts";
import { normalizeLocale } from "./normalizeLocale.ts";
import type { StreamDocument } from "./types/StreamDocument.ts";
import { DEFAULT_LOCALE } from "./pageSetLocales.ts";

type JsonObject = Record<string, unknown>;

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

const isPlainObject = (value: unknown): value is JsonObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const stripNonSemanticIds = (node: unknown): unknown => {
  if (Array.isArray(node)) {
    return node.map(stripNonSemanticIds);
  }

  if (!isPlainObject(node)) {
    return node;
  }

  const stripped: JsonObject = {};
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

const getTemplateLayout = (templateId: string): unknown | undefined => {
  return defaultLayoutsByTemplate[templateId as VisualEditorTemplateId];
};

const getNormalizedTemplateLayout = (
  templateId: string
): unknown | undefined => {
  return normalizedDefaultLayoutsByTemplate[
    templateId as VisualEditorTemplateId
  ];
};

const getTargetLocales = (streamDocument: StreamDocument): string[] => {
  try {
    const parsedPageset = JSON.parse(streamDocument?._pageset ?? "{}");
    const pagesetLocales = parsedPageset?.scope?.locales;

    if (!Array.isArray(pagesetLocales) || pagesetLocales.length === 0) {
      return [DEFAULT_LOCALE];
    }

    const normalizedLocales = pagesetLocales
      .filter((locale: unknown): locale is string => typeof locale === "string")
      .map((locale) => normalizeLocale(locale));

    if (normalizedLocales.length === 0) {
      return [DEFAULT_LOCALE];
    }

    // Include both regional and base locales (for example, "es-MX" and "es").
    const expandedLocales = new Set<string>();
    for (const locale of normalizedLocales) {
      expandedLocales.add(locale);
      expandedLocales.add(locale.split("-")[0]);
    }

    return [...expandedLocales];
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

const injectLocalizedValues = (node: unknown, locales: string[]): void => {
  if (Array.isArray(node)) {
    node.forEach((item) => injectLocalizedValues(item, locales));
    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  const localizedNode = node as LocalizedObject;
  if (localizedNode.hasLocalizedValue === "true") {
    const enValue = localizedNode.en;

    if (typeof enValue === "string") {
      injectMissingLocaleValues(localizedNode, locales, (locale) => {
        return getLocalizedDefaultText(locale, enValue);
      });
    } else {
      const richTextInfo = extractDefaultRichTextInfo(enValue);
      if (richTextInfo) {
        injectMissingLocaleValues(localizedNode, locales, (locale) => {
          const localizedText = getLocalizedDefaultText(
            locale,
            richTextInfo.text
          );
          return localizedText === undefined
            ? undefined
            : getDefaultRTF(localizedText, { isBold: richTextInfo.isBold });
        });
      }
    }
  }

  for (const value of Object.values(node)) {
    injectLocalizedValues(value, locales);
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
  injectLocalizedValues(layout, locales);
  return layout;
};

type ProcessTemplateLayoutData = {
  <TLayout extends Data>(
    options: Omit<
      ProcessTemplateLayoutDataOptions<TLayout>,
      "buildProcessedLayout"
    > & {
      buildProcessedLayout: () => TLayout;
    }
  ): TLayout;
  <TLayout extends Data>(
    options: Omit<
      ProcessTemplateLayoutDataOptions<TLayout>,
      "buildProcessedLayout"
    > & {
      buildProcessedLayout: () => Promise<TLayout>;
    }
  ): Promise<TLayout>;
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
 * @returns Processed layout, with injected default translations when eligible.
 */
export const processTemplateLayoutData: ProcessTemplateLayoutData = <
  TLayout extends Data,
>({
  layoutData,
  streamDocument,
  templateId,
  buildProcessedLayout,
}: ProcessTemplateLayoutDataOptions<TLayout>): TLayout | Promise<TLayout> => {
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

  const processedLayout = buildProcessedLayout();
  if (
    processedLayout &&
    typeof (processedLayout as Promise<TLayout>).then === "function"
  ) {
    return (processedLayout as Promise<TLayout>).then(applyInjection);
  }

  return applyInjection(processedLayout as TLayout);
};
