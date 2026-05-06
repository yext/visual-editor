import { StreamDocument } from "../types/StreamDocument.ts";

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

/**
 * Recursively remove all keys with empty values (undefined, null, empty string, or empty array) from an object.
 * Also removes keys with empty object values or objects that only contain the '@type' key.
 */
export const removeEmptyValues = (
  obj: Record<string, any>
): Record<string, any> => {
  // Base case
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Step 1: Recurse into child objects and arrays
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        removeEmptyValues(value);
      }

      if (typeof value === "object" && value !== null && Array.isArray(value)) {
        obj[key] = value.map(removeEmptyValues);
      }
    }
  }

  // Step 2: Delete keys with falsy values or empty arrays
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "[]" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete obj[key];
      }
    }
  }

  // Step 3: Delete keys with empty object values or objects with only @type
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        (Object.keys(value).length === 0 ||
          (Object.keys(value).length === 1 &&
            Object.keys(value)[0] === "@type"))
      ) {
        delete obj[key];
      }
    }
  }

  return obj;
};

// Mapping of primary category root ancestor IDs to LocalBusiness subtypes based on schema.org
// The name of the top-level category is shown in the comments.
const primaryCategoryIdToLocalBusinessSubtype: Record<number, string> = {
  369: "EntertainmentBusiness", // Arts & Entertainment
  370: "AutomotiveBusiness", // Automotive & Vehicles
  371: "HealthAndBeautyBusiness", // Beauty & Spas
  372: "ProfessionalService", // Business Services
  373: "Store", // Computers & Software
  374: "Store", // Consumer Electronics
  375: "HomeAndConstructionBusiness", // Contractors
  378: "FinancialService", // Financial Services
  379: "FoodEstablishment", // Food & Dining
  380: "GovernmentOffice", // Government
  381: "MedicalBusiness", // Health & Medicine
  382: "Store", // Home & Garden
  383: "FinancialService", // Insurance
  384: "Store", // Telecommunication Services
  385: "LegalService", // Legal
  386: "ProfessionalService", // Moving & Transport
  387: "Store", // Pets
  388: "RealEstateAgent", // Real Estate
  389: "Store", // Shopping
  390: "SportsActivityLocation", // Sports & Recreation
  392: "TravelAgency", // Travel
};

export const getLocalBusinessSubtype = (
  streamDocument: StreamDocument
): string => {
  const categoryRootAncestorId = streamDocument?.__?.categoryRootAncestorId;

  return (
    primaryCategoryIdToLocalBusinessSubtype[categoryRootAncestorId] ||
    "LocalBusiness"
  );
};
