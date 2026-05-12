import { type ComponentData } from "@puckeditor/core";
import { describe, expect, it } from "vitest";
import {
  syncLinkedSlotMappedCards,
  syncManualSlotMappedCards,
} from "./slotMappedCards.ts";

type TestCard = ComponentData<{
  id?: string;
  index?: number;
  parentData?: unknown;
  slots: Record<
    string,
    Array<{
      props: { id?: string; parentData?: unknown } & Record<string, unknown>;
    }>
  >;
}>;

const createCard = (id: string, index: number): TestCard => ({
  type: "TestCard",
  props: {
    id,
    index,
    slots: {
      TitleSlot: [{ props: { id: `${id}-TitleSlot` } }],
    },
  },
});

describe("slotMappedCards", () => {
  it("returns linked cards with mapped parent data", () => {
    const cards = syncLinkedSlotMappedCards({
      items: [{ title: "First" }, { title: "Second" }],
      currentCards: [createCard("Card-1", 0)],
      createCard,
      toParentData: (item) => item,
      normalizeId: (id) => `Card-${id}`,
    });

    expect(cards).toHaveLength(2);
    expect(cards[0]?.props.index).toBe(0);
    expect(cards[0]?.props.parentData).toEqual({ title: "First" });
    expect(cards[1]?.props.index).toBe(1);
    expect(cards[1]?.props.parentData).toEqual({ title: "Second" });
  });

  it("normalizes manual ids and returns parent card references", () => {
    const existingCard = createCard("Card-1", 0);
    existingCard.props.slots.TitleSlot[0]!.props.parentData = { text: "stale" };

    const reconciled = syncManualSlotMappedCards({
      cardReferences: [{ id: "Card-1" }, { id: "Card-1" }],
      currentCards: [existingCard],
      createCard,
      syncChildSlotIds: (card, id) => {
        card.props.slots.TitleSlot[0]!.props.id = `${id}-TitleSlot`;
        return card;
      },
      normalizeId: (id) => `Card-${id}`,
    });

    expect(reconciled.cards).toHaveLength(2);
    expect(reconciled.cards[0]?.props.id).toBe("Card-1");
    expect(reconciled.cards[0]?.props.parentData).toBeUndefined();
    expect(
      reconciled.cards[0]?.props.slots.TitleSlot[0]?.props.parentData
    ).toBe(undefined);
    expect(reconciled.cards[1]?.props.id).not.toBe(
      reconciled.cards[0]?.props.id
    );
    expect(reconciled.cards[1]?.props.slots.TitleSlot[0]?.props.id).toBe(
      `${reconciled.cards[1]?.props.id}-TitleSlot`
    );
    expect(reconciled.cardReferences).toEqual(
      reconciled.cards.map((card) => ({ id: card.props.id }))
    );
  });

  it("reuses legacy manual cards without ids by index", () => {
    const existingCard: TestCard = {
      type: "TestCard",
      props: {
        id: "",
        index: 0,
        slots: {
          TitleSlot: [{ props: { parentData: { text: "legacy" } } }],
          ImageSlot: [{ props: { id: "legacy-image", customHeight: 900 } }],
        },
      },
    };

    const reconciled = syncManualSlotMappedCards({
      cardReferences: [{}],
      currentCards: [existingCard],
      createCard,
      syncChildSlotIds: (card, id) => {
        card.props.slots.TitleSlot[0]!.props.id = `${id}-TitleSlot`;
        if (card.props.slots.ImageSlot?.[0]?.props) {
          card.props.slots.ImageSlot[0]!.props.id = `${id}-ImageSlot`;
        }
        return card;
      },
      normalizeId: (id) => `Card-${id}`,
    });

    expect(reconciled.cards).toHaveLength(1);
    expect(reconciled.cards[0]?.props.id).toBeDefined();
    expect(reconciled.cards[0]?.props.slots.ImageSlot?.[0]?.props.id).toBe(
      `${reconciled.cards[0]?.props.id}-ImageSlot`
    );
    expect(
      reconciled.cards[0]?.props.slots.ImageSlot?.[0]?.props.customHeight
    ).toBe(900);
    expect(
      reconciled.cards[0]?.props.slots.TitleSlot[0]?.props.parentData
    ).toBeUndefined();
  });
});
