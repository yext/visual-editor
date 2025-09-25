import { resolveSchemaJson } from "./resolveYextEntityField.ts";

export const getSchema = (document: Record<string, any>): string => {
  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return "";
  }
  try {
    const layout = JSON.parse(layoutString);
    const schemaMarkup = JSON.stringify(layout?.root?.props?.schemaMarkup);
    return schemaMarkup
      ? JSON.parse(resolveSchemaJson(document, schemaMarkup))
      : getDefaultSchema(document);
  } catch (e) {
    console.warn("Error resolving schema:", e);
    return getDefaultSchema(document);
  }
};

const getDefaultSchema = (document: Record<string, any>): string => {
  const entityTypeId = (document as any)?.meta?.entityType?.id;
  const defaultSchemaTemplate = getSchemaTemplate(entityTypeId);
  try {
    return JSON.parse(resolveSchemaJson(document, defaultSchemaTemplate));
  } catch (e) {
    console.warn("Error resolving default schema:", e);
    return "";
  }
};

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
}`;

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
}`;

const FALLBACK_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "Thing",
  "name": "[[name]]",
  "description": "[[description]]",
}`;

// Function to get the appropriate schema template based on entity type
export const getSchemaTemplate = (entityTypeId?: string): string => {
  if (!entityTypeId) {
    return FALLBACK_SCHEMA;
  }

  if (
    entityTypeId === "location" ||
    entityTypeId === "financialProfessional" ||
    entityTypeId === "healthcareProfessional"
  ) {
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
    );
  } else {
    return FALLBACK_SCHEMA;
  }
};
