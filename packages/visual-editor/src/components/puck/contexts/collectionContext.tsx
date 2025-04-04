import { createContext, useContext } from "react";
import { YextEntityField } from "../../../index.js";

export const CollectionContext = createContext<{
  parentEntityField: YextEntityField<Array<any>>;
  limit: undefined | number;
} | null>(null);

export const useCollectionContext = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    return undefined;
  }
  return context;
};
