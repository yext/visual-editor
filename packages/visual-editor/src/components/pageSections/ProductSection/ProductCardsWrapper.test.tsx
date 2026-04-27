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

  it("when using a linked mapped list field then mapped products are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_productSection.products",
        constantValueEnabled: false,
        itemFieldMappings: {
          name: "name",
          description: "description",
          image: "image",
        },
      },
      {
        c_linkedLocation: [
          {
            c_productSection: {
              products: [
                {
                  name: "Mapped Product",
                  description: { html: "<p>Product Description</p>" },
                  image: { url: "https://example.com/product.jpg" },
                },
              ],
            },
          },
        ],
      }
    );

    const cardSlot = result.props!.slots!.CardSlot!;
    expect(cardSlot).toHaveLength(1);
    expect(cardSlot[0]?.props.parentData?.product).toEqual({
      description: { html: "<p>Product Description</p>" },
      image: { url: "https://example.com/product.jpg" },
      name: "Mapped Product",
    });
  });

  it("when optional mapped fields are missing then products still render as long as name resolves", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_productSection.products",
        constantValueEnabled: false,
        itemFieldMappings: {
          name: "name",
        },
      },
      {
        c_linkedLocation: [
          {
            c_productSection: {
              products: [{ name: "Name Only Product" }],
            },
          },
        ],
      }
    );

    const cardSlot = result.props!.slots!.CardSlot!;
    expect(cardSlot).toHaveLength(1);
    expect(cardSlot[0]?.props.parentData?.product).toEqual({
      brow: undefined,
      category: undefined,
      cta: undefined,
      description: undefined,
      image: undefined,
      name: "Name Only Product",
      price: undefined,
    });
  });

  it("when mapped products are missing the required name then the card slot is cleared", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_productSection.products",
        constantValueEnabled: false,
        itemFieldMappings: {
          name: "missing",
        },
      },
      {
        c_linkedLocation: [
          {
            c_productSection: {
              products: [{ description: { html: "<p>No Name</p>" } }],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toEqual([]);
  });
});
