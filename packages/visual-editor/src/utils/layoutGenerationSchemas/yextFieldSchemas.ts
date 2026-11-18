import { z } from "zod";
import { FOOD_DELIVERY_SERVICES } from "../../types/types.ts";
import { imageAspectRatioOptions } from "../../components/contentBlocks/image/styling.ts";
import { ThemeOptions } from "../themeOptions.ts";
import {
  appendSchemaInstructions,
  widthZodSchema,
} from "./inferFieldZodSchema.ts";
import { siteColorZodSchema } from "./colorFieldSchemas.ts";

export const translatableStringZodSchema = z
  .union([
    z.string(),
    z
      .object({
        hasLocalizedValue: z.literal("true").optional().describe("Always true"),
        defaultValue: z
          .string()
          .optional()
          .describe("Put the text content here"),
      })
      .catchall(z.string().optional()),
  ])
  .describe(
    "Static text or localized text with defaultValue and locale keys. Embedded fields supported via [[]] syntax."
  );

export function entityFieldZodSchema<T extends z.ZodType>(constantValue: T) {
  return z
    .object({
      field: z
        .string()
        .describe("Use this to render entity knowledge graph data"),
      constantValue: appendSchemaInstructions(
        constantValue,
        "Static value used when constantValueEnabled is true."
      ),
      constantValueEnabled: z
        .boolean()
        .optional()
        .describe(
          "When true constantValue is rendered, when false field is rendered."
        ),
    })
    .describe(
      "Entity binding: use field for Knowledge Graph data and constantValueEnabled false; use constantValueEnabled true and constantValue for static content. Preserve existing bindings unless the request changes their source."
    );
}

export const assetImageZodSchema = z.object({
  url: z.string().describe("The url of the image"),
  width: z.number().min(0).describe("The width of the image"),
  height: z.number().min(0).describe("The height of the image"),
  alternateText: translatableStringZodSchema
    .optional()
    .describe("The alt text to use for this image"),
});

export const imageZodSchema = z
  .union([
    assetImageZodSchema,
    z.object({ image: assetImageZodSchema }),
    // The strict compiler supports the canonical image fallback as an ordinary
    // object. Locale-specific assets remain unexposed serializable configuration
    // and are preserved by materialization rather than replaced or flattened.
    z.object({
      hasLocalizedValue: z.literal("true").optional(),
      defaultValue: assetImageZodSchema.optional(),
    }),
  ])
  .describe(
    "An image with url, width and height, a nested image object, or a localized image fallback in defaultValue. Alternate text can be localized. Existing locale-specific asset overrides are preserved."
  );

export const ctaTypeZodSchema = z
  .enum(["textAndLink", "getDirections", "presetImage"])
  .describe(
    "The type of the CTA. Use textAndLink for ordinary links or presetImage for app-store and food-delivery preset icons. Preset icons also require the containing presetImage style; changing the type alone does not select artwork."
  );

export const enhancedCtaZodSchema = z.object({
  label: translatableStringZodSchema,
  link: translatableStringZodSchema,
  linkType: z
    .enum([
      "URL",
      "Email",
      "EMAIL",
      "Phone",
      "PHONE",
      "DRIVING_DIRECTIONS",
      "CLICK_TO_WEBSITE",
      "OTHER",
    ])
    .optional()
    .describe("The type of the link for analytics"),
  normalizeLink: z
    .boolean()
    .optional()
    .describe("Whether to standardize characters and casing"),
  openInNewTab: z.boolean().optional().describe("Whether to open in a new tab"),
  ctaType: ctaTypeZodSchema
    .optional()
    .describe(
      "Controls the rendered type for a CTA with constantValueEnabled: true. To display a preset icon, set this to presetImage and set the containing presetImage style to the requested artwork. selectedType is ignored in constant value mode. Keep the existing destination and use actionType link where available."
    ),
});

export const richTextZodSchema = z.strictObject({
  // The runtime recognizes rich text by its HTML property; JSON alone cannot render.
  html: z.string().describe("HTML markup used to render the rich text."),
  json: z
    .string()
    .optional()
    .describe(
      "Optional serialized Lexical editor state. Never put plain text here."
    ),
});

export const translatableRichTextZodSchema = z
  .union([
    z.string(),
    z
      .object({
        hasLocalizedValue: z.literal("true").optional(),
        defaultValue: z.union([z.string(), richTextZodSchema]).optional(),
      })
      .catchall(z.union([z.string(), richTextZodSchema]).optional()),
    richTextZodSchema,
  ])
  .describe(
    "Rich text as a plain string, an object with required html and optional Lexical json, or localized values keyed by locale. Use a plain string for unformatted text. JSON-only objects are not renderable."
  );

const choices = (options: readonly { value: string }[]) =>
  z.enum(["default", ...options.map(({ value }) => value)]);

const typography = {
  fontFamily: z.string(),
  fontSize: z.string(),
  fontWeight: z.string(),
  fontStyle: z.enum(["normal", "italic", "default"]),
  textTransform: choices(ThemeOptions.TEXT_TRANSFORM),
};

