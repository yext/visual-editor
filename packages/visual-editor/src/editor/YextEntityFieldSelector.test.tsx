import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { LinkedEntitySchemasContext } from "../hooks/useLinkedEntitySchemas.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamFields } from "../types/entityFields.ts";
import {
  ConstantValueInput,
  EntityFieldInput,
  resetWarnedLinkedEntityFieldPaths,
  type TypeSelectorConfigProps,
} from "./YextEntityFieldSelector.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EmbeddedFieldStringInputFromEntity } from "./EmbeddedFieldStringInput.tsx";
import { type LinkedEntitySchemas } from "./linkedEntityFieldUtils.ts";

const { warningToast } = vi.hoisted(() => ({
  warningToast: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    warning: warningToast,
  },
}));

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

const renderEntityFieldInput = (
  props: {
    entityFields?: StreamFields | null;
    filter?: any;
    onChange?: any;
    typeSelectorConfig?: TypeSelectorConfigProps;
    value?: Record<string, any>;
    document?: Record<string, unknown>;
    linkedEntitySchemas?: LinkedEntitySchemas;
  } = {}
) => {
  const {
    entityFields = defaultEntityFields,
    filter = { types: ["type.string", "type.image"] },
    onChange = vi.fn(),
    value = {},
    document = {},
    linkedEntitySchemas,
  } = props;
  const resolvedTypeSelectorConfig =
    "typeSelectorConfig" in props
      ? props.typeSelectorConfig
      : defaultTypeSelectorConfig;
  const templateMetadata = {
    ...generateTemplateMetadata(),
    entityTypeDisplayName: "Location",
  };

  render(
    <TemplatePropsContext.Provider value={{ document }}>
      <TemplateMetadataContext.Provider value={templateMetadata}>
        <LinkedEntitySchemasContext.Provider
          value={linkedEntitySchemas ?? null}
        >
          <EntityFieldsContext.Provider value={entityFields}>
            <EntityFieldInput
              filter={filter}
              onChange={onChange}
              typeSelectorConfig={resolvedTypeSelectorConfig}
              value={value}
            />
          </EntityFieldsContext.Provider>
        </LinkedEntitySchemasContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange };
};

const renderEmbeddedFieldInput = ({
  entityFields = defaultEntityFields,
  filter = { types: ["type.string"] },
  linkedEntitySchemas,
}: {
  entityFields?: StreamFields | null;
  filter?: any;
  linkedEntitySchemas?: LinkedEntitySchemas;
} = {}) => {
  const templateMetadata = generateTemplateMetadata();

  render(
    <TemplatePropsContext.Provider value={{ document: {} }}>
      <TemplateMetadataContext.Provider value={templateMetadata}>
        <LinkedEntitySchemasContext.Provider
          value={linkedEntitySchemas ?? null}
        >
          <EntityFieldsContext.Provider value={entityFields}>
            <EmbeddedFieldStringInputFromEntity
              filter={filter}
              onChange={vi.fn()}
              showFieldSelector={true}
              value=""
            />
          </EntityFieldsContext.Provider>
        </LinkedEntitySchemasContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );
};

describe("YextEntityFieldSelector", () => {
  it("shows linked entity fields for single-value selectors", () => {
    renderEntityFieldInput({
      filter: { types: ["type.string"] },
      typeSelectorConfig: undefined,
      linkedEntitySchemas: {
        c_linkedLocation: {
          displayName: "Linked Location",
          fields: [
            {
              name: "name",
              displayName: "Name",
              definition: {
                name: "name",
                typeName: "type.string",
                type: {},
              },
            },
          ],
        },
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Linked Location > Name")).toBeDefined();
  });

  it("does not show linked entity fields for list-only selectors", () => {
    renderEntityFieldInput({
      filter: { types: ["type.string"], includeListsOnly: true },
      linkedEntitySchemas: {
        c_linkedLocation: {
          displayName: "Linked Location",
          fields: [
            {
              name: "name",
              displayName: "Name",
              definition: {
                name: "name",
                typeName: "type.string",
                type: {},
              },
            },
          ],
        },
      },
      typeSelectorConfig: undefined,
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.queryByText("Linked Location > Name")).toBeNull();
  });

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

  it("renders datetime constant values through the registered Yext field type", () => {
    const onChange = vi.fn();

    render(
      <ConstantValueInput
        filter={{ types: ["type.datetime"] }}
        onChange={onChange}
        value={{ constantValue: "2026-04-15T09:30" }}
      />
    );

    expect(
      (screen.getByDisplayValue("2026-04-15T09:30") as HTMLInputElement).type
    ).toBe("datetime-local");
    expect(screen.queryByText("Value")).toBeNull();

    fireEvent.change(screen.getByDisplayValue("2026-04-15T09:30"), {
      target: { value: "2026-06-01T13:45" },
    });

    expect(onChange).toHaveBeenCalledWith(
      {
        constantValue: "2026-06-01T13:45",
      },
      undefined
    );
  });

  it("includes linked entity fields in the embedded field selector", () => {
    renderEmbeddedFieldInput({
      linkedEntitySchemas: {
        c_linkedLocation: {
          displayName: "Linked Location",
          fields: [
            {
              name: "address",
              displayName: "Address",
              definition: {
                name: "address",
                typeName: "type.address",
                type: {},
              },
              children: {
                fields: [
                  {
                    name: "city",
                    displayName: "City",
                    definition: {
                      name: "city",
                      typeName: "type.string",
                      type: {},
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    fireEvent.click(screen.getByLabelText("Add entity field"));

    expect(screen.getByText("Linked Location > Address > City")).toBeDefined();
  });

  it("warns once when a linked entity field resolves through multiple references", () => {
    warningToast.mockClear();
    resetWarnedLinkedEntityFieldPaths();

    const props = {
      filter: { types: ["type.string"] },
      value: {
        field: "c_linkedLocation.name",
      },
      document: {
        c_linkedLocation: [{ name: "First" }, { name: "Second" }],
      },
      linkedEntitySchemas: {
        c_linkedLocation: {
          displayName: "Linked Location",
          fields: [
            {
              name: "name",
              displayName: "Name",
              definition: {
                name: "name",
                typeName: "type.string",
                type: {},
              },
            },
          ],
        },
      },
      typeSelectorConfig: undefined,
    };

    renderEntityFieldInput(props);
    renderEntityFieldInput(props);

    expect(warningToast).toHaveBeenCalledTimes(1);
    expect(warningToast).toHaveBeenCalledWith(
      "Multiple linked entities were found for c_linkedLocation.name. Using the first linked entity."
    );
  });
});
