import { z } from "zod";
import type { PuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";

export const summarizeSchema = (
  schema: Record<string, any>,
  jsonBytes: (value: unknown) => number
) => {
  const summary = {
    bytes: jsonBytes(schema),
    definitions: Object.keys(schema.$defs ?? {}).length,
    references: 0,
    properties: 0,
    unionBranches: 0,
    maximumDepth: 0,
    keywords: {} as Record<string, number>,
  };
  const visit = (value: unknown, depth: number) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return;
    }
    summary.maximumDepth = Math.max(summary.maximumDepth, depth);
    for (const [key, child] of Object.entries(value)) {
      summary.keywords[key] = (summary.keywords[key] ?? 0) + 1;
      if (key === "$ref") {
        summary.references++;
      }
      if (key === "properties" && child && typeof child === "object") {
        summary.properties += Object.keys(child).length;
      }
      if (["anyOf", "oneOf", "allOf"].includes(key) && Array.isArray(child)) {
        summary.unionBranches += child.length;
      }
      if (Array.isArray(child)) {
        child.forEach((item) => visit(item, depth + 1));
      } else {
        visit(child, depth + 1);
      }
    }
  };
  visit(schema, 0);
  return summary;
};

export const componentDiagnostics = (
  catalog: PuckGenerationCatalog,
  {
    jsonBytes,
    utf8Bytes,
  }: {
    jsonBytes: (value: unknown) => number;
    utf8Bytes: (text: string) => number;
  }
) =>
  Object.entries(catalog.data.components)
    .filter(([, component]) => component.generation)
    .map(([name, component]) => {
      let authoredSchemaBytes: number | undefined;
      try {
        authoredSchemaBytes = jsonBytes(
          z.toJSONSchema(component.props, { io: "input" })
        );
      } catch {
        // The compiled strict schema diagnostics below still capture total size.
      }
      return {
        name,
        nestedOnly: component.nestedOnly ?? false,
        authoredSchemaBytes,
        descriptionBytes: utf8Bytes(component.description ?? ""),
        defaultPropsBytes: jsonBytes(component.defaultProps ?? {}),
        authoredPropCount: Object.keys(component.props.shape ?? {}).length,
      };
    });
