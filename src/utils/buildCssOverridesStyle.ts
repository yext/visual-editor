export type CssVariableOverrides = {
  [key: string]: string;
};

export const buildCssOverridesStyle = (
  base: string,
  selector: string,
  overrides: CssVariableOverrides
): string => {
  return (
    `${base}<style type="text/css">${selector}{` +
    Object.entries(overrides)
      .map(([key, value]) => `${key}:${value}!important`)
      .join(";") +
    "}</style>"
  );
};
