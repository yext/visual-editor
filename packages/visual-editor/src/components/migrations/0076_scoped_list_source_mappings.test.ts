import { describe, expect, it } from "vitest";
import { migrate } from "../../utils/migrate.ts";
import { scopedListSourceMappingsMigration } from "./0076_scoped_list_source_mappings.ts";

const runMigration = (
  content: Record<string, any>,
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

    expect(migrated.props.data.constantValue[0]?.email).toEqual({
      field: "",
      constantValueEnabled: true,
      constantValue: "alex@example.com",
    });
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
});
