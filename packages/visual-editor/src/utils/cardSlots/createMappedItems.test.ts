import { type ComponentData } from "@puckeditor/core";
import { describe, expect, it } from "vitest";
import { ComponentFields } from "../../types/fields.ts";
import { createMappedItems } from "./createMappedItems.ts";

type TestProps = {
  data: {
    field: string;
    constantValueEnabled: boolean;
    constantValue: { id?: string }[];
  };
  cards?: {
    title: {
      field: string;
      constantValueEnabled: boolean;
      constantValue: { defaultValue: string };
    };
  };
  slots: {
    ItemSlot: ComponentData<{
      id: string;
      index?: number;
      itemData?: {
        title?: string;
      };
    }>[];
  };
};

const mappedItems = createMappedItems<TestProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: "Items",
  mappingGroupLabel: "Cards",
  mappings: {
    title: {
      label: "Title",
      types: ["type.string"],
      defaultValue: { defaultValue: "" },
    },
  },
});

const repeatedMappedItems = mappedItems.withRepeatedSlot({
  slotPath: "slots.ItemSlot",
  createItem: (id, index) =>
    ({
      type: "ExampleItem",
      props: { id, index },
    }) as ComponentData<{
      id: string;
      index?: number;
      itemData?: { title?: string };
    }>,
  getItemData: (item, data) => ({
    title: mappedItems.resolveMapping(data.props.cards?.title, item),
  }),
});

const repeatedMappedItemsWithConstantValueMode = mappedItems
  .withConstantValueMode({
    constantValueType: ComponentFields.EventSection.type,
    defaultConstantValue: [{}, {}],
  })
  .withRepeatedSlot({
    slotPath: "slots.ItemSlot",
    createItem: (id, index) =>
      ({
        type: "ExampleItem",
        props: { id, index },
      }) as ComponentData<{
        id: string;
        index?: number;
        itemData?: { title?: string };
      }>,
    getItemData: () => ({
      title: "unused",
    }),
  });

describe("createMappedItems", () => {
  it("shows mapping fields only when a mapped source is selected", () => {
    const hiddenFields = repeatedMappedItems.resolveFields({
      type: "Test",
      props: {
        id: "test",
        data: {
          field: "",
          constantValueEnabled: false,
          constantValue: [],
        },
        cards: {
          title: {
            field: "",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
        slots: {
          ItemSlot: [],
        },
      },
    } as unknown as ComponentData<TestProps>) as any;
    const visibleFields = repeatedMappedItems.resolveFields({
      type: "Test",
      props: {
        id: "test",
        data: {
          field: "c_events",
          constantValueEnabled: false,
          constantValue: [],
        },
        cards: {
          title: {
            field: "",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
        slots: {
          ItemSlot: [],
        },
      },
    } as unknown as ComponentData<TestProps>) as any;

    expect(hiddenFields.cards.visible).toBe(false);
    expect(visibleFields.cards.visible).toBe(true);
  });

  it("clears scoped mapping fields when the source changes", () => {
    const resolved = mappedItems.resolve(
      {
        type: "Test",
        props: {
          id: "test",
          data: {
            field: "c_newItems",
            constantValueEnabled: false,
            constantValue: [],
          },
          cards: {
            title: {
              field: "title",
              constantValueEnabled: false,
              constantValue: { defaultValue: "Fallback" },
            },
          },
          slots: {
            ItemSlot: [],
          },
        },
      } as unknown as ComponentData<TestProps>,
      {
        lastData: {
          props: {
            id: "test",
            data: {
              field: "c_oldItems",
              constantValueEnabled: false,
              constantValue: [],
            },
            cards: {
              title: {
                field: "title",
                constantValueEnabled: false,
                constantValue: { defaultValue: "Fallback" },
              },
            },
            slots: {
              ItemSlot: [],
            },
          },
        } as unknown as { props: Record<string, unknown> },
        metadata: {
          streamDocument: {
            c_newItems: [{ title: "New title" }],
          },
        },
      }
    );

    expect(resolved.data.props.cards?.title.field).toBe("");
    expect(resolved.data.props.cards?.title.constantValue).toEqual({
      defaultValue: "Fallback",
    });
    expect(resolved.items).toEqual([{ title: "New title" }]);
  });

  it("resolves repeated items, index, and itemData through resolveItems", () => {
    const resolved = repeatedMappedItems.resolveItems(
      {
        type: "Test",
        props: {
          id: "test",
          data: {
            field: "c_newItems",
            constantValueEnabled: false,
            constantValue: [],
          },
          cards: {
            title: {
              field: "title",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
          },
          slots: {
            ItemSlot: [],
          },
        },
      } as unknown as ComponentData<TestProps>,
      {
        lastData: null,
        metadata: {
          streamDocument: {
            c_newItems: [{ title: "First" }, { title: "Second" }],
          },
        },
      }
    );

    expect(resolved.items).toEqual([{ title: "First" }, { title: "Second" }]);
    expect(resolved.data.props.slots.ItemSlot).toHaveLength(2);
    expect(resolved.data.props.slots.ItemSlot[0]?.props.index).toBe(0);
    expect(resolved.data.props.slots.ItemSlot[0]?.props.itemData).toEqual({
      title: "First",
    });
    expect(resolved.data.props.slots.ItemSlot[1]?.props.index).toBe(1);
    expect(resolved.data.props.slots.ItemSlot[1]?.props.itemData).toEqual({
      title: "Second",
    });
  });

  it("clears repeated items when the mapped source is unresolved", () => {
    const resolved = repeatedMappedItems.resolveItems(
      {
        type: "Test",
        props: {
          id: "test",
          data: {
            field: "c_missingItems",
            constantValueEnabled: false,
            constantValue: [],
          },
          cards: {
            title: {
              field: "title",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
          },
          slots: {
            ItemSlot: [
              {
                type: "ExampleItem",
                props: { id: "existing" },
              } as ComponentData<{
                id: string;
                index?: number;
                itemData?: { title?: string };
              }>,
            ],
          },
        },
      } as unknown as ComponentData<TestProps>,
      {
        lastData: null,
        metadata: {
          streamDocument: {},
        },
      }
    );

    expect(resolved.items).toEqual([]);
    expect(resolved.data.props.slots.ItemSlot).toEqual([]);
  });

  it("keeps constant-value slots in sync through resolveItems", () => {
    const resolved = repeatedMappedItemsWithConstantValueMode.resolveItems(
      {
        type: "Test",
        props: {
          id: "test",
          data: {
            field: "",
            constantValueEnabled: true,
            constantValue: [{ id: "existing-0" }, {}],
          },
          cards: {
            title: {
              field: "",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
          },
          slots: {
            ItemSlot: [
              {
                type: "ExampleItem",
                props: { id: "existing-0", index: 7 },
              } as ComponentData<{
                id: string;
                index?: number;
                itemData?: { title?: string };
              }>,
            ],
          },
        },
      } as unknown as ComponentData<TestProps>,
      {
        lastData: null,
        metadata: {
          streamDocument: {},
        },
      }
    );

    expect(resolved.items).toEqual([]);
    expect(resolved.data.props.slots.ItemSlot).toHaveLength(2);
    expect(resolved.data.props.slots.ItemSlot[0]?.props.id).toBe("existing-0");
    expect(resolved.data.props.slots.ItemSlot[0]?.props.index).toBe(0);
    expect(resolved.data.props.data.constantValue).toEqual([
      { id: resolved.data.props.slots.ItemSlot[0]?.props.id },
      { id: resolved.data.props.slots.ItemSlot[1]?.props.id },
    ]);
  });
});
