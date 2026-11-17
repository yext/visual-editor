import { z } from "zod";
import { defaultFonts } from "../utils/fonts/font_registry.js";
import { constructFontSelectOptions } from "../utils/fonts/fontSelectOptions.ts";
import type { FontRegistry } from "../utils/fonts/visualEditorFonts.ts";

const supportedFontFamilies = new Set(
  constructFontSelectOptions(defaultFonts).map((option) => option.value)
);

const identifier = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/);
const label = z.string().trim().min(1).max(200);
const positive = z.number().finite().positive().max(10000);
const nonnegative = z.number().finite().nonnegative().max(10000);
const decimal = "(?:\\d+(?:\\.\\d+)?|\\.\\d+)";
const length = `${decimal}(?:px|rem|em|%)`;
const fontFamily = z
  .string()
  .min(1)
  .max(1000)
  .refine(
    (value) =>
      value
        .split(",")
        .every((family) =>
          /^(?:'[^'"\\;{}<>\r\n]+'|"[^'"\\;{}<>\r\n]+"|[\p{L}\p{N}_-]+(?: [\p{L}\p{N}_-]+)*)$/u.test(
            family.trim()
          )
        ),
    "Expected a comma-separated font family list"
  );
const fontWeight = z.string().regex(/^(?:[1-9]\d{0,2}|1000)$/);
const fontStyle = z.enum(["normal", "italic"]);
const textTransform = z.enum(["none", "uppercase", "lowercase", "capitalize"]);
const lineHeight = z
  .string()
  .regex(new RegExp(`^(?:${decimal}|${length})$`))
  .refine(
    (value) =>
      Number.isFinite(Number.parseFloat(value)) && Number.parseFloat(value) > 0,
    "Line height must be finite and positive"
  );
const letterSpacing = z.string().regex(new RegExp(`^-?${length}$`));
const textDecoration = z.enum([
  "none",
  "underline",
  "overline",
  "line-through",
]);
const transition = z
  .string()
  .regex(
    /^(?:none|(?:(?:all|color|background|border-color|opacity|transform) \d+(?:\.\d+)?m?s(?: (?:ease|linear|ease-in|ease-out|ease-in-out))?)(?:, (?:all|color|background|border-color|opacity|transform) \d+(?:\.\d+)?m?s(?: (?:ease|linear|ease-in|ease-out|ease-in-out))?)*)$/
  );
const padding = z
  .string()
  .regex(new RegExp(`^(?:0|${length})(?: (?:0|${length})){0,3}$`));
const borderWidth = z
  .string()
  .regex(new RegExp(`^(?:0|${decimal}(?:px|rem|em))$`));

// This grammar intentionally supports a bounded CSS subset, identically in Node
// and the browser. No DOM CSS parser or browser-dependent normalization is used.
const isColor = (value: string): boolean => {
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) {
    return true;
  }
  if (["transparent", "black", "white"].includes(value)) {
    return true;
  }
  const match = /^(rgb|rgba|hsl|hsla)\(([^()]+)\)$/.exec(value);
  if (!match) {
    return false;
  }
  const body = match[2].trim();
  const commaSyntax = body.includes(",");
  if (commaSyntax && body.includes("/")) {
    return false;
  }
  const parts = commaSyntax
    ? body.split(",").map((part) => part.trim())
    : body.split(/\s*\/\s*|\s+/);
  if (parts.length < 3 || parts.length > 4) {
    return false;
  }
  if (!commaSyntax && (parts.length === 4) !== body.includes("/")) {
    return false;
  }
  return parts.every((part, index) => {
    if (!/^-?(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(part)) {
      return false;
    }
    const number = Number.parseFloat(part);
    if (!Number.isFinite(number)) {
      return false;
    }
    const percent = part.endsWith("%");
    if (index === 3) {
      return number >= 0 && number <= (percent ? 100 : 1);
    }
    if (match[1].startsWith("hsl")) {
      return index === 0 ? !percent : percent && number >= 0 && number <= 100;
    }
    return number >= 0 && number <= (percent ? 100 : 255);
  });
};

const isBackground = (value: string): boolean => {
  if (isColor(value)) {
    return true;
  }
  const match = /^(linear|radial)-gradient\((.*)\)$/.exec(value);
  if (!match) {
    return false;
  }
  const stops = match[2].split(/,(?![^()]*\))/).map((stop) => stop.trim());
  const direction =
    match[1] === "linear"
      ? /^(?:-?\d+(?:\.\d+)?deg|to (?:(?:top|bottom)(?: (?:left|right))?|(?:left|right)(?: (?:top|bottom))?))$/
      : /^(?:circle|ellipse)(?: at (?:center|top|bottom|left|right|\d+%)(?: (?:center|top|bottom|left|right|\d+%))?)?$/;
  if (direction.test(stops[0])) {
    stops.shift();
  }
  return (
    stops.length >= 2 &&
    stops.every((stop) => {
      const color = stop.replace(
        /\s+-?(?:\d+(?:\.\d+)?|\.\d+)(?:%|px|rem|em)$/,
        ""
      );
      return isColor(color);
    })
  );
};

