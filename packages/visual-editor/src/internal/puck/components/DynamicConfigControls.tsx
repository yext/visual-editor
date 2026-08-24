import { Data, useGetPuck } from "@puckeditor/core";
import { Info } from "lucide-react";
import { validateDynamicConfig } from "../../ai/validateDynamicConfig.ts";
import {
  normalizeDynamicConfig,
  normalizeDynamicData,
} from "../../ai/normalizeDynamicConfig.ts";
import { pt } from "../../../utils/i18n/platform.ts";
import { Button } from "../ui/button.tsx";
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
  const showDynamicConfigButtons =
    localDev &&
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if (!showDynamicConfigButtons) {
    return null;
  }

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
      const { appState } = getPuck();
      const dynamicConfig =
        typeof appState.data.root?.props === "object" &&
        appState.data.root?.props &&
        "_dynamicConfig" in appState.data.root.props
          ? (appState.data.root.props as Record<string, any>)._dynamicConfig
          : {};

      await navigator.clipboard.writeText(
        JSON.stringify(dynamicConfig, null, 2)
      );
    } catch {
      alert(pt("failedToCopyDynamicConfig", "Failed to copy dynamic config."));
    }
  };

  const normalizeCurrentDynamicConfig = () => {
    const puckApi = getPuck();
    const normalized = normalizeDynamicData(
      puckApi.appState.data,
      puckApi.config
    );

    if (!normalized.changed) {
      return;
    }

    puckApi.dispatch({
      type: "setData",
      recordHistory: true,
      data: normalized.data,
    });
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

      const normalized = normalizeDynamicConfig(pastedDynamicConfig);
      const validationErrors = validateDynamicConfig(normalized.dynamicConfig);
      if (validationErrors.length > 0) {
        alert(validationErrors.join("\n"));
        return;
      }

      upsertDynamicConfig((existingDynamicComponents) => ({
        ...existingDynamicComponents,
        ...(normalized.dynamicConfig as { components: Record<string, any> })
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
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={pt(
                "dynamicConfigLocalOnly",
                "Dynamic config buttons are only shown in local editor"
              )}
              className="ve-ml-3 ve-flex ve-h-5 ve-w-5 ve-items-center ve-justify-center ve-rounded-full ve-text-gray-500 hover:ve-text-gray-700"
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
        className="ve-ml-2 ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
      >
        {pt("copyDynamicConfig", "Copy Dynamic Config")}
      </Button>
      <Button
        variant="outline"
        onClick={pasteDynamicConfig}
        className="ve-ml-2 ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
      >
        {pt("pasteDynamicConfig", "Paste Dynamic Config")}
      </Button>
      <Button
        variant="outline"
        onClick={normalizeCurrentDynamicConfig}
        className="ve-ml-2 ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
      >
        {pt("normalizeDynamicConfig", "Normalize Dynamic Config")}
      </Button>
    </>
  );
};
