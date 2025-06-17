import React, { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  // Increment openCount every time the drawer is opened
  React.useEffect(() => {
    if (open) setOpenCount((c) => c + 1);
  }, [open]);

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
    <Dialog.Root open={open} onOpenChange={setOpen}>
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
          <h2 className="ve-text-2xl ve-font-semibold ve-mb-4">
            Edit Body Text
          </h2>
          {/* Local state for the editor, re-initialized on each open */}
          <DrawerEditor
            key={openCount}
            value={value}
            translations={translations}
            onChange={onChange}
            onTranslationChange={onTranslationChange}
            currentLocale={currentLocale}
            availableLocales={availableLocales}
            onClose={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// DrawerEditor is a local component to manage localValue per open
function DrawerEditor({
  value,
  translations,
  onChange,
  onTranslationChange,
  currentLocale,
  availableLocales,
  onClose,
}: {
  value: string | RichText;
  translations: Record<string, string | RichText>;
  onChange: (value: string | RichText) => void;
  onTranslationChange?: (locale: string, value: string | RichText) => void;
  currentLocale: string;
  availableLocales: string[];
  onClose: () => void;
}) {
  const [localValue, setLocalValue] = useState(value);
  return (
    <>
      <TranslatableLexicalEditor
        value={localValue}
        onChange={setLocalValue}
        translations={translations}
        onTranslationChange={onTranslationChange}
        currentLocale={currentLocale}
        availableLocales={availableLocales}
      />
      <div className="ve-flex ve-justify-between ve-mt-6">
        <button
          className="ve-px-4 ve-py-2 ve-bg-gray-200 ve-rounded hover:ve-bg-gray-300"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="ve-px-4 ve-py-2 ve-bg-blue-600 ve-text-white ve-rounded hover:ve-bg-blue-700"
          type="button"
          onClick={() => {
            onChange(localValue);
            onClose();
          }}
        >
          Save
        </button>
      </div>
    </>
  );
}
