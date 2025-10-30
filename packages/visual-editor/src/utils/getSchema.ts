import { StreamDocument } from "./applyTheme.ts";
import { resolveUrlTemplate } from "./resolveUrlTemplate.ts";
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
    document.path = resolveUrlTemplate(document, data.relativePrefixToRoot);
  }

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
