import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { LinkedEntitySchemasContext } from "../hooks/useLinkedEntitySchemas.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import { type EntityFieldSelectorField } from "./EntityFieldSelectorField.tsx";

const defaultEntityFields: StreamFields = {
  fields: [
    {
      name: "name",
      definition: {
        name: "name",
        typeName: "type.string",
        type: {},
      },
    },
    {
      name: "description",
      definition: {
        name: "description",
        typeName: "type.string",
        type: {},
      },
    },
    {
      name: "startDate",
      definition: {
        name: "startDate",
        typeName: "type.datetime",
        type: {},
      },
    },
  ],
  displayNames: {
    name: "Name",
    description: "Description",
    startDate: "Start Date",
  },
};

const renderEntityField = ({
  field = {
    type: "entityField",
    label: "Entity Field",
    filter: {
      types: ["type.string"],
    },
  } satisfies EntityFieldSelectorField,
  value = {
    field: "name",
    constantValue: "",
    constantValueEnabled: false,
  },
  entityFields = defaultEntityFields,
}: {
  field?: EntityFieldSelectorField;
  value?: Record<string, any>;
  entityFields?: StreamFields | null;
} = {}) => {
  const onChange = vi.fn();

  render(
    <TemplatePropsContext.Provider value={{ document: {} }}>
      <TemplateMetadataContext.Provider
        value={{
          ...generateTemplateMetadata(),
          entityTypeDisplayName: "Location",
        }}
      >
        <LinkedEntitySchemasContext.Provider value={null}>
          <EntityFieldsContext.Provider value={entityFields}>
            <YextAutoField
              field={field}
              id="entity-selector-field"
              onChange={onChange}
              value={value}
            />
          </EntityFieldsContext.Provider>
        </LinkedEntitySchemasContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange };
};

describe("EntityFieldSelectorField", () => {
  it("renders the configured label", () => {
    renderEntityField({
      field: {
        type: "entityField",
        label: "Meta Description",
        filter: { types: ["type.string"] },
      },
    });

    expect(screen.getByText("Meta Description")).toBeDefined();
  });

  it("toggles between KG and static modes", () => {
    const { onChange } = renderEntityField({
      value: {
        field: "name",
        constantValue: "",
        constantValueEnabled: false,
      },
    });

    fireEvent.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith({
      field: "name",
      constantValue: "",
      constantValueEnabled: true,
    });
  });

  it("hides the KG/static toggle when disableConstantValueToggle is true", () => {
    renderEntityField({
      field: {
        type: "entityField",
        label: "Meta Description",
        filter: { types: ["type.string"] },
        disableConstantValueToggle: true,
      },
    });

    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("renders the constant value input path when constant mode is enabled", () => {
    const { onChange } = renderEntityField({
      field: {
        type: "entityField",
        label: "Start Date",
        filter: { types: ["type.datetime"] },
      },
      value: {
        field: "startDate",
        constantValueEnabled: true,
        constantValue: "2026-04-15T09:30",
      },
    });

    const input = screen.getByDisplayValue(
      "2026-04-15T09:30"
    ) as HTMLInputElement;
    expect(input.type).toBe("datetime-local");

    fireEvent.change(input, { target: { value: "2026-06-01T13:45" } });

    expect(onChange).toHaveBeenCalledWith(
      {
        field: "startDate",
        constantValueEnabled: true,
        constantValue: "2026-06-01T13:45",
      },
      undefined
    );
  });

  it("renders the entity field selector path", () => {
    const { onChange } = renderEntityField({
      value: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
    });

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Name"));

    expect(onChange).toHaveBeenCalledWith(
      {
        field: "name",
        constantValue: "",
        constantValueEnabled: false,
      },
      undefined
    );
  });

  it("renders nested entityField configs through YextAutoField normalization", () => {
    render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <TemplateMetadataContext.Provider
          value={{
            ...generateTemplateMetadata(),
            entityTypeDisplayName: "Location",
          }}
        >
          <LinkedEntitySchemasContext.Provider value={null}>
            <EntityFieldsContext.Provider value={defaultEntityFields}>
              <YextAutoField
                field={{
                  type: "object",
                  label: "Data",
                  objectFields: {
                    title: {
                      type: "entityField",
                      label: "Title",
                      filter: { types: ["type.string"] },
                    },
                  },
                }}
                id="nested-entity-selector-field"
                onChange={vi.fn()}
                value={{
                  title: {
                    field: "name",
                    constantValue: "",
                    constantValueEnabled: false,
                  },
                }}
              />
            </EntityFieldsContext.Provider>
          </LinkedEntitySchemasContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    expect(screen.getByText("Title")).toBeDefined();
  });
});
