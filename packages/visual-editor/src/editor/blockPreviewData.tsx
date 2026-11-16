import React from "react";
import {
  resolveAllData,
  type Config,
  type Data,
  type Fields,
} from "@puckeditor/core";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";

export type BlockPreviewData = {
  config: Config;
  data: Data;
  sampleLayout: boolean;
  wideLayout: boolean;
};
const sampleType = "__BlockPreviewSample";

function hasLayoutFields(fields: Fields | undefined): boolean {
  return Object.values(fields ?? {}).some(
    (field) =>
      field.type === "slot" ||
      field.type === "array" ||
      !!field.metadata?.yextField?.repeated ||
      (field.type === "object" && hasLayoutFields(field.objectFields))
  );
}

function hasContentSources(fields: Fields | undefined): boolean {
  return Object.values(fields ?? {}).some((field) => {
    const authored = field.metadata?.yextField ?? field;
    return (
      [
        "entityField",
        "ctaSelector",
        "translatableString",
        "image",
        "video",
        "code",
      ].includes(authored.type) ||
      (field.type === "object" && hasContentSources(field.objectFields)) ||
      (field.type === "array" && hasContentSources(field.arrayFields))
    );
  });
}

/** Make a private, deterministic default tree. Never reuse IDs or props from the edited page. */
export async function resolveBlockPreview(
  config: Config,
  componentId: string,
  streamDocument: StreamDocument,
  rootProps: Record<string, unknown>
): Promise<BlockPreviewData> {
  const component = config.components[componentId];
  if (!component) throw new Error("Unknown preview component");
  const props = structuredClone(component.defaultProps ?? {});
  let sampleLayout = false;
  let sampleNumber = 0;
  const populateEmptySlots = (
    fields: Fields | undefined,
    values: Record<string, any>
  ) => {
    for (const [name, field] of Object.entries(fields ?? {})) {
      if (
        field.type === "slot" &&
        (!values[name] || (Array.isArray(values[name]) && !values[name].length))
      ) {
        sampleLayout = true;
        values[name] = Array.from(
          { length: name === "content" ? 3 : 1 },
          () => ({
            type: sampleType,
            props: {
              number: ++sampleNumber,
              as: values.as === "ul" || values.as === "ol" ? "li" : "div",
            },
          })
        );
      } else if (
        field.type === "object" &&
        values[name] &&
        typeof values[name] === "object"
      ) {
        populateEmptySlots(field.objectFields, values[name]);
      } else if (field.type === "array" && Array.isArray(values[name])) {
        values[name].forEach((item: Record<string, any>) =>
          populateEmptySlots(field.arrayFields, item)
        );
      }
    }
  };
  // Sample only layout slots; a mapped source with no entity data stays empty.
  if (!hasContentSources(component.fields))
    populateEmptySlots(component.fields, props);
  let counter = 0;
  const hydrate = (value: unknown, depth = 0): any => {
    if (depth > 40) throw new Error("Preview defaults are nested too deeply");
    if (Array.isArray(value))
      return value.map((child) => hydrate(child, depth + 1));
    if (!value || typeof value !== "object") return value;
    const node = value as Record<string, any>;
    if (
      typeof node.type === "string" &&
      node.props &&
      (config.components[node.type] || node.type === sampleType)
    ) {
      const defaults = config.components[node.type]?.defaultProps ?? {};
      return {
        ...node,
        props: {
          ...hydrate(
            { ...structuredClone(defaults), ...node.props },
            depth + 1
          ),
          id: `block-preview-${componentId}-${++counter}`,
        },
      };
    }
    return Object.fromEntries(
      Object.entries(node).map(([key, child]) => [
        key,
        hydrate(child, depth + 1),
      ])
    );
  };
  const RootTag = props.as === "li" ? "ul" : "div";
  const previewConfig: Config = {
    ...config,
    root: {
      render: ({ children }: { children: React.ReactNode }) => (
        <RootTag
          className="components ve-block-preview-stage"
          style={{ margin: 0, padding: 0, listStyle: "none" }}
        >
          {children}
        </RootTag>
      ),
    },
    components: {
      ...config.components,
      [sampleType]: {
        fields: {},
        render: ({ number, as: Tag = "div" }) => (
          <Tag
            style={{
              flex: "1 1 0",
              minWidth: 100,
              minHeight: 120,
              padding: 24,
              boxSizing: "border-box",
              display: "grid",
              placeItems: "center",
              border: "2px dashed #94a3b8",
              borderRadius: 8,
              background: "#f1f5f9",
              color: "#475569",
              font: "600 24px system-ui",
            }}
          >
            {number}
          </Tag>
        ),
      },
    },
  };
  const data = await resolveAllData(
    {
      root: { props: structuredClone(rootProps) },
      content: [hydrate({ type: componentId, props })],
    },
    previewConfig,
    { streamDocument }
  );
  return {
    config: previewConfig,
    data,
    sampleLayout,
    wideLayout:
      hasLayoutFields(component.fields) &&
      !["article", "li", "ul", "ol"].includes(props.as),
  };
}
