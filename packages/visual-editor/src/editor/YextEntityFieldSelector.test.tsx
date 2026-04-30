import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { LinkedEntitySchemasContext } from "../hooks/useLinkedEntitySchemas.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { type LinkedEntitySchemas } from "../utils/linkedEntityFieldUtils.ts";
import {
  ConstantValueInput,
  EntityFieldInput,
} from "./YextEntityFieldSelector.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EmbeddedFieldStringInputFromEntity } from "./EmbeddedFieldStringInput.tsx";

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

const linkedLocationSchemas: LinkedEntitySchemas = {
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
};

const renderEntityFieldInput = (
  props: {
    entityFields?: StreamFields | null;
    filter?: any;
    onChange?: any;
    value?: Record<string, any>;
    document?: Record<string, unknown>;
    linkedEntitySchemas?: LinkedEntitySchemas | null;
  } = {}
) => {
  const {
    entityFields = defaultEntityFields,
    filter = { types: ["type.string", "type.image"] },
    onChange = vi.fn(),
    value = {},
    document = {},
    linkedEntitySchemas = null,
  } = props;
  const templateMetadata = {
    ...generateTemplateMetadata(),
    entityTypeDisplayName: "Location",
  };

  const view = render(
    <TemplatePropsContext.Provider value={{ document }}>
      <TemplateMetadataContext.Provider value={templateMetadata}>
        <EntityFieldsContext.Provider value={entityFields}>
          <LinkedEntitySchemasContext.Provider value={linkedEntitySchemas}>
            <EntityFieldInput
              filter={filter}
              onChange={onChange}
              value={value}
            />
          </LinkedEntitySchemasContext.Provider>
        </EntityFieldsContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange, ...view };
};

