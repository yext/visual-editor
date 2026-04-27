import { describe, expect, it } from "vitest";
import { ProductCardsWrapper } from "./ProductCardsWrapper.tsx";

const defaultProps = ProductCardsWrapper.defaultProps!;
const resolveData = async (
  data: Partial<typeof defaultProps.data>,
  streamDocument: Record<string, unknown>
) =>
  await ProductCardsWrapper.resolveData!(
    {
      props: {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          ...data,
        },
      },
    } as NonNullable<
      Parameters<NonNullable<typeof ProductCardsWrapper.resolveData>>[0]
    >,
    {
      metadata: {
        streamDocument,
      },
    } as Parameters<NonNullable<typeof ProductCardsWrapper.resolveData>>[1]
  );

describe("ProductCardsWrapper", () => {
  it("when using a base entity section field then legacy products are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_productSection",
        constantValueEnabled: false,
      },
      {
        c_productSection: {
          products: [{ name: "Base Product" }, { name: "Second Product" }],
        },
      }
    );

    const cardSlot = result.props!.slots!.CardSlot!;
    expect(cardSlot).toHaveLength(2);
    expect(cardSlot[0]?.props.parentData?.product).toEqual({
      name: "Base Product",
    });
    expect(cardSlot[1]?.props.parentData?.product).toEqual({
      name: "Second Product",
    });
  });

  it("when using a linked section field then the first linked entity's products are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_productSection",
        constantValueEnabled: false,
      },
      {
        c_linkedLocation: [
          {
            c_productSection: {
              products: [{ name: "Linked Product" }],
            },
          },
          {
            c_productSection: {
              products: [{ name: "Ignored Product" }],
            },
          },
        ],
      }
    );

    const cardSlot = result.props!.slots!.CardSlot!;
    expect(cardSlot).toHaveLength(1);
    expect(cardSlot[0]?.props.parentData?.product).toEqual({
      name: "Linked Product",
    });
  });
});
