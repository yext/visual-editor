import { describe, expect, it } from "vitest";
import {
  getListSourceRootFields,
  resolveMappedListSource,
} from "./mappedSource.ts";

describe("mappedSource", () => {
  it("resolves constant, mapped, unresolved, and empty sources", () => {
    expect(
      resolveMappedListSource({
        streamDocument: {},
        constantValueEnabled: true,
        fieldPath: "c_linkedLocation",
      })
    ).toEqual({ mode: "constantValue", items: [] });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_eventsSection: {
            events: [{ title: "Cooking Class" }],
          },
        },
        fieldPath: "c_eventsSection.events",
      })
    ).toEqual({
      mode: "resolvedItems",
      items: [{ title: "Cooking Class" }],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_linkedLocation: [{ name: "Downtown" }],
        },
        fieldPath: "c_linkedLocation",
      })
    ).toEqual({
      mode: "resolvedItems",
      items: [{ name: "Downtown" }],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_linkedLocation: { name: "Downtown" },
        },
        fieldPath: "c_linkedLocation",
      })
    ).toEqual({
      mode: "resolvedItems",
      items: [{ name: "Downtown" }],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {},
        fieldPath: "c_linkedLocation",
      })
    ).toEqual({
      mode: "resolvedItems",
      items: [],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_linkedLocation: [],
        },
        fieldPath: "c_linkedLocation",
      })
    ).toEqual({
      mode: "resolvedItems",
      items: [],
    });
  });

  it("returns descendant list roots with nested fields for mapped sources", () => {
    expect(
      getListSourceRootFields([
        {
          name: "c_customEvents",
          definition: {
            isList: true,
            name: "c_customEvents",
            type: {},
          },
          children: {
            fields: [{ name: "title" }],
          },
        },
        {
          name: "heroSection",
          definition: {
            name: "heroSection",
            type: {},
          },
          children: {
            fields: [
              {
                name: "items",
                definition: {
                  isList: true,
                  name: "items",
                  type: {},
                },
                children: {
                  fields: [{ name: "title" }],
                },
              },
            ],
          },
        },
      ] as any)
    ).toEqual([
      {
        name: "c_customEvents",
        definition: {
          isList: true,
          name: "c_customEvents",
          type: {},
        },
        children: {
          fields: [{ name: "title" }],
        },
      },
      {
        name: "heroSection.items",
        definition: {
          isList: true,
          name: "items",
          type: {},
        },
        children: {
          fields: [{ name: "title" }],
        },
      },
    ]);
  });

  it("treats a missing source field as constant value mode", () => {
    expect(
      resolveMappedListSource({
        streamDocument: {},
      })
    ).toEqual({ mode: "constantValue", items: [] });
  });
});
