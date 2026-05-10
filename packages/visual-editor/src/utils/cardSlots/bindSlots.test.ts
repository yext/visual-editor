import { describe, expect, it } from "vitest";
import { bindSlots } from "./bindSlots.ts";

describe("bindSlots", () => {
  it("wraps shorthand values for common slot child types", () => {
    const data = {
      props: {
        slots: {
          TitleSlot: [
            { type: "HeadingTextSlot", props: { parentData: undefined } },
          ],
          DescriptionSlot: [
            { type: "BodyTextSlot", props: { parentData: undefined } },
          ],
          ImageSlot: [{ type: "ImageSlot", props: { parentData: undefined } }],
          DateTimeSlot: [
            { type: "Timestamp", props: { parentData: undefined } },
          ],
          CTASlot: [{ type: "CTASlot", props: { parentData: undefined } }],
        },
      },
    };

    const updatedData = bindSlots(data, {
      TitleSlot: "Title",
      DescriptionSlot: { html: "<p>Description</p>" },
      ImageSlot: { url: "/image.png" },
      DateTimeSlot: "2026-01-01T00:00:00Z",
      CTASlot: { link: "/learn-more" },
    });

    expect(updatedData.props.slots.TitleSlot[0]?.props.parentData).toEqual({
      text: "Title",
    });
    expect(
      updatedData.props.slots.DescriptionSlot[0]?.props.parentData
    ).toEqual({
      richText: { html: "<p>Description</p>" },
    });
    expect(updatedData.props.slots.ImageSlot[0]?.props.parentData).toEqual({
      image: { url: "/image.png" },
    });
    expect(updatedData.props.slots.DateTimeSlot[0]?.props.parentData).toEqual({
      date: "2026-01-01T00:00:00Z",
    });
    expect(updatedData.props.slots.CTASlot[0]?.props.parentData).toEqual({
      cta: { link: "/learn-more" },
    });
  });

  it("preserves explicit parent-data objects", () => {
    const data = {
      props: {
        slots: {
          TitleSlot: [
            { type: "HeadingTextSlot", props: { parentData: undefined } },
          ],
        },
      },
    };

    const updatedData = bindSlots(data, {
      TitleSlot: { field: "c_title", text: "Title" },
    });

    expect(updatedData.props.slots.TitleSlot[0]?.props.parentData).toEqual({
      field: "c_title",
      text: "Title",
    });
  });
});
