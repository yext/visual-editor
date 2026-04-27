import { describe, expect, it, vi } from "vitest";
import {
  buildListSectionCards,
  resolveListSectionItems,
} from "./listSectionData.ts";

describe("resolveListSectionItems", () => {
  it("when list item mappings exist then mapped items win over legacy items", () => {
    const resolveLegacyItems = vi.fn(() => [{ label: "legacy" }]);

    const result = resolveListSectionItems({
      buildMappedItem: (resolvedItemFields) => ({
        label: resolvedItemFields.label,
      }),
      data: {
        field: "linked.items",
        itemFieldMappings: {
          label: "label",
        },
      },
      resolveLegacyItems,
      streamDocument: {
        linked: {
          items: [{ label: "mapped" }],
        },
      },
    });

    expect(result).toEqual({
      items: [{ label: "mapped" }],
      requiredLength: 1,
    });
    expect(resolveLegacyItems).not.toHaveBeenCalled();
  });

  it("when list item mappings are absent then legacy items are used", () => {
    const resolveLegacyItems = vi.fn(() => [{ label: "legacy" }]);

    const result = resolveListSectionItems({
      buildMappedItem: (resolvedItemFields) => ({
        label: resolvedItemFields.label,
      }),
      data: {
        field: "linked.items",
      },
      resolveLegacyItems,
      streamDocument: {
        linked: {
          items: [{ label: "mapped" }],
        },
      },
    });

    expect(result).toEqual({
      items: [{ label: "legacy" }],
      requiredLength: 1,
    });
    expect(resolveLegacyItems).toHaveBeenCalledTimes(1);
  });

  it("when an item validator is provided then invalid mapped items are removed", () => {
    const result = resolveListSectionItems({
      buildMappedItem: (resolvedItemFields) => ({
        label:
          typeof resolvedItemFields.label === "string"
            ? resolvedItemFields.label
            : undefined,
      }),
      data: {
        field: "linked.items",
        itemFieldMappings: {
          label: "missing",
        },
      },
      isValidItem: (item) => Boolean(item.label),
      resolveLegacyItems: () => [{ label: "legacy" }],
      streamDocument: {
        linked: {
          items: [{ name: "mapped" }],
        },
      },
    });

    expect(result).toEqual({
      items: [],
      requiredLength: 0,
    });
  });
});

describe("buildListSectionCards", () => {
  it("when resolved items differ from the current slot length then cards are resized and decorated", () => {
    const result = buildListSectionCards({
      currentCards: [
        {
          type: "Card",
          props: { id: "one" },
        },
      ],
      createCard: () => ({
        type: "Card",
        props: { id: "added" },
      }),
      decorateCard: (card, item, index) => ({
        ...card,
        props: {
          ...card.props,
          index,
          value: item,
        },
      }),
      items: ["first", "second"],
    });

    expect(result).toEqual([
      {
        type: "Card",
        props: { id: "one", index: 0, value: "first" },
      },
      {
        type: "Card",
        props: { id: "added", index: 1, value: "second" },
      },
    ]);
  });
});
