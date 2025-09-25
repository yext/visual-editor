import { resolveSchemaJson } from "./resolveYextEntityField.ts";

export function getSchema(document: Record<string, any>): string {
  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return "";
  }
  const layout = JSON.parse(layoutString);
  const schemaMarkup = JSON.stringify(layout?.root?.props?.schemaMarkup);
  return schemaMarkup
    ? JSON.parse(resolveSchemaJson(document, schemaMarkup))
    : document._schema;
}
