import Handlebars from "handlebars";
import {
  BaseSchema,
  LocalBusiness,
  Event,
  Product,
  FAQPage,
  AddressSchema,
  LocationSchema,
  OpeningHoursSchema,
  OpeningHoursSpecificationSchema,
  OfferSchema,
  PerformerSchema,
  OrganizationSchema,
  PhotoGallerySchema,
  PhotoSchema,
  ReviewSchema,
  AggregateRatingSchema,
} from "@yext/pages-components";
import { normalizeSlug } from "../slugifier.ts";
import { getLocalBusinessSubtype } from "./helpers.ts";
import { getDirectoryChildUrl } from "./resolveSchema.ts";
import type { StreamDocument } from "../types/StreamDocument.ts";
import type { TemplateRenderProps } from "./getSchema.ts";

// JSON escapes preserve values without allowing them to close a script tag.
const serializeSchemaJson = (value: unknown): string | undefined =>
  JSON.stringify(value)?.replace(/</g, "\\u003c");

const handlebars = Handlebars.create();
handlebars.registerHelper("directoryChildUrl", getDirectoryChildUrl);
handlebars.registerHelper("json", (...args: unknown[]) => {
  const [value] = args.slice(0, -1);
  return serializeSchemaJson(value) ?? "null";
});
handlebars.registerHelper("SchemaWrapper", (...args: unknown[]) => {
  const [value] = args.slice(0, -1);
  return `<script type="application/ld+json">
  ${serializeSchemaJson(value)}
  </script>`;
});

handlebars.registerHelper(
  "businessType",
  function (this: StreamDocument, ...args: unknown[]) {
    const document = args.length > 1 ? args[0] : this;
    return getLocalBusinessSubtype(document as StreamDocument);
  }
);

// Equality is strict. Ordering follows JavaScript comparisons (including coercion).
// Logical helpers return booleans using JavaScript truthiness; arrays are truthy.
handlebars.registerHelper({
  eq: (a: unknown, b: unknown) => a === b,
  ne: (a: unknown, b: unknown) => a !== b,
  gt: (a: any, b: any) => a > b,
  gte: (a: any, b: any) => a >= b,
  lt: (a: any, b: any) => a < b,
  lte: (a: any, b: any) => a <= b,
  and: (...args: unknown[]) => args.slice(0, -1).every(Boolean),
  or: (...args: unknown[]) => args.slice(0, -1).some(Boolean),
  not: (value: unknown) => !value,
  slugify: (...args: unknown[]) =>
    normalizeSlug(
      args
        .slice(0, -1)
        .map((value) => (value == null ? "" : String(value)))
        .join("")
    ),
});

const schemaHelpers = {
  BaseSchema,
  LocalBusiness,
  Event,
  Product,
  FAQPage,
  AddressSchema,
  LocationSchema,
  OpeningHoursSchema,
  OpeningHoursSpecificationSchema,
  OfferSchema,
  PerformerSchema,
  OrganizationSchema,
  PhotoGallerySchema,
  PhotoSchema,
  ReviewSchema,
  AggregateRatingSchema,
};
for (const [name, helper] of Object.entries(schemaHelpers)) {
  handlebars.registerHelper(name, (...args: unknown[]) =>
    (helper as (...values: unknown[]) => unknown)(...args.slice(0, -1))
  );
}

export type CustomSchemaResult = { output: string; error?: string };

/** Shared by publishing and preview; successful markup is never reformatted. */
export const resolveCustomSchema = (
  template: string,
  { document, path, relativePrefixToRoot }: TemplateRenderProps
): CustomSchemaResult => {
  try {
    return {
      output: handlebars.compile(template, {
        noEscape: true,
        ignoreStandalone: true,
      })({
        ...document,
        path,
        relativePrefixToRoot,
      }),
    };
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
