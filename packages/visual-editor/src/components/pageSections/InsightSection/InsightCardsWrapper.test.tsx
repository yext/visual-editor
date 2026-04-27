import { describe, expect, it } from "vitest";
import { InsightCardsWrapper } from "./InsightCardsWrapper.tsx";

const defaultProps = InsightCardsWrapper.defaultProps!;
const resolveData = async (
  data: Partial<typeof defaultProps.data>,
  streamDocument: Record<string, unknown>
) =>
  await InsightCardsWrapper.resolveData!(
    {
      props: {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          ...data,
        },
      },
    } as NonNullable<
      Parameters<NonNullable<typeof InsightCardsWrapper.resolveData>>[0]
    >,
    {
      metadata: {
        streamDocument,
      },
    } as Parameters<NonNullable<typeof InsightCardsWrapper.resolveData>>[1]
  );

describe("InsightCardsWrapper", () => {
  it("when using a base entity section field then legacy insights are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_insightSection",
        constantValueEnabled: false,
      },
      {
        c_insightSection: {
          insights: [{ name: "Base Insight" }],
        },
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(
      result.props!.slots!.CardSlot![0]?.props.parentData?.insight
    ).toEqual({
      name: "Base Insight",
    });
  });

  it("when using a linked section field then the first linked entity's insights are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_insightSection",
        constantValueEnabled: false,
      },
      {
        c_linkedLocation: [
          {
            c_insightSection: {
              insights: [{ name: "Linked Insight" }],
            },
          },
          {
            c_insightSection: {
              insights: [{ name: "Ignored Insight" }],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(
      result.props!.slots!.CardSlot![0]?.props.parentData?.insight
    ).toEqual({
      name: "Linked Insight",
    });
  });
});
