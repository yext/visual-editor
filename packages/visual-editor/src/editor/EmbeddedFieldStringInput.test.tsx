import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { EmbeddedFieldStringInputFromEntity } from "./EmbeddedFieldStringInput.tsx";

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

describe("EmbeddedFieldStringInput", () => {
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
});
