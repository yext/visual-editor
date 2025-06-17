import React from "react";
import { TranslatableLexicalEditor } from "./TranslatableLexicalEditor.tsx";
import { RichText } from "../types/types.ts";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./TranslatableRichTextDrawer.module.css";

interface TranslatableRichTextDrawerProps {
  value: string | RichText;
  preview?: string;
  onChange: (value: string | RichText) => void;
  translations?: Record<string, string | RichText>;
  onTranslationChange?: (locale: string, value: string | RichText) => void;
  currentLocale?: string;
  availableLocales?: string[];
}

function stripHtml(html: string): string {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function TranslatableRichTextDrawer({
  value,
  preview,
  onChange,
  translations = {},
  onTranslationChange,
  currentLocale = "en",
  availableLocales = ["en"],
}: TranslatableRichTextDrawerProps) {
  // Render preview (plain text or HTML)
  const renderPreview = () => {
    if (typeof preview === "string" && preview.trim() !== "") {
      // Always show plain text for ellipsis effect
      return <span>{stripHtml(preview)}</span>;
    }
    if (typeof value === "object" && value && "html" in value && value.html) {
      return <span>{stripHtml(value.html)}</span>;
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
          className={`ve-p-2 ve-border ve-rounded ve-cursor-pointer ve-bg-white hover:ve-bg-gray-50 ${styles["ve-multiline-ellipsis"]}`}
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
        <Dialog.Content
          className="ve-fixed ve-top-0 ve-right-0 ve-h-full ve-w-full ve-max-w-xl ve-bg-white ve-shadow-xl ve-z-50 ve-animate-slide-in-right sm:ve-rounded-l-lg ve-p-6"
          style={{
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
          }}
        >
          <TranslatableLexicalEditor
            value={value}
            onChange={onChange}
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
