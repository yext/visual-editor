import { describe, test, expect, beforeEach, vi } from "vitest";
import { getFilteredEntityFields } from "./getFilteredEntityFields.ts";
import { useEntityFields } from "../../hooks/useEntityFields.tsx";
import { YextSchemaField } from "../../types/entityFields.ts";

// Mock the useEntityFields hook
vi.mock("../../hooks/useEntityFields.tsx", () => ({
  useEntityFields: vi.fn(),
}));

describe("getFilteredEntityFields", () => {
  beforeEach(() => {
    vi.mocked(useEntityFields).mockReturnValue(mockEntityFields);
  });

  test("filters out default disallowed fields", () => {
    const result = getFilteredEntityFields({ types: [] });
    expect(result.find((field) => field.name === "uid")).toBeUndefined();
    expect(result.find((field) => field.name === "meta")).toBeUndefined();
    expect(result.find((field) => field.name === "slug")).toBeUndefined();
    expect(
      result.find((field) => field.name === "c_visualConfigurations")
    ).toBeUndefined();
    expect(
      result.find((field) => field.name === "c_pages_layouts")
    ).toBeUndefined();
  });

  test("applies allowList filter", () => {
    const result = getFilteredEntityFields({
      allowList: ["name"],
      types: ["type.string"],
    });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("name");
  });

  test("applies disallowList filter", () => {
    const result = getFilteredEntityFields({
      disallowList: ["address"],
      types: ["type.address", "type.string"],
    });
    expect(result.find((field) => field.name === "address")).toBeUndefined();
  });

  test("applies types filter", () => {
    const result = getFilteredEntityFields({ types: ["type.string"] });
    expect(result.map((field) => field.name)).toEqual(
      expect.arrayContaining([
        "id",
        "name",
        "address.line1",
        "address.line2",
        "address.line3",
        "address.sublocality",
        "address.city",
        "address.region",
        "address.postalCode",
        "address.extraDescription",
        "address.countryCode",
        "c_productSection.sectionTitle",
        "c_hero.cta1.name",
        "c_hero.cta1.link",
        "c_hero.cta2.name",
        "c_hero.cta2.link",
        "additionalHoursText",
        "c_deliveryPromo.title",
        "c_deliveryPromo.description",
        "c_deliveryPromo.cta.name",
        "c_deliveryPromo.cta.link",
      ])
    );
  });

  test("handles nested fields correctly", () => {
    const result = getFilteredEntityFields({
      allowList: ["address"],
      types: ["type.string"],
    });
    expect(result.map((field) => field.name)).toEqual(
      expect.arrayContaining([
        "address.line1",
        "address.line2",
        "address.line3",
        "address.sublocality",
        "address.city",
        "address.region",
        "address.postalCode",
        "address.extraDescription",
        "address.countryCode",
      ])
    );
  });

  test("correctly handles top level fields and subfields", () => {
    const result = getFilteredEntityFields({
      types: ["type.image", "type.hours", "type.address"],
    });

    expect(result.map((field) => field.name)).toEqual(
      expect.arrayContaining([
        "hours",
        "address",
        "c_hero.image",
        "c_deliveryPromo.image",
      ])
    );
    expect(
      result.find((field) => field.name.startsWith("hours."))
    ).toBeUndefined();
    expect(
      result.find((field) => field.name.startsWith("address."))
    ).toBeUndefined();
  });

  test("combines multiple filters", () => {
    const result = getFilteredEntityFields({
      allowList: ["name", "address"],
      types: ["type.string"],
    });
    expect(result.map((field) => field.name)).toEqual(
      expect.arrayContaining([
        "name",
        "address.line1",
        "address.line2",
        "address.city",
        "address.region",
        "address.postalCode",
        "address.countryCode",
      ])
    );
  });

  test("warns about non-existent fields in allowList", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    getFilteredEntityFields({
      allowList: ["nonexistent"],
      types: ["type.string"],
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("nonexistent")
    );
    consoleSpy.mockRestore();
  });

  test("handles custom fields correctly", () => {
    const result = getFilteredEntityFields({ types: ["c_productSection"] });
    expect(result.map((field) => field.name)).toEqual(
      expect.arrayContaining(["c_productSection"])
    );
  });

  test("handles list fields correctly", () => {
    const result = getFilteredEntityFields({
      allowList: ["emails"],
      types: ["type.string"],
    });
    expect(result.length).toBe(0);
  });
});

