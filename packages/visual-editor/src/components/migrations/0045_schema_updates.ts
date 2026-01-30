import { LOCAL_BUSINESS_ENTITY_TYPES } from "../../utils/schema/defaultSchemas.ts";
import { Migration } from "../../utils/migrate.ts";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";

export const schemaUpdates: Migration = {
  root: {
    propTransformation: (
      oldProps: Record<string, any>,
      streamDocument: StreamDocument
    ) => {
      if (!oldProps.schemaMarkup) {
        return oldProps;
      }

      try {
        const schema = JSON.parse(oldProps.schemaMarkup);

        // add url to all schemas if missing
        if (!schema["url"]) {
          schema["url"] = "https://[[siteDomain]]/[[path]]";
        }

        // update @id to include a unique id
        // update locations to use the correct local business subtype and openingHoursSpecification
        const entityTypeId = streamDocument?.meta?.entityType?.id;
        if (
          entityTypeId &&
          LOCAL_BUSINESS_ENTITY_TYPES.includes(entityTypeId)
        ) {
          schema["@id"] = `https://[[siteDomain]]/[[uid]]#[[primaryCategory]]`;
          schema["@type"] = "[[primaryCategory]]";
          schema["openingHoursSpecification"] = schema["openingHours"];
          delete schema["openingHours"];
        } else if (entityTypeId?.includes("_dm")) {
          schema["@id"] = "https://[[siteDomain]]/[[uid]]#collectionpage";
        } else if (entityTypeId === "locator") {
          schema["@id"] = "https://[[siteDomain]]/[[uid]]#webpage";
        } else {
          schema["@id"] = "https://[[siteDomain]]/[[uid]]#thing";
        }

        return {
          ...oldProps,
          schemaMarkup: JSON.stringify(schema),
        };
      } catch {
        return oldProps;
      }
    },
  },
};
