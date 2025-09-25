import { getSchemaTemplate } from "../internal/components/AdvancedSettings.tsx";
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
      : getDefaultSchema(document);
  } catch (e) {
    console.warn("Error resolving schema:", e);
    return getDefaultSchema(document);
  }
};

const getDefaultSchema = (document: Record<string, any>): string => {
  const entityTypeId = (document as any)?.meta?.entityType?.id;
  const defaultSchemaTemplate = getSchemaTemplate(entityTypeId);
  try {
    return JSON.parse(resolveSchemaJson(document, defaultSchemaTemplate));
  } catch (e) {
    console.warn("Error resolving default schema:", e);
    return "";
  }
};
