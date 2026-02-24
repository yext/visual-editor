import type { Data, DefaultComponentProps } from "@puckeditor/core";
import { defaultLayoutData } from "../../vite-plugin/defaultLayoutData.ts";
import { normalizeLocales } from "../pageSetLocales.ts";
import {
  normalizeComponentDefaultLocale,
  preloadComponentDefaultTranslations,
} from "./componentDefaultResolver.ts";
import { injectMissingLocalizedValuesRecursively } from "./injectMissingLocalizedValues.ts";
import { RootProps } from "../migrate.ts";

const SKIP_DEFAULT_TRANSLATIONS_KEY = "skipDefaultTranslations";

type SkipDefaultTranslationsState = {
  hasMarker: boolean;
  locales: string[];
};

/**
 * Reads the persisted skip marker state from layout root props.
 *
 * This reads `root.props.skipDefaultTranslations` and separates two concerns:
 * - `hasMarker`: whether the key exists at all (presence gate for injection)
 * - `locales`: normalized locale values currently tracked in the marker
 *
 * Locale normalization trims whitespace, removes empty values, and de-duplicates
 * while preserving the first occurrence order.
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
 * Persists `skipDefaultTranslations` onto `layout.root.props`.
 *
 * The marker is written only when root props exist. Input locales are normalized
 * to keep the marker deterministic and idempotent across repeated writes.
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
  templateId: string;
  targetLocale?: string;
  buildProcessedLayout: () => TLayout | Promise<TLayout>;
};

/**
 * Runs template layout processing and conditionally injects default translations
 * based on the `root.props.skipDefaultTranslations` marker.
 *
 * @param options.layoutData - layout before migration/resolution.
 * @param options.templateId - Template id (`main`, `directory`, or `locator`).
 * @param options.targetLocale - Locale to inject in this run.
 * @param options.buildProcessedLayout - Function that returns the processed layout
 * (sync or async).
 * @returns Promise of processed layout with injected default translations when eligible.
 */
export const processTemplateLayoutData = async <
  TLayout extends Data<DefaultComponentProps, RootProps>,
>({
  layoutData,
  templateId,
  targetLocale,
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

  const normalizedTargetLocale = normalizeComponentDefaultLocale(targetLocale);
  if (!normalizedTargetLocale) {
    return processedLayout;
  }

  if (skippedDefaultTranslations.includes(normalizedTargetLocale)) {
    return processedLayout;
  }

  const didPreloadDefaults = await preloadComponentDefaultTranslations(
    normalizedTargetLocale
  );
  if (!didPreloadDefaults) {
    return processedLayout;
  }

  injectMissingLocalizedValuesRecursively(
    processedLayout,
    normalizedTargetLocale
  );

  writeSkippedDefaultTranslations(processedLayout, [
    ...skippedDefaultTranslations,
    normalizedTargetLocale,
  ]);

  return processedLayout;
};
