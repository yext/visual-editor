import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { LinkedEntitySchemasContext } from "../hooks/useLinkedEntitySchemas.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { type StreamFields } from "../types/entityFields.ts";
import {
  ConstantValueInput,
  EntityFieldInput,
} from "./YextEntityFieldSelector.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EmbeddedFieldStringInputFromEntity } from "./EmbeddedFieldStringInput.tsx";
import { type LinkedEntitySchemas } from "../utils/linkedEntityFieldUtils.ts";

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

const renderEntityFieldInput = (
  props: {
    entityFields?: StreamFields | null;
    filter?: any;
    onChange?: any;
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
  const templateMetadata = {
    ...generateTemplateMetadata(),
    entityTypeDisplayName: "Location",
  };

  const view = render(
    <TemplatePropsContext.Provider value={{ document }}>
      <TemplateMetadataContext.Provider value={templateMetadata}>
        <LinkedEntitySchemasContext.Provider
          value={linkedEntitySchemas ?? null}
        >
          <EntityFieldsContext.Provider value={entityFields}>
            <EntityFieldInput
              filter={filter}
              onChange={onChange}
              value={value}
            />
          </EntityFieldsContext.Provider>
        </LinkedEntitySchemasContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange, ...view };
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
  beforeEach(() => {
    warningToast.mockClear();
  });

  it("shows linked entity fields for single-value selectors", () => {
    renderEntityFieldInput({
      filter: { types: ["type.string"] },
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
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.queryByText("Linked Location > Name")).toBeNull();
  });

  it("shows linked entity source roots when the selector opts into them", () => {
    renderEntityFieldInput({
      filter: {
        types: ["type.events_section"],
        includeLinkedEntityRoots: true,
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
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("Linked Location")).toBeDefined();
    expect(screen.queryByText("Linked Location > Name")).toBeNull();
  });

  it("falls back to the default entity field option when no matching entity fields exist", () => {
    renderEntityFieldInput({
      entityFields: {
        fields: [],
      },
    });

    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.getAllByRole("combobox")[0]?.textContent).toContain(
      "Location Field"
    );

    fireEvent.click(screen.getAllByRole("combobox")[0]);

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
    const props = {
      filter: {
        types: ["type.string"],
      } satisfies RenderEntityFieldFilter<Record<string, any>>,
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
    };

    const { rerender } = renderEntityFieldInput(props);
    rerender(
      <TemplatePropsContext.Provider value={{ document: props.document }}>
        <TemplateMetadataContext.Provider
          value={{
            ...generateTemplateMetadata(),
            entityTypeDisplayName: "Location",
          }}
        >
          <LinkedEntitySchemasContext.Provider
            value={props.linkedEntitySchemas ?? null}
          >
            <EntityFieldsContext.Provider value={defaultEntityFields}>
              <EntityFieldInput
                filter={props.filter}
                onChange={vi.fn()}
                value={props.value}
              />
            </EntityFieldsContext.Provider>
          </LinkedEntitySchemasContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    expect(warningToast).toHaveBeenCalledTimes(1);
    expect(warningToast).toHaveBeenCalledWith(
      "Multiple linked entities were found for c_linkedLocation.name. Using the first linked entity."
    );
  });
});
