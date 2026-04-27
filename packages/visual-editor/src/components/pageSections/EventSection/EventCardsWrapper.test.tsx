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

  it("when using a linked section field then the first linked entity's events are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_eventSection",
        constantValueEnabled: false,
      },
      {
        c_linkedLocation: [
          {
            c_eventSection: {
              events: [{ title: "Linked Event" }],
            },
          },
          {
            c_eventSection: {
              events: [{ title: "Ignored Event" }],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(result.props!.slots!.CardSlot![0]?.props.parentData?.event).toEqual({
      title: "Linked Event",
    });
  });
});
