import { schemaWhitespaceRegex } from "../../utils/getSchema";
import { Migration } from "../../utils/migrate";

export const addIdToSchema: Migration = {
  root: {
    propTransformation: (oldProps: Record<string, any>) => {
      if (!oldProps.schemaMarkup) {
        return oldProps;
      }

      if (oldProps.schemaMarkup.includes("LocalBusiness")) {
        // migrate locations schema to add @id
        try {
          const schema = JSON.parse(oldProps.schemaMarkup);
          schema["@id"] = "[[siteDomain]]/[[path]]";
          return {
            ...oldProps,
            schemaMarkup: JSON.stringify(schema),
          };
        } catch {
          return oldProps;
        }
      } else if (oldProps.schemaMarkup.includes("ListItem")) {
        // migrate directory schema (overwrite)
        return {
          ...oldProps,
          schemaMarkup: `{
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
            .trim(),
        };
      } else if (oldProps.schemaMarkup.includes("Thing")) {
        // migrate locator schema (overwrite)
        return {
          ...oldProps,
          schemaMarkup: `{
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "[[siteDomain]]/[[path]]",
            "name": "[[name]]"
          }`
            .replace(schemaWhitespaceRegex, " ")
            .trim(),
        };
      }

      return oldProps;
    },
  },
};
