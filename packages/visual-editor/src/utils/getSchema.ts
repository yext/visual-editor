import { StreamDocument } from "./applyTheme.ts";
import { resolveSchemaJson } from "./resolveYextEntityField.ts";

type TemplateRenderProps = {
  relativePrefixToRoot: string;
  document: StreamDocument;
};

export const getSchema = (data: TemplateRenderProps): Record<string, any> => {
  const { document } = data;

  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return {};
  }
  try {
    const layout = JSON.parse(layoutString);
    const entityTypeId = document?.meta?.entityType?.id;

    const schemaMarkup: string = layout?.root?.props?.schemaMarkup;
    const resolvedSchemaMarkup: Record<string, any> = schemaMarkup
      ? JSON.parse(resolveSchemaJson(document, schemaMarkup))
      : getDefaultSchema(document);

    if (entityTypeId && LOCAL_BUSINESS_ENTITY_TYPES.includes(entityTypeId)) {
      const breadcrumbsSchema = getBreadcrumbsSchema(data);
      const reviewsSchema = getReviewsSchema(document);

      if (reviewsSchema) {
        resolvedSchemaMarkup["aggregateRating"] = reviewsSchema;
      }

      return {
        "@graph": [
          resolvedSchemaMarkup,
          breadcrumbsSchema && { ...breadcrumbsSchema },
        ].filter(Boolean),
      };
    }

    return { "@graph": [resolvedSchemaMarkup] };
  } catch (e) {
    console.warn("Error resolving schema:", e);
    return { "@graph": [getDefaultSchema(document)] };
  }
};

const getDefaultSchema = (
  document: Record<string, any>
): Record<string, any> => {
  const entityTypeId = (document as any)?.meta?.entityType?.id;
  const defaultSchemaTemplate = getSchemaTemplate(entityTypeId);
  try {
    return JSON.parse(resolveSchemaJson(document, defaultSchemaTemplate));
  } catch (e) {
    console.warn("Error resolving default schema:", e);
    return {};
  }
};

/**
 * isValidDirectoryParents returns true if the array from dm_directoryParents
 * matches this type: Array<{ slug: string; name: string }>
 */
const isValidDirectoryParents = (value: any[]): boolean => {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        typeof item?.name === "string" &&
        typeof item?.slug === "string"
    )
  );
};

/**
 * getDirectoryParents returns an array of objects. If no dm_directoryParents or children of
 * the directory parent are not the expected objects, returns an empty array.
 */
export const getDirectoryParents = (
  streamDocument: StreamDocument
): Array<{ slug: string; name: string }> => {
  for (const key in streamDocument) {
    if (
      key.startsWith("dm_directoryParents_") &&
      isValidDirectoryParents(streamDocument[key])
    ) {
      return streamDocument[key];
    }
  }
  return [];
};

const getBreadcrumbsSchema = (
  data: TemplateRenderProps
): Record<string, any> | undefined => {
  const directoryParents = getDirectoryParents(data.document);
  if (!directoryParents?.length) {
    return;
  }

  const breadcrumbItems = directoryParents.map((parent, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: parent.name,
    item: {
      "@id": data.relativePrefixToRoot + parent.slug,
      "@type": "Thing",
    },
  }));

  return {
    "@type": "BreadcrumbList",
    "@context": "https://schema.org",
    itemListElement: breadcrumbItems,
  };
};

const getReviewsSchema = (
  document: StreamDocument
): Record<string, any> | undefined => {
  const reviewsAgg = document.ref_reviewsAgg as
    | Array<{
        publisher?: string;
        averageRating?: number;
        reviewCount?: number;
      }>
    | undefined;

  if (!reviewsAgg || !Array.isArray(reviewsAgg) || reviewsAgg.length === 0) {
    return;
  }

  for (const review of reviewsAgg) {
    if (
      review.publisher === "FIRSTPARTY" &&
      review.averageRating !== undefined &&
      review.reviewCount !== undefined
    ) {
      // there should be at most one "FIRSTPARTY" so return early when found
      return {
        "@type": "AggregateRating",
        ratingValue: review.averageRating?.toString() ?? "0",
        reviewCount: review.reviewCount?.toString() ?? "0",
      };
    }
  }

  return;
};

const schemaWhitespaceRegex = /\n\s*/g;

const LOCAL_BUSINESS_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[[name]]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[[address.line1]]",
    "addressLocality": "[[address.city]]",
    "addressRegion": "[[address.region]]",
    "postalCode": "[[address.postalCode]]",
    "addressCountry": "[[address.countryCode]]"
  },
  "openingHours": "[[hours]]",
  "image": "[[photoGallery]]",
  "description": "[[description]]",
  "telephone": "[[mainPhone]]",
  "paymentAccepted": "[[paymentOptions]]",
  "hasOfferCatalog": "[[services]]"
}`
  .replace(schemaWhitespaceRegex, " ")
  .trim();

const DIRECTORY_LIST_ITEM_SCHEMA = `{
  "@type": "ListItem",
  "position": "[[position]]",
  "item": {
    "@type": "Place",
    "name": "[[name]]",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "[[address.line1]]",
      "addressLocality": "[[address.city]]",
      "addressRegion": "[[address.region]]",
      "postalCode": "[[address.postalCode]]",
      "addressCountry": "[[address.countryCode]]"
    }
  }
}`
  .replace(schemaWhitespaceRegex, " ")
  .trim();

const FALLBACK_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "Thing",
  "name": "[[name]]",
  "description": "[[description]]",
}`
  .replace(schemaWhitespaceRegex, " ")
  .trim();

const LOCAL_BUSINESS_ENTITY_TYPES = [
  "location",
  "financialProfessional",
  "healthcareProfessional",
  "restaurant",
  "healthcareFacility",
  "atm",
  "hotel",
  "healthcareProvider",
  "providerFacility",
];

// Function to get the appropriate schema template based on entity type
export const getSchemaTemplate = (entityTypeId?: string): string => {
  if (!entityTypeId) {
    return FALLBACK_SCHEMA;
  }

  if (LOCAL_BUSINESS_ENTITY_TYPES.includes(entityTypeId)) {
    return LOCAL_BUSINESS_SCHEMA;
  } else if (entityTypeId.startsWith("dm_")) {
    // Determine position based on entity type
    let position = 1; // default for dm_root
    if (entityTypeId === "dm_root") {
      position = 1;
    } else if (entityTypeId === "dm_country") {
      position = 2;
    } else if (entityTypeId === "dm_region") {
      position = 3;
    } else if (entityTypeId === "dm_city") {
      position = 4;
    }

    return DIRECTORY_LIST_ITEM_SCHEMA.replace(
      "[[position]]",
      position.toString()
    )
      .replace(/\n\s*/g, " ")
      .trim();
  } else {
    return FALLBACK_SCHEMA;
  }
};