export const themeColorReferenceSchema = z.strictObject({
  colorId: identifier,
  channel: z.enum(["background", "foreground"]),
});
export type ThemeColorReference = z.infer<typeof themeColorReferenceSchema>;

/** Definitions are fixed; collection entries and their ordering are saved data. */
type ThemeProperty<T extends z.ZodType = z.ZodType> = {
  label: string;
  type:
    | "number"
    | "fontFamily"
    | "fontWeight"
    | "fontStyle"
    | "select"
    | "colorReference"
    | "length"
    | "transition";
  default: z.infer<T>;
  schema: T;
  css: string;
  unit?: "px";
};

export const typographyProperties = {
  fontFamily: {
    label: "Font Family",
    type: "fontFamily",
    default: "'Open Sans', 'Open Sans Fallback', sans-serif",
    schema: fontFamily,
    css: "font-family",
  },
  fontSize: {
    label: "Font Size",
    type: "number",
    default: 16,
    schema: positive,
    css: "font-size",
    unit: "px",
  },
  mobileFontSize: {
    label: "Mobile Font Size",
    type: "number",
    default: 16,
    schema: positive,
    css: "font-size",
    unit: "px",
  },
  fontWeight: {
    label: "Font Weight",
    type: "fontWeight",
    default: "400",
    schema: fontWeight,
    css: "font-weight",
  },
  fontStyle: {
    label: "Font Style",
    type: "fontStyle",
    default: "normal",
    schema: fontStyle,
    css: "font-style",
  },
  lineHeight: {
    label: "Line Height",
    type: "length",
    default: "1.5",
    schema: lineHeight,
    css: "line-height",
  },
  mobileLineHeight: {
    label: "Mobile Line Height",
    type: "length",
    default: "1.5",
    schema: lineHeight,
    css: "line-height",
  },
  letterSpacing: {
    label: "Letter Spacing",
    type: "length",
    default: "0em",
    schema: letterSpacing,
    css: "letter-spacing",
  },
  textTransform: {
    label: "Text Transform",
    type: "select",
    default: "none",
    schema: textTransform,
    css: "text-transform",
  },
} as const satisfies Record<string, ThemeProperty>;
const { fontWeight: _fontWeight, ...actionTypographyProperties } =
  typographyProperties;
