export type Document = {
  c_theme?: CssVariableOverrides;
  [key: string]: any;
};

export type CssVariableOverrides = {
  [key: string]: string;
};

export const applyTheme = (document: Document, base?: string): string => {
  const overrides = document.c_theme;
  if (!overrides || Object.keys(overrides).length === 0) {
    return base ?? "";
  }
  return (
    `${base ?? ""}<style type="text/css">.components{` +
    Object.entries(overrides)
      .map(([key, value]) => `${key}:${value} !important`)
      .join(";") +
    "}</style>"
  );
};
