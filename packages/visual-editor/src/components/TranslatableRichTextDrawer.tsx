import React from "react";
import { TranslatableLexicalEditor } from "./TranslatableLexicalEditor.tsx";
import { RichText } from "../types/types.ts";
import * as Dialog from "@radix-ui/react-dialog";

interface TranslatableRichTextDrawerProps {
  value: string | RichText;
  preview?: string;
  onChange: (value: string | RichText) => void;
  readOnly?: boolean;
  translations?: Record<string, string | RichText>;
  onTranslationChange?: (locale: string, value: string | RichText) => void;
  currentLocale?: string;
  availableLocales?: string[];
}

function isHtmlString(str: string) {
  return /<[a-z][\s\S]*>/i.test(str);
}

export function TranslatableRichTextDrawer({
  value,
  preview,
  onChange,
  readOnly = false,
  translations = {},
  onTranslationChange,
  currentLocale = "en",
  availableLocales = ["en"],
}: TranslatableRichTextDrawerProps) {
  // Render preview (plain text or HTML)
  const renderPreview = () => {
    if (typeof preview === "string" && preview.trim() !== "") {
      if (isHtmlString(preview)) {
        return <span dangerouslySetInnerHTML={{ __html: preview }} />;
      } else {
        return <span>{preview}</span>;
      }
    }
    if (typeof value === "object" && value && "html" in value && value.html) {
      return <span dangerouslySetInnerHTML={{ __html: value.html }} />;
    }
    if (typeof value === "string") return value;
    if (typeof value === "object" && "json" in value && value.json)
      return String(value.json);
    return "";
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div
          className="ve-p-2 ve-border ve-rounded ve-cursor-pointer ve-bg-white hover:ve-bg-gray-50 ve-overflow-hidden ve-leading-normal"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: "3.5em", // visually matches 3 lines
            maxHeight: "4.5em",
          }}
          tabIndex={0}
          role="button"
          aria-label="Edit rich text"
        >
          {renderPreview() || (
            <span className="ve-text-gray-400">Click to edit...</span>
          )}
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ve-fixed ve-inset-0 ve-bg-black/30 ve-z-50" />
        <Dialog.Content className="ve-fixed ve-left-1/2 ve-top-1/2 ve-w-full ve-max-w-xl ve--translate-x-1/2 ve--translate-y-1/2 ve-rounded-lg ve-bg-white ve-p-6 ve-shadow-xl ve-z-50">
          <TranslatableLexicalEditor
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            translations={translations}
            onTranslationChange={onTranslationChange}
            currentLocale={currentLocale}
            availableLocales={availableLocales}
          />
          <Dialog.Close asChild>
            <button className="ve-mt-4 ve-px-4 ve-py-2 ve-bg-gray-200 ve-rounded hover:ve-bg-gray-300">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
