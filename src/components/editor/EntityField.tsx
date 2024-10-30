import { createContext, useContext, useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../internal/puck/ui/Tooltip.tsx";
import React from "react";

type EntityFieldProps = {
  displayName?: string;
  fieldId?: string;
  children: React.ReactNode;
};

export const EntityField = ({ fieldId, children }: EntityFieldProps) => {
  const { tooltipsVisible } = useEntityField();

  if (!tooltipsVisible) {
    return children;
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip open={!!fieldId}>
          <TooltipTrigger asChild>
            <div className="ve-outline-2 ve-outline-dotted ve-outline-[#5A58F2]">
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{fieldId}</p>
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
