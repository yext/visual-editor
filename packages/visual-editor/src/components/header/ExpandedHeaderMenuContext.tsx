import * as React from "react";

export type HeaderLinksDisplayMode = "inline" | "menu";

export const HeaderLinksDisplayModeContext =
  React.createContext<HeaderLinksDisplayMode>("inline");

export const HeaderLinksDisplayModeProvider =
  HeaderLinksDisplayModeContext.Provider;

export const useHeaderLinksDisplayMode = (): HeaderLinksDisplayMode => {
  return React.useContext(HeaderLinksDisplayModeContext);
};

type ExpandedHeaderMenuContextValue = {
  primaryHasCollapsedLinks: boolean;
  setPrimaryHasCollapsedLinks: (value: boolean) => void;
  primaryOverflow: boolean;
  setPrimaryOverflow: (value: boolean) => void;
  secondaryOverflow: boolean;
  setSecondaryOverflow: (value: boolean) => void;
};

const ExpandedHeaderMenuContext =
  React.createContext<ExpandedHeaderMenuContextValue | null>(null);

export const ExpandedHeaderMenuProvider = ExpandedHeaderMenuContext.Provider;

export const useExpandedHeaderMenu = () => {
  return React.useContext(ExpandedHeaderMenuContext);
};
