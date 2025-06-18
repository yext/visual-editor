import { TranslatableRichText, RichText } from "../types/types.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { usePlatformTranslation } from "../utils/i18nPlatform.ts";
import { Translation } from "../internal/types/translation.ts";
import { CustomField, FieldLabel } from "@measured/puck";
import React from "react";
import { TranslatableRichTextDrawer } from "../components/TranslatableRichTextDrawer.tsx";

/**
 * Generates a translatableRichText field config
 * @param label optional label. Takes in translation key and TOptions from react-i18next
 */
export function TranslatableRichTextField<
  T extends TranslatableRichText | undefined = TranslatableRichText,
>(label?: Translation): CustomField<T> {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
      const document: { locale: string } = useDocument();
      const locale = document?.locale ?? "en";
      const { t } = usePlatformTranslation();
      // Compute preview string for the current locale
      let previewString = "";
      let valueForEditor: any = "";
      const isRecord = (v: any): v is Record<string, any> =>
        typeof v === "object" &&
        v !== null &&
        !Array.isArray(v) &&
        !("html" in v) &&
        !("json" in v);
      const isRichText = (v: any): v is { html?: string; json?: string } =>
        typeof v === "object" && v !== null && ("html" in v || "json" in v);
      if (isRecord(value)) {
        const localized = (value as Record<string, any>)[locale];
        if (isRichText(localized)) {
          previewString = localized.html || "";
          valueForEditor = localized;
        } else if (typeof localized === "string") {
          previewString = localized;
          valueForEditor = localized;
        } else {
          valueForEditor = "";
        }
      } else if (isRichText(value)) {
        previewString = value.html || "";
        valueForEditor = value;
      } else if (typeof value === "string") {
        previewString = value;
        valueForEditor = value;
      }

      // Defensive: always pass a record to the drawer for translations
      const translations = isRecord(value) ? value : {};

      // Always pass a string or json to the editor
      let lexicalEditorValue: string = "";
      if (isRichText(valueForEditor) && valueForEditor.json) {
        lexicalEditorValue = valueForEditor.json;
      } else if (typeof valueForEditor === "string") {
        lexicalEditorValue = valueForEditor;
      }

      const fieldLabel =
        (label && t(label.key, label.options)) + ` (${locale})`;

      // onChange handler: always preserve object structure
      const handleChange = (newValue: string | RichText) => {
        const updated: any = { ...translations };
        updated[locale] = newValue;
        onChange(updated as T);
      };

      const handleTranslationChange = (
        translationLocale: string,
        translationValue: string | RichText
      ) => {
        const updated: any = { ...translations };
        updated[translationLocale] = translationValue;
        updated.hasLocalizedValue = "true";
        onChange(updated as T);
      };

      return (
        <FieldLabel label={fieldLabel}>
          <TranslatableRichTextDrawer
            value={lexicalEditorValue}
            preview={previewString}
            onChange={handleChange}
            translations={translations}
            onTranslationChange={handleTranslationChange}
            currentLocale={locale}
            availableLocales={["en", "es", "fr", "de"]} // You can customize this list based on your needs
          />
        </FieldLabel>
      );
    },
  };
}
