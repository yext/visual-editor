import {
  getLocalBusinessSubtype,
  LOCAL_BUSINESS_ENTITY_TYPES,
} from "../../utils/schema/defaultSchemas.ts";
import { Migration } from "../../utils/migrate";
import { StreamDocument } from "src/utils/applyTheme.ts";

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
        // update locations to use the correct local business subtype
        const entityTypeId = streamDocument?.meta?.entityType?.id;
        if (
          entityTypeId &&
          LOCAL_BUSINESS_ENTITY_TYPES.includes(entityTypeId)
        ) {
          const localBusinessSubtype = getLocalBusinessSubtype(streamDocument);
          schema["@id"] =
            `https://[[siteDomain]]/[[uid]]#${localBusinessSubtype.toLowerCase()}`;
          schema["@type"] = localBusinessSubtype;
        } else if (entityTypeId?.includes("dm")) {
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
