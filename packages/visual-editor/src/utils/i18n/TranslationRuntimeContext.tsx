import React from "react";

// Keep this context independent of either provider so shared editor code can
// consume the active runtime without importing the built-in loader graph.
export type TranslationRuntimeContextValue = {
  loadPlatformTranslations: (locale: string) => Promise<void>;
  loadPageTranslations: (locale: string) => Promise<void>;
};

const missingRuntime = async (): Promise<void> => {
  throw new Error("Translation runtime is missing a VisualEditorProvider.");
};

export const TranslationRuntimeContext =
  React.createContext<TranslationRuntimeContextValue>({
    loadPlatformTranslations: missingRuntime,
    loadPageTranslations: missingRuntime,
  });

export const useTranslationRuntime = (): TranslationRuntimeContextValue =>
  React.useContext(TranslationRuntimeContext);
