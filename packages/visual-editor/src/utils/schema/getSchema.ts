import { StreamDocument } from "../applyTheme.ts";
import { resolveUrlTemplate } from "../resolveUrlTemplate.ts";
import { resolveSchemaJson } from "./resolveSchema.ts";
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
  if (data.path) {
    document.path = data.path;
  } else {
    // TODO (SUMO-7941): Check that this resolves correctly for the schema drawer preview
    document.path = resolveUrlTemplate(document, data.relativePrefixToRoot);
  }

  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return {};
  }

  try {
    const layout = JSON.parse(layoutString);
    const entityTypeId = document?.meta?.entityType?.id;

    const schemaMarkup: string = layout?.root?.props?.schemaMarkup;
    const resolvedSchemaMarkup: Record<string, any> = schemaMarkup
      ? JSON.parse(resolveSchemaJson(document, schemaMarkup))
      : getDefaultSchema(document);
    const parsedSchemaEditorMarkup = removeEmptyValues(resolvedSchemaMarkup);
    const pageId = resolveSchemaJson(document, "[[siteDomain]]/[[path]]");

    if (entityTypeId && entityTypeId !== "locator") {
      const breadcrumbsSchema = getBreadcrumbsSchema(data, pageId);
      const aggregateRatingSchemaBlock = getAggregateRatingSchemaBlock(
        document,
        pageId
      );

      return {
        "@graph": [
          parsedSchemaEditorMarkup,
          breadcrumbsSchema && { ...breadcrumbsSchema },
          aggregateRatingSchemaBlock && { ...aggregateRatingSchemaBlock },
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
