import { resolveSchemaJson } from "./resolveYextEntityField.ts";

export const getSchema = (
  document: Record<string, any>
): Record<string, any> => {
  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return {};
  }
  try {
    const layout = JSON.parse(layoutString);
    const schemaMarkup: string = layout?.root?.props?.schemaMarkup;
    return schemaMarkup
      ? JSON.parse(resolveSchemaJson(document, schemaMarkup))
      : getDefaultSchema(document);
  } catch (e) {
    console.warn("Error resolving schema:", e);
    return getDefaultSchema(document);
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
