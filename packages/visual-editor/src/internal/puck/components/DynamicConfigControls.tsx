import React from "react";
import { Data, useGetPuck } from "@puckeditor/core";
import { Info } from "lucide-react";
import { validateDynamicConfig } from "../../ai/validateDynamicConfig.ts";
import { normalizePuckDynamicData } from "../../ai/normalizeDynamicConfig.ts";
import { pt } from "../../../utils/i18n/platform.ts";
import { Button } from "../ui/button.tsx";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/AlertDialog.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip.tsx";

type DynamicConfigControlsProps = {
  localDev: boolean;
};

export const DynamicConfigControls = ({
  localDev,
}: DynamicConfigControlsProps) => {
  const getPuck = useGetPuck();
  const [validationReport, setValidationReport] = React.useState<string>();
  const showDynamicConfigButtons =
    localDev &&
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if (!showDynamicConfigButtons) {
    return null;
  }

  const getCurrentDynamicConfig = (): unknown => {
    const { appState } = getPuck();
    return typeof appState.data.root?.props === "object" &&
      appState.data.root?.props &&
      "_dynamicConfig" in appState.data.root.props
      ? (appState.data.root.props as Record<string, any>)._dynamicConfig
      : {};
  };

  const upsertDynamicConfig = (
    transform: (components: Record<string, any>) => Record<string, any>
  ) => {
    const { appState, dispatch } = getPuck();
    const existingRootProps =
      typeof appState.data.root?.props === "object" && appState.data.root.props
        ? (appState.data.root.props as Record<string, any>)
        : {};
    const existingDynamicConfig =
      typeof existingRootProps._dynamicConfig === "object" &&
      existingRootProps._dynamicConfig
        ? existingRootProps._dynamicConfig
        : {};
    const existingDynamicComponents =
      typeof existingDynamicConfig.components === "object" &&
      existingDynamicConfig.components
        ? existingDynamicConfig.components
        : {};

    dispatch({
      type: "setData",
      recordHistory: true,
      data: {
        ...appState.data,
        root: {
          ...appState.data.root,
          props: {
            ...existingRootProps,
            _dynamicConfig: {
              ...existingDynamicConfig,
              components: transform(existingDynamicComponents),
            },
          },
        },
      } as Data & {
        root: {
          props: Record<string, any>;
        };
      },
    });
  };

  const copyDynamicConfig = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(getCurrentDynamicConfig(), null, 2)
      );
    } catch {
      alert(pt("failedToCopyDynamicConfig", "Failed to copy dynamic config."));
    }
  };

  const normalizeCurrentDynamicConfig = () => {
    normalizePuckDynamicData(getPuck());
  };

  const validateCurrentDynamicConfig = (): void => {
    const validationErrors = validateDynamicConfig(getCurrentDynamicConfig());

    setValidationReport(
      validationErrors.length > 0
        ? validationErrors.join("\n")
        : pt("dynamicConfigValid", "Dynamic config is valid.")
    );
  };

  const pasteDynamicConfig = async () => {
    try {
      const rawClipboardText = await navigator.clipboard.readText();
      const pastedDynamicConfig = JSON.parse(rawClipboardText);

      if (
        !pastedDynamicConfig ||
        typeof pastedDynamicConfig !== "object" ||
        !pastedDynamicConfig.components ||
        typeof pastedDynamicConfig.components !== "object"
      ) {
        alert(
          pt(
            "failedToPasteDynamicConfigInvalidData",
            "Failed to paste: Invalid dynamic config."
          )
        );
        return;
      }

      upsertDynamicConfig((existingDynamicComponents) => ({
        ...existingDynamicComponents,
        ...(pastedDynamicConfig as { components: Record<string, any> })
          .components,
      }));
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        alert(
          pt(
            "failedToPasteDynamicConfigPermissionDenied",
            "Failed to paste: Clipboard access is blocked. Enable paste permissions and try again."
          )
        );
        return;
      }

      alert(
        pt("failedToPasteDynamicConfig", "Failed to paste dynamic config.")
      );
    }
  };

  return (
    <>
      <AlertDialog
        open={validationReport !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setValidationReport(undefined);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pt("dynamicConfigValidation", "Dynamic Config Validation")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <pre className="ve-max-h-[60vh] ve-overflow-auto ve-whitespace-pre-wrap ve-rounded-md ve-bg-gray-50 ve-p-3 ve-text-left">
                {validationReport}
              </pre>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{pt("close", "Close")}</AlertDialogCancel>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(validationReport ?? "");
                } catch {
                  alert(
                    pt(
                      "failedToCopyValidationResults",
                      "Failed to copy validation results."
                    )
                  );
                }
              }}
            >
              {pt("copyValidationResults", "Copy Validation Results")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="dynamic-config-controls">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={pt(
                  "dynamicConfigLocalOnly",
                  "Dynamic config buttons are only shown in local editor"
                )}
                className="ve-flex ve-h-5 ve-w-5 ve-items-center ve-justify-center ve-rounded-full ve-text-gray-500 hover:ve-text-gray-700"
              >
                <Info className="ve-h-4 ve-w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {pt(
                "dynamicConfigLocalOnly",
                "Dynamic config buttons are only shown in local editor"
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="outline"
          onClick={copyDynamicConfig}
          className="ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
        >
          {pt("copyDynamicConfig", "Copy Dynamic Config")}
        </Button>
        <Button
          variant="outline"
          onClick={pasteDynamicConfig}
          className="ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
        >
          {pt("pasteDynamicConfig", "Paste Dynamic Config")}
        </Button>
        <Button
          variant="outline"
          onClick={normalizeCurrentDynamicConfig}
          className="ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
        >
          {pt("normalizeDynamicConfig", "Normalize Dynamic Config")}
        </Button>
        <Button
          variant="outline"
          onClick={validateCurrentDynamicConfig}
          className="ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
        >
          {pt("validateDynamicConfig", "Validate Dynamic Config")}
        </Button>
      </div>
    </>
  );
};
