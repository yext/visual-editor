import { z } from "zod";
import {
  themeDataSchema,
  ThemeData,
  themeColorReferenceSchema,
} from "../../types/themeData.ts";
import { defaultThemeData } from "../defaultThemeData.ts";

/** Create per-theme choices; individual descriptions must survive JSON Schema export. */
export const createThemeChoiceSchema = (
  input: ThemeData,
  collection: "colors" | "typography" | "actions",
  channel = false
): z.ZodType => {
  const theme = themeDataSchema.parse(input);
  const choices = theme[collection].map((entry) =>
    z.literal(entry.id).describe(entry.label)
  );
  const choice = choices.length === 1 ? choices[0] : z.union(choices);
  return collection === "colors" && channel
    ? z.strictObject({
        colorId: choice,
        channel: z.enum(["background", "foreground"]),
      })
    : choice;
};

type ChoiceKind = "site" | "background" | "typography" | "actions";
const choices = z.registry<{ kind: ChoiceKind }>();
const customColor = z.strictObject({
  selectedColor: z
    .string()
    .regex(/^\[(?:#[0-9a-fA-F]{3,8}|rgba?\([^;{}<>]+\)|hsla?\([^;{}<>]+\))\]$/),
  contrastingColor: z
    .string()
    .regex(/^(?:black|white|#[0-9a-fA-F]{3,8}|\[#[0-9a-fA-F]{3,8}\])$/),
  isDarkColor: z.boolean().optional(),
});
export const themeTypographyIdSchema = z
  .string()
  .register(choices, { kind: "typography" });
export const themeActionIdSchema = z
  .string()
  .register(choices, { kind: "actions" });
export const backgroundColorZodSchema = z
  .union([themeColorReferenceSchema, customColor])
  .register(choices, { kind: "background" });
export const siteColorZodSchema = z
  .union([themeColorReferenceSchema, customColor])
  .register(choices, { kind: "site" });

/** The registry describes schema intent only; generated choices are never cached globally. */
export const getColorGenerationSchema = (
  schema: z.ZodType,
  theme: ThemeData = defaultThemeData
): z.ZodType | undefined => {
  const kind = choices.get(schema)?.kind;
  if (!kind) {
    return undefined;
  }
  if (kind === "typography" || kind === "actions") {
    return createThemeChoiceSchema(theme, kind);
  }
  const options = theme.colors.map((entry) =>
    z.strictObject({
      colorId: z.literal(entry.id).describe(entry.label),
      channel:
        kind === "background"
          ? z.literal("background")
          : z.enum(["background", "foreground"]),
    })
  );
  return z.union([...options, customColor]);
};