const renderEmbeddedFieldInput = ({
  entityFields = defaultEntityFields,
  filter = { types: ["type.string"] },
  linkedEntitySchemas = null,
}: {
  entityFields?: StreamFields | null;
  filter?: any;
  linkedEntitySchemas?: LinkedEntitySchemas | null;
} = {}) => {
  const templateMetadata = generateTemplateMetadata();

  render(
    <TemplatePropsContext.Provider value={{ document: {} }}>
      <TemplateMetadataContext.Provider value={templateMetadata}>
        <EntityFieldsContext.Provider value={entityFields}>
          <LinkedEntitySchemasContext.Provider value={linkedEntitySchemas}>
            <EmbeddedFieldStringInputFromEntity
              filter={filter}
              onChange={vi.fn()}
              showFieldSelector={true}
              value=""
            />
          </LinkedEntitySchemasContext.Provider>
        </EntityFieldsContext.Provider>
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
      linkedEntitySchemas: linkedLocationSchemas,
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
      filter: { types: ["type.string"] },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("Name").length).toBeGreaterThan(0);
    expect(screen.getByText("Linked Location > Name")).toBeDefined();
  });

  it("does not show linked entity fields for list-only selectors", () => {
    renderEntityFieldInput({
      linkedEntitySchemas: {
        c_linkedLocation: linkedLocationSchemas.c_linkedLocation,
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
      },
      filter: { types: ["type.string"], includeListsOnly: true },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.queryByText("Linked Location > Name")).toBeNull();
  });

  it("shows linked entity source roots when the selector opts into them", () => {
    renderEntityFieldInput({
      linkedEntitySchemas: linkedLocationSchemas,
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
      },
      filter: {
        types: ["type.events_section"],
        sourceRootKinds: ["linkedEntityRoot"],
        sourceRootsOnly: true,
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("Linked Location")).toHaveLength(1);
    expect(screen.queryByText("Linked Location > Name")).toBeNull();
  });

  it("shows base entity list roots when the selector opts into them", () => {
    renderEntityFieldInput({
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_customEvents",
            displayName: "Custom Events",
            definition: {
              name: "c_customEvents",
              isList: true,
              typeName: "type.list",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "title",
                  displayName: "Title",
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
      filter: {
        types: ["type.events_section"],
        sourceRootKinds: ["baseListRoot"],
        sourceRootsOnly: true,
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("Custom Events")).toBeDefined();
  });

  it("does not show single objects or scalar roots as base item-list sources", () => {
    renderEntityFieldInput({
      linkedEntitySchemas: linkedLocationSchemas,
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
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
          {
            name: "hours",
            displayName: "Hours",
            definition: {
              name: "hours",
              typeName: "type.hours",
              type: {},
            },
          },
          {
            name: "heroSection",
            displayName: "Hero Section",
            definition: {
              name: "heroSection",
              typeName: "c_hero_section",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "primaryCta",
                  displayName: "Primary CTA",
                  definition: {
                    name: "primaryCta",
                    typeName: "type.cta",
                    type: {},
                  },
                },
              ],
            },
          },
          {
            name: "accessHours",
            displayName: "Access Hours",
            definition: {
              name: "accessHours",
              typeName: "type.hours",
              type: {},
            },
          },
          {
            name: "cityCoordinate",
            displayName: "City Lat/Long",
            definition: {
              name: "cityCoordinate",
              typeName: "type.coordinate",
              type: {},
            },
          },
          {
            name: "c_customEvents",
            displayName: "Custom Events",
            definition: {
              name: "c_customEvents",
              isList: true,
              typeName: "type.list",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "title",
                  displayName: "Title",
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
      filter: {
        types: ["type.events_section"],
        sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
        sourceRootsOnly: true,
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("Custom Events")).toBeDefined();
    expect(screen.queryByText("Address")).toBeNull();
    expect(screen.queryByText("Hours")).toBeNull();
    expect(screen.queryByText("Hero Section")).toBeNull();
    expect(screen.queryByText("Access Hours")).toBeNull();
    expect(screen.queryByText("City Lat/Long")).toBeNull();
  });

  it("filters base list roots that cannot satisfy all event card mapping types", () => {
    renderEntityFieldInput({
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_partialEvents",
            displayName: "Partial Events",
            definition: {
              name: "c_partialEvents",
              isList: true,
              typeName: "type.list",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "title",
                  displayName: "Title",
                  definition: {
                    name: "title",
                    typeName: "type.string",
                    type: {},
                  },
                },
              ],
            },
          },
          {
            name: "c_fullEvents",
            displayName: "Full Events",
            definition: {
              name: "c_fullEvents",
              isList: true,
              typeName: "type.list",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "title",
                  displayName: "Title",
                  definition: {
                    name: "title",
                    typeName: "type.string",
                    type: {},
                  },
                },
                {
                  name: "startDate",
                  displayName: "Start Date",
                  definition: {
                    name: "startDate",
                    typeName: "type.datetime",
                    type: {},
                  },
                },
                {
                  name: "description",
                  displayName: "Description",
                  definition: {
                    name: "description",
                    typeName: "type.rich_text_v2",
                    type: {},
                  },
                },
                {
                  name: "primaryCta",
                  displayName: "Primary CTA",
                  definition: {
                    name: "primaryCta",
                    typeName: "type.cta",
                    type: {},
                  },
                },
                {
                  name: "heroImage",
                  displayName: "Hero Image",
                  definition: {
                    name: "heroImage",
                    typeName: "type.image",
                    type: {},
                  },
                },
              ],
            },
          },
        ],
      },
      filter: {
        types: ["type.events_section"],
        requiredDescendantTypes: [
          ["type.string"],
          ["type.datetime"],
          ["type.string", "type.rich_text_v2"],
          ["type.cta"],
          ["type.image"],
        ],
        sourceRootKinds: ["baseListRoot"],
        sourceRootsOnly: true,
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("Full Events")).toBeDefined();
    expect(screen.queryByText("Partial Events")).toBeNull();
  });

  it("filters faq list roots that have no mappable question or answer fields", () => {
    renderEntityFieldInput({
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "ref_listings",
            displayName: "Referenced Listings",
            definition: {
              name: "ref_listings",
              isList: true,
              typeName: "type.list",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "photo",
                  displayName: "Photo",
                  definition: {
                    name: "photo",
                    typeName: "type.image",
                    type: {},
                  },
                },
              ],
            },
          },
          {
            name: "c_faqItems",
            displayName: "FAQ Items",
            definition: {
              name: "c_faqItems",
              isList: true,
              typeName: "type.list",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "question",
                  displayName: "Question",
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
      filter: {
        types: ["type.faq_section"],
        requiredDescendantTypes: [["type.string", "type.rich_text_v2"]],
        sourceRootKinds: ["baseListRoot"],
        sourceRootsOnly: true,
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("FAQ Items")).toBeDefined();
    expect(screen.queryByText("Referenced Listings")).toBeNull();
  });

  it("limits event card source selectors to valid top-level roots", () => {
    renderEntityFieldInput({
      linkedEntitySchemas: linkedLocationSchemas,
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_eventsSection",
            displayName: "Events Section",
            definition: {
              name: "c_eventsSection",
              typeName: "type.events_section",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "events",
                  displayName: "Events",
                  definition: {
                    name: "events",
                    isList: true,
                    typeName: "type.list",
                    type: {},
                  },
                  children: {
                    fields: [
                      {
                        name: "title",
                        displayName: "Title",
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
            displayName: "faqSection",
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
                    typeName: "type.list",
                    type: {},
                  },
                  children: {
                    fields: [
                      {
                        name: "question",
                        displayName: "Question",
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
          {
            name: "c_linkedLocation",
            displayName: "Linked Location",
            definition: {
              name: "c_linkedLocation",
              isList: true,
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
                {
                  name: "instagramHandle",
                  displayName: "Instagram Handle",
                  definition: {
                    name: "instagramHandle",
                    typeName: "type.string",
                    type: {},
                  },
                },
              ],
            },
          },
        ],
      },
      filter: {
        types: ["type.events_section"],
        sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
        sourceRootsOnly: true,
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("Events Section")).toBeDefined();
    expect(screen.getAllByText("Linked Location")).toHaveLength(1);
    expect(screen.queryByText("faqSection > FAQs")).toBeNull();
    expect(screen.queryByText("Events Section > Events")).toBeNull();
    expect(screen.queryByText("Linked Location > Name")).toBeNull();
  });

  it("limits mapped linked-entity title fields to descendants of the selected source", () => {
    renderEntityFieldInput({
      linkedEntitySchemas: linkedLocationSchemas,
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "additionalHoursText",
            displayName: "Additional Hours Text",
            definition: {
              name: "additionalHoursText",
              typeName: "type.string",
              type: {},
            },
          },
          {
            name: "c_linkedLocation",
            displayName: "Linked Location",
            definition: {
              name: "c_linkedLocation",
              isList: true,
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
          ...defaultEntityFields.displayNames,
          additionalHoursText: "Additional Hours Text",
          c_linkedLocation: "Linked Location",
          "c_linkedLocation.name": "Linked Location > Name",
          "c_linkedLocation.address": "Linked Location > Address",
          "c_linkedLocation.address.city": "Linked Location > Address > City",
        },
      },
      filter: {
        types: ["type.string"],
        descendantsOf: "c_linkedLocation",
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("Name")).toHaveLength(1);
    expect(screen.getByText("Address > City")).toBeDefined();
    expect(screen.queryByText("Linked Location > Name")).toBeNull();
    expect(screen.queryByText("Instagram Handle")).toBeNull();
    expect(screen.queryByText("Additional Hours Text")).toBeNull();
    expect(screen.queryByText("Description")).toBeNull();
  });

  it("does not fall back to entity fields when linked descendant schemas are unavailable", () => {
    renderEntityFieldInput({
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_linkedLocation",
            displayName: "Linked Location",
            definition: {
              name: "c_linkedLocation",
              isList: true,
              typeRegistryId: "type.entity_reference",
              type: {
                documentType: "DOCUMENT_TYPE_ENTITY",
              },
            },
            children: {
              fields: [
                {
                  name: "youtubeChannelUrl",
                  displayName: "Youtube Channel URL",
                  definition: {
                    name: "youtubeChannelUrl",
                    typeName: "type.string",
                    type: {},
                  },
                },
              ],
            },
          },
        ],
      },
      filter: {
        types: ["type.string"],
        descendantsOf: "c_linkedLocation",
      },
    });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("Location Field")).toHaveLength(2);
    expect(screen.queryByText("Youtube Channel URL")).toBeNull();
    expect(screen.queryByText("Linked Location")).toBeNull();
  });

  it("stores linked descendant selections as absolute paths while showing relative options", () => {
    const onChange = vi.fn();

    renderEntityFieldInput({
      linkedEntitySchemas: {
        c_linkedLocation: {
          displayName: "LinkedLocation",
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
      onChange,
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_linkedLocation",
            displayName: "LinkedLocation",
            definition: {
              name: "c_linkedLocation",
              isList: true,
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
          c_linkedLocation: "LinkedLocation",
          "c_linkedLocation.name": "LinkedLocation > Name",
        },
      },
      filter: {
        types: ["type.string"],
        descendantsOf: "c_linkedLocation",
      },
      value: {
        field: "c_linkedLocation.name",
      },
    });

    expect(screen.getByRole("combobox").textContent).toContain("Name");
    expect(screen.getByRole("combobox").textContent).not.toContain(
      "LinkedLocation"
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getAllByText("Name")[1]!);

    expect(onChange).toHaveBeenCalledWith(
      {
        field: "c_linkedLocation.name",
      },
      undefined
    );
  });

  it("stores base list descendant selections as absolute paths while showing relative options", () => {
    const onChange = vi.fn();

    renderEntityFieldInput({
      onChange,
      entityFields: {
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_customEvents",
            displayName: "Custom Events",
            definition: {
              name: "c_customEvents",
              isList: true,
              typeName: "type.list",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "primaryCta",
                  displayName: "Primary CTA",
                  definition: {
                    name: "primaryCta",
                    typeName: "type.cta",
                    type: {},
                  },
                  children: {
                    fields: [
                      {
                        name: "label",
                        displayName: "Label",
                        definition: {
                          name: "label",
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
          ...defaultEntityFields.displayNames,
          c_customEvents: "Custom Events",
          "c_customEvents.primaryCta": "Custom Events > Primary CTA",
          "c_customEvents.primaryCta.label":
            "Custom Events > Primary CTA > Label",
        },
      },
      filter: {
        types: ["type.string"],
        descendantsOf: "c_customEvents",
      },
      value: {
        field: "c_customEvents.primaryCta.label",
      },
    });

    expect(screen.getByRole("combobox").textContent).toContain(
      "Primary CTA > Label"
    );
    expect(screen.getByRole("combobox").textContent).not.toContain(
      "Custom Events"
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("Primary CTA > Label")).toHaveLength(2);

    fireEvent.click(screen.getAllByText("Primary CTA > Label")[1]!);

    expect(onChange).toHaveBeenCalledWith(
      {
        field: "c_customEvents.primaryCta.label",
      },
      undefined
    );
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
      linkedEntitySchemas: linkedLocationSchemas,
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
          ...defaultEntityFields.displayNames,
          c_linkedLocation: "Linked Location",
          "c_linkedLocation.address": "Linked Location > Address",
          "c_linkedLocation.address.city": "Linked Location > Address > City",
        },
      },
    });

    fireEvent.click(screen.getByLabelText("Add entity field"));

    expect(screen.getByText("Linked Location > Address > City")).toBeDefined();
  });

  it("warns once when a linked entity field resolves through multiple references", () => {
    const props = {
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
      },
      filter: {
        types: ["type.string"],
      } satisfies RenderEntityFieldFilter<Record<string, any>>,
      value: {
        field: "c_linkedLocation.name",
      },
      document: {
        c_linkedLocation: [{ name: "First" }, { name: "Second" }],
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
          <EntityFieldsContext.Provider value={props.entityFields}>
            <LinkedEntitySchemasContext.Provider
              value={props.linkedEntitySchemas}
            >
              <EntityFieldInput
                filter={props.filter}
                onChange={vi.fn()}
                value={props.value}
              />
            </LinkedEntitySchemasContext.Provider>
          </EntityFieldsContext.Provider>
        </TemplateMetadataContext.Provider>
      </TemplatePropsContext.Provider>
    );

    expect(warningToast).toHaveBeenCalledTimes(1);
    expect(warningToast).toHaveBeenCalledWith(
      "Multiple linked entities were found for c_linkedLocation.name. Using the first linked entity."
    );
  });

  it("does not warn for linked descendant mapping selectors", () => {
    renderEntityFieldInput({
      linkedEntitySchemas: {
        c_linkedLocation: {
          displayName: "LinkedLocation",
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
      entityFields: {
        ...defaultEntityFields,
        fields: [
          ...defaultEntityFields.fields,
          {
            name: "c_linkedLocation",
            displayName: "LinkedLocation",
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
      filter: {
        types: ["type.string"],
        descendantsOf: "c_linkedLocation",
      },
      value: {
        field: "c_linkedLocation.name",
      },
      document: {
        c_linkedLocation: [{ name: "First" }, { name: "Second" }],
      },
    });

    expect(warningToast).not.toHaveBeenCalled();
  });
});
