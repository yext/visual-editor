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

  it("when using a linked mapped list field then mapped insights are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_insightSection.insights",
        constantValueEnabled: false,
        itemFieldMappings: {
          name: "name",
          category: "category",
          publishTime: "publishTime",
        },
      },
      {
        c_linkedLocation: [
          {
            c_insightSection: {
              insights: [
                {
                  name: "Mapped Insight",
                  category: "News",
                  publishTime: "2026-01-01T10:00:00Z",
                },
              ],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(
      result.props!.slots!.CardSlot![0]?.props.parentData?.insight
    ).toEqual({
      category: "News",
      cta: undefined,
      description: undefined,
      image: undefined,
      name: "Mapped Insight",
      publishTime: "2026-01-01T10:00:00Z",
    });
  });
});
