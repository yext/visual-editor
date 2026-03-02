import { StreamDocument } from "./types/StreamDocument.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { msg, pt } from "../utils/i18n/platform.ts";

export const DEFAULT_ENTITY_TYPE = "location";

export const getLocatorEntityTypeSourceMap = (
  streamDocument?: StreamDocument
): Record<string, string | undefined> => {
  const entityDocument: StreamDocument = streamDocument ?? useDocument();
  const entityTypeSourceMap: Record<string, string | undefined> = {};

  const locatorSourcePageSets = entityDocument.__?.locatorSourcePageSets;
  if (locatorSourcePageSets) {
    try {
      const pageSetMap = JSON.parse(locatorSourcePageSets) as Record<
        string,
        { entityType?: string }
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
            entityType?: string;
            entityTypeScope?: Array<{ entityType?: string }>;
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

export const getEntityTypeLabel = (entityType: string) => {
  switch (entityType) {
    case "restaurant":
      return pt(msg("fields.options.restaurants", "Restaurants"));
    case "healthcareFacility":
      return pt(
        msg("fields.options.healthcareFacilities", "Healthcare Facilities")
      );
    case "healthcareProfessional":
      return pt(
        msg(
          "fields.options.healthcareProfessionals",
          "Healthcare Professionals"
        )
      );
    case "hotel":
      return pt(msg("fields.options.hotels", "Hotels"));
    case "financialProfessional":
      return pt(
        msg("fields.options.financialProfessionals", "Financial Professionals")
      );
    default:
      return pt(msg("fields.options.locations", "Locations"));
  }
};
