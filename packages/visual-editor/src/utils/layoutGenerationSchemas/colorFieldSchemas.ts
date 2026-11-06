import { z } from "zod";
import {
  backgroundColors,
  ThemeOptions,
  type ThemeColor,
} from "../themeConfigOptions.ts";

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
  .regex(/^\[#[0-9A-Fa-f]{6}\]$/)
  .describe(
    "Custom hex color with literal square brackets: [#FFBBC7]. Bare hex such as #FFBBC7 is invalid."
  );

function makeColorSchema(options: ThemeColor[]) {
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

  const customColorSchemas = [
    z.object({
      selectedColor: hexColorSchema,
      contrastingColor: z.literal("black"),
      isDarkColor: z.literal(false),
    }),
    z.object({
      selectedColor: hexColorSchema,
      contrastingColor: z.literal("white"),
      isDarkColor: z.literal(true),
    }),
    z.object({
      selectedColor: hexColorSchema,
      contrastingColor: hexColorSchema,
      isDarkColor: z.boolean(),
    }),
  ];

  const schemas = [...themeColorSchemas, ...customColorSchemas] as [
    (typeof customColorSchemas)[number],
    ...(typeof customColorSchemas)[number][],
  ];

  return z
    .union(schemas)
    .describe(
      'Custom colors require selectedColor in [#XXXXXX] format, contrastingColor, and isDarkColor. For a light pink background use {"selectedColor":"[#FFBBC7]","contrastingColor":"black","isDarkColor":false}. Use white contrast with isDarkColor true for dark backgrounds.'
    );
}

export const backgroundColorZodSchema = makeColorSchema(backgroundValues);

export const siteColorZodSchema = makeColorSchema(textValues);
