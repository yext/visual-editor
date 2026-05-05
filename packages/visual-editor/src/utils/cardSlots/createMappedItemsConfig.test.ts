import { type ComponentData } from "@puckeditor/core";
import { describe, expect, it } from "vitest";
import { ComponentFields } from "../../types/fields.ts";
import { createMappedItemsConfig } from "./createMappedItemsConfig.ts";

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
};

describe("createMappedItemsConfig", () => {
  const mappedItems = createMappedItemsConfig<TestProps>({
    sourceFieldPath: "data.field",
    mappingGroupPath: "cards",
    sourceLabel: "Items",
    mappingGroupLabel: "Cards",
    constantValueType: ComponentFields.EventSection.type,
    mappings: {
      title: {
        label: "Title",
        types: ["type.string"],
        defaultValue: { defaultValue: "" },
      },
    },
  });

  it("shows mapping fields only when a mapped source is selected", () => {
    const hiddenFields = mappedItems.resolveFields({
      type: "Test",
      props: {
        id: "test",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [],
        },
        cards: {
          title: {
            field: "",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
    } as unknown as ComponentData<TestProps>) as any;
    const visibleFields = mappedItems.resolveFields({
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

  it("resolves one mapping against the current item", () => {
    expect(
      mappedItems.resolveMapping(
        {
          field: "title",
          constantValueEnabled: false,
          constantValue: { defaultValue: "" },
        },
        { title: "Mapped title" }
      )
    ).toBe("Mapped title");
  });
});
