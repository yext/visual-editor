import { StreamDocument } from "../applyTheme";
import { extractPrimaryCategory } from "./helpers";

export const schemaWhitespaceRegex = /\n\s*/g;

export const getDefaultSchema = (
  document: StreamDocument
): Record<string, any> => {
  const defaultSchemaTemplate = getSchemaTemplate(document);
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
    return LOCAL_BUSINESS_SCHEMA(getLocalBusinessSubtype(streamDocument));
  } else if (entityTypeId.startsWith("dm_")) {
    return DIRECTORY_SCHEMA;
  } else if (entityTypeId === "locator") {
    return LOCATOR_SCHEMA;
  } else {
    return FALLBACK_SCHEMA;
  }
};

const LOCAL_BUSINESS_SCHEMA = (localBusinessSubtype: string) =>
  `{
  "@context": "https://schema.org",
  "@type": "${localBusinessSubtype}",
  "@id": "https://[[siteDomain]]/[[uid]]#${localBusinessSubtype.toLowerCase()}",
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

const primaryCategoryToLocalBusinessSubtype: Record<string, string> = {
  "Arts & Entertainment": "EntertainmentBusiness",
  "Automotive & Vehicles": "AutomotiveBusiness",
  "Beauty & Spas": "HealthAndBeautyBusiness",
  "Business Services": "ProfessionalService",
  "Computers & Software": "Store",
  "Consumer Electronics": "Store",
  Contractors: "HomeAndConstructionBusiness",
  "Financial Services": "FinancialService",
  Government: "GovernmentOffice",
  "Health & Medicine": "MedicalBusiness",
  "Home & Garden": "Store",
  Insurance: "FinancialService",
  "Telecommunication Services": "Store",
  Legal: "LegalService",
  "Moving & Transport": "ProfessionalService",
  Pets: "Store",
  "Real Estate": "RealEstateAgent",
  Shopping: "Store",
  "Sports & Recreation": "SportsActivityLocation",
  Travel: "TravelAgency",
};

export const getLocalBusinessSubtype = (
  streamDocument: StreamDocument
): string => {
  const category = extractPrimaryCategory(
    streamDocument?.ref_categories?.[0]?.fullDisplayName || ""
  );
  return primaryCategoryToLocalBusinessSubtype[category] || "LocalBusiness";
};
