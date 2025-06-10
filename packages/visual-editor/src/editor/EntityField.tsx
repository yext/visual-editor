import { createContext, useContext, useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../internal/puck/ui/Tooltip.tsx";
import { pt } from "../utils/i18nPlatform.ts";
import React from "react";

const MemoizedChildren = React.memo(function MemoizedChildren({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
});

type EntityFieldProps = {
  displayName?: string;
  fieldId?: string;
  constantValueEnabled?: boolean;
  children: React.ReactNode;
};

export const EntityField = ({
  displayName,
  fieldId,
  constantValueEnabled,
  children,
}: EntityFieldProps) => {
  const tooltipsContext = useEntityTooltips();

  if (!tooltipsContext) {
    return children;
  }

  const { tooltipsVisible } = tooltipsContext;

  let tooltipContent = "";
  if (constantValueEnabled) {
    tooltipContent = pt("staticContent", "Static content");
  } else if (displayName && fieldId) {
    tooltipContent = `${displayName} (${fieldId})`;
  } else if (fieldId) {
    tooltipContent = `${fieldId}`;
  } else if (displayName) {
    tooltipContent = `${displayName}`;
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip open={!!tooltipContent && tooltipsVisible}>
          <TooltipTrigger asChild>
            <div
              className={
                tooltipsVisible
                  ? "ve-outline-2 ve-outline-dotted" +
                    (!constantValueEnabled ? " ve-outline-primary" : "")
                  : ""
              }
            >
              <MemoizedChildren>{children}</MemoizedChildren>
            </div>
          </TooltipTrigger>
          <TooltipContent
            zoomWithViewport
            className={!constantValueEnabled ? "ve-bg-primary" : ""}
          >
            <p>{tooltipContent}</p>
            <TooltipArrow
              fill="bg-popover"
              className={!constantValueEnabled ? "ve-fill-primary" : ""}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

type EntityTooltipsContext = {
  tooltipsVisible: boolean;
  toggleTooltips: () => void;
};

const EntityTooltipsContext = createContext<EntityTooltipsContext | undefined>(
  undefined
);

export const EntityTooltipsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tooltipsVisible, setTooltipsVisible] = useState(false);

  const toggleTooltips = () => {
    setTooltipsVisible((prev: boolean) => !prev);
  };

  return (
    <EntityTooltipsContext.Provider value={{ tooltipsVisible, toggleTooltips }}>
      {children}
    </EntityTooltipsContext.Provider>
  );
};

export const useEntityTooltips = () => {
  return useContext(EntityTooltipsContext);
};
