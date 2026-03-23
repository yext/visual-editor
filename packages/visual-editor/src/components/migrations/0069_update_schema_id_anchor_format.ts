import { Migration } from "../../utils/migrate.ts";

const LEGACY_PAGE_SCHEMA_ID_REGEX =
  /^https:\/\/\[\[siteDomain\]\]\/\[\[uid\]\]#(.+)$/;

const transformSchemaIdAnchorFormat = (oldProps: Record<string, any>) => {
  if (!oldProps.schemaMarkup) {
    return oldProps;
  }

  try {
    const schema = JSON.parse(oldProps.schemaMarkup);
    const schemaId = schema["@id"];

    if (typeof schemaId !== "string") {
      return oldProps;
    }

    const match = schemaId.match(LEGACY_PAGE_SCHEMA_ID_REGEX);
    if (!match) {
      return oldProps;
    }

    schema["@id"] = `https://[[siteDomain]]/#[[uid]]-${match[1]}`;

    return {
      ...oldProps,
      schemaMarkup: JSON.stringify(schema),
    };
  } catch {
    return oldProps;
  }
};

export const updateSchemaIdAnchorFormat: Migration = {
  root: {
    propTransformation: transformSchemaIdAnchorFormat,
  },
};
