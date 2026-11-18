import React, { useId, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "../ui/button.tsx";
import { pt } from "../../../utils/i18n/platform.ts";
import { type FontRegistry } from "../../../utils/fonts/visualEditorFonts.ts";
import {
  type ThemeData,
  type OnThemeChangeFunc,
} from "../../types/themeData.ts";
import { themeFields } from "../../theme/themeFields.ts";
import { readThemeValues } from "../../utils/internalThemeResolver.ts";
import {
  CUSTOM_FONT_ASSETS_KEY,
  updateThemeWithCustomFontAssets,
} from "../../utils/customFontAssets.ts";

const parseThemePayload = (input: string): ThemeData => {
  const parsed: unknown = JSON.parse(input);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a theme object");
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (key === CUSTOM_FONT_ASSETS_KEY) continue;
    if (!Object.hasOwn(themeFields, key))
      throw new Error("Unknown theme field");
    const field = themeFields[key];
    if (field.type === "number") {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("Expected a finite number");
      }
    } else if (typeof value !== "string" || !value.trim()) {
      throw new Error("Expected a nonempty string");
    } else if (
      field.type === "select" &&
      !field.options.some((option) => option.value === value)
    ) {
      throw new Error("Unknown option");
    }
  }
  return readThemeValues(parsed);
};

export const SetThemeDataButton = ({
  themeData,
  onThemeChange,
  customFonts,
  disabled,
}: {
  themeData: ThemeData;
  onThemeChange: OnThemeChangeFunc;
  customFonts?: FontRegistry;
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [invalid, setInvalid] = useState(false);
  const inputId = useId();
  const errorId = useId();
  const title = pt("themeDataEditor.title", "Set Theme Data");

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setInput(JSON.stringify(readThemeValues(themeData), null, 2));
          setInvalid(false);
        }
        setOpen(nextOpen);
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="outline" disabled={disabled}>
          {title}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ve-fixed ve-inset-0 ve-z-50 ve-bg-black/50" />
        <Dialog.Content className="ve-fixed ve-left-1/2 ve-top-1/2 ve-z-50 ve-w-full ve-max-w-2xl ve--translate-x-1/2 ve--translate-y-1/2 ve-rounded-xl ve-bg-white ve-p-6 ve-shadow-lg ve-space-y-4">
          <Dialog.Title className="ve-text-lg ve-font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="ve-text-sm ve-text-gray-600">
            {pt(
              "themeDataEditor.description",
              "Replace the theme with a JSON object. Missing fields use theme defaults."
            )}
          </Dialog.Description>
          <label
            htmlFor={inputId}
            className="ve-block ve-text-sm ve-font-medium"
          >
            {pt("fields.data", "Data")}
          </label>
          <textarea
            id={inputId}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setInvalid(false);
            }}
            rows={16}
            spellCheck={false}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className="ve-block ve-w-full ve-max-h-[50vh] ve-resize-y ve-rounded ve-border ve-border-gray-300 ve-p-3 ve-font-mono ve-text-sm"
          />
          {invalid && (
            <p id={errorId} role="alert" className="ve-text-sm ve-text-red-600">
              {pt(
                "themeDataEditor.invalid",
                "Enter a JSON object with recognized theme fields and valid value types."
              )}
            </p>
          )}
          <div className="ve-flex ve-justify-end ve-gap-2">
            <Dialog.Close asChild>
              <Button variant="outline">{pt("cancel", "Cancel")}</Button>
            </Dialog.Close>
            <Button
              disabled={disabled}
              onClick={() => {
                let values: ThemeData;
                try {
                  values = parseThemePayload(input);
                } catch {
                  setInvalid(true);
                  return;
                }
                onThemeChange(
                  updateThemeWithCustomFontAssets({
                    themeValues: values,
                    customFonts,
                  })
                );
                setOpen(false);
              }}
            >
              {pt("confirm", "Confirm")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
