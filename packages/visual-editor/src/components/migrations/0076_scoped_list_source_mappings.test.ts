import { describe, expect, it } from "vitest";
import { migrate } from "../../utils/migrate.ts";
import { scopedListSourceMappingsMigration } from "./0076_scoped_list_source_mappings.ts";

const runMigration = (
  content: { type: string; props: Record<string, any> },
  streamDocument: Record<string, unknown> = {}
): Record<string, any> =>
  migrate(
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
  ).content[0];

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
      getProps: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_events.events",
      mappingFieldName: "cards",
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
      getProps: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_products.products",
      mappingFieldName: "cards",
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
      getProps: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_insights.insights",
      mappingFieldName: "cards",
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
      getProps: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_team.people",
      mappingFieldName: "cards",
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
      getProps: (props: Record<string, any>) =>
        props.slots.CardsWrapperSlot[0].props,
      expectedField: "c_testimonials.testimonials",
      mappingFieldName: "cards",
      expectedMappings: {
        description: "description",
        contributorName: "contributorName",
        contributionDate: "contributionDate",
      },
    },
    {
      name: "FAQSection",
      streamDocument: {
        c_faq: { faqs: [{ question: "Q", answer: { html: "<p>A</p>" } }] },
      },
      content: {
        type: "FAQSection",
        props: {
          id: "faq-section",
          data: {
            field: "c_faq",
            constantValueEnabled: false,
            constantValue: [],
          },
        },
      },
      getProps: (props: Record<string, any>) => props,
      expectedField: "c_faq.faqs",
      mappingFieldName: "faqs",
      expectedMappings: {
        question: "question",
        answer: "answer",
      },
    },
  ])(
    "migrates linked $name props from main to the item source schema",
    ({
      content,
      expectedField,
      expectedMappings,
      getProps,
      mappingFieldName,
      streamDocument,
    }) => {
      const migratedProps = getProps(
        runMigration(content, streamDocument).props
      );

      expect(migratedProps.data.field).toBe(expectedField);
      expect(migratedProps[mappingFieldName]).toEqual(
        Object.fromEntries(
          Object.entries(expectedMappings).map(([key, field]) => [
            key,
            { field },
          ])
        )
      );
    }
  );

  it("extracts manual EventCardsWrapper card values into inline constantValue items", () => {
    const migrated = runMigration({
      type: "EventCardsWrapper",
      props: {
        id: "event-wrapper",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [{ id: "event-card-1" }],
        },
        slots: {
          CardSlot: [
            {
              type: "EventCard",
              props: {
                slots: {
                  TitleSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Summer Social" },
                          },
                        },
                      },
                    },
                  ],
                  DateTimeSlot: [
                    {
                      props: {
                        data: {
                          date: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: "2026-06-01T12:00:00",
                          },
                        },
                      },
                    },
                  ],
                  DescriptionSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Join us." },
                          },
                        },
                      },
                    },
                  ],
                  CTASlot: [
                    {
                      props: {
                        data: {
                          entityField: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: {
                              label: { defaultValue: "RSVP" },
                              link: "/rsvp",
                              linkType: "URL",
                              ctaType: "textAndLink",
                            },
                          },
                        },
                      },
                    },
                  ],
                  ImageSlot: [
                    {
                      props: {
                        data: {
                          image: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: {
                              url: "https://example.com/event.jpg",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(migrated.props.data.constantValue).toEqual([
      {
        title: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Summer Social" },
        },
        date: {
          field: "",
          constantValueEnabled: true,
          constantValue: "2026-06-01T12:00:00",
        },
        description: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Join us." },
        },
        cta: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            label: { defaultValue: "RSVP" },
            link: "/rsvp",
            linkType: "URL",
            ctaType: "textAndLink",
          },
        },
        image: {
          field: "",
          constantValueEnabled: true,
          constantValue: { url: "https://example.com/event.jpg" },
        },
      },
    ]);
  });

  it("extracts manual TeamCardsWrapper email values from the legacy email list field", () => {
    const migrated = runMigration({
      type: "TeamCardsWrapper",
      props: {
        id: "team-wrapper",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [{ id: "team-card-1" }],
        },
        slots: {
          CardSlot: [
            {
              type: "TeamCard",
              props: {
                slots: {
                  ImageSlot: [
                    {
                      props: {
                        data: {
                          image: {
                            constantValue: {
                              url: "https://example.com/headshot.jpg",
                            },
                          },
                        },
                      },
                    },
                  ],
                  NameSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            constantValue: { defaultValue: "Alex Agent" },
                          },
                        },
                      },
                    },
                  ],
                  TitleSlot: [
                    {
                      props: {
                        data: {
                          text: { constantValue: { defaultValue: "Broker" } },
                        },
                      },
                    },
                  ],
                  PhoneSlot: [
                    {
                      props: {
                        data: {
                          phoneNumbers: [
                            {
                              number: {
                                field: "",
                                constantValueEnabled: true,
                                constantValue: "+12025550123",
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  EmailSlot: [
                    {
                      props: {
                        data: {
                          list: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: ["alex@example.com"],
                          },
                        },
                      },
                    },
                  ],
                  CTASlot: [
                    {
                      props: {
                        data: {
                          entityField: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: {
                              label: { defaultValue: "View Profile" },
                              link: "/team/alex",
                              linkType: "URL",
                              ctaType: "textAndLink",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(migrated.props.data.constantValue).toEqual([
      {
        headshot: {
          constantValue: {
            url: "https://example.com/headshot.jpg",
          },
        },
        name: {
          constantValue: { defaultValue: "Alex Agent" },
        },
        title: {
          constantValue: { defaultValue: "Broker" },
        },
        phoneNumber: {
          field: "",
          constantValueEnabled: true,
          constantValue: "+12025550123",
        },
        email: {
          field: "",
          constantValueEnabled: true,
          constantValue: "alex@example.com",
        },
        cta: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            label: { defaultValue: "View Profile" },
            link: "/team/alex",
            linkType: "URL",
            ctaType: "textAndLink",
          },
        },
      },
    ]);
  });

  it("extracts manual FAQSection card values into inline FAQ items", () => {
    const migrated = runMigration({
      type: "FAQSection",
      props: {
        id: "faq-section",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [{ id: "faq-card-1" }],
        },
        slots: {
          CardSlot: [
            {
              type: "FAQCard",
              props: {
                data: {
                  question: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: { defaultValue: "What are your hours?" },
                  },
                  answer: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: { html: "<p>9 to 5</p>" },
                  },
                },
              },
            },
          ],
        },
      },
    });

    expect(migrated.props.data.constantValue).toEqual([
      {
        question: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "What are your hours?" },
        },
        answer: {
          field: "",
          constantValueEnabled: true,
          constantValue: { html: "<p>9 to 5</p>" },
        },
      },
    ]);
  });

  it("extracts manual legacy FAQ slot parentData into inline FAQ items", () => {
    const migrated = runMigration({
      type: "FAQSection",
      props: {
        id: "faq-section",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [{ id: "faq-card-1" }],
        },
        slots: {
          CardSlot: [
            {
              type: "FAQCard",
              props: {
                slots: {
                  QuestionSlot: [
                    {
                      props: {
                        parentData: {
                          richText: { defaultValue: "Legacy question?" },
                        },
                      },
                    },
                  ],
                  AnswerSlot: [
                    {
                      props: {
                        parentData: {
                          richText: { html: "<p>Legacy answer</p>" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(migrated.props.data.constantValue).toEqual([
      {
        question: { defaultValue: "Legacy question?" },
        answer: { html: "<p>Legacy answer</p>" },
      },
    ]);
  });

  it("extracts manual InsightCardsWrapper card values into inline constantValue items", () => {
    const migrated = runMigration({
      type: "InsightCardsWrapper",
      props: {
        id: "insight-wrapper",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [{ id: "insight-card-1" }],
        },
        slots: {
          CardSlot: [
            {
              type: "InsightCard",
              props: {
                slots: {
                  ImageSlot: [
                    {
                      props: {
                        data: {
                          image: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: {
                              url: "https://example.com/insight.jpg",
                            },
                          },
                        },
                      },
                    },
                  ],
                  TitleSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Fresh Flavors" },
                          },
                        },
                      },
                    },
                  ],
                  CategorySlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "News" },
                          },
                        },
                      },
                    },
                  ],
                  PublishTimeSlot: [
                    {
                      props: {
                        data: {
                          date: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: "2026-05-01T12:00:00",
                          },
                        },
                      },
                    },
                  ],
                  DescriptionSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Read this now." },
                          },
                        },
                      },
                    },
                  ],
                  CTASlot: [
                    {
                      props: {
                        data: {
                          entityField: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: {
                              label: { defaultValue: "Read More" },
                              link: "/insights/fresh-flavors",
                              linkType: "URL",
                              ctaType: "textAndLink",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(migrated.props.data.constantValue).toEqual([
      {
        image: {
          field: "",
          constantValueEnabled: true,
          constantValue: { url: "https://example.com/insight.jpg" },
        },
        name: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Fresh Flavors" },
        },
        category: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "News" },
        },
        publishTime: {
          field: "",
          constantValueEnabled: true,
          constantValue: "2026-05-01T12:00:00",
        },
        description: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Read this now." },
        },
        cta: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            label: { defaultValue: "Read More" },
            link: "/insights/fresh-flavors",
            linkType: "URL",
            ctaType: "textAndLink",
          },
        },
      },
    ]);
  });

  it("extracts manual ProductCardsWrapper card values into inline constantValue items", () => {
    const migrated = runMigration({
      type: "ProductCardsWrapper",
      props: {
        id: "product-wrapper",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [{ id: "product-card-1" }],
        },
        slots: {
          CardSlot: [
            {
              type: "ProductCard",
              props: {
                slots: {
                  ImageSlot: [
                    {
                      props: {
                        data: {
                          image: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: {
                              url: "https://example.com/product.jpg",
                            },
                          },
                        },
                      },
                    },
                  ],
                  BrowSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Featured" },
                          },
                        },
                      },
                    },
                  ],
                  TitleSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Galaxy Burger" },
                          },
                        },
                      },
                    },
                  ],
                  PriceSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "$12.99" },
                          },
                        },
                      },
                    },
                  ],
                  DescriptionSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Our bestseller." },
                          },
                        },
                      },
                    },
                  ],
                  CTASlot: [
                    {
                      props: {
                        data: {
                          entityField: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: {
                              label: { defaultValue: "Order Now" },
                              link: "/order/galaxy-burger",
                              linkType: "URL",
                              ctaType: "textAndLink",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(migrated.props.data.constantValue).toEqual([
      {
        image: {
          field: "",
          constantValueEnabled: true,
          constantValue: { url: "https://example.com/product.jpg" },
        },
        brow: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Featured" },
        },
        name: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Galaxy Burger" },
        },
        price: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "$12.99" },
        },
        description: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Our bestseller." },
        },
        cta: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            label: { defaultValue: "Order Now" },
            link: "/order/galaxy-burger",
            linkType: "URL",
            ctaType: "textAndLink",
          },
        },
      },
    ]);
  });

  it("extracts manual TestimonialCardsWrapper card values into inline constantValue items", () => {
    const migrated = runMigration({
      type: "TestimonialCardsWrapper",
      props: {
        id: "testimonial-wrapper",
        data: {
          field: "",
          constantValueEnabled: true,
          constantValue: [{ id: "testimonial-card-1" }],
        },
        slots: {
          CardSlot: [
            {
              type: "TestimonialCard",
              props: {
                slots: {
                  DescriptionSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Five stars." },
                          },
                        },
                      },
                    },
                  ],
                  ContributorNameSlot: [
                    {
                      props: {
                        data: {
                          text: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: { defaultValue: "Jamie" },
                          },
                        },
                      },
                    },
                  ],
                  ContributionDateSlot: [
                    {
                      props: {
                        data: {
                          date: {
                            field: "",
                            constantValueEnabled: true,
                            constantValue: "2026-04-20T12:00:00",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(migrated.props.data.constantValue).toEqual([
      {
        description: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Five stars." },
        },
        contributorName: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Jamie" },
        },
        contributionDate: {
          field: "",
          constantValueEnabled: true,
          constantValue: "2026-04-20T12:00:00",
        },
      },
    ]);
  });
});
