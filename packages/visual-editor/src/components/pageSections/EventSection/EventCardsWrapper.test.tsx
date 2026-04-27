import { describe, expect, it } from "vitest";
import { EventCardsWrapper } from "./EventCardsWrapper.tsx";

const defaultProps = EventCardsWrapper.defaultProps!;
const resolveData = async (
  data: Partial<typeof defaultProps.data>,
  streamDocument: Record<string, unknown>
) =>
  await EventCardsWrapper.resolveData!(
    {
      props: {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          ...data,
        },
      },
    } as NonNullable<
      Parameters<NonNullable<typeof EventCardsWrapper.resolveData>>[0]
    >,
    {
      metadata: {
        streamDocument,
      },
    } as Parameters<NonNullable<typeof EventCardsWrapper.resolveData>>[1]
  );

describe("EventCardsWrapper", () => {
  it("when using a base entity section field then legacy events are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_eventSection",
        constantValueEnabled: false,
      },
      {
        c_eventSection: {
          events: [{ title: "Base Event" }],
        },
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(result.props!.slots!.CardSlot![0]?.props.parentData?.event).toEqual({
      title: "Base Event",
    });
  });

  it("when using a linked mapped list field then mapped events are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_eventSection.events",
        constantValueEnabled: false,
        itemFieldMappings: {
          title: "title",
          dateTime: "dateTime",
        },
      },
      {
        c_linkedLocation: [
          {
            c_eventSection: {
              events: [
                {
                  title: "Mapped Event",
                  dateTime: "2026-02-01T10:00:00Z",
                },
              ],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(result.props!.slots!.CardSlot![0]?.props.parentData?.event).toEqual({
      cta: undefined,
      dateTime: "2026-02-01T10:00:00Z",
      description: undefined,
      image: undefined,
      title: "Mapped Event",
    });
  });
});
