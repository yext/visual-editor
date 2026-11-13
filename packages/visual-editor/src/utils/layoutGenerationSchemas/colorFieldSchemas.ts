import { pickerGradientPattern } from "../colorPicker.ts";
import { z } from "zod";
import {
  backgroundColors,
  ThemeOptions,
  type ThemeColor,
} from "../themeOptions.ts";

const backgroundValues = Object.values(backgroundColors).map(
  ({ value }) => value
);

const textValues = ThemeOptions.SITE_COLOR.flatMap((group) => group.options)
  .map(({ value }) => value)
  .filter(
    (value): value is ThemeColor =>
      typeof value === "object" &&
      value !== null &&
      "selectedColor" in value &&
      typeof value.selectedColor === "string" &&
      "contrastingColor" in value &&
      typeof value.contrastingColor === "string"
  );

const hexColorSchema = z
  .string()
  .regex(/^\[#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?\]$/)
  .describe(
    "Custom hex color (6 digits, or 8 digits including opacity) with literal square brackets: [#FFBBC7]. Bare hex such as #FFBBC7 is invalid."
  );

// Keep saved-value validation tolerant. Only the model-facing compiler uses
// the exact selector values; older layouts may contain additional color flags.
type ColorSchemaKind = "site" | "background";
const colorSchemas = z.registry<{ kind: ColorSchemaKind }>();
const generationSchemas: Partial<Record<ColorSchemaKind, z.ZodType>> = {};

export const getColorGenerationSchema = (
  schema: z.ZodType
): z.ZodType | undefined => {
  const kind = colorSchemas.get(schema)?.kind;
  return kind ? generationSchemas[kind] : undefined;
};

function makeColorSchema(options: ThemeColor[], kind: ColorSchemaKind) {
  options = [
    { selectedColor: "default", contrastingColor: "default" },
    ...options,
  ];
  const themeColorSchemas = options.map((color) =>
    z.object({
      selectedColor: z.literal(color.selectedColor),
      contrastingColor: z.union([
        z.literal(color.contrastingColor),
        hexColorSchema,
      ]),
      isDarkColor: z.boolean().optional(),
    })
  );

  const selectedColorSchema =
    kind === "background"
      ? z.union([
          hexColorSchema,
          z
            .string()
            .regex(
              new RegExp(
                `^\\[${pickerGradientPattern.source.slice(1, -1)}\\]$`,
                "i"
              )
            ),
        ])
      : hexColorSchema;
  const customColorSchemas = [
    z.object({
      selectedColor: selectedColorSchema,
      contrastingColor: z.literal("black"),
      isDarkColor: z.literal(false),
    }),
    z.object({
      selectedColor: selectedColorSchema,
      contrastingColor: z.literal("white"),
      isDarkColor: z.literal(true),
    }),
    z.object({
      selectedColor: selectedColorSchema,
      contrastingColor: hexColorSchema,
      isDarkColor: z.boolean(),
    }),
  ];

  const schemas = [...themeColorSchemas, ...customColorSchemas] as [
    (typeof customColorSchemas)[number],
    ...(typeof customColorSchemas)[number][],
  ];

  const gradientDescription =
    kind === "background"
      ? " Backgrounds also support bracketed two-color gradients, for example [linear-gradient(90deg, #00000080 0%, #FFFFFF 100%)] or [radial-gradient(circle, #000000 0%, #FFFFFF 100%)]."
      : "";
  const schema = z
    .union(schemas)
    .describe(
      'Palette colors must exactly match the selector option: selectedColor and its canonical contrastingColor, without isDarkColor. Custom colors require selectedColor in [#XXXXXX] or [#XXXXXXXX] format (the last two digits encode opacity), contrastingColor, and isDarkColor. For a light pink background use {"selectedColor":"[#FFBBC7]","contrastingColor":"black","isDarkColor":false}. Use white contrast with isDarkColor true for dark backgrounds.' +
        gradientDescription
    );

  colorSchemas.add(schema, { kind });
  generationSchemas[kind] = z.union([
    ...options.map((color) =>
      z.strictObject({
        selectedColor: z.literal(color.selectedColor),
        contrastingColor: z.literal(color.contrastingColor),
      })
    ),
    ...customColorSchemas,
  ]);
  return schema;
}

export const backgroundColorZodSchema = makeColorSchema(
  backgroundValues,
  "background"
);

const siteColorSchema = makeColorSchema(textValues, "site");
export const siteColorZodSchema = siteColorSchema.describe(
  `${siteColorSchema.description} Leave text and other foreground color overrides unset so the theme chooses them. A requested palette or background change does not by itself require a foreground color override. Do not infer a text color from imagery or surrounding content. Set a valid theme color only when the user specifically requests a color override. For optional generated colors, use the unset operation or {"$unset":true} to inherit the theme.`
);
