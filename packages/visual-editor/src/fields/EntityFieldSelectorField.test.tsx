import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const puckState = {
  appState: {
    ui: {
      itemSelector: null,
    },
  },
  getItemBySelector: () => undefined,
};

vi.mock("@puckeditor/core", async () => {
  const actual =
    await vi.importActual<typeof import("@puckeditor/core")>(
      "@puckeditor/core"
    );

  return {
    ...actual,
    createUsePuck: () => (selector: (state: typeof puckState) => unknown) =>
      selector(puckState),
  };
});

import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import {
  getConstantConfigFromType,
  returnConstantFieldConfig,
  type EntityFieldSelectorField,
} from "./EntityFieldSelectorField.tsx";

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
        <EntityFieldsContext.Provider value={entityFields}>
          <YextAutoField
            field={field}
            id="entity-selector-field"
            onChange={onChange}
            value={value}
          />
        </EntityFieldsContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange };
};

const renderRepeatedEntityField = ({
  field = {
    type: "entityField",
    label: "Articles",
    filter: {
      itemSourceTypes: [["type.string"]],
    },
    repeated: {
      defaultItemValue: {
        title: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "" },
        },
      },
      defaultMappings: {
        title: {
          field: "",
          constantValueEnabled: false,
          constantValue: { defaultValue: "" },
        },
      },
      manualItemFields: {
        title: {
          type: "entityField",
          label: "Title",
          filter: { types: ["type.string"] },
        },
      },
      mappingFields: {
        title: {
          type: "entityField",
          label: "Title",
          filter: { types: ["type.string"] },
        },
      },
    },
  } satisfies EntityFieldSelectorField,
  value = {
    field: "",
    constantValueEnabled: true,
    constantValue: [
      {
        title: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "" },
        },
      },
    ],
    mappings: {
      title: {
        field: "name",
        constantValueEnabled: false,
        constantValue: { defaultValue: "" },
      },
    },
  },
  entityFields = {
    ...defaultEntityFields,
    fields: [
      {
        name: "c_articles",
        definition: {
          name: "c_articles",
          typeName: "c_articles",
          isList: true,
          type: {},
        },
        children: {
          fields: [
            {
              name: "name",
              definition: {
                name: "name",
                typeName: "type.string",
                type: {},
              },
            },
          ],
        },
      },
      ...defaultEntityFields.fields,
    ],
    displayNames: {
      ...defaultEntityFields.displayNames,
      c_articles: "Articles",
      "c_articles.name": "Articles > Name",
    },
  } satisfies StreamFields,
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
        <EntityFieldsContext.Provider value={entityFields}>
          <YextAutoField
            field={field}
            id="repeated-entity-selector-field"
            onChange={onChange}
            value={value}
          />
        </EntityFieldsContext.Provider>
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

  it("prefers the rich text constant editor for mixed string and rich text filters", () => {
    expect(
      returnConstantFieldConfig(
        ["type.string", "type.rich_text_v2"],
        false,
        false
      )
    ).toBe(getConstantConfigFromType("type.rich_text_v2", false, false));
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

    fireEvent.click(screen.getAllByRole("combobox")[0]);
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

  it("shows linked entity fields for single-value selectors", () => {
    renderEntityField({
      field: {
        type: "entityField",
        label: "Entity Field",
        filter: {
          types: ["type.string"],
        },
      },
      entityFields: {
        ...defaultEntityFields,
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_linkedLocation",
            displayName: "Linked Location",
            definition: {
              name: "c_linkedLocation",
              typeRegistryId: "type.entity_reference",
              type: {
                documentType: "DOCUMENT_TYPE_ENTITY",
              },
            },
            children: {
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
        ],
        displayNames: {
          ...defaultEntityFields.displayNames,
          c_linkedLocation: "Linked Location",
          "c_linkedLocation.name": "Linked Location > Name",
        },
      },
    });

    fireEvent.click(screen.getAllByRole("combobox")[0]);

    expect(screen.getAllByText("Name").length).toBeGreaterThan(0);
    expect(screen.getByText("Linked Location > Name")).toBeDefined();
  });

  it("does not show linked entity fields for list-only selectors", () => {
    renderEntityField({
      field: {
        type: "entityField",
        label: "Entity Field",
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
        },
      },
      entityFields: {
        ...defaultEntityFields,
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_linkedLocation",
            displayName: "Linked Location",
            definition: {
              name: "c_linkedLocation",
              typeRegistryId: "type.entity_reference",
              type: {
                documentType: "DOCUMENT_TYPE_ENTITY",
              },
            },
            children: {
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
        ],
        displayNames: {
          ...defaultEntityFields.displayNames,
          c_linkedLocation: "Linked Location",
          "c_linkedLocation.name": "Linked Location > Name",
        },
      },
    });

    fireEvent.click(screen.getAllByRole("combobox")[0]);

    expect(screen.queryByText("Linked Location > Name")).toBeNull();
  });

  it("falls back to the default entity field option when no matching entity fields exist", () => {
    renderEntityField({
      entityFields: {
        fields: [],
        displayNames: {},
      },
      value: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
    });

    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.getAllByRole("combobox")[0]?.textContent).toContain(
      "Select a Field"
    );

    fireEvent.click(screen.getAllByRole("combobox")[0]);

    expect(screen.getAllByText("Select a Field").length).toBeGreaterThan(0);
    expect(screen.queryByText("Name")).toBeNull();
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
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    expect(screen.getByText("Title")).toBeDefined();
  });

  it("renders inline repeated item editors in manual mode", () => {
    renderRepeatedEntityField();

    expect(screen.getByText("Articles")).toBeDefined();
    expect(screen.getByRole("switch")).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
  });

  it("renders repeated card controls for slot-backed manual mode", () => {
    renderRepeatedEntityField({
      field: {
        type: "entityField",
        label: "Articles",
        filter: {
          itemSourceTypes: [["type.string"]],
        },
        repeated: {
          defaultItemValue: {},
          defaultMappings: {
            title: {
              field: "",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
          },
          manualItemFields: {},
          mappingFields: {
            title: {
              type: "entityField",
              label: "Title",
              filter: { types: ["type.string"] },
            },
          },
          manualItemSummary: (_, index) => `Event ${String((index ?? 0) + 1)}`,
        },
      },
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: [{ id: "ArticleCard-1" }],
        mappings: {
          title: {
            field: "name",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
    });

    expect(screen.getByText("Event 1")).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
  });
  it("renders the linked source selector when repeated KG mode is enabled", () => {
    const { onChange } = renderRepeatedEntityField({
      value: {
        field: "c_featuredArticles",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          title: {
            field: "",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
    });

    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(
      within(screen.getByRole("listbox")).getAllByText("Articles")[0]
    );

    expect(onChange).toHaveBeenCalledWith({
      field: "c_articles",
      constantValueEnabled: false,
      constantValue: [],
      mappings: {
        title: {
          field: "",
          constantValueEnabled: false,
          constantValue: { defaultValue: "" },
        },
      },
    });
  });

  it("uses the scoped source name for repeated mapping field groups", () => {
    renderRepeatedEntityField({
      value: {
        field: "c_productsSection.products",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          title: {
            field: "",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
      entityFields: {
        ...defaultEntityFields,
        fields: [
          {
            name: "c_productsSection",
            definition: {
              name: "c_productsSection",
              typeName: "type.products_section",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "products",
                  definition: {
                    name: "products",
                    typeName: "c_products",
                    isList: true,
                    type: {},
                  },
                  children: {
                    fields: [
                      {
                        name: "name",
                        definition: {
                          name: "name",
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
          ...defaultEntityFields.fields,
        ],
        displayNames: {
          ...defaultEntityFields.displayNames,
          c_productsSection: "Products Section",
          "c_productsSection.products": "Products Section > Products",
          "c_productsSection.products.name":
            "Products Section > Products > Name",
        },
      },
    });

    fireEvent.click(screen.getAllByRole("combobox")[1]);

    expect(screen.getByText("Products Fields")).toBeDefined();
  });

  it("hides the repeated source selector when the source field is fixed", () => {
    renderRepeatedEntityField({
      field: {
        type: "entityField",
        label: "Directory Children",
        filter: {
          itemSourceTypes: [["type.string"]],
        },
        disableConstantValueToggle: true,
        fixedRepeatedField: "dm_directoryChildren",
        repeated: {
          defaultItemValue: {
            title: {
              field: "",
              constantValueEnabled: true,
              constantValue: { defaultValue: "" },
            },
          },
          defaultMappings: {
            title: {
              field: "",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
          },
          manualItemFields: {
            title: {
              type: "entityField",
              label: "Title",
              filter: { types: ["type.string"] },
            },
          },
          mappingFields: {
            title: {
              type: "entityField",
              label: "Title",
              filter: { types: ["type.string"] },
            },
          },
        },
      },
      value: {
        field: "dm_directoryChildren",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          title: {
            field: "name",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
      entityFields: {
        ...defaultEntityFields,
        fields: [
          {
            name: "dm_directoryChildren",
            definition: {
              name: "dm_directoryChildren",
              typeName: "dm_directoryChildren",
              isList: true,
              type: {},
            },
            children: {
              fields: [
                {
                  name: "name",
                  definition: {
                    name: "name",
                    typeName: "type.string",
                    type: {},
                  },
                },
              ],
            },
          },
          ...defaultEntityFields.fields,
        ],
        displayNames: {
          ...defaultEntityFields.displayNames,
          dm_directoryChildren: "Directory Children",
          "dm_directoryChildren.name": "Directory Children > Name",
        },
      },
    });

    expect(screen.getAllByRole("switch")).toHaveLength(1);
    expect(screen.getAllByRole("combobox")).toHaveLength(1);

    fireEvent.click(screen.getAllByRole("combobox")[0]);

    expect(screen.getByText("Directory Children Fields")).toBeDefined();
    expect(screen.queryByText("Location Fields")).toBeNull();
  });

  it("clears stale repeated mappings when switching between linked sources", () => {
    const { onChange } = renderRepeatedEntityField({
      value: {
        field: "c_featuredArticles",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          title: {
            field: "name",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
    });

    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(
      within(screen.getByRole("listbox")).getAllByText("Articles")[0]
    );

    expect(onChange).toHaveBeenCalledWith({
      field: "c_articles",
      constantValueEnabled: false,
      constantValue: [],
      mappings: {
        title: {
          field: "",
          constantValueEnabled: false,
          constantValue: { defaultValue: "" },
        },
      },
    });
  });

  it("preserves repeated mappings when switching from linked mode to manual mode", () => {
    const { onChange } = renderRepeatedEntityField({
      value: {
        field: "c_featuredArticles",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          title: {
            field: "name",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
    });

    fireEvent.click(screen.getAllByRole("switch")[0]);

    expect(onChange).toHaveBeenCalledWith({
      field: "c_featuredArticles",
      constantValueEnabled: true,
      constantValue: [],
      mappings: {
        title: {
          field: "name",
          constantValueEnabled: false,
          constantValue: { defaultValue: "" },
        },
      },
    });
  });
});
