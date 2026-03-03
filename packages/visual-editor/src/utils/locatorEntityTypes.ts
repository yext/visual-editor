import { StreamDocument } from "./types/StreamDocument.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { pt } from "../utils/i18n/platform.ts";

export const DEFAULT_ENTITY_TYPE = "location";
export type EntityType =
  | "location"
  | "healthcareProfessional"
  | "healthcareFacility"
  | "restaurant"
  | "hotel"
  | "financialProfessional";

export function isEntityType(value: string): value is EntityType {
  return (
    value === "location" ||
    value === "healthcareProfessional" ||
    value === "healthcareFacility" ||
    value === "restaurant" ||
    value === "hotel" ||
    value === "financialProfessional"
  );
}

export const getLocatorEntityTypeSourceMap = (
  streamDocument?: StreamDocument
): Partial<Record<EntityType, string | undefined>> => {
  const entityDocument: StreamDocument = streamDocument ?? useDocument();
  const entityTypeSourceMap: Partial<Record<EntityType, string | undefined>> =
    {};

  const locatorSourcePageSets = entityDocument.__?.locatorSourcePageSets;
  if (locatorSourcePageSets) {
    try {
      const pageSetMap = JSON.parse(locatorSourcePageSets) as Record<
        string,
        { entityType?: EntityType }
      >;
      for (const [source, entry] of Object.entries(pageSetMap)) {
        if (entry.entityType) {
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
      const locatorConfig = JSON.parse(pageset)?.typeConfig?.locatorConfig as
        | {
            source?: string;
            entityType?: EntityType;
            entityTypeScope?: Array<{ entityType?: EntityType }>;
          }
        | undefined;

      if (locatorConfig?.entityType) {
        entityTypeSourceMap[locatorConfig.entityType] = locatorConfig.source;
      }

      for (const entityTypeScope of locatorConfig?.entityTypeScope ?? []) {
        if (entityTypeScope.entityType) {
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

export const getEntityTypeLabel = (entityType: EntityType) => {
  switch (entityType) {
    case "healthcareProfessional":
      return pt("healthcareProfessionals", "Healthcare Professionals");
    case "healthcareFacility":
      return pt("healthcareFacilities", "Healthcare Facilities");
    case "restaurant":
      return pt("restaurants", "Restaurants");
    case "hotel":
      return pt("hotels", "Hotels");
    case "financialProfessional":
      return pt("financialProfessionals", "Financial Professionals");
    default:
      return pt("locations", "Locations");
  }
};
