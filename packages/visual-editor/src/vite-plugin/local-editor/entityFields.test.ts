// @vitest-environment node
import { describe, expect, it } from "vitest";
import { inferEntityFields } from "./entityFields.ts";

describe("inferEntityFields", () => {
  it("recognizes structured local-editor rich text, CTA, and image values", () => {
    const inferred = inferEntityFields({
      description: {
        json: {
          root: {
            children: [],
          },
        },
      },
      cta: {
        label: "Order",
        link: "/order",
        linkType: "OTHER",
      },
      image: {
        url: "https://example.com/image.jpg",
        width: 1200,
        height: 800,
        alternateText: "Example",
      },
    });

    expect(inferred.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "description",
          definition: expect.objectContaining({
            typeRegistryId: "type.rich_text_v2",
          }),
        }),
        expect.objectContaining({
          name: "cta",
          definition: expect.objectContaining({
            typeRegistryId: "type.cta",
          }),
        }),
        expect.objectContaining({
          name: "image",
          definition: expect.objectContaining({
            typeRegistryId: "type.image",
          }),
        }),
      ])
    );
  });

  it("recognizes ComplexImage-shaped values as type.image", () => {
    const inferred = inferEntityFields({
      heroImage: {
        image: {
          url: "https://example.com/hero.jpg",
          width: 1440,
          height: 900,
          alternateText: "Hero",
        },
      },
    });

    expect(inferred.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "heroImage",
          definition: expect.objectContaining({
            typeRegistryId: "type.image",
          }),
        }),
      ])
    );
  });

  it("merges inferred schema across multiple local snapshots", () => {
    const inferred = inferEntityFields([
      {
        c_featuredProducts: {
          products: [
            {
              name: "Latte",
              description: {
                json: {
                  root: {
                    children: [],
                  },
                },
              },
              cta: {
                label: "Order",
                link: "/order",
                linkType: "OTHER",
              },
            },
          ],
        },
      },
      {
        c_featuredProducts: {
          products: [
            {
              name: "Espresso",
              image: {
                url: "https://example.com/product.jpg",
                width: 1200,
                height: 800,
              },
            },
          ],
        },
      },
    ]);

    const featuredProductsField = inferred.fields.find(
      (field) => field.name === "c_featuredProducts"
    );
    const productsField = featuredProductsField?.children?.fields.find(
      (field) => field.name === "products"
    );
    const productChildren = productsField?.children?.fields ?? [];

    expect(productsField?.definition.isList).toBe(true);
    expect(productChildren).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "name",
          definition: expect.objectContaining({
            typeRegistryId: "type.string",
          }),
        }),
        expect.objectContaining({
          name: "description",
          definition: expect.objectContaining({
            typeRegistryId: "type.rich_text_v2",
          }),
        }),
        expect.objectContaining({
          name: "cta",
          definition: expect.objectContaining({
            typeRegistryId: "type.cta",
          }),
        }),
        expect.objectContaining({
          name: "image",
          definition: expect.objectContaining({
            typeRegistryId: "type.image",
          }),
        }),
      ])
    );
  });
});
