import { describe, expect, it } from "vitest";
import { type ComponentData } from "@puckeditor/core";
import { syncManualListCards } from "./mappedListWrapper.ts";

type TestCardProps = {
  id?: string;
  index?: number;
  parentData?: { label: string };
  slots: {
    TitleSlot: [{ props: { id?: string } }];
  };
};

const createCard = (
  id: string,
  index: number
): ComponentData<TestCardProps> => ({
  type: "TestCard",
  props: {
    id,
    index,
    slots: {
      TitleSlot: [{ props: { id: `${id}-TitleSlot` } }],
    },
  },
});

describe("mappedListWrapper", () => {
  it("syncs manual cards, clears parentData, and rewrites ids", () => {
    let generatedId = 1;
    const currentCards = [
      {
        type: "TestCard",
        props: {
          id: "Card-1",
          index: 9,
          parentData: { label: "old" },
          slots: {
            TitleSlot: [{ props: { id: "Card-1-TitleSlot" } }],
          },
        },
      },
      {
        type: "TestCard",
        props: {
          id: "Card-1",
          index: 10,
          parentData: { label: "duplicate" },
          slots: {
            TitleSlot: [{ props: { id: "Card-1-TitleSlot" } }],
          },
        },
      },
    ] as ComponentData<TestCardProps>[];

    const syncedCards = syncManualListCards<TestCardProps>({
      currentCards,
      constantValue: [{ id: "Card-1" }, { id: "Card-1" }, {}],
      createId: () => `Generated-Card-${generatedId++}`,
      createCard,
      rewriteChildSlotIds: (card, newId) => {
        card.props.slots.TitleSlot[0].props.id = `${newId}-TitleSlot`;
      },
    });

    expect(syncedCards.slots).toHaveLength(3);
    expect(syncedCards.slots[0]?.props.id).toBe("Card-1");
    expect(syncedCards.slots[0]?.props.index).toBe(0);
    expect(syncedCards.slots[0]?.props.parentData).toBeUndefined();
    expect(syncedCards.slots[1]?.props.id).toBe("Generated-Card-1");
    expect(syncedCards.slots[1]?.props.slots.TitleSlot[0].props.id).toBe(
      "Generated-Card-1-TitleSlot"
    );
    expect(syncedCards.slots[2]?.props.id).toBe("Generated-Card-2");
    expect(syncedCards.constantValue).toEqual([
      { id: "Card-1" },
      { id: "Generated-Card-1" },
      { id: "Generated-Card-2" },
    ]);
  });

  it("falls back to index when requested", () => {
    const currentCards = [createCard("Card-1", 7), createCard("Card-2", 8)];

    const syncedCards = syncManualListCards<TestCardProps>({
      currentCards,
      constantValue: [{}, {}],
      createId: () => "Generated-Card",
      createCard,
      fallbackToIndex: true,
    });

    expect(syncedCards.slots[0]?.props.id).toBe("Card-1");
    expect(syncedCards.slots[1]?.props.id).toBe("Card-2");
    expect(syncedCards.slots[0]?.props.index).toBe(0);
    expect(syncedCards.slots[1]?.props.index).toBe(1);
  });
});
