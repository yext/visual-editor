import type { Data, DefaultComponentProps } from "@puckeditor/core";
import { defaultLayoutData } from "../../vite-plugin/defaultLayoutData.ts";
import { isPlainObject } from "./componentDefaultRegistry.ts";
import type { StreamDocument } from "../types/StreamDocument.ts";
import { getPageSetLocales, normalizeLocales } from "../pageSetLocales.ts";
import { resolveLocalizedComponentDefaultValue } from "./componentDefaultResolver.ts";
import { RootProps } from "../migrate.ts";

const SKIP_DEFAULT_TRANSLATIONS_KEY = "skipDefaultTranslations";

type LocalizedObject = {
  hasLocalizedValue: "true";
  [key: string]: unknown;
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

type SkipDefaultTranslationsState = {
  hasMarker: boolean;
  locales: string[];
};

/**
 * Reads the persisted skip marker state from layout root props.
 *
 * `hasMarker` indicates whether the marker key exists at all, while `locales`
 * contains a normalized locale list (trimmed, deduped, invalid entries removed).
 */
const getSkippedDefaultTranslationsState = (
  layout: Data<DefaultComponentProps, RootProps>
): SkipDefaultTranslationsState => {
  if (!layout.root || !layout.root.props) {
    return { hasMarker: false, locales: [] };
  }

  const rootProps = layout.root.props;
  return {
    hasMarker: Object.prototype.hasOwnProperty.call(
      rootProps,
      SKIP_DEFAULT_TRANSLATIONS_KEY
    ),
    locales: normalizeLocales(rootProps[SKIP_DEFAULT_TRANSLATIONS_KEY]),
  };
};

/**
 * Writes the persisted skip marker, skipDefaultTranslations, to layout root props.
 */
const writeSkippedDefaultTranslations = (
  layout: Data<DefaultComponentProps, RootProps>,
  locales: string[]
) => {
  if (!layout.root || !layout.root.props) {
    return;
  }

  layout.root.props[SKIP_DEFAULT_TRANSLATIONS_KEY] = normalizeLocales(locales);
};

type ProcessTemplateLayoutDataOptions<
  TLayout extends Data<DefaultComponentProps, RootProps>,
> = {
  layoutData: Data<DefaultComponentProps, RootProps>;
  streamDocument: StreamDocument;
  templateId: string;
  buildProcessedLayout: () => TLayout | Promise<TLayout>;
};

/**
 * Runs template layout processing and conditionally injects default translations
 * based on the `root.props.skipDefaultTranslations` marker.
 *
 * @param options.layoutData - layout before migration/resolution.
 * @param options.streamDocument - Stream document used for scoped locale selection.
 * @param options.templateId - Template id (`main`, `directory`, or `locator`).
 * @param options.buildProcessedLayout - Function that returns the processed layout
 * (sync or async).
 * @returns Promise of processed layout with injected default translations when eligible.
 */
export const processTemplateLayoutData = async <
  TLayout extends Data<DefaultComponentProps, RootProps>,
>({
  layoutData,
  streamDocument,
  templateId,
  buildProcessedLayout,
}: ProcessTemplateLayoutDataOptions<TLayout>): Promise<TLayout> => {
  const processedLayout = await Promise.resolve(buildProcessedLayout());
  if (!Object.prototype.hasOwnProperty.call(defaultLayoutData, templateId)) {
    return processedLayout;
  }

  const { hasMarker, locales: skippedDefaultTranslations } =
    getSkippedDefaultTranslationsState(layoutData);
  if (!hasMarker) {
    return processedLayout;
  }

  const scopedLocales = getPageSetLocales(streamDocument);
  const skippedLocaleSet = new Set(skippedDefaultTranslations);
  const unskippedLocales = scopedLocales.filter(
    (locale) => !skippedLocaleSet.has(locale)
  );

  if (unskippedLocales.length > 0) {
    injectLocalizedValuesRecursively(processedLayout, unskippedLocales);
  }

  writeSkippedDefaultTranslations(processedLayout, [
    ...skippedDefaultTranslations,
    ...scopedLocales,
  ]);

  return processedLayout;
};
