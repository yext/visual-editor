import type { Data, DefaultComponentProps } from "@puckeditor/core";
import { defaultLayoutData } from "../../vite-plugin/defaultLayoutData.ts";
import { normalizeLocales } from "../pageSetLocales.ts";
import {
  getComponentDefaultsFromTranslations,
  normalizeComponentDefaultLocale,
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
 * This reads `root.props.skipDefaultTranslations` and returns an object with:
 * - `hasMarker`: whether the key exists at all
 * - `locales`: normalized locale values currently tracked in the marker
 *
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
 * The marker is written only when root props exist.
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
  processedLayout: TLayout;
  templateId: string;
  targetLocale?: string;
  targetTranslations?: Record<string, unknown>;
  targets?: Array<{
    locale: string;
    translations?: Record<string, unknown>;
  }>;
};

/**
 * Runs template layout processing and conditionally injects default translations
 * based on the `root.props.skipDefaultTranslations` marker.
 *
 * @param options.layoutData - layout before migration/resolution.
 * @param options.processedLayout - processed layout (for example after migration
 * and resolve).
 * @param options.templateId - `main`, `directory`, or `locator`
 * @param options.targetLocale - locale to inject
 * @param options.targetTranslations - locale translations for `targetLocale`.
 * @param options.targets - optional batch locale/translation targets to inject
 * in. When present, single-target options are ignored.
 *
 * @returns promise of processed layout with injected default translations
 */
export const processTemplateLayoutData = async <
  TLayout extends Data<DefaultComponentProps, RootProps>,
>({
  layoutData,
  processedLayout,
  templateId,
  targetLocale,
  targetTranslations,
  targets,
}: ProcessTemplateLayoutDataOptions<TLayout>): Promise<TLayout> => {
  if (!Object.prototype.hasOwnProperty.call(defaultLayoutData, templateId)) {
    return processedLayout;
  }

  const { hasMarker, locales: skippedDefaultTranslations } =
    getSkippedDefaultTranslationsState(layoutData);
  if (!hasMarker) {
    return processedLayout;
  }

  const localeTargets =
    targets && targets.length > 0
      ? targets
      : targetLocale
        ? [{ locale: targetLocale, translations: targetTranslations }]
        : [];

  if (localeTargets.length === 0) {
    return processedLayout;
  }

  const nextSkippedLocales = [...skippedDefaultTranslations];
  let didInjectAnyLocale = false;

  for (const target of localeTargets) {
    const normalizedTargetLocale = normalizeComponentDefaultLocale(
      target.locale
    );
    if (
      !normalizedTargetLocale ||
      nextSkippedLocales.includes(normalizedTargetLocale)
    ) {
      continue;
    }

    const localizedComponentDefaults = getComponentDefaultsFromTranslations(
      target.translations
    );
    if (Object.keys(localizedComponentDefaults).length === 0) {
      continue;
    }

    injectMissingLocalizedValuesRecursively(
      processedLayout,
      normalizedTargetLocale,
      localizedComponentDefaults
    );

    nextSkippedLocales.push(normalizedTargetLocale);
    didInjectAnyLocale = true;
  }

  if (!didInjectAnyLocale) {
    return processedLayout;
  }

  writeSkippedDefaultTranslations(processedLayout, nextSkippedLocales);

  return processedLayout;
};
