import { describe, expect, it } from "vitest";
import { EventCard, defaultEventCardSlotData } from "./EventCard.tsx";

describe("EventCard", () => {
  it("when itemData provides title description and cta then conditional render stays enabled", () => {
    const data = defaultEventCardSlotData("event-card-1", 0) as any;
    data.props.itemData = {
      field: "",
      image: {
        url: "https://example.com/event.jpg",
        width: 640,
        height: 360,
      },
      title: { defaultValue: "Event title" },
      dateTime: "2026-05-05T12:00:00",
      description: { html: "<p>Event description</p>" },
      cta: {
        label: { defaultValue: "Learn more" },
        link: "/events/1",
        linkType: "URL",
        ctaType: "textAndLink",
      },
    };

    const resolvedData = EventCard.resolveData!(data, {
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: { streamDocument: {} },
      trigger: "initial",
      parent: null,
    } as any) as any;

    expect(resolvedData.props.conditionalRender).toEqual({
      image: true,
      title: true,
      dateTime: true,
      description: true,
      cta: true,
    });
  });
});
