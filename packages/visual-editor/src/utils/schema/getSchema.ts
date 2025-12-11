import { StreamDocument } from "../applyTheme.ts";
import { resolveSchemaJson, resolveSchemaString } from "./resolveSchema.ts";
import { getDefaultSchema } from "./defaultSchemas.ts";
import { removeEmptyValues } from "./helpers.ts";
import {
  getAggregateRatingSchemaBlock,
  getBreadcrumbsSchema,
} from "./schemaBlocks.ts";

export interface TemplateRenderProps {
  /** The relative path from the page to the site root */
  relativePrefixToRoot: string;
  /** The result of the getPath function */
  path: string;
  /** The stream document */
  document: StreamDocument;
}

export const getSchema = (data: TemplateRenderProps): Record<string, any> => {
  const { document } = data;

  // Move path to the document for schema resolution
  document.path = data.path;
  if (!document.siteDomain) {
    console.log("data", data);
  }

  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return {};
  }

  try {
    const layout = JSON.parse(layoutString);
    const entityTypeId = document?.meta?.entityType?.id;

    const schemaMarkup: string = layout?.root?.props?.schemaMarkup;
    const schemaMarkupJson: Record<string, any> = schemaMarkup
      ? JSON.parse(schemaMarkup)
      : getDefaultSchema(document);

    // Resolve all fields in the schema markup
    const resolvedSchema = resolveSchemaJson(document, schemaMarkupJson);

    const parsedSchemaEditorMarkup = removeEmptyValues(resolvedSchema);
    const currentPageUrl = resolveSchemaString(
      document,
      "https://[[siteDomain]]/[[path]]"
    );
    const currentPageId = parsedSchemaEditorMarkup?.["@id"];

    if (entityTypeId && entityTypeId !== "locator") {
      const breadcrumbsSchema = getBreadcrumbsSchema(data, currentPageUrl);
      const aggregateRatingSchemaBlock = getAggregateRatingSchemaBlock(
        document,
        currentPageId
      );

      return {
        "@graph": [
          parsedSchemaEditorMarkup,
          breadcrumbsSchema,
          aggregateRatingSchemaBlock,
        ].filter(Boolean),
      };
    }

    return { "@graph": [parsedSchemaEditorMarkup] };
  } catch (e) {
    const defaultSchema = removeEmptyValues(getDefaultSchema(document));
    console.warn("Error resolving schema:", e);
    return { "@graph": [defaultSchema] };
  }
};