export const styledButtonZodSchema = z.object({
  ...typography,
  borderRadius: choices(ThemeOptions.BUTTON_BORDER_RADIUS),
  letterSpacing: choices(ThemeOptions.LETTER_SPACING),
});

export const styledLinkZodSchema = z.object({
  ...typography,
  letterSpacing: choices(ThemeOptions.LETTER_SPACING),
  includeCaret: z.enum(["default", "block", "none"]),
});

export const styledTextZodSchema = (includeColor: boolean) =>
  z.object({
    ...typography,
    ...(includeColor ? { color: siteColorZodSchema.optional() } : {}),
  });

export const styledImageZodSchema = (includeAspectRatio: boolean) =>
  z.object({
    borderRadius: choices(ThemeOptions.IMAGE_BORDER_RADIUS),
    ...(includeAspectRatio
      ? {
          aspectRatio: z
            .union([
              z.literal("default"),
              ...imageAspectRatioOptions.map(({ value }) => z.literal(value)),
            ])
            .optional(),
        }
      : {}),
  });

export const styledPageSectionZodSchema = z.object({
  // Defer access until the shared inference helpers finish initializing.
  get contentWidth() {
    return widthZodSchema;
  },
  verticalPadding: choices(ThemeOptions.SPACING()),
});

export const ctaSelectorZodSchema = entityFieldZodSchema(
  enhancedCtaZodSchema
).extend({
  selectedType: ctaTypeZodSchema
    .optional()
    .describe(
      "Controls the rendered type only for an entity-bound CTA (constantValueEnabled false or absent). To display a preset icon, set this to presetImage and set the containing presetImage style to the requested artwork. Constant value CTAs instead require constantValue.ctaType. Preserve the existing entity binding and use actionType link where available."
    ),
});

export const comprehensiveCtaZodSchema = z.object({
  data: z.object({
    actionType: z
      .enum(["link", "button"])
      .describe(
        "Use link for preset icons. button renders buttonText as an ordinary text button and ignores preset artwork."
      ),
    cta: ctaSelectorZodSchema,
    openInNewTab: z.boolean(),
    buttonText: translatableStringZodSchema.optional(),
    customId: z.string().optional(),
    customClass: z.string().optional(),
    dataAttributes: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .optional(),
    ariaLabel: translatableStringZodSchema.optional(),
  }),
  styles: z.object({
    variant: z.enum(["primary", "secondary", "link"]),
    presetImage: z
      .enum([
        "app-store",
        "google-play",
        "galaxy-store",
        "app-gallery",
        ...FOOD_DELIVERY_SERVICES,
      ])
      .optional()
      .describe(
        "Selects preset artwork only. Also set data.actionType to link and the active CTA type to presetImage: data.cta.constantValue.ctaType for constantValueEnabled: true content, or data.cta.selectedType for entity-bound content. Preserve the existing source and destination. Changing this field alone does not activate the icon."
      ),
    color: siteColorZodSchema.optional(),
    button: styledButtonZodSchema.optional(),
    link: styledLinkZodSchema.optional(),
  }),
});

export const videoZodSchema = z.object({
  video: z.object({
    url: z.string(),
    id: z.string(),
    title: z.string(),
    thumbnail: z.string(),
    duration: z.string(),
    embeddedUrl: z.string(),
  }),
  videoDescription: z.string().optional(),
  name: z.string(),
  id: z.string(),
});

const hoursDay = z.object({
  isClosed: z.boolean().optional(),
  openIntervals: z
    .array(z.object({ start: z.string(), end: z.string() }))
    .optional(),
});

export const hoursZodSchema = z.object({
  ...Object.fromEntries(
    [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ].map((day) => [day, hoursDay.optional()])
  ),
  holidayHours: z
    .array(
      hoursDay.extend({
        date: z.string(),
        isRegularHours: z.boolean().optional(),
      })
    )
    .optional(),
  reopenDate: z.string().optional(),
});

/** Authored constant shapes, never the resolved render props. Unknown types need overrides. */
export const entityConstantZodSchemas: Record<string, z.ZodType> = {
  "type.string": translatableStringZodSchema,
  "type.rich_text_v2": translatableRichTextZodSchema,
  "type.image": imageZodSchema,
  imageOrVideo: z.union([imageZodSchema, videoZodSchema]),
  "type.cta": enhancedCtaZodSchema,
  "type.datetime": z.string(),
  "type.phone": z.string(),
  "type.decimal": z.number(),
  "type.float": z.number(),
  "type.integer": z.number().int(),
  "type.boolean": z.boolean(),
  "type.coordinate": z.object({ latitude: z.number(), longitude: z.number() }),
  "type.address": z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    line3: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    countryCode: z.string().optional(),
    extraDescription: z.string().optional(),
    sublocality: z.string().optional(),
    localizedRegionName: z.string().optional(),
    localizedCountryName: z.string().optional(),
  }),
  "type.hours": hoursZodSchema,
  "type.price": z.object({
    value: z.union([z.number(), z.string()]).optional(),
    currencyCode: z.string().optional(),
  }),
};
