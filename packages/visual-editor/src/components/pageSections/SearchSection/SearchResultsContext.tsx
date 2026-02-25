import React, { createContext, useContext } from "react";
import {
  BackgroundStyle,
  HeadingLevel,
} from "../../../utils/themeConfigOptions.ts";

export interface headingStyleProps {
  headingLevel: HeadingLevel;
  color?: BackgroundStyle;
}

interface SearchResultsContextType {
  headingStyle?: headingStyleProps;
}

const defaultContextValues: SearchResultsContextType = {
  headingStyle: {
    headingLevel: 2,
  },
};

const SearchResultsContext =
  createContext<SearchResultsContextType>(defaultContextValues);

export const SearchResultsProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SearchResultsContextType;
}) => {
  return (
    <SearchResultsContext.Provider value={value}>
      {children}
    </SearchResultsContext.Provider>
  );
};

export const useSearchResultsContext = () => {
  return useContext(SearchResultsContext);
};
