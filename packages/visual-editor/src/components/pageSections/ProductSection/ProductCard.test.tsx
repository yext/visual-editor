import { describe, expect, it } from "vitest";
import { ProductCard, defaultProductCardSlotData } from "./ProductCard.tsx";

describe("ProductCard", () => {
  it("when itemData provides mapped content then conditional render stays enabled", () => {
    const data = defaultProductCardSlotData("product-card-1", 0) as any;
    data.props.itemData = {
      field: "",
      image: {
        url: "https://example.com/product.jpg",
        width: 640,
        height: 360,
      },
      brow: { defaultValue: "Featured" },
      name: { defaultValue: "Galaxy Burger" },
      price: { value: "12", currencyCode: "USD" },
      description: { html: "<p>Product description</p>" },
      cta: {
        label: { defaultValue: "Order now" },
        link: "/order",
        linkType: "URL",
        ctaType: "textAndLink",
      },
    };

    const resolvedData = ProductCard.resolveData!(data, {
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: { streamDocument: {} },
      trigger: "initial",
      parent: null,
    } as any) as any;

    expect(resolvedData.props.conditionalRender).toEqual({
      image: true,
      title: true,
      price: true,
      brow: true,
      description: true,
      cta: true,
    });
  });
});
