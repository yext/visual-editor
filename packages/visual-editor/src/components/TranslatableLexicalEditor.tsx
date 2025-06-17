import React, { useState } from "react";
import { LexicalEditorComponent } from "./LexicalEditor.tsx";
import { RichText } from "../types/types.ts";
import { usePuck } from "@measured/puck";

interface TranslatableLexicalEditorProps {
  value: string | RichText;
  onChange: (value: string | RichText) => void;
  readOnly?: boolean;
  translations?: Record<string, string | RichText>;
  onTranslationChange?: (locale: string, value: string | RichText) => void;
  currentLocale?: string;
  availableLocales?: string[];
}

export function TranslatableLexicalEditor({
  value,
  onChange,
  readOnly = false,
  translations = {},
  onTranslationChange,
  currentLocale = "en",
  availableLocales = ["en"],
}: TranslatableLexicalEditorProps) {
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);
  const { appState } = usePuck();
  const isDrawerOpen = appState?.ui?.rightSideBarVisible;

  const handleLocaleChange = (locale: string) => {
    setSelectedLocale(locale);
  };

  const handleEditorChange = (newValue: string | RichText) => {
    if (selectedLocale === currentLocale) {
      onChange(newValue);
    } else if (onTranslationChange) {
      onTranslationChange(selectedLocale, newValue);
    }
  };

  const getValueForLocale = (locale: string) => {
    if (locale === currentLocale) {
      return value;
    }
    return translations[locale] || "";
  };

  return (
    <div className="translatable-lexical-editor">
      <div className="locale-selector mb-2">
        {availableLocales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`px-3 py-1 mr-2 rounded ${
              selectedLocale === locale
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
      <LexicalEditorComponent
        value={getValueForLocale(selectedLocale)}
        onChange={handleEditorChange}
        readOnly={readOnly}
        showToolbar={isDrawerOpen}
      />
    </div>
  );
}
