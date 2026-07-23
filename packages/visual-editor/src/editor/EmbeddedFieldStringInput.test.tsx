import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { EmbeddedFieldStringInputFromEntity } from "./EmbeddedFieldStringInput.tsx";
import { toast } from "sonner";

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

vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
  },
}));

describe("EmbeddedFieldStringInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("includes linked entity fields in the embedded field selector", () => {
    render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <TemplateMetadataContext.Provider value={generateTemplateMetadata()}>
          <EntityFieldsContext.Provider
            value={{
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
              ],
              displayNames: {
                name: "Name",
                c_linkedLocation: "Linked Location",
                "c_linkedLocation.address": "Linked Location > Address",
                "c_linkedLocation.address.city":
                  "Linked Location > Address > City",
              },
            }}
          >
            <EmbeddedFieldStringInputFromEntity
              filter={{ types: ["type.string"] }}
              onChange={() => undefined}
              showFieldSelector={true}
              value=""
            />
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByLabelText("Add entity field"));

    expect(screen.getByText("Linked Location > Address > City")).toBeDefined();
  });

  it("scopes mapped-item embedded fields to one entity group and includes nested linked descendants", () => {
    render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <TemplateMetadataContext.Provider value={generateTemplateMetadata()}>
          <EntityFieldsContext.Provider
            value={{
              fields: [
                {
                  name: "c_articles",
                  displayName: "Articles",
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
                        displayName: "Name",
                        definition: {
                          name: "name",
                          typeName: "type.string",
                          type: {},
                        },
                      },
                      {
                        name: "description",
                        displayName: "Description",
                        definition: {
                          name: "description",
                          typeName: "type.string",
                          type: {},
                        },
                      },
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
                  },
                },
              ],
              displayNames: {
                c_articles: "Articles",
                "c_articles.name": "Articles > Name",
                "c_articles.description": "Articles > Description",
                "c_articles.c_linkedLocation": "Articles > Linked Location",
                "c_articles.c_linkedLocation.name":
                  "Articles > Linked Location > Name",
              },
            }}
          >
            <EmbeddedFieldStringInputFromEntity
              filter={{ types: ["type.string"] }}
              onChange={() => undefined}
              showFieldSelector={true}
              sourceField="c_articles"
              value=""
            />
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByLabelText("Add entity field"));

    expect(screen.queryByText("Linked Entity Fields")).toBeNull();
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Description")).toBeDefined();
    expect(screen.getByText("Linked Location > Name")).toBeDefined();
  });

  it("warns when selecting an embedded field through multiple linked entities", () => {
    render(
      <TemplatePropsContext.Provider
        value={{
          document: {
            c_linkedLocation: [{ name: "First" }, { name: "Second" }],
          },
        }}
      >
        <TemplateMetadataContext.Provider value={generateTemplateMetadata()}>
          <EntityFieldsContext.Provider
            value={{
              fields: [
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
                c_linkedLocation: "Linked Location",
                "c_linkedLocation.name": "Linked Location > Name",
              },
            }}
          >
            <EmbeddedFieldStringInputFromEntity
              filter={{ types: ["type.string"] }}
              onChange={() => undefined}
              showFieldSelector={true}
              value=""
            />
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByLabelText("Add entity field"));
    fireEvent.click(screen.getByText("Linked Location > Name"));

    expect(toast.warning).toHaveBeenCalledWith(
      "Linked Location contains multiple linked entities. Using the first one for Linked Location > Name."
    );
  });

  it("does not warn for scoped embedded fields mapped across multiple cards", () => {
    render(
      <TemplatePropsContext.Provider
        value={{
          document: {
            c_articles: [
              {
                c_linkedLocation: [{ name: "First" }],
              },
              {
                c_linkedLocation: [{ name: "Second" }],
              },
            ],
          },
        }}
      >
        <TemplateMetadataContext.Provider value={generateTemplateMetadata()}>
          <EntityFieldsContext.Provider
            value={{
              fields: [
                {
                  name: "c_articles",
                  displayName: "Articles",
                  definition: {
                    name: "c_articles",
                    typeName: "c_articles",
                    isList: true,
                    type: {},
                  },
                  children: {
                    fields: [
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
                  },
                },
              ],
              displayNames: {
                c_articles: "Articles",
                "c_articles.c_linkedLocation": "Articles > Linked Location",
                "c_articles.c_linkedLocation.name":
                  "Articles > Linked Location > Name",
              },
            }}
          >
            <EmbeddedFieldStringInputFromEntity
              filter={{ types: ["type.string"] }}
              onChange={() => undefined}
              showFieldSelector={true}
              sourceField="c_articles"
              value=""
            />
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByLabelText("Add entity field"));
    fireEvent.click(screen.getByText("Linked Location > Name"));

    expect(toast.warning).not.toHaveBeenCalled();
  });
});

describe("numeric embedded entity fields", () => {
  it("offers root and linked numeric fields and inserts a linked decimal path", () => {
    render(
      <TemplatePropsContext.Provider
        value={{
          document: {
            yearEstablished: 2006,
            rating: 4.5,
            c_linkedProducts: [
              {
                price: {
                  value: 19.95,
                },
              },
            ],
          },
        }}
      >
        <TemplateMetadataContext.Provider value={generateTemplateMetadata()}>
          <EntityFieldsContext.Provider
            value={{
              fields: [
                {
                  name: "yearEstablished",
                  displayName: "Year Established",
                  definition: {
                    name: "yearEstablished",
                    typeRegistryId: "type.integer",
                    type: {
                      numberType: "NUMBER_TYPE_INT",
                    },
                  },
                },
                {
                  name: "rating",
                  displayName: "Rating",
                  definition: {
                    name: "rating",
                    typeRegistryId: "type.float",
                    type: {
                      numberType: "NUMBER_TYPE_FLOAT",
                    },
                  },
                },
                {
                  name: "c_linkedProducts",
                  displayName: "Linked Products",
                  definition: {
                    name: "c_linkedProducts",
                    typeRegistryId: "type.entity_reference",
                    type: {
                      documentType: "DOCUMENT_TYPE_ENTITY",
                    },
                    isList: true,
                  },
                  children: {
                    fields: [
                      {
                        name: "price",
                        displayName: "Price",
                        definition: {
                          name: "price",
                          typeRegistryId: "type.price",
                          type: {
                            objectType: "OBJECT_TYPE_DEFAULT",
                          },
                        },
                        children: {
                          fields: [
                            {
                              name: "value",
                              displayName: "Value",
                              definition: {
                                name: "value",
                                typeRegistryId: "type.decimal",
                                type: {
                                  stringType: "STRING_TYPE_DECIMAL",
                                },
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
                yearEstablished: "Year Established",
                rating: "Rating",
                c_linkedProducts: "Linked Products",
                "c_linkedProducts.price": "Linked Products > Price",
                "c_linkedProducts.price.value":
                  "Linked Products > Price > Value",
              },
            }}
          >
            <EmbeddedFieldStringInputFromEntity
              filter={{ types: ["type.string"] }}
              onChange={() => undefined}
              showFieldSelector={true}
              value=""
            />
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByLabelText("Add entity field"));

    expect(screen.getByText("Year Established")).toBeDefined();
    expect(screen.getByText("Rating")).toBeDefined();
    expect(screen.getByText("Linked Products > Price > Value")).toBeDefined();

    fireEvent.click(screen.getByText("Linked Products > Price > Value"));

    expect(
      screen.getByDisplayValue("[[c_linkedProducts.price.value]]")
    ).toBeDefined();
  });
});
