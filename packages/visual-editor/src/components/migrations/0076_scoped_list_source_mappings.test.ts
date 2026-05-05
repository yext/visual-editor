import { describe, expect, it } from "vitest";
import { migrate } from "../../utils/migrate.ts";
import { scopedListSourceMappingsMigration } from "./0076_scoped_list_source_mappings.ts";

describe("scopedListSourceMappingsMigration", () => {
  it.each([
    {
      name: "EventSection",
      streamDocument: { c_events: { events: [{ title: "Cooking Class" }] } },
      content: {
        type: "EventSection",
        props: {
          id: "event-section",
          slots: {
            CardsWrapperSlot: [
              {
                type: "EventCardsWrapper",
                props: {
                  id: "event-wrapper",
                  data: {
                    field: "c_events",
                    constantValueEnabled: false,
                    constantValue: [],
                  },
                },
              },
            ],
          },
        },
      },
      getWrapper: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_events.events",
      expectedMappings: {
        title: "title",
        date: "dateTime",
        description: "description",
        cta: "cta",
        image: "image",
      },
    },
    {
      name: "ProductSection",
      streamDocument: { c_products: { products: [{ name: "Galaxy Burger" }] } },
      content: {
        type: "ProductSection",
        props: {
          id: "product-section",
          slots: {
            CardsWrapperSlot: [
              {
                type: "ProductCardsWrapper",
                props: {
                  id: "product-wrapper",
                  data: {
                    field: "c_products",
                    constantValueEnabled: false,
                    constantValue: [],
                  },
                },
              },
            ],
          },
        },
      },
      getWrapper: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_products.products",
      expectedMappings: {
        image: "image",
        brow: "brow",
        name: "name",
        price: "price.value",
        description: "description",
        cta: "cta",
      },
    },
    {
      name: "InsightSection",
      streamDocument: {
        c_insights: { insights: [{ name: "Fresh Flavors Fast" }] },
      },
      content: {
        type: "InsightSection",
        props: {
          id: "insight-section",
          slots: {
            CardsWrapperSlot: [
              {
                type: "InsightCardsWrapper",
                props: {
                  id: "insight-wrapper",
                  data: {
                    field: "c_insights",
                    constantValueEnabled: false,
                    constantValue: [],
                  },
                },
              },
            ],
          },
        },
      },
      getWrapper: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_insights.insights",
      expectedMappings: {
        image: "image",
        name: "name",
        category: "category",
        publishTime: "publishTime",
        description: "description",
        cta: "cta",
      },
    },
    {
      name: "TeamSection",
      streamDocument: { c_team: { people: [{ name: "Captain Cosmo" }] } },
      content: {
        type: "TeamSection",
        props: {
          id: "team-section",
          slots: {
            CardsWrapperSlot: [
              {
                type: "TeamCardsWrapper",
                props: {
                  id: "team-wrapper",
                  data: {
                    field: "c_team",
                    constantValueEnabled: false,
                    constantValue: [],
                  },
                },
              },
            ],
          },
        },
      },
      getWrapper: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_team.people",
      expectedMappings: {
        headshot: "headshot",
        name: "name",
        title: "title",
        phoneNumber: "phoneNumber",
        email: "email",
        cta: "cta",
      },
    },
    {
      name: "TestimonialSection",
      streamDocument: {
        c_testimonials: { testimonials: [{ contributorName: "Jane" }] },
      },
      content: {
        type: "TestimonialSection",
        props: {
          id: "testimonial-section",
          slots: {
            CardsWrapperSlot: [
              {
                type: "TestimonialCardsWrapper",
                props: {
                  id: "testimonial-wrapper",
                  data: {
                    field: "c_testimonials",
                    constantValueEnabled: false,
                    constantValue: [],
                  },
                },
              },
            ],
          },
        },
      },
      getWrapper: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_testimonials.testimonials",
      expectedMappings: {
        description: "description",
        contributorName: "contributorName",
        contributionDate: "contributionDate",
      },
    },
    {
      name: "legacy FAQSection wrapper slot",
      streamDocument: {
        c_faq: { faqs: [{ question: "Q", answer: { html: "<p>A</p>" } }] },
      },
      content: {
        type: "FAQSection",
        props: {
          id: "faq-section",
          slots: {
            FAQsWrapperSlot: [
              {
                type: "FAQsWrapperSlot",
                props: {
                  id: "faq-wrapper",
                  data: {
                    field: "c_faq",
                    constantValueEnabled: false,
                    constantValue: [],
                  },
                },
              },
            ],
          },
        },
      },
      getWrapper: (props: Record<string, any>) =>
        props.slots.FAQsWrapperSlot[0].props,
      expectedField: "c_faq.faqs",
      expectedMappings: {
        question: "question",
        answer: "answer",
      },
      mappingFieldName: "faqs",
    },
  ])(
    "migrates old $name source-driven wrapper props to scoped mappings",
    ({
      content,
      expectedField,
      expectedMappings,
      getWrapper,
      mappingFieldName = "cards",
      streamDocument,
    }) => {
      const migratedData = migrate(
        {
          root: {
            props: {
              version: 0,
            },
          },
          content: [content],
          zones: {},
        },
        [scopedListSourceMappingsMigration],
        {
          components: {},
        },
        streamDocument
      );

      const wrapperProps = getWrapper(migratedData.content[0].props);

      expect(wrapperProps.data.field).toBe(expectedField);
      expect(wrapperProps[mappingFieldName]).toEqual(
        Object.fromEntries(
          Object.entries(expectedMappings).map(([key, field]) => [
            key,
            { field },
          ])
        )
      );
    }
  );
});
