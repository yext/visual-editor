import { type ComponentData } from "@puckeditor/core";
import { describe, expect, it } from "vitest";
import {
  createSlotMappedCardsSource,
  createSlottedItemSource,
} from "./index.ts";

type FeaturedItemMappings = {
  title: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: { defaultValue?: string };
  };
  description: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: { defaultValue?: { html?: string } };
  };
};

const featuredItemsSource = createSlotMappedCardsSource<FeaturedItemMappings>({
  label: "Featured Items",
  itemLabel: "Featured Item",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
  },
});

describe("createSlotMappedCardsSource", () => {
  it("returns the slotted item source alias", () => {
    expect(createSlotMappedCardsSource).toBe(createSlottedItemSource);
  });

  it("returns a repeated entity field with item-labeled manual summaries", () => {
    expect(featuredItemsSource.field).toMatchObject({
      type: "entityField",
      label: "Featured Items",
      filter: {
        itemSourceTypes: [["type.string"], ["type.rich_text_v2"]],
      },
    });
    expect(
      (featuredItemsSource.field as any).repeated.manualItemSummary({}, 1)
    ).toBe("Featured Item 2");
    expect(featuredItemsSource.defaultValue).toEqual({
      field: "",
      constantValueEnabled: true,
      constantValue: [{}, {}, {}],
      mappings: {
        title: {
          field: "",
          constantValueEnabled: false,
          constantValue: undefined,
        },
        description: {
          field: "",
          constantValueEnabled: false,
          constantValue: undefined,
        },
      },
    });
    expect(featuredItemsSource.defaultWrapperProps).toEqual({
      data: featuredItemsSource.defaultValue,
      slots: {
        CardSlot: [],
      },
    });
  });

  it("resolves linked slot mappings against the current mapped item", () => {
    const resolved = featuredItemsSource.resolveItems(
      {
        field: "c_featuredItems",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          title: {
            field: "name",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
          description: {
            field: "summary",
            constantValueEnabled: false,
            constantValue: { defaultValue: { html: "" } },
          },
        },
      },
      {
        locale: "en",
        c_featuredItems: [
          {
            name: "Item one",
            summary: { html: "<p>Summary one</p>" },
          },
          {
            name: "Item two",
            summary: { html: "<p>Summary two</p>" },
          },
        ],
      }
    );

    expect(resolved).toEqual([
      {
        title: "Item one",
        description: { html: "<p>Summary one</p>" },
      },
      {
        title: "Item two",
        description: { html: "<p>Summary two</p>" },
      },
    ]);
  });

  it("populates linked cards with resolved item props", () => {
    const populated = featuredItemsSource.populateSlots(
      {
        type: "FeaturedItems",
        props: {
          id: "FeaturedItems-test",
          data: {
            field: "c_featuredItems",
            constantValueEnabled: false,
            constantValue: [],
            mappings: {
              title: {
                field: "name",
                constantValueEnabled: false,
                constantValue: { defaultValue: "" },
              },
              description: {
                field: "summary",
                constantValueEnabled: false,
                constantValue: { defaultValue: { html: "" } },
              },
            },
          },
          slots: {
            CardSlot: [],
          },
        },
      } as unknown as ComponentData<{
        data: typeof featuredItemsSource.value;
        conditionalRender?: { isMappedContentEmpty?: boolean };
        slots: {
          CardSlot: ComponentData<Record<string, unknown>>[];
        };
      }>,
      {
        locale: "en",
        c_featuredItems: [
          {
            name: "Item one",
            summary: { html: "<p>Summary one</p>" },
          },
        ],
      }
    );

    expect(populated.props.conditionalRender).toBeUndefined();
    expect(populated.props.slots.CardSlot).toHaveLength(1);
    expect(populated.props.slots.CardSlot[0]).toMatchObject({
      type: "Featured Item",
      props: {
        field: "c_featuredItems",
        title: "Item one",
        description: { html: "<p>Summary one</p>" },
      },
    });
  });

  it("syncs manual cards back to constantValue ids", () => {
    const populated = featuredItemsSource.populateSlots(
      {
        type: "FeaturedItems",
        props: {
          id: "FeaturedItems-test",
          data: featuredItemsSource.defaultValue,
          slots: {
            CardSlot: [],
          },
        },
      } as unknown as ComponentData<{
        data: typeof featuredItemsSource.value;
        slots: {
          CardSlot: ComponentData<Record<string, unknown>>[];
        };
      }>,
      { locale: "en" }
    );

    expect(populated.props.slots.CardSlot).toHaveLength(3);
    expect(populated.props.data.constantValue).toEqual(
      populated.props.slots.CardSlot.map((card) => ({ id: card.props.id }))
    );
  });
});
