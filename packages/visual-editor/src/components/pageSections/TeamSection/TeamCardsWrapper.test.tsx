import { describe, expect, it } from "vitest";
import { TeamCardsWrapper } from "./TeamCardsWrapper.tsx";

const defaultProps = TeamCardsWrapper.defaultProps!;
const resolveData = async (
  data: Partial<typeof defaultProps.data>,
  streamDocument: Record<string, unknown>
) =>
  await TeamCardsWrapper.resolveData!(
    {
      props: {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          ...data,
        },
      },
    } as NonNullable<
      Parameters<NonNullable<typeof TeamCardsWrapper.resolveData>>[0]
    >,
    {
      metadata: {
        streamDocument,
      },
    } as Parameters<NonNullable<typeof TeamCardsWrapper.resolveData>>[1]
  );

describe("TeamCardsWrapper", () => {
  it("when using a base entity section field then legacy people are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_teamSection",
        constantValueEnabled: false,
      },
      {
        c_teamSection: {
          people: [{ name: "Base Person" }],
        },
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(result.props!.slots!.CardSlot![0]?.props.parentData?.person).toEqual(
      {
        name: "Base Person",
      }
    );
  });

  it("when using a linked section field then the first linked entity's people are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_teamSection",
        constantValueEnabled: false,
      },
      {
        c_linkedLocation: [
          {
            c_teamSection: {
              people: [{ name: "Linked Person" }],
            },
          },
          {
            c_teamSection: {
              people: [{ name: "Ignored Person" }],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(result.props!.slots!.CardSlot![0]?.props.parentData?.person).toEqual(
      {
        name: "Linked Person",
      }
    );
  });
});