export const actionProperties = {
  ...actionTypographyProperties,
  transition: {
    label: "Transition",
    type: "transition",
    default: "none",
    schema: transition,
    css: "transition",
  },
} as const satisfies Record<string, ThemeProperty>;
export const buttonProperties = {
  padding: {
    label: "Padding",
    type: "length",
    default: "12px 24px",
    schema: padding,
    css: "padding",
  },
  borderRadius: {
    label: "Border Radius",
    type: "number",
    default: 4,
    schema: nonnegative,
    css: "border-radius",
    unit: "px",
  },
  borderWidth: {
    label: "Border Width",
    type: "length",
    default: "2px",
    schema: borderWidth,
    css: "border-width",
  },
} as const satisfies Record<string, ThemeProperty>;
export const actionStateProperties = {
  fontWeight: typographyProperties.fontWeight,
  textDecoration: {
    label: "Text Decoration",
    type: "select",
    default: "none",
    schema: textDecoration,
    css: "text-decoration",
  },
  textColor: {
    label: "Text Color",
    type: "colorReference",
    default: (theme: { colors: readonly { id: string }[] }) => ({
      colorId: theme.colors[0].id,
      channel: "foreground" as const,
    }),
    schema: themeColorReferenceSchema,
    css: "color",
  },
} as const satisfies Record<string, ThemeProperty>;
export const buttonStateProperties = {
  ...actionStateProperties,
  backgroundColor: {
    label: "Background Color",
    type: "colorReference",
    default: (theme: { colors: readonly { id: string }[] }) => ({
      colorId: theme.colors[0].id,
      channel: "background" as const,
    }),
    schema: themeColorReferenceSchema,
    css: "background",
  },
  borderColor: {
    label: "Border Color",
    type: "colorReference",
    default: (theme: { colors: readonly { id: string }[] }) => ({
      colorId: theme.colors[0].id,
      channel: "background" as const,
    }),
    schema: themeColorReferenceSchema,
    css: "border-color",
  },
} as const satisfies Record<string, ThemeProperty>;
export const pageProperties = {
  imageBorderRadius: {
    label: "Image Border Radius",
    type: "number",
    default: 0,
    schema: nonnegative,
    css: "--ve-image-border-radius",
    unit: "px",
  },
  cardBorderRadius: {
    label: "Card Border Radius",
    type: "number",
    default: 4,
    schema: nonnegative,
    css: "--ve-card-border-radius",
    unit: "px",
  },
  cardBorderWidth: {
    label: "Card Border Width",
    type: "length",
    default: "1px",
    schema: borderWidth,
    css: "--ve-card-border-width",
  },
  pageContentMaxWidth: {
    label: "Content Max Width",
    type: "number",
    default: 1024,
    schema: positive,
    css: "--ve-page-content-max-width",
    unit: "px",
  },
  pageSectionVerticalSpacing: {
    label: "Section Vertical Spacing",
    type: "number",
    default: 32,
    schema: nonnegative,
    css: "--ve-page-section-vertical-spacing",
    unit: "px",
  },
} as const satisfies Record<string, ThemeProperty>;

export const themePropertySchemas = <T extends Record<string, ThemeProperty>>(
  definitions: T
): { [K in keyof T]: T[K]["schema"] } =>
  Object.fromEntries(
    Object.entries(definitions).map(([key, definition]) => [
      key,
      definition.schema,
    ])
  ) as { [K in keyof T]: T[K]["schema"] };

const identity = { id: identifier, label };
const typographySchema = z.strictObject({
  ...identity,
  ...themePropertySchemas(typographyProperties),
});
const linkState = z.strictObject(themePropertySchemas(actionStateProperties));
const buttonState = z.strictObject(themePropertySchemas(buttonStateProperties));
const actionSchema = z.discriminatedUnion("presentation", [
  z.strictObject({
    ...identity,
    presentation: z.literal("button"),
    ...themePropertySchemas(actionProperties),
    ...themePropertySchemas(buttonProperties),
    default: buttonState,
    hover: buttonState,
    active: buttonState,
    onDark: z
      .strictObject({
        default: buttonState,
        hover: buttonState,
        active: buttonState,
      })
      .optional(),
  }),
  z.strictObject({
    ...identity,
    presentation: z.literal("link"),
    ...themePropertySchemas(actionProperties),
    default: linkState,
    hover: linkState,
    active: linkState,
    onDark: z
      .strictObject({
        default: linkState,
        hover: linkState,
        active: linkState,
      })
      .optional(),
  }),
]);

