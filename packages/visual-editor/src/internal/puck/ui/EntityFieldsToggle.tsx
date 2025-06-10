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
import { pt } from "../../../utils/i18nPlatform.ts";

export const EntityFieldsToggle = () => {
  const tooltipsContext = useEntityTooltips();
  if (!tooltipsContext) {
    return;
  }

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
              {pt("showLabels", "Show Labels")}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipsVisible
            ? pt("hideLabels", "Hide Labels")
            : pt("showLabels", "Show Labels")}
          <TooltipArrow fill="ve-bg-popover" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
