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
      : document._schema;
  } catch (e) {
    console.warn("Error parsing layout:", e);
    return document._schema;
  }
};
