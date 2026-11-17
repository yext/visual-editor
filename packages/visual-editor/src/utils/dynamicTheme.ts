import {
  actionProperties,
  actionStateProperties,
  buttonProperties,
  buttonStateProperties,
  pageProperties,
  themeDataSchema,
  typographyProperties,
  type ThemeColorReference,
  type ThemeData,
} from "../types/themeData.ts";
import { defaultThemeData } from "./defaultThemeData.ts";
import { isDarkColor } from "./colors.ts";

type PropertyDefinitions = Record<
  string,
  { css: string; unit?: "px"; default: unknown }
>;
export const themePropertyDefaults = <T extends PropertyDefinitions>(
  definitions: T,
  theme: ThemeData = defaultThemeData
): {
  -readonly [K in keyof T]: T[K]["default"] extends (
    theme: ThemeData
  ) => infer Value
    ? Value
    : T[K]["default"];
} =>
  Object.fromEntries(
    Object.entries(definitions).map(([key, definition]) => [
      key,
      typeof definition.default === "function"
        ? definition.default(theme)
        : definition.default,
    ])
  ) as {
    -readonly [K in keyof T]: T[K]["default"] extends (
      theme: ThemeData
    ) => infer Value
      ? Value
      : T[K]["default"];
  };

/** Identifiers are validated, case-sensitive and used verbatim; labels never enter CSS. */
export const themeVariable = (
  collection: "colors" | "typography" | "actions",
  entryId: string,
  property: string
): string =>
  `--ve-${collection}-${entryId.length}-${entryId}-${property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

export const resolveThemeEntry = <T extends { id: string }>(
  entries: readonly T[],
  entryId?: string
): T => {
  const entry =
    entries.find((candidate) => candidate.id === entryId) ?? entries[0];
  if (!entry) {
    throw new Error("Theme collections must be nonempty");
  }
  return entry;
};

export const resolveThemeColor = (
  theme: ThemeData,
  reference: ThemeColorReference,
  solid = false
): string => {
  const compatible = (entry: ThemeData["colors"][number]) =>
    !solid || !entry[reference.channel].includes("gradient(");
  const entry =
    theme.colors.find(
      (color) => color.id === reference.colorId && compatible(color)
    ) ?? theme.colors.find(compatible);
  // Every color has a solid foreground, even when every background is a gradient.
  return entry ? entry[reference.channel] : theme.colors[0].foreground;
};

export const themeCssVariables = (theme: ThemeData): Record<string, string> => {
  const variables: Record<string, string> = {
    "--ve-default-color-background": theme.colors[0].background,
    "--ve-default-color-foreground": theme.colors[0].foreground,
    "--ve-default-solid-background": resolveThemeColor(
      theme,
      { colorId: theme.colors[0].id, channel: "background" },
      true
    ),
    "--ve-default-solid-foreground": theme.colors[0].foreground,
  };
  for (const color of theme.colors) {
    variables[themeVariable("colors", color.id, "background")] =
      color.background;
    variables[themeVariable("colors", color.id, "foreground")] =
      color.foreground;
    for (const channel of ["background", "foreground"] as const) {
      variables[themeVariable("colors", color.id, `${channel}-solid`)] =
        resolveThemeColor(theme, { colorId: color.id, channel }, true);
    }
  }
  const addProperties = (
    collection: "typography" | "actions",
    entryId: string,
    values: object,
    definitions: PropertyDefinitions,
    prefix = ""
  ) => {
    for (const [key, definition] of Object.entries(definitions)) {
      const value = (values as Record<string, unknown>)[key];
      variables[themeVariable(collection, entryId, `${prefix}${key}`)] =
        typeof value === "object" && value !== null
          ? resolveThemeColor(
              theme,
              value as ThemeColorReference,
              key !== "backgroundColor"
            )
          : `${value}${definition.unit ?? ""}`;
    }
  };
  for (const entry of theme.typography) {
    addProperties("typography", entry.id, entry, typographyProperties);
  }
  for (const entry of theme.actions) {
    addProperties("actions", entry.id, entry, actionProperties);
    if (entry.presentation === "button") {
      addProperties("actions", entry.id, entry, buttonProperties);
    }
    for (const state of ["default", "hover", "active"] as const) {
      addProperties(
        "actions",
        entry.id,
        entry[state],
        entry.presentation === "button"
          ? buttonStateProperties
          : actionStateProperties,
        `${state}-`
      );
      addProperties(
        "actions",
        entry.id,
        entry.onDark?.[state] ?? entry[state],
        entry.presentation === "button"
          ? buttonStateProperties
          : actionStateProperties,
        `onDark-${state}-`
      );
    }
  }
  for (const [key, definition] of Object.entries(pageProperties)) {
    variables[definition.css] =
      `${theme.page[key as keyof typeof theme.page]}${"unit" in definition ? definition.unit : ""}`;
  }
  return variables;
};

/** Shared by published markup and both editor documents. No role selectors or aliases. */
export const buildThemeCss = (input: ThemeData): string => {
  const theme = themeDataSchema.parse(input);
  const variables = themeCssVariables(theme);
  const rules = [
    `.components{${Object.entries(variables)
      .map(([key, value]) => `${key}:${value}`)
      .join(";")}}`,
  ];
  const firstTypography = theme.typography[0];
  // Resolve state variables at each surface boundary so nested light surfaces
  // reset dark styles and hover/active rules use the nearest background.
  const surfaceVariables = (dark: boolean) =>
    theme.actions
      .flatMap((entry) =>
        (["default", "hover", "active"] as const).flatMap((state) =>
          Object.keys(
            entry.presentation === "button"
              ? buttonStateProperties
              : actionStateProperties
          ).map(
            (key) =>
              `${themeVariable("actions", entry.id, `surface-${state}-${key}`)}:var(${themeVariable("actions", entry.id, `${dark ? "onDark-" : ""}${state}-${key}`)})`
          )
        )
      )
      .join(";");
  rules.push(
    `:where(.components):not(:where(.components .components)){${surfaceVariables(isDarkColor(theme.colors[0].background))}}`
  );
  const defaultSelector =
    ":where(.components):not(:where(.components .components))";
  const mobile: string[] = [];
  const declarations = (
    collection: "typography" | "actions",
    entryId: string,
    definitions: PropertyDefinitions,
    isMobile = false,
    prefix = ""
  ) =>
    Object.entries(definitions)
      .filter(([key]) => key.startsWith("mobile") === isMobile)
      .map(
        ([key, definition]) =>
          `${definition.css}:var(${themeVariable(collection, entryId, `${prefix}${key}`)})`
      )
      .join(";");
  rules.push(
    `${defaultSelector}{${declarations("typography", firstTypography.id, typographyProperties)};color:var(--ve-default-color-foreground)}`
  );
  mobile.push(
    `${defaultSelector}{${declarations("typography", firstTypography.id, typographyProperties, true)}}`
  );
  // Entry rules leave component utility classes and inline overrides in control.
  for (const entry of theme.colors) {
    rules.push(
      `:where([data-ve-background="${entry.id}"]){background:var(${themeVariable("colors", entry.id, "background")});color:var(${themeVariable("colors", entry.id, "foreground")})}`
    );
    rules.push(
      `:where([data-ve-background="${entry.id}"]){${surfaceVariables(isDarkColor(entry.background))}}`
    );
  }
  rules.push(`:where(.ve-theme-on-dark){${surfaceVariables(true)}}`);
  rules.push(`:where(.ve-theme-on-light){${surfaceVariables(false)}}`);
  for (const entry of theme.typography) {
    const selector = `:where([data-ve-typography="${entry.id}"])`;
    rules.push(
      `${selector}{${declarations("typography", entry.id, typographyProperties)}}`
    );
    mobile.push(
      `${selector}{${declarations("typography", entry.id, typographyProperties, true)}}`
    );
  }
  for (const entry of theme.actions) {
    const selector = `:where([data-ve-action="${entry.id}"])`;
    const isButton = entry.presentation === "button";
    rules.push(
      `${selector}{${declarations("actions", entry.id, actionProperties)}${isButton ? `;border-style:solid;${declarations("actions", entry.id, buttonProperties)}` : ""}}`
    );
    mobile.push(
      `${selector}{${declarations("actions", entry.id, actionProperties, true)}}`
    );
    for (const state of ["default", "hover", "active"] as const) {
      rules.push(
        `${state === "default" ? selector : `:where([data-ve-action="${entry.id}"]:${state})`}{${declarations("actions", entry.id, isButton ? buttonStateProperties : actionStateProperties, false, `surface-${state}-`)}}`
      );
    }
  }
  rules.push(`@media (width < 640px){${mobile.join("")}}`);
  return rules.join("");
};

/** Fully initialized entries are cloned so new entries never share mutable state. */
export const createThemeEntry = <T extends "colors" | "typography" | "actions">(
  theme: ThemeData,
  collection: T,
  entryId: string,
  label: string
): ThemeData[T][number] => {
  const entry = structuredClone(theme[collection][0]);
  return { ...entry, id: entryId, label } as ThemeData[T][number];
};