/** Every mobile and state property is required. Parsing never fills defaults. */
export const themeDataSchema = z
  .strictObject({
    version: z.literal(1),
    colors: z
      .array(
        z.strictObject({
          ...identity,
          background: z
            .string()
            .max(4000)
            .refine(isBackground, "Expected a supported color or gradient"),
          foreground: z
            .string()
            .max(1000)
            .refine(isColor, "Expected a supported solid color"),
        })
      )
      .min(1),
    typography: z.array(typographySchema).min(1),
    actions: z.array(actionSchema).min(1),
    page: z.strictObject(themePropertySchemas(pageProperties)),
    __customFontAssets: z
      .strictObject({
        stylesheetPaths: z.array(z.string()),
        preloads: z.array(z.string()),
      })
      .optional(),
  })
  .superRefine((data, context) => {
    for (const collection of ["colors", "typography", "actions"] as const) {
      const seen = new Set<string>();
      data[collection].forEach((entry, index) => {
        if (seen.has(entry.id)) {
          context.addIssue({
            code: "custom",
            path: [collection, index, "id"],
            message: "Duplicate identifier",
          });
        }
        seen.add(entry.id);
      });
    }
  });
export type ThemeData = z.infer<typeof themeDataSchema>;
export type ThemeIssue = {
  severity: "error" | "warning";
  code: string;
  path: (string | number)[];
  message: string;
};
export type ThemeValidationResult = {
  success: boolean;
  data?: ThemeData;
  errors: ThemeIssue[];
  warnings: ThemeIssue[];
};

/** Missing references are recoverable and never rewrite the supplied payload. */
export const validateThemeData = (
  input: unknown,
  customFonts: FontRegistry = {}
): ThemeValidationResult => {
  const parsed = themeDataSchema.safeParse(input);
  const errors: ThemeIssue[] = parsed.success
    ? []
    : parsed.error.issues.flatMap((issue) => {
        const path = issue.path.map((part) =>
          typeof part === "number" ? part : String(part)
        );
        const paths =
          issue.code === "unrecognized_keys"
            ? issue.keys.map((key) => [...path, key])
            : [path];
        return paths.map((issuePath): ThemeIssue => ({
          severity: "error",
          code: issue.code,
          path: issuePath,
          message: issue.message,
        }));
      });
  const warnings: ThemeIssue[] = [];
  if (parsed.success) {
    const availableFontFamilies = Object.keys(customFonts).length
      ? new Set(
          constructFontSelectOptions({ ...defaultFonts, ...customFonts }).map(
            (option) => option.value
          )
        )
      : supportedFontFamilies;
    for (const collection of ["typography", "actions"] as const) {
      parsed.data[collection].forEach((entry, index) => {
        if (!availableFontFamilies.has(entry.fontFamily)) {
          errors.push({
            severity: "error",
            code: "unsupported_font_family",
            path: [collection, index, "fontFamily"],
            message:
              "Choose a supported Google Font or available custom font using the selector's exact font name, fallback name, and generic family.",
          });
        }
      });
    }
    const colors = new Map(
      parsed.data.colors.map((entry) => [entry.id, entry])
    );
    parsed.data.actions.forEach((entry, index) => {
      const states = ["default", "hover", "active"] as const;
      for (const path of [[], ["onDark"]] as const) {
        const values = path.length ? entry.onDark : entry;
        if (!values) continue;
        for (const state of states) {
          for (const [property, reference] of Object.entries(values[state])) {
            if (typeof reference === "object") {
              const color = colors.get(reference.colorId);
              const requiresSolid = property !== "backgroundColor";
              if (
                !color ||
                (requiresSolid && !isColor(color[reference.channel]))
              ) {
                warnings.push({
                  severity: "warning",
                  code: color ? "incompatible_reference" : "missing_reference",
                  path: ["actions", index, ...path, state, property],
                  message: `Color ${reference.colorId} (${reference.channel}) is unavailable; rendering uses the first compatible color.`,
                });
              }
            }
          }
        }
      }
    });
  }
  return {
    success: parsed.success && errors.length === 0,
    ...(parsed.success && errors.length === 0 ? { data: parsed.data } : {}),
    errors,
    warnings,
  };
};
