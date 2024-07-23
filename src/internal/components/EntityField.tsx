import {createContext, useContext, useState} from "react";

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