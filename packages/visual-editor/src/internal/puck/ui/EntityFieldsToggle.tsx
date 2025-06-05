import "./puck.css";
import React from "react";
import { Switch } from "../ui/switch.tsx";
import { useEntityTooltips } from "../../../editor/EntityField.tsx";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip.tsx";
import "../../../editor/index.css";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

export const EntityFieldsToggle = () => {
  const tooltipsContext = useEntityTooltips();
  if (!tooltipsContext) {
    return;
  }

  const { t } = usePlatformTranslation();
  const { toggleTooltips, tooltipsVisible } = tooltipsContext;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="ve-flex ve-flex-row ve-self-center ve-gap-3 ve-pl-2">
            <Switch
              onCheckedChange={toggleTooltips}
              checked={tooltipsVisible}
            />
            <p className="ve-self-center ve-text-sm">
              {t("showLabels", "Show Labels")}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipsVisible
            ? t("hideLabels", "Hide Labels")
            : t("showLabels", "Show Labels")}
          <TooltipArrow fill="ve-bg-popover" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
