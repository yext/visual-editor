import { resolveSchemaJson } from "./resolveSchema.ts";

export const schemaWhitespaceRegex = /\n\s*/g;

export const getDefaultSchema = (
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
