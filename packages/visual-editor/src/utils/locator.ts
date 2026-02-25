import { StreamDocument } from "./types/StreamDocument.ts";

export const getLocatorSourcePageSetsEntityTypes = (
  entityDocument: StreamDocument
): string[] | undefined => {
  const locatorSourcePageSets = entityDocument.__?.locatorSourcePageSets;
  if (locatorSourcePageSets) {
    try {
      const pageSetMap = JSON.parse(locatorSourcePageSets) as Record<
        string,
        { entityType?: string }
      >;
      const entityTypes = Object.values(pageSetMap)
        .map((entry) => entry.entityType)
        .filter((entityType): entityType is string => !!entityType);
      if (entityTypes.length > 0) {
        return Array.from(new Set(entityTypes));
      }
    } catch {
      console.error("Failed to parse locatorSourcePageSets for entity types.");
    }
  }
  return undefined;
};
