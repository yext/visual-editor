import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import { type ItemSourceField } from "./ItemSourceField.tsx";

const entityFields: StreamFields = {
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
  ],
  displayNames: {
    c_articles: "Articles",
    "c_articles.name": "Articles > Name",
  },
};

const renderItemSource = ({
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
  },
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
            field={
              {
                type: "itemSource",
                label: "Articles",
                filter: {
                  itemSourceTypes: [["type.string"]],
                },
                defaultItemValue: {
                  title: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: { defaultValue: "" },
                  },
                },
                itemFields: {
                  title: {
                    type: "entityField",
                    label: "Title",
                    sourceEntityPath: "articleSource",
                    filter: {
                      types: ["type.string"],
                    },
                  },
                },
              } satisfies ItemSourceField<any, any>
            }
            id="item-source-field"
            onChange={onChange}
            value={value}
          />
        </EntityFieldsContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange };
};

describe("ItemSourceField", () => {
  it("renders inline item editors in manual mode", () => {
    renderItemSource();

    expect(screen.getByText("Articles")).toBeDefined();
    expect(screen.getByRole("switch")).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
  });

  it("renders the linked source selector when KG mode is enabled", () => {
    const { onChange } = renderItemSource({
      value: {
        field: "",
        constantValueEnabled: false,
        constantValue: [],
      },
    });

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getAllByText("Articles")[1]!);

    expect(onChange).toHaveBeenCalledWith(
      {
        field: "c_articles",
        constantValueEnabled: false,
        constantValue: [],
      },
      undefined
    );
  });
});
