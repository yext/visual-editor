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

  it("shows FAQ list sources when item mappings require string and rich text fields", () => {
    render(
      <TemplatePropsContext.Provider
        value={{ document: { c_faqSection: { faqs: [] } } }}
      >
        <TemplateMetadataContext.Provider
          value={{
            ...generateTemplateMetadata(),
            entityTypeDisplayName: "Location",
          }}
        >
          <EntityFieldsContext.Provider
            value={{
              fields: [
                {
                  name: "c_faqSection",
                  definition: {
                    name: "c_faqSection",
                    typeName: "type.faq_section",
                    type: {},
                  },
                  children: {
                    fields: [
                      {
                        name: "faqs",
                        displayName: "FAQs",
                        definition: {
                          name: "faqs",
                          isList: true,
                          typeName: "type.struct",
                          type: {},
                        },
                        children: {
                          fields: [
                            {
                              name: "question",
                              definition: {
                                name: "question",
                                typeName: "type.string",
                                type: {},
                              },
                            },
                            {
                              name: "answer",
                              definition: {
                                name: "answer",
                                typeName: "type.rich_text_v2",
                                type: {},
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
              displayNames: {
                c_faqSection: "FAQ Section",
                "c_faqSection.faqs": "FAQ Section > FAQs",
              },
            }}
          >
            <YextAutoField
              field={
                {
                  type: "itemSource",
                  label: "FAQs",
                  filter: {
                    itemSourceTypes: [["type.string"], ["type.rich_text_v2"]],
                  },
                  defaultItemValue: {
                    question: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: { defaultValue: "" },
                    },
                    answer: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: { defaultValue: "" },
                    },
                  },
                  itemFields: {
                    question: {
                      type: "entityField",
                      label: "Question",
                      filter: {
                        types: ["type.string"],
                      },
                      constantValueFilter: {
                        types: ["type.string", "type.rich_text_v2"],
                      },
                    },
                    answer: {
                      type: "entityField",
                      label: "Answer",
                      filter: {
                        types: ["type.rich_text_v2"],
                      },
                    },
                  },
                } satisfies ItemSourceField<any, any>
              }
              id="faq-item-source-field"
              onChange={vi.fn()}
              value={{
                field: "",
                constantValueEnabled: false,
                constantValue: [],
              }}
            />
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("FAQs").length).toBeGreaterThan(0);
  });

  it("uses ENTITY_FIELDS display names for linked nested list sources", () => {
    render(
      <TemplatePropsContext.Provider
        value={{ document: { c_linkedLocation: [] } }}
      >
        <TemplateMetadataContext.Provider
          value={{
            ...generateTemplateMetadata(),
            entityTypeDisplayName: "Location",
          }}
        >
          <EntityFieldsContext.Provider
            value={{
              fields: [
                {
                  name: "c_linkedLocation",
                  displayName: "LinkedLocation",
                  definition: {
                    name: "c_linkedLocation",
                    typeRegistryId: "type.entity_reference",
                    type: {
                      documentType: "DOCUMENT_TYPE_ENTITY",
                    },
                    isList: true,
                  },
                  children: {
                    fields: [
                      {
                        name: "c_eventsSection",
                        definition: {
                          name: "c_eventsSection",
                          typeName: "type.events_section",
                          type: {},
                        },
                        children: {
                          fields: [
                            {
                              name: "events",
                              definition: {
                                name: "events",
                                isList: true,
                                typeName: "type.struct",
                                type: {},
                              },
                              children: {
                                fields: [
                                  {
                                    name: "title",
                                    definition: {
                                      name: "title",
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
                      {
                        name: "c_faqSection",
                        definition: {
                          name: "c_faqSection",
                          typeName: "type.faq_section",
                          type: {},
                        },
                        children: {
                          fields: [
                            {
                              name: "faqs",
                              definition: {
                                name: "faqs",
                                isList: true,
                                typeName: "type.struct",
                                type: {},
                              },
                              children: {
                                fields: [
                                  {
                                    name: "question",
                                    definition: {
                                      name: "question",
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
                    ],
                  },
                },
              ],
              displayNames: {
                c_linkedLocation: "LinkedLocation",
                c_eventsSection: "Events Section",
                "c_eventsSection.events": "Events Section > Events",
                c_faqSection: "FAQ Section",
                "c_faqSection.faqs": "FAQ Section > FAQs",
              },
            }}
          >
            <YextAutoField
              field={
                {
                  type: "itemSource",
                  label: "Events",
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
                      filter: {
                        types: ["type.string"],
                      },
                    },
                  },
                } satisfies ItemSourceField<any, any>
              }
              id="linked-list-item-source-field"
              onChange={vi.fn()}
              value={{
                field: "",
                constantValueEnabled: false,
                constantValue: [],
              }}
            />
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(
      screen.getAllByText("LinkedLocation > Events Section > Events").length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("LinkedLocation > FAQ Section > FAQs").length
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText("LinkedLocation > c_eventsSection > events")
    ).toBeNull();
    expect(
      screen.queryByText("LinkedLocation > c_faqSection > faqs")
    ).toBeNull();
  });
});
