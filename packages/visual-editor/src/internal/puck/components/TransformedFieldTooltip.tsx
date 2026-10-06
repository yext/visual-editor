import React from "react";
import {
  createUsePuck,
  type BaseField,
  type Fields,
  type Overrides,
} from "@puckeditor/core";
import { useEntityTooltips } from "../../../editor/EntityField.tsx";
import { getTransformField } from "../../../fields/fieldTransforms.tsx";
import { pt } from "../../../utils/i18n/platform.ts";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip.tsx";

const usePuck = createUsePuck();

/** Collects source descriptions for opted-in fields from authored component props. */
export function getTransformedFieldSources(
  fields: Fields<any, BaseField & { type: string }>,
  values: Record<string, any>,
  path: string = ""
): { label: string; field?: string }[] {
  return Object.entries(fields).flatMap(([key, field]) => {
    const value = values[key];
    const propPath = path ? `${path}.${key}` : key;
    const authoredField = getTransformField(field);
    if (authoredField) {
      return [
        {
          label: authoredField.label ? pt(authoredField.label) : propPath,
          field:
            authoredField.type === "entityField" &&
            !value?.constantValueEnabled &&
            value?.field
              ? value.field
              : undefined,
        },
      ];
    }
    if (field.type === "object" && "objectFields" in field && value) {
      return getTransformedFieldSources(field.objectFields, value, propPath);
    }
    if (
      field.type === "array" &&
      "arrayFields" in field &&
      Array.isArray(value)
    ) {
      return value.flatMap((item, index) =>
        getTransformedFieldSources(
          field.arrayFields,
          item,
          `${propPath}[${index}]`
        )
      );
    }
    return [];
  });
}

/** Shows one component-level tooltip without adding source metadata to render values. */
export const TransformedFieldTooltip: Overrides["componentOverlay"] = ({
  children,
  componentId,
  componentType,
}) => {
  const tooltips = useEntityTooltips();
  const fields = usePuck(
    (state) => state.config.components[componentType]?.fields
  );
  const item = usePuck((state) => {
    const selector = state.getSelectorForId(componentId);
    return selector ? state.getItemBySelector(selector) : undefined;
  });
  const sources =
    fields && item ? getTransformedFieldSources(fields, item.props) : [];

  if (!tooltips?.tooltipsVisible || !sources.length) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <div className="h-full ve-outline-2 ve-outline-dotted ve-outline-primary">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent zoomWithViewport className="ve-bg-primary">
          {sources.map((source, index) => (
            <p key={index}>
              {source.label}:{" "}
              {source.field ?? pt("staticContent", "Static content")}
            </p>
          ))}
          <TooltipArrow fill="bg-popover" className="ve-fill-primary" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
