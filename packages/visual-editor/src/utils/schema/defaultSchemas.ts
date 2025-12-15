import { StreamDocument } from "../applyTheme";

export const schemaWhitespaceRegex = /\n\s*/g;

export const getDefaultSchema = (
  streamDocument: StreamDocument
): Record<string, any> => {
  const defaultSchemaTemplate = getSchemaTemplate(streamDocument);
  try {
    return JSON.parse(defaultSchemaTemplate);
  } catch (e) {
    console.warn("Error resolving default schema:", e);
    return {};
  }
};

// Function to get the appropriate schema template based on entity type
export const getSchemaTemplate = (streamDocument: StreamDocument): string => {
  const entityTypeId = streamDocument?.meta?.entityType?.id;

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
  "@type": "[[primaryCategory]]",
  "@id": "https://[[siteDomain]]/[[uid]]#[[primaryCategory]]",
  "url": "https://[[siteDomain]]/[[path]]",
  "name": "[[name]]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[[address.line1]]",
    "addressLocality": "[[address.city]]",
    "addressRegion": "[[address.region]]",
    "postalCode": "[[address.postalCode]]",
    "addressCountry": "[[address.countryCode]]"
  },
  "openingHoursSpecification": "[[hours]]",
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
  "@id": "https://[[siteDomain]]/[[uid]]#collectionpage",
  "url": "https://[[siteDomain]]/[[path]]",
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
  "@id": "https://[[siteDomain]]/[[uid]]#webpage",
  "url": "https://[[siteDomain]]/[[path]]",
  "name": "[[name]]"
}`
  .replace(schemaWhitespaceRegex, " ")
  .trim();

const FALLBACK_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "Thing",
  "@id": "https://[[siteDomain]]/[[uid]]#thing",
  "url": "https://[[siteDomain]]/[[path]]",
  "name": "[[name]]",
  "description": "[[description]]"
}`
  .replace(schemaWhitespaceRegex, " ")
  .trim();

export const LOCAL_BUSINESS_ENTITY_TYPES = [
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
