import {
  type ComponentData,
  type DefaultComponentProps,
} from "@puckeditor/core";
import { describe, expect, it } from "vitest";
import { EventCardsWrapper } from "./EventSection/EventCardsWrapper.tsx";
import { type EventCardsWrapperProps } from "./EventSection/EventCardsWrapper.tsx";
import { FAQSection } from "./FAQsSection/FAQsSection.tsx";
import { type FAQSectionProps } from "./FAQsSection/FAQsSection.tsx";
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
  it("maps manual events into event card itemData without rewriting slot data", async () => {
    const data = createWrapperData<EventCardsWrapperProps>(
      "EventCardsWrapper",
      EventCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = true;
    data.props.data.field = "";
    data.props.data.constantValue = [
      {
        title: {
          field: "",
          constantValue: { defaultValue: "Manual Event" },
          constantValueEnabled: true,
        },
        date: {
          field: "",
          constantValue: "2026-05-01T12:00:00",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue: { html: "<p>Manual description</p>" },
          constantValueEnabled: true,
        },
        cta: {
          field: "",
          constantValue: {
            label: { defaultValue: "Learn More" },
            link: "/events/manual",
            linkType: "URL",
            ctaType: "textAndLink",
          },
          constantValueEnabled: true,
        },
        image: {
          field: "",
          constantValue: {
            url: "https://example.com/event.jpg",
            width: 640,
            height: 360,
          },
          constantValueEnabled: true,
        },
      },
    ];

    const resolvedData = await EventCardsWrapper.resolveData!(
      data,
      resolveParams({ locale: "en" })
    );
    const card = resolvedData.props!.slots!.CardSlot[0]!;

    expect(card.props.itemData).toEqual({
      field: "",
      fields: {
        image: undefined,
        title: undefined,
        dateTime: undefined,
        description: undefined,
        cta: undefined,
      },
      image: { url: "https://example.com/event.jpg", width: 640, height: 360 },
      title: { defaultValue: "Manual Event" },
      dateTime: "2026-05-01T12:00:00",
      description: { html: "<p>Manual description</p>" },
      cta: {
        label: { defaultValue: "Learn More" },
        link: "/events/manual",
        linkType: "URL",
        ctaType: "textAndLink",
      },
    });
    expect(
      card.props.slots.TitleSlot[0]?.props.data.text.constantValue
    ).not.toEqual({ defaultValue: "Manual Event" });
  });

  it("maps linked products into product card itemData", async () => {
    const data = createWrapperData<ProductCardsWrapperProps>(
      "ProductCardsWrapper",
      ProductCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_linkedProducts";
    data.props.cards = {
      image: {
        field: "photo",
        constantValue: undefined,
        constantValueEnabled: false,
      },
      brow: {
        field: "category",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      name: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      price: {
        field: "price",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "description",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "cta",
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
    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_linkedProducts",
      image: { url: "https://example.com/product.jpg" },
      brow: "Featured",
      name: "Trail Shoe",
      description: { html: "<p>Lightweight</p>" },
      cta: { label: "Shop", link: "/shop", linkType: "URL" },
      priceText: "$120",
    });
  });

  it("maps linked insights into insight card itemData", async () => {
    const data = createWrapperData<InsightCardsWrapperProps>(
      "InsightCardsWrapper",
      InsightCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_articles";
    data.props.cards = {
      image: {
        field: "image",
        constantValue: undefined,
        constantValueEnabled: false,
      },
      name: {
        field: "title",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      category: {
        field: "category",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      publishTime: {
        field: "publishDate",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "summary",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "cta",
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

    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_articles",
      image: { url: "https://example.com/article.jpg" },
      name: "Market Trends",
      category: "Research",
      publishTime: "2026-05-01",
      description: { html: "<p>Analysis</p>" },
      cta: { label: "Read", link: "/read", linkType: "URL" },
    });
  });

  it("maps linked testimonials into testimonial card itemData", async () => {
    const data = createWrapperData<TestimonialCardsWrapperProps>(
      "TestimonialCardsWrapper",
      TestimonialCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_reviews";
    data.props.cards = {
      description: {
        field: "quote",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      contributorName: {
        field: "author",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      contributionDate: {
        field: "date",
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

    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_reviews",
      description: { html: "<p>Great service</p>" },
      contributorName: "Avery",
      contributionDate: "2026-04-15",
    });
  });

  it("maps linked team members into team card itemData", async () => {
    const data = createWrapperData<TeamCardsWrapperProps>(
      "TeamCardsWrapper",
      TeamCardsWrapper.defaultProps!
    );
    data.props.data.constantValueEnabled = false;
    data.props.data.field = "c_teamMembers";
    data.props.cards = {
      headshot: {
        field: "photo",
        constantValue: undefined,
        constantValueEnabled: false,
      },
      name: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      title: {
        field: "jobTitle",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      phoneNumber: {
        field: "phone",
        constantValue: "",
        constantValueEnabled: false,
      },
      email: {
        field: "email",
        constantValue: "",
        constantValueEnabled: false,
      },
      cta: {
        field: "cta",
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

    expect(resolvedData.props!.slots!.CardSlot[0]?.props.itemData).toEqual({
      field: "c_teamMembers",
      headshot: { url: "https://example.com/headshot.jpg" },
      name: "Jordan",
      title: "Advisor",
      phoneNumber: "+12025550123",
      email: "jordan@example.com",
      cta: { label: "Profile", link: "/team/jordan", linkType: "URL" },
    });
  });

  it("maps manual FAQs into FAQ card itemData without keeping card data props", async () => {
    const data = createWrapperData<FAQSectionProps>(
      "FAQSection",
      FAQSection.defaultProps!
    );
    data.props.data.constantValueEnabled = true;
    data.props.data.field = "";
    data.props.data.constantValue = [
      {
        question: {
          field: "",
          constantValue: { defaultValue: "Manual question?" },
          constantValueEnabled: true,
        },
        answer: {
          field: "",
          constantValue: { html: "<p>Manual answer</p>" },
          constantValueEnabled: true,
        },
      },
    ];

    const resolvedData = await FAQSection.resolveData!(
      data,
      resolveParams({ locale: "en" })
    );
    const card = resolvedData.props!.slots!.CardSlot[0]!;

    expect(card.props.itemData).toEqual({
      field: "",
      question: { defaultValue: "Manual question?" },
      answer: { html: "<p>Manual answer</p>" },
    });
    expect("data" in card.props).toBe(false);
  });
});
