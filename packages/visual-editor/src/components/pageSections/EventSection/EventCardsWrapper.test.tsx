import { describe, expect, it } from "vitest";
import { EventCardsWrapper } from "./EventCardsWrapper.tsx";
import { type ComponentData } from "@puckeditor/core";
import { type EventCardsWrapperProps } from "./EventCardsWrapper.tsx";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";

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

  it("resolves one card per linked entity and maps card fields into itemData", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";
    data.props.cards = {
      title: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      date: {
        field: "c_eventDate",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "c_eventDescription",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "c_eventCta",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
      image: {
        field: "photo",
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
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_linkedLocation",
      fields: {
        image: "photo",
        title: "name",
        dateTime: "c_eventDate",
        description: "c_eventDescription",
        cta: "c_eventCta",
      },
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
    });
  });

  it("does not crash when only the title mapping is set for linked entity cards", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";
    data.props.cards = {
      title: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
    } as EventCardsWrapperProps["cards"];

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_linkedLocation: [{ name: "Downtown" }],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot).toHaveLength(1);
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_linkedLocation",
      fields: {
        image: undefined,
        title: "name",
        dateTime: undefined,
        description: undefined,
        cta: undefined,
      },
      image: undefined,
      title: "Downtown",
      dateTime: undefined,
      description: undefined,
      cta: {
        label: { defaultValue: "" },
        link: "",
        linkType: "URL",
        ctaType: "textAndLink",
      },
    });
  });

  it("resolves constant linked card mappings against each linked entity", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedLocation";
    data.props.cards = {
      title: {
        field: "",
        constantValue: { defaultValue: "Location: [[name]]" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: getDefaultRTF("Details: [[description]]"),
        constantValueEnabled: true,
      },
    } as EventCardsWrapperProps["cards"];

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_linkedLocation: [
          { name: "Downtown", description: "Fresh daily" },
          { name: "Uptown", description: "Open late" },
        ],
      })
    );

    expect(
      resolvedData.props!.slots!.CardSlot[0]?.props.itemData
    ).toMatchObject({
      field: "c_linkedLocation",
      title: "Location: Downtown",
      description: {
        html: expect.stringContaining("Details: Fresh daily"),
      },
    });
    expect(
      resolvedData.props!.slots!.CardSlot[1]?.props.itemData
    ).toMatchObject({
      field: "c_linkedLocation",
      title: "Location: Uptown",
      description: {
        html: expect.stringContaining("Details: Open late"),
      },
    });
  });

  it("treats an object source as a single current document context", async () => {
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
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_eventsSection",
      fields: {
        image: undefined,
        title: undefined,
        dateTime: undefined,
        description: undefined,
        cta: undefined,
      },
      image: {
        url: "",
        width: 0,
        height: 0,
      },
      title: "",
      dateTime: "",
      description: {
        defaultValue: "",
      },
      cta: {
        label: { defaultValue: "" },
        link: "",
        linkType: "URL",
        ctaType: "textAndLink",
      },
    });
  });

  it("resolves one card per base-entity struct item and maps card fields into itemData", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_customEvents";
    data.props.cards = {
      title: {
        field: "title",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      date: {
        field: "startDate",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "summary",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "primaryCta",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
      image: {
        field: "heroImage",
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
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_customEvents",
      fields: {
        image: "heroImage",
        title: "title",
        dateTime: "startDate",
        description: "summary",
        cta: "primaryCta",
      },
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
    });
  });

  it("preserves constant value mode and keeps itemData unset", async () => {
    const data = createWrapperData();

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({})
    );

    expect(resolvedData.props!.data!.constantValue).toHaveLength(3);
    expect(
      resolvedData.props!.slots!.CardSlot.every(
        (card: any) => card.props.itemData === undefined
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
    expect(linkedFields.cards?.visible).toBe(true);
    expect((linkedFields.cards as any)?.objectFields?.title?.type).toBe(
      "entityField"
    );
  });

  it("clears scoped card field mappings when the source field changes", async () => {
    const data = createWrapperData();
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_locations";
    data.props.cards = {
      title: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      date: {
        field: "eventDate",
        constantValue: "",
        constantValueEnabled: false,
      },
    } as EventCardsWrapperProps["cards"];

    const resolvedData = await EventCardsWrapper.resolveData!(data, {
      ...resolveParams({
        c_locations: [{ name: "Downtown", eventDate: "2026-05-01T12:00:00" }],
      }),
      lastData: {
        type: "EventCardsWrapper",
        props: {
          ...JSON.parse(JSON.stringify(EventCardsWrapper.defaultProps)),
          data: {
            field: "c_oldLocations",
            constantValueEnabled: false,
            constantValue: [{}, {}, {}],
          },
        },
      },
      trigger: "data",
      changed: { data: true },
    } as any);

    expect(resolvedData.props!.cards?.title.field).toBe("");
    expect(resolvedData.props!.cards?.date.field).toBe("");
    expect(resolvedData.props!.cards?.title.constantValue).toEqual({
      defaultValue: "",
    });
  });
});
