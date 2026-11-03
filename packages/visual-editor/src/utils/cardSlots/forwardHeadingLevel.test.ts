import { describe, expect, it } from "vitest";
import { forwardHeadingLevel } from "./forwardHeadingLevel.ts";

const section = (cards: any[], level = 2) => ({
  props: {
    slots: {
      SectionHeadingSlot: [{ props: { styles: { level } } }],
      CardsWrapperSlot: [{ props: { slots: { CardSlot: cards } } }],
    },
  },
});

const card = (slots: Record<string, any[]>) => ({
  type: "TestimonialCard",
  props: { id: "testimonial", slots },
});

describe("forwardHeadingLevel", () => {
  it("leaves empty and absent destination slots unchanged", () => {
    const cards = [card({ ContributorNameSlot: [] }), card({})];
    const data = section(cards);
    const before = JSON.parse(JSON.stringify(data));

    const result = forwardHeadingLevel(data, "ContributorNameSlot");

    expect(result).toEqual(before);
    // Card resolvers treat the presence of props as authored content and read data.text.
    for (const item of result.props.slots.CardsWrapperSlot[0].props.slots
      .CardSlot) {
      expect(item.props.slots.ContributorNameSlot?.[0]).toBeUndefined();
    }
  });

  it.each([
    [2, 3],
    [6, "span"],
  ])(
    "forwards section level %s to an existing heading as %s",
    (level, expected) => {
      const heading = {
        type: "HeadingTextSlot",
        props: { id: "name", data: { text: "Name" }, styles: { level: 3 } },
      };
      const data = section(
        [card({ ContributorNameSlot: [heading] })],
        level as number
      );

      const result = forwardHeadingLevel(data, "ContributorNameSlot");

      expect(
        result.props.slots.CardsWrapperSlot[0].props.slots.CardSlot[0].props
          .slots.ContributorNameSlot[0]
      ).toEqual({
        ...heading,
        props: {
          ...heading.props,
          styles: { level: 3, semanticLevelOverride: expected },
        },
      });
    }
  );
});