const mockEntityFields: YextSchemaField[] = [
  {
    name: "id",
    definition: {
      name: "id",
      registryId: "location.store_id",
      typeRegistryId: "type.string",
      type: {
        stringType: "STRING_TYPE_ID",
      },
    },
  },
  {
    name: "uid",
    definition: {
      name: "uid",
      type: {
        numberType: "NUMBER_TYPE_ID",
      },
    },
  },
  {
    name: "meta",
    definition: {
      name: "meta",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
    },
    children: {
      fields: [
        {
          name: "locale",
          definition: {
            name: "locale",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "entityType",
          definition: {
            name: "entityType",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "uid",
                definition: {
                  name: "uid",
                  type: {
                    numberType: "NUMBER_TYPE_ID",
                  },
                },
              },
              {
                name: "id",
                definition: {
                  name: "id",
                  type: {
                    stringType: "STRING_TYPE_ID",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    name: "slug",
    definition: {
      name: "slug",
      registryId: "entity.slug",
      typeRegistryId: "type.string",
      type: {
        stringType: "STRING_TYPE_DEFAULT",
      },
    },
  },
  {
    name: "c_visualConfigurations",
    definition: {
      name: "c_visualConfigurations",
      registryId: "location.custom.1000152098.visual_configurations.0",
      typeName: "c_visualConfiguration",
      typeRegistryId: "type.c1000152098.visualconfiguration",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
      isList: true,
    },
    children: {
      fields: [
        {
          name: "template",
          definition: {
            name: "template",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "data",
          definition: {
            name: "data",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_MULTILINE",
            },
          },
        },
      ],
    },
  },
  {
    name: "c_pages_layouts",
    definition: {
      name: "c_pages_layouts",
      registryId: "location.custom.1000152098.pages_layouts.0",
      typeRegistryId: "type.entity_reference",
      type: {
        documentType: "DOCUMENT_TYPE_ENTITY",
      },
      isList: true,
    },
    children: {
      fields: [
        {
          name: "c_visualConfiguration",
          definition: {
            name: "c_visualConfiguration",
            registryId: "location.custom.1000152098.visual_configuration.0",
            typeName: "c_visualConfiguration",
            typeRegistryId: "type.c1000152098.visualconfiguration",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "template",
                definition: {
                  name: "template",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "data",
                definition: {
                  name: "data",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_MULTILINE",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    name: "name",
    definition: {
      name: "name",
      registryId: "location.business_name",
      typeRegistryId: "type.string",
      type: {
        stringType: "STRING_TYPE_DEFAULT",
      },
    },
  },
  {
    name: "hours",
    definition: {
      name: "hours",
      registryId: "location.business_hours",
      typeRegistryId: "type.hours",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
    },
    children: {
      fields: [
        {
          name: "monday",
          definition: {
            name: "monday",
            typeRegistryId: "type.day_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "tuesday",
          definition: {
            name: "tuesday",
            typeRegistryId: "type.day_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "wednesday",
          definition: {
            name: "wednesday",
            typeRegistryId: "type.day_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "thursday",
          definition: {
            name: "thursday",
            typeRegistryId: "type.day_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "friday",
          definition: {
            name: "friday",
            typeRegistryId: "type.day_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "saturday",
          definition: {
            name: "saturday",
            typeRegistryId: "type.day_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "sunday",
          definition: {
            name: "sunday",
            typeRegistryId: "type.day_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "holidayHours",
          definition: {
            name: "holidayHours",
            typeRegistryId: "type.holiday_hour",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
            isList: true,
          },
          children: {
            fields: [
              {
                name: "date",
                definition: {
                  name: "date",
                  typeRegistryId: "type.date",
                  type: {
                    stringType: "STRING_TYPE_DATE",
                  },
                },
              },
              {
                name: "openIntervals",
                definition: {
                  name: "openIntervals",
                  typeRegistryId: "type.interval",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                  isList: true,
                },
                children: {
                  fields: [
                    {
                      name: "start",
                      definition: {
                        name: "start",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                    {
                      name: "end",
                      definition: {
                        name: "end",
                        typeRegistryId: "type.time",
                        type: {
                          stringType: "STRING_TYPE_LOCAL_TIME",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "isClosed",
                definition: {
                  name: "isClosed",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "isRegularHours",
                definition: {
                  name: "isRegularHours",
                  typeRegistryId: "type.boolean",
                  type: {
                    booleanType: "BOOLEAN_TYPE_DEFAULT",
                  },
                },
              },
            ],
          },
        },
        {
          name: "reopenDate",
          definition: {
            name: "reopenDate",
            typeRegistryId: "type.date",
            type: {
              stringType: "STRING_TYPE_DATE",
            },
          },
        },
      ],
    },
  },
  {
    name: "address",
    definition: {
      name: "address",
      registryId: "location.address",
      typeRegistryId: "type.address",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
    },
    children: {
      fields: [
        {
          name: "line1",
          definition: {
            name: "line1",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "line2",
          definition: {
            name: "line2",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "line3",
          definition: {
            name: "line3",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "sublocality",
          definition: {
            name: "sublocality",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "city",
          definition: {
            name: "city",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "region",
          definition: {
            name: "region",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "postalCode",
          definition: {
            name: "postalCode",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "extraDescription",
          definition: {
            name: "extraDescription",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "countryCode",
          definition: {
            name: "countryCode",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
      ],
    },
  },
  {
    name: "c_productSection",
    definition: {
      name: "c_productSection",
      registryId: "location.custom.1000152098.product_section.0",
      typeName: "c_productSection",
      typeRegistryId: "type.c1000152098.productsection",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
    },
    children: {
      fields: [
        {
          name: "sectionTitle",
          definition: {
            name: "sectionTitle",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "linkedProducts",
          definition: {
            name: "linkedProducts",
            typeRegistryId: "type.entity_reference",
            type: {
              documentType: "DOCUMENT_TYPE_ENTITY",
            },
            isList: true,
          },
          children: {
            fields: [
              {
                name: "name",
                definition: {
                  name: "name",
                  registryId: "location.business_name",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "c_productPromo",
                definition: {
                  name: "c_productPromo",
                  registryId: "location.custom.1000152098.product_promo.0",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "c_description",
                definition: {
                  name: "c_description",
                  registryId: "location.custom.1000152098.description.0",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_MULTILINE",
                  },
                },
              },
              {
                name: "c_coverPhoto",
                definition: {
                  name: "c_coverPhoto",
                  registryId: "location.custom.1000152098.cover_photo.0",
                  typeRegistryId: "type.image",
                  type: {
                    objectType: "OBJECT_TYPE_COMPLEX_IMAGE",
                  },
                },
                children: {
                  fields: [
                    {
                      name: "image",
                      definition: {
                        name: "image",
                        type: {
                          objectType: "OBJECT_TYPE_IMAGE",
                        },
                      },
                      children: {
                        fields: [
                          {
                            name: "url",
                            definition: {
                              name: "url",
                              type: {
                                stringType: "STRING_TYPE_URL",
                              },
                            },
                          },
                          {
                            name: "alternateText",
                            definition: {
                              name: "alternateText",
                              type: {
                                stringType: "STRING_TYPE_MULTILINE",
                              },
                            },
                          },
                          {
                            name: "width",
                            definition: {
                              name: "width",
                              type: {
                                numberType: "NUMBER_TYPE_INT",
                              },
                            },
                          },
                          {
                            name: "height",
                            definition: {
                              name: "height",
                              type: {
                                numberType: "NUMBER_TYPE_INT",
                              },
                            },
                          },
                        ],
                      },
                    },
                    {
                      name: "description",
                      definition: {
                        name: "description",
                        type: {
                          stringType: "STRING_TYPE_MULTILINE",
                        },
                      },
                    },
                    {
                      name: "details",
                      definition: {
                        name: "details",
                        type: {
                          stringType: "STRING_TYPE_MULTILINE",
                        },
                      },
                    },
                    {
                      name: "clickthroughUrl",
                      definition: {
                        name: "clickthroughUrl",
                        type: {
                          stringType: "STRING_TYPE_URL",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "c_productCTA",
                definition: {
                  name: "c_productCTA",
                  registryId: "location.custom.1000152098.product_cta.0",
                  typeName: "c_cta",
                  typeRegistryId: "type.c1000152098.cta",
                  type: {
                    objectType: "OBJECT_TYPE_DEFAULT",
                  },
                },
                children: {
                  fields: [
                    {
                      name: "name",
                      definition: {
                        name: "name",
                        typeRegistryId: "type.string",
                        type: {
                          stringType: "STRING_TYPE_DEFAULT",
                        },
                      },
                    },
                    {
                      name: "link",
                      definition: {
                        name: "link",
                        typeRegistryId: "type.string",
                        type: {
                          stringType: "STRING_TYPE_URL",
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
    },
  },
  {
    name: "c_hero",
    definition: {
      name: "c_hero",
      registryId: "location.custom.1000152098.hero.0",
      typeName: "c_hero",
      typeRegistryId: "type.c1000152098.hero",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
    },
    children: {
      fields: [
        {
          name: "image",
          definition: {
            name: "image",
            typeRegistryId: "type.image",
            type: {
              objectType: "OBJECT_TYPE_COMPLEX_IMAGE",
            },
          },
          children: {
            fields: [
              {
                name: "image",
                definition: {
                  name: "image",
                  type: {
                    objectType: "OBJECT_TYPE_IMAGE",
                  },
                },
                children: {
                  fields: [
                    {
                      name: "url",
                      definition: {
                        name: "url",
                        type: {
                          stringType: "STRING_TYPE_URL",
                        },
                      },
                    },
                    {
                      name: "alternateText",
                      definition: {
                        name: "alternateText",
                        type: {
                          stringType: "STRING_TYPE_MULTILINE",
                        },
                      },
                    },
                    {
                      name: "width",
                      definition: {
                        name: "width",
                        type: {
                          numberType: "NUMBER_TYPE_INT",
                        },
                      },
                    },
                    {
                      name: "height",
                      definition: {
                        name: "height",
                        type: {
                          numberType: "NUMBER_TYPE_INT",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "description",
                definition: {
                  name: "description",
                  type: {
                    stringType: "STRING_TYPE_MULTILINE",
                  },
                },
              },
              {
                name: "details",
                definition: {
                  name: "details",
                  type: {
                    stringType: "STRING_TYPE_MULTILINE",
                  },
                },
              },
              {
                name: "clickthroughUrl",
                definition: {
                  name: "clickthroughUrl",
                  type: {
                    stringType: "STRING_TYPE_URL",
                  },
                },
              },
            ],
          },
        },
        {
          name: "cta1",
          definition: {
            name: "cta1",
            typeName: "c_cta",
            typeRegistryId: "type.c1000152098.cta",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "name",
                definition: {
                  name: "name",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "link",
                definition: {
                  name: "link",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_URL",
                  },
                },
              },
            ],
          },
        },
        {
          name: "cta2",
          definition: {
            name: "cta2",
            typeName: "c_cta",
            typeRegistryId: "type.c1000152098.cta",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "name",
                definition: {
                  name: "name",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "link",
                definition: {
                  name: "link",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_URL",
                  },
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
      registryId: "location.custom.1000152098.faq_section.0",
      typeName: "c_faqSection",
      typeRegistryId: "type.c1000152098.faqsection",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
    },
    children: {
      fields: [
        {
          name: "linkedFAQs",
          definition: {
            name: "linkedFAQs",
            typeRegistryId: "type.entity_reference",
            type: {
              documentType: "DOCUMENT_TYPE_ENTITY",
            },
            isList: true,
          },
          children: {
            fields: [
              {
                name: "question",
                definition: {
                  name: "question",
                  registryId: "entity.question",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "answerV2",
                definition: {
                  name: "answerV2",
                  registryId: "entity.answer_v2",
                  typeRegistryId: "type.rich_text_v2",
                  type: {
                    objectType: "OBJECT_TYPE_RICH_TEXT",
                  },
                },
                children: {
                  fields: [
                    {
                      name: "json",
                      definition: {
                        name: "json",
                        type: {
                          rawType: "RAW_TYPE_LEXICAL",
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
    },
  },
  {
    name: "additionalHoursText",
    definition: {
      name: "additionalHoursText",
      registryId: "location.additional_hours_text",
      typeRegistryId: "type.string",
      type: {
        stringType: "STRING_TYPE_DEFAULT",
      },
    },
  },
  {
    name: "mainPhone",
    definition: {
      name: "mainPhone",
      registryId: "location.main_phone",
      typeRegistryId: "type.phone",
      type: {
        stringType: "STRING_TYPE_PHONE",
      },
    },
  },
  {
    name: "emails",
    definition: {
      name: "emails",
      registryId: "location.emails",
      typeRegistryId: "type.string",
      type: {
        stringType: "STRING_TYPE_DEFAULT",
      },
      isList: true,
    },
  },
  {
    name: "c_deliveryPromo",
    definition: {
      name: "c_deliveryPromo",
      registryId: "location.custom.1000152098.delivery_promo.0",
      typeName: "c_promoSection",
      typeRegistryId: "type.c1000152098.promosection",
      type: {
        objectType: "OBJECT_TYPE_DEFAULT",
      },
    },
    children: {
      fields: [
        {
          name: "image",
          definition: {
            name: "image",
            typeRegistryId: "type.image",
            type: {
              objectType: "OBJECT_TYPE_COMPLEX_IMAGE",
            },
          },
          children: {
            fields: [
              {
                name: "image",
                definition: {
                  name: "image",
                  type: {
                    objectType: "OBJECT_TYPE_IMAGE",
                  },
                },
                children: {
                  fields: [
                    {
                      name: "url",
                      definition: {
                        name: "url",
                        type: {
                          stringType: "STRING_TYPE_URL",
                        },
                      },
                    },
                    {
                      name: "alternateText",
                      definition: {
                        name: "alternateText",
                        type: {
                          stringType: "STRING_TYPE_MULTILINE",
                        },
                      },
                    },
                    {
                      name: "width",
                      definition: {
                        name: "width",
                        type: {
                          numberType: "NUMBER_TYPE_INT",
                        },
                      },
                    },
                    {
                      name: "height",
                      definition: {
                        name: "height",
                        type: {
                          numberType: "NUMBER_TYPE_INT",
                        },
                      },
                    },
                  ],
                },
              },
              {
                name: "description",
                definition: {
                  name: "description",
                  type: {
                    stringType: "STRING_TYPE_MULTILINE",
                  },
                },
              },
              {
                name: "details",
                definition: {
                  name: "details",
                  type: {
                    stringType: "STRING_TYPE_MULTILINE",
                  },
                },
              },
              {
                name: "clickthroughUrl",
                definition: {
                  name: "clickthroughUrl",
                  type: {
                    stringType: "STRING_TYPE_URL",
                  },
                },
              },
            ],
          },
        },
        {
          name: "title",
          definition: {
            name: "title",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_DEFAULT",
            },
          },
        },
        {
          name: "description",
          definition: {
            name: "description",
            typeRegistryId: "type.string",
            type: {
              stringType: "STRING_TYPE_MULTILINE",
            },
          },
        },
        {
          name: "cta",
          definition: {
            name: "cta",
            typeName: "c_cta",
            typeRegistryId: "type.c1000152098.cta",
            type: {
              objectType: "OBJECT_TYPE_DEFAULT",
            },
          },
          children: {
            fields: [
              {
                name: "name",
                definition: {
                  name: "name",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_DEFAULT",
                  },
                },
              },
              {
                name: "link",
                definition: {
                  name: "link",
                  typeRegistryId: "type.string",
                  type: {
                    stringType: "STRING_TYPE_URL",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
];
