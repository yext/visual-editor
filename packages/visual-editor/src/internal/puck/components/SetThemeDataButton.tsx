import { useId, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "../ui/button.tsx";
import {
  validateThemeData,
  type ThemeData,
  type ThemeIssue,
} from "../../../types/themeData.ts";
import { type FontRegistry } from "../../../utils/fonts/visualEditorFonts.ts";
import { updateThemeWithCustomFontAssets } from "../../utils/customFontAssets.ts";

export const SetThemeDataButton = ({
  themeData,
  onThemeChange,
  customFonts,
  disabled = false,
}: {
  themeData: ThemeData;
  onThemeChange: (data: ThemeData) => void;
  customFonts?: FontRegistry;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [issues, setIssues] = useState<ThemeIssue[]>([]);
  const inputId = useId();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setInput(JSON.stringify(themeData, null, 2));
          setIssues([]);
        }
        setOpen(nextOpen);
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="outline" disabled={disabled}>
          Set Theme Data
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ve-fixed ve-inset-0 ve-z-50 ve-bg-black/50" />
        <Dialog.Content className="theme-editor-dialog ve-fixed ve-left-1/2 ve-top-1/2 ve-z-50 ve-w-full ve-max-w-2xl ve--translate-x-1/2 ve--translate-y-1/2 ve-rounded-xl ve-bg-white ve-p-6 ve-shadow-lg ve-space-y-4">
          <Dialog.Title className="ve-text-lg ve-font-semibold">
            Set Theme Data
          </Dialog.Title>
          <Dialog.Description className="ve-text-sm ve-text-gray-600">
            Replace the complete theme with a versioned JSON payload. Every
            mobile and state value is required.
          </Dialog.Description>
          <label htmlFor={inputId}>Theme data</label>
          <textarea
            id={inputId}
            value={input}
            rows={16}
            spellCheck={false}
            aria-invalid={issues.some((issue) => issue.severity === "error")}
            className="ve-block ve-w-full ve-max-h-[50vh] ve-border ve-p-3 ve-font-mono"
            onChange={(event) => {
              setInput(event.target.value);
              setIssues([]);
            }}
          />
          {issues.map((issue, index) => (
            <p
              key={index}
              role={issue.severity === "error" ? "alert" : "status"}
            >
              {issue.path.join(".")}: {issue.message}
            </p>
          ))}
          <div className="ve-flex ve-justify-end ve-gap-2">
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button
              disabled={disabled}
              onClick={() => {
                let parsed: unknown;
                try {
                  parsed = JSON.parse(input);
                } catch {
                  setIssues([
                    {
                      severity: "error",
                      code: "invalid_json",
                      path: [],
                      message: "Enter valid JSON",
                    },
                  ]);
                  return;
                }
                const validation = validateThemeData(parsed, customFonts);
                setIssues([...validation.errors, ...validation.warnings]);
                if (validation.data) {
                  onThemeChange(
                    updateThemeWithCustomFontAssets({
                      themeValues: validation.data,
                      customFonts,
                    }) as ThemeData
                  );
                  setOpen(false);
                }
              }}
            >
              Apply theme
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
