import React, { useState } from "react";
import { LexicalEditorComponent } from "./LexicalEditor.tsx";
import { RichText } from "../types/types.ts";
import { usePuck } from "@measured/puck";

interface TranslatableLexicalEditorProps {
  value: string | RichText;
  onChange: (value: string | RichText) => void;
  translations?: Record<string, string | RichText>;
  onTranslationChange?: (locale: string, value: string | RichText) => void;
  currentLocale?: string;
  availableLocales?: string[];
}

export function TranslatableLexicalEditor({
  value,
  onChange,
  translations = {},
  onTranslationChange,
  currentLocale = "en",
  availableLocales = ["en"],
}: TranslatableLexicalEditorProps) {
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);
  const { appState } = usePuck();
  const isDrawerOpen = appState?.ui?.rightSideBarVisible;
  const prevLocaleRef = React.useRef(selectedLocale);
  const [editorKey, setEditorKey] = React.useState(0);

  // Update selected locale when currentLocale changes
  React.useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  const handleLocaleChange = (locale: string) => {
    if (locale !== prevLocaleRef.current) {
      prevLocaleRef.current = locale;
      setEditorKey((prev) => prev + 1);
    }
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
    // Always check translations first, as it contains the local state
    if (translations[locale]) {
      return translations[locale];
    }
    // Fallback to the original value for current locale
    if (locale === currentLocale) {
      return value;
    }
    return "";
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
        key={`${selectedLocale}-${editorKey}`}
        value={getValueForLocale(selectedLocale)}
        onChange={handleEditorChange}
        showToolbar={isDrawerOpen}
      />
    </div>
  );
}
