import { StreamDocument } from "./applyTheme.ts";
import {
  resolvePageSetUrlTemplate,
  resolveUrlTemplateOfChild,
} from "./resolveUrlTemplate.ts";
import { resolveSchemaJson } from "./resolveYextEntityField.ts";

interface TemplateRenderProps {
  /** The relative path from the page to the site root */
  relativePrefixToRoot: string;
  /** The result of the getPath function */
  path: string;
  /** The stream document */
  document: StreamDocument;
}

export const getSchema = (data: TemplateRenderProps): Record<string, any> => {
  const { document } = data;

  // Move path to the document for schema resolution
  if (data.path) {
    document.path = data.path;
  } else {
    // TODO (SUMO-7941): Check that this resolves correctly for the schema drawer preview
    if (
      document?.__?.codeTemplate === "directory" ||
      document?.__?.codeTemplate === "locator"
    ) {
      document.path = resolveUrlTemplateOfChild(
        document,
        data.relativePrefixToRoot
      );
    } else {
      document.path = resolvePageSetUrlTemplate(
        document,
        data.relativePrefixToRoot
      );
    }
  }

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
    const pageId = resolveSchemaJson(document, "[[siteDomain]]/[[path]]");

    if (entityTypeId && entityTypeId !== "locator") {
      const breadcrumbsSchema = getBreadcrumbsSchema(data, pageId);
      const aggregateRatingSchemaBlock = getAggregateRatingSchemaBlock(
        document,
        pageId
      );

      return {
        "@graph": [
          resolvedSchemaMarkup,
          breadcrumbsSchema && { ...breadcrumbsSchema },
          aggregateRatingSchemaBlock && { ...aggregateRatingSchemaBlock },
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
  data: TemplateRenderProps,
  pageId: string
): Record<string, any> | undefined => {
  // Helper to create a ListItem object
  const fillBreadcrumbsItem = (position: number, name: string, id: string) => ({
    "@type": "ListItem",
    position,
    name,
    item: {
      "@id": id,
      "@type": "Thing",
    },
  });

  const directoryParents = getDirectoryParents(data.document);

  if (!directoryParents?.length) {
    // If dm_root, return a single breadcrumb item for the current page
    if (data.document.meta?.entityType?.id === "dm_root") {
      return {
        "@type": "BreadcrumbList",
        "@context": "https://schema.org",
        itemListElement: [fillBreadcrumbsItem(1, data.document.name, pageId)],
      };
    }
    // If no parents, do not return breadcrumbs
    return undefined;
  }

  // Create the breadcrumbs for the directory parents
  const breadcrumbItems = directoryParents.map((parent, index) =>
    fillBreadcrumbsItem(
      index + 1,
      parent.name,
      data.relativePrefixToRoot + parent.slug
    )
  );

  // Add the current page as the last breadcrumb item
  if (data.document?.name) {
    breadcrumbItems.push(
      fillBreadcrumbsItem(
        breadcrumbItems.length + 1,
        data.document.name,
        pageId
      )
    );
  }

  return {
    "@type": "BreadcrumbList",
    "@context": "https://schema.org",
    itemListElement: breadcrumbItems,
  };
};

/**
 * If reviews are present in the stream, return a AggregateRating object that is
 * connected to the main page schema block via the '@id' property.
 */
const getAggregateRatingSchemaBlock = (
  document: StreamDocument,
  /** The resolved id of the main schema block */
  pageId: string
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
        ratingValue: review.averageRating.toString(),
        reviewCount: review.reviewCount.toString(),
        itemReviewed: {
          "@id": pageId,
        },
      };
    }
  }

  return;
};

export const schemaWhitespaceRegex = /\n\s*/g;

const LOCAL_BUSINESS_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "[[siteDomain]]/[[path]]",
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

const DIRECTORY_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "[[siteDomain]]/[[path]]",
  "name": "[[name]]",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": "[[dm_directoryChildren]]"
  }
}`
  .replace(schemaWhitespaceRegex, " ")
  .trim();

const LOCATOR_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "[[siteDomain]]/[[path]]",
  "name": "[[name]]"
}`
  .replace(schemaWhitespaceRegex, " ")
  .trim();

const FALLBACK_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "Thing",
  "@id": "[[siteDomain]]/[[path]]",
  "name": "[[name]]",
  "description": "[[description]]"
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
  } else if (LOCAL_BUSINESS_ENTITY_TYPES.includes(entityTypeId)) {
    return LOCAL_BUSINESS_SCHEMA;
  } else if (entityTypeId.startsWith("dm_")) {
    return DIRECTORY_SCHEMA;
  } else if (entityTypeId === "locator") {
    return LOCATOR_SCHEMA;
  } else {
    return FALLBACK_SCHEMA;
  }
};
