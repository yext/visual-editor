import {
  LocatorConfig,
  LocatorSourcePageSetInfo,
  StreamDocument,
} from "./types/StreamDocument.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { pt } from "../utils/i18n/platform.ts";

/** Built-in locator entity types. Locators can also use custom entity types. */
export const LOCATOR_ENTITY_TYPES = Object.freeze([
  "location",
  "healthcareProfessional",
  "healthcareFacility",
  "event",
  "atm",
  "restaurant",
  "hotel",
  "providerFacility",
  "financialProfessional",
] as const);

/** Entity type API name, including custom types configured for the locator. */
export type LocatorEntityType = string;
export const DEFAULT_ENTITY_TYPE: LocatorEntityType = "location";

/** Eligibility (including address support) is validated by the backend. */
export function isLocatorEntityType(
  value: unknown
): value is LocatorEntityType {
  return typeof value === "string" && value.length > 0;
}

export const getLocatorEntityTypeSourceMap = (
  streamDocument?: StreamDocument
): Partial<Record<LocatorEntityType, string | undefined>> => {
  const entityDocument: StreamDocument = streamDocument ?? useDocument();
  const entityTypeSourceMap: Partial<
    Record<LocatorEntityType, string | undefined>
  > = {};

  const locatorSourcePageSets = entityDocument.__?.locatorSourcePageSets;
  if (locatorSourcePageSets) {
    try {
      const pageSetMap: Record<string, LocatorSourcePageSetInfo> = JSON.parse(
        locatorSourcePageSets
      );
      for (const [source, entry] of Object.entries(pageSetMap)) {
        if (entry?.entityType && isLocatorEntityType(entry.entityType)) {
          entityTypeSourceMap[entry.entityType] = source;
        }
      }
    } catch (err) {
      console.error(
        "Failed to parse locatorSourcePageSets for entity type sources: ",
        err
      );
    }
  }

  const pageset = entityDocument._pageset;
  if (pageset) {
    try {
      const locatorConfig: LocatorConfig =
        JSON.parse(pageset)?.typeConfig?.locatorConfig;

      if (
        locatorConfig?.entityType &&
        isLocatorEntityType(locatorConfig.entityType)
      ) {
        entityTypeSourceMap[locatorConfig.entityType] = locatorConfig.source;
      }

      for (const entityTypeScope of locatorConfig?.entityTypeScope ?? []) {
        if (
          entityTypeScope?.entityType &&
          isLocatorEntityType(entityTypeScope.entityType)
        ) {
          entityTypeSourceMap[entityTypeScope.entityType] = undefined;
        }
      }
    } catch (err) {
      console.error("Failed to parse pageset for entity type sources: ", err);
    }
  }

  if (Object.keys(entityTypeSourceMap).length === 0) {
    return { [DEFAULT_ENTITY_TYPE]: undefined };
  }

  return entityTypeSourceMap;
};

export const getEntityTypeLabel = (entityType: LocatorEntityType) => {
  switch (entityType) {
    case "location":
      return pt("locations", "Locations");
    case "healthcareProfessional":
      return pt("healthcareProfessionals", "Healthcare Professionals");
    case "healthcareFacility":
      return pt("healthcareFacilities", "Healthcare Facilities");
    case "event":
      return pt("events", "Events");
    case "atm":
      return pt("atms", "ATMs");
    case "restaurant":
      return pt("restaurants", "Restaurants");
    case "hotel":
      return pt("hotels", "Hotels");
    case "providerFacility":
      return pt("providerFacilities", "Provider Facilities");
    case "financialProfessional":
      return pt("financialProfessionals", "Financial Professionals");
    default: {
      // convert api name to display name (e.g. ce_myCustomField -> My Custom Field)
      const match = /^ce_([a-z][a-zA-Z0-9]*)$/.exec(entityType);
      if (match) {
        return (
          match[1]
            // handle acronyms like ce_localATMBranch
            .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/^./, (letter) => letter.toUpperCase())
        );
      }
      return entityType;
    }
  }
};
