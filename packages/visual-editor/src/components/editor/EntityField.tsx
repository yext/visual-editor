import { createContext, useContext, useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../internal/puck/ui/Tooltip.tsx";
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
  const { tooltipsVisible } = useEntityField();

  if (constantValueEnabled) {
    return children;
  }

  let tooltipContent = "";
  if (displayName && fieldId) {
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
                  ? "ve-outline-2 ve-outline-dotted ve-outline-[#5A58F2]"
                  : ""
              }
            >
              <MemoizedChildren>{children}</MemoizedChildren>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
            <TooltipArrow fill="bg-popover" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

type EntityFieldContextProps = {
  tooltipsVisible: boolean;
  toggleTooltips: () => void;
};

const EntityFieldContext = createContext<EntityFieldContextProps | undefined>(
  undefined
);

export const EntityFieldProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tooltipsVisible, setTooltipsVisible] = useState(false);

  const toggleTooltips = () => {
    setTooltipsVisible((prev: boolean) => !prev);
  };

  return (
    <EntityFieldContext.Provider value={{ tooltipsVisible, toggleTooltips }}>
      {children}
    </EntityFieldContext.Provider>
  );
};

export const useEntityField = () => {
  const context = useContext(EntityFieldContext);
  if (!context) {
    return {
      tooltipsVisible: false,
      toggleTooltips: () => {},
    };
  }
  return context;
};
