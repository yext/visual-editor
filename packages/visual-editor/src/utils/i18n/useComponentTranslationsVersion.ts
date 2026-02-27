import { useEffect, useState } from "react";
import { i18nComponentsInstance } from "./components.ts";

/**
 * Monotonic version that increments when component translation resources change.
 *
 * Consumers can use this in memo/effect dependency arrays to recompute locale-
 * dependent defaults once component i18n bundles are loaded.
 */
export const useComponentTranslationsVersion = (): number => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleTranslationsChange = () => {
      setVersion((current) => current + 1);
    };

    i18nComponentsInstance.on("loaded", handleTranslationsChange);
    i18nComponentsInstance.on("languageChanged", handleTranslationsChange);
    i18nComponentsInstance.store?.on?.("added", handleTranslationsChange);

    return () => {
      i18nComponentsInstance.off("loaded", handleTranslationsChange);
      i18nComponentsInstance.off("languageChanged", handleTranslationsChange);
      i18nComponentsInstance.store?.off?.("added", handleTranslationsChange);
    };
  }, []);

  return version;
};
