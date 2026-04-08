import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamFields } from "../types/entityFields.ts";
import {
  EntityFieldInput,
  type TypeSelectorConfigProps,
} from "./YextEntityFieldSelector.tsx";

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
      name: "photo",
      definition: {
        name: "photo",
        typeName: "type.image",
        type: {},
      },
    },
  ],
  displayNames: {
    name: "Name",
    description: "Description",
    photo: "Photo",
  },
};

const defaultTypeSelectorConfig: TypeSelectorConfigProps = {
  typeLabel: "Type",
  fieldLabel: "Field",
  options: [
    { label: "Text", value: "text" },
    { label: "Image", value: "image" },
  ],
  optionValueToEntityFieldType: {
    text: "type.string",
    image: "type.image",
  },
};

const renderEntityFieldInput = ({
  entityFields = defaultEntityFields,
  filter = { types: ["type.string", "type.image"] },
  onChange = vi.fn(),
  typeSelectorConfig = defaultTypeSelectorConfig,
  value = {},
}: {
  entityFields?: StreamFields | null;
  filter?: any;
  onChange?: any;
  typeSelectorConfig?: TypeSelectorConfigProps;
  value?: Record<string, any>;
} = {}) => {
  const templateMetadata = {
    ...generateTemplateMetadata(),
    entityTypeDisplayName: "Location",
  };

  render(
    <TemplateMetadataContext.Provider value={templateMetadata}>
      <EntityFieldsContext.Provider value={entityFields}>
        <EntityFieldInput
          filter={filter}
          onChange={onChange}
          typeSelectorConfig={typeSelectorConfig}
          value={value}
        />
      </EntityFieldsContext.Provider>
    </TemplateMetadataContext.Provider>
  );

  return { onChange };
};

describe("YextEntityFieldSelector", () => {
  it("renders a type selector and filters entity field options by selected type", () => {
    renderEntityFieldInput({
      value: {
        selectedType: "text",
      },
    });

    expect(screen.getAllByRole("combobox")).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("combobox")[1]);

    expect(screen.getAllByText("Location Field").length).toBeGreaterThan(0);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Description")).toBeDefined();
    expect(screen.queryByText("Photo")).toBeNull();
  });

  it("clears the selected field when the selected type changes", () => {
    const { onChange } = renderEntityFieldInput({
      value: {
        field: "name",
        selectedType: "text",
      },
    });

    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByText("Image"));

    expect(onChange.mock.calls[0]?.[0]).toEqual({
      field: "",
      selectedType: "image",
    });
  });

  it("hides the field selector when the selected type does not map to an entity field type", () => {
    renderEntityFieldInput({
      value: {
        selectedType: "unsupported",
      },
    });

    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });

  it("shows the no-options placeholder and message when no type options are available", () => {
    renderEntityFieldInput({
      typeSelectorConfig: {
        ...defaultTypeSelectorConfig,
        options: [],
      },
    });

    expect(screen.getByText("No available types")).toBeDefined();
    expect(
      screen.getByText("No types found. Please check your configuration.")
    ).toBeDefined();
  });

  it("falls back to the default entity field option when no matching entity fields exist", () => {
    renderEntityFieldInput({
      entityFields: {
        fields: [],
      },
      value: {
        selectedType: "text",
      },
    });

    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(screen.getAllByRole("combobox")[1]?.textContent).toContain(
      "Location Field"
    );

    fireEvent.click(screen.getAllByRole("combobox")[1]);

    expect(screen.getAllByText("Location Field").length).toBeGreaterThan(0);
    expect(screen.queryByText("Name")).toBeNull();
  });
});
