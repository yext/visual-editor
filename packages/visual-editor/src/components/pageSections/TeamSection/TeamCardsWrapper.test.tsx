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

  it("when using a linked mapped list field then mapped people are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_teamSection.people",
        constantValueEnabled: false,
        itemFieldMappings: {
          name: "name",
          phoneNumber: "phoneNumber",
          email: "email",
        },
      },
      {
        c_linkedLocation: [
          {
            c_teamSection: {
              people: [
                {
                  name: "Mapped Person",
                  phoneNumber: "+12025550123",
                  email: "person@example.com",
                },
              ],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(result.props!.slots!.CardSlot![0]?.props.parentData?.person).toEqual(
      {
        cta: undefined,
        email: "person@example.com",
        headshot: undefined,
        name: "Mapped Person",
        phoneNumber: "+12025550123",
        title: undefined,
      }
    );
  });
});
