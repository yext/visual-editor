import React from "react";
import type { StreamFields } from "../types/entityFields.ts";
import { loadVEPageTranslations } from "./i18n/page.ts";
import { loadVEPlatformTranslations } from "./i18n/platformLoader.ts";
import { useVisualEditorTranslations } from "./i18n/useVisualEditorTranslations.ts";
import type { TailwindConfig } from "./themeResolver.ts";
import { VisualEditorProviderCore } from "./VisualEditorProviderCore.tsx";

type AllOrNothing<T extends Record<string, any>> =
  | T
  | Partial<Record<keyof T, never>>;

type VisualEditorProviderProps<T> = {
  templateProps: T;
  children: React.ReactNode;
} & AllOrNothing<{
  entityFields: StreamFields | null;
  tailwindConfig: TailwindConfig;
}>;

const VisualEditorProvider = <T extends Record<string, any>>({
  templateProps,
  entityFields,
  tailwindConfig,
  children,
}: VisualEditorProviderProps<T>) => {
  const translationRuntime = React.useMemo(
    () => ({
      loadPlatformTranslations: loadVEPlatformTranslations,
      loadPageTranslations: (nextLocale: string) =>
        loadVEPageTranslations(nextLocale),
    }),
    []
  );
  const { normalizedTemplateProps } = useVisualEditorTranslations({
    templateProps,
    translationRuntime,
  });

  return (
    <VisualEditorProviderCore
      templateProps={normalizedTemplateProps}
      entityFields={entityFields}
      tailwindConfig={tailwindConfig}
      translationRuntime={translationRuntime}
      renderChildren={true}
    >
      {children}
    </VisualEditorProviderCore>
  );
};

export { VisualEditorProvider };
