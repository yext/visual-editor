import { describe, expect, it } from "vitest";
import { EventCardsWrapper } from "./EventCardsWrapper.tsx";
import { type ComponentData } from "@puckeditor/core";
import { type EventCardsWrapperProps } from "./EventCardsWrapper.tsx";

const createWrapperData = (): ComponentData<EventCardsWrapperProps> => ({
  type: "EventCardsWrapper",
  props: JSON.parse(JSON.stringify(EventCardsWrapper.defaultProps)),
});

describe("EventCardsWrapper", () => {
  const resolveParams = (streamDocument: Record<string, unknown>) =>
    ({
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: { streamDocument },
      trigger: "initial",
      parent: null,
    }) as any;

  it("resolves one card per linked entity and maps card fields into parentData", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";
    data.props.cards = {
      title: {
        field: "c_linkedLocation.name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      date: {
        field: "c_linkedLocation.c_eventDate",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "c_linkedLocation.c_eventDescription",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "c_linkedLocation.c_eventCta",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
      image: {
        field: "c_linkedLocation.photo",
        constantValue: {
          url: "",
          width: 0,
          height: 0,
        },
        constantValueEnabled: false,
      },
    };

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_linkedLocation: [
          {
            name: "Downtown",
            c_eventDate: "2026-05-01T12:00:00",
            c_eventDescription: {
              html: "<p>Open house</p>",
            },
            c_eventCta: {
              label: "Learn More",
              link: "https://example.com",
              linkType: "URL",
            },
            photo: {
              url: "https://example.com/image.jpg",
              width: 640,
              height: 360,
            },
          },
          {
            name: "Uptown",
            c_eventDate: "2026-05-02T13:00:00",
            c_eventDescription: {
              html: "<p>Workshop</p>",
            },
            c_eventCta: {
              label: "Reserve",
              link: "https://example.com/reserve",
              linkType: "URL",
            },
            photo: {
              url: "https://example.com/image-2.jpg",
              width: 640,
              height: 360,
            },
          },
        ],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot).toHaveLength(2);
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_linkedLocation",
      fields: {
        image: "c_linkedLocation.photo",
        title: "c_linkedLocation.name",
        dateTime: "c_linkedLocation.c_eventDate",
        description: "c_linkedLocation.c_eventDescription",
        cta: "c_linkedLocation.c_eventCta",
      },
      event: {
        image: {
          url: "https://example.com/image.jpg",
          width: 640,
          height: 360,
        },
        title: "Downtown",
        dateTime: "2026-05-01T12:00:00",
        description: {
          html: "<p>Open house</p>",
        },
        cta: {
          label: "Learn More",
          link: "https://example.com",
          linkType: "URL",
        },
      },
    });
  });

  it("returns zero cards for an empty linked entity list", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_linkedLocation: [],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot).toEqual([]);
  });

  it("preserves existing event section sources", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_eventsSection";

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_eventsSection: {
          events: [
            {
              title: "Cooking Class",
              dateTime: "2026-05-01T12:00:00",
              description: {
                html: "<p>Open house</p>",
              },
              cta: {
                label: "Learn More",
                link: "https://example.com",
                linkType: "URL",
              },
            },
          ],
        },
      })
    );

    expect(resolvedData.props!.slots!.CardSlot).toHaveLength(1);
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_eventsSection",
      event: {
        title: "Cooking Class",
        dateTime: "2026-05-01T12:00:00",
        description: {
          html: "<p>Open house</p>",
        },
        cta: {
          label: "Learn More",
          link: "https://example.com",
          linkType: "URL",
        },
      },
    });
  });

  it("resolves one card per base-entity struct item and maps card fields into parentData", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_customEvents";
    data.props.cards = {
      title: {
        field: "c_customEvents.title",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      date: {
        field: "c_customEvents.startDate",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "c_customEvents.summary",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "c_customEvents.primaryCta",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
      image: {
        field: "c_customEvents.heroImage",
        constantValue: {
          url: "",
          width: 0,
          height: 0,
        },
        constantValueEnabled: false,
      },
    };

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_customEvents: [
          {
            title: "Cooking Class",
            startDate: "2026-05-01T12:00:00",
            summary: {
              html: "<p>Open house</p>",
            },
            primaryCta: {
              label: "Reserve",
              link: "https://example.com",
              linkType: "URL",
            },
            heroImage: {
              url: "https://example.com/image.jpg",
              width: 640,
              height: 360,
            },
          },
        ],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot).toHaveLength(1);
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_customEvents",
      fields: {
        image: "c_customEvents.heroImage",
        title: "c_customEvents.title",
        dateTime: "c_customEvents.startDate",
        description: "c_customEvents.summary",
        cta: "c_customEvents.primaryCta",
      },
      event: {
        image: {
          url: "https://example.com/image.jpg",
          width: 640,
          height: 360,
        },
        title: "Cooking Class",
        dateTime: "2026-05-01T12:00:00",
        description: {
          html: "<p>Open house</p>",
        },
        cta: {
          label: "Reserve",
          link: "https://example.com",
          linkType: "URL",
        },
      },
    });
  });

  it("preserves manual mode and keeps parentData unset", async () => {
    const data = createWrapperData();

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({})
    );

    expect(resolvedData.props!.data!.constantValue).toHaveLength(3);
    expect(
      resolvedData.props!.slots!.CardSlot.every(
        (card: any) => card.props.parentData === undefined
      )
    ).toBe(true);
  });

  it("shows cards mappings only for mapped item list mode", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_customEvents";

    const linkedFields = await EventCardsWrapper.resolveFields!(
      data,
      resolveParams({
        c_customEvents: [{ title: "Downtown" }],
      })
    );
    const sectionFields = await EventCardsWrapper.resolveFields!(
      data,
      resolveParams({
        c_customEvents: {
          events: [{ title: "Event" }],
        },
      })
    );

    expect(linkedFields.cards?.visible).toBe(true);
    expect(sectionFields.cards?.visible).toBe(false);
  });
});
