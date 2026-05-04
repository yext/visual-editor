import {
  type ComponentData,
  type DefaultComponentProps,
} from "@puckeditor/core";
import { describe, expect, it } from "vitest";
import { InsightCardsWrapper } from "./InsightSection/InsightCardsWrapper.tsx";
import { type InsightCardsWrapperProps } from "./InsightSection/InsightCardsWrapper.tsx";
import { ProductCardsWrapper } from "./ProductSection/ProductCardsWrapper.tsx";
import { type ProductCardsWrapperProps } from "./ProductSection/ProductCardsWrapper.tsx";
import { TeamCardsWrapper } from "./TeamSection/TeamCardsWrapper.tsx";
import { type TeamCardsWrapperProps } from "./TeamSection/TeamCardsWrapper.tsx";
import { TestimonialCardsWrapper } from "./TestimonialSection/TestimonialCardsWrapper.tsx";
import { type TestimonialCardsWrapperProps } from "./TestimonialSection/TestimonialCardsWrapper.tsx";

const resolveParams = (streamDocument: Record<string, unknown>) =>
  ({
    changed: {},
    fields: {},
    lastFields: null,
    lastData: null,
    metadata: { streamDocument },
    trigger: "initial",
    parent: null,
  }) as any;

const createWrapperData = <TProps extends DefaultComponentProps>(
  type: string,
  defaultProps: TProps
): ComponentData<TProps> => ({
  type,
  props: JSON.parse(JSON.stringify(defaultProps)),
});

describe("mapped list wrappers", () => {
  it("maps linked products into product card parentData", async () => {
    const data = createWrapperData<ProductCardsWrapperProps>(
      "ProductCardsWrapper",
      ProductCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedProducts";
    data.props.cards = {
      image: {
        field: "c_linkedProducts.photo",
        constantValue: undefined,
        constantValueEnabled: false,
      },
      brow: {
        field: "c_linkedProducts.category",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      name: {
        field: "c_linkedProducts.name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      price: {
        field: "c_linkedProducts.price",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "c_linkedProducts.description",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "c_linkedProducts.cta",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
    };

    const resolvedData = await ProductCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_linkedProducts: [
          {
            photo: { url: "https://example.com/product.jpg" },
            category: "Featured",
            name: "Trail Shoe",
            price: "$120",
            description: { html: "<p>Lightweight</p>" },
            cta: { label: "Shop", link: "/shop", linkType: "URL" },
          },
        ],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot).toHaveLength(1);
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_linkedProducts",
      product: {
        image: { url: "https://example.com/product.jpg" },
        brow: "Featured",
        name: "Trail Shoe",
        description: { html: "<p>Lightweight</p>" },
        cta: { label: "Shop", link: "/shop", linkType: "URL" },
      },
      priceText: "$120",
    });
  });

  it("maps linked insights into insight card parentData", async () => {
    const data = createWrapperData<InsightCardsWrapperProps>(
      "InsightCardsWrapper",
      InsightCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_articles";
    data.props.cards = {
      image: {
        field: "c_articles.image",
        constantValue: undefined,
        constantValueEnabled: false,
      },
      name: {
        field: "c_articles.title",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      category: {
        field: "c_articles.category",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      publishTime: {
        field: "c_articles.publishDate",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "c_articles.summary",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "c_articles.cta",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
    };

    const resolvedData = await InsightCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_articles: [
          {
            image: { url: "https://example.com/article.jpg" },
            title: "Market Trends",
            category: "Research",
            publishDate: "2026-05-01",
            summary: { html: "<p>Analysis</p>" },
            cta: { label: "Read", link: "/read", linkType: "URL" },
          },
        ],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_articles",
      insight: {
        image: { url: "https://example.com/article.jpg" },
        name: "Market Trends",
        category: "Research",
        publishTime: "2026-05-01",
        description: { html: "<p>Analysis</p>" },
        cta: { label: "Read", link: "/read", linkType: "URL" },
      },
    });
  });

  it("maps linked testimonials into testimonial card parentData", async () => {
    const data = createWrapperData<TestimonialCardsWrapperProps>(
      "TestimonialCardsWrapper",
      TestimonialCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_reviews";
    data.props.cards = {
      description: {
        field: "c_reviews.quote",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      contributorName: {
        field: "c_reviews.author",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      contributionDate: {
        field: "c_reviews.date",
        constantValue: "",
        constantValueEnabled: false,
      },
    };

    const resolvedData = await TestimonialCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_reviews: [
          {
            quote: { html: "<p>Great service</p>" },
            author: "Avery",
            date: "2026-04-15",
          },
        ],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_reviews",
      testimonial: {
        description: { html: "<p>Great service</p>" },
        contributorName: "Avery",
        contributionDate: "2026-04-15",
      },
    });
  });

  it("maps linked team members into team card parentData", async () => {
    const data = createWrapperData<TeamCardsWrapperProps>(
      "TeamCardsWrapper",
      TeamCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_teamMembers";
    data.props.cards = {
      headshot: {
        field: "c_teamMembers.photo",
        constantValue: undefined,
        constantValueEnabled: false,
      },
      name: {
        field: "c_teamMembers.name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      title: {
        field: "c_teamMembers.jobTitle",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      phoneNumber: {
        field: "c_teamMembers.phone",
        constantValue: "",
        constantValueEnabled: false,
      },
      email: {
        field: "c_teamMembers.email",
        constantValue: "",
        constantValueEnabled: false,
      },
      cta: {
        field: "c_teamMembers.cta",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
    };

    const resolvedData = await TeamCardsWrapper.resolveData!(
      data,
      resolveParams({
        c_teamMembers: [
          {
            photo: { url: "https://example.com/headshot.jpg" },
            name: "Jordan",
            jobTitle: "Advisor",
            phone: "+12025550123",
            email: "jordan@example.com",
            cta: { label: "Profile", link: "/team/jordan", linkType: "URL" },
          },
        ],
      })
    );

    expect(resolvedData.props!.slots!.CardSlot[0]?.props.parentData).toEqual({
      field: "c_teamMembers",
      person: {
        headshot: { url: "https://example.com/headshot.jpg" },
        name: "Jordan",
        title: "Advisor",
        phoneNumber: "+12025550123",
        email: "jordan@example.com",
        cta: { label: "Profile", link: "/team/jordan", linkType: "URL" },
      },
    });
  });
});
