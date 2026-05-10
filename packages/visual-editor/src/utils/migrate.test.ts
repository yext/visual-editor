import { describe, expect, it } from "vitest";
import { Migration, MigrationRegistry, migrate } from "./migrate.ts";
import { addIdToSchema } from "../components/migrations/0023_add_id_to_schema.ts";
import { updateSchemaIdAnchorFormat } from "../components/migrations/0069_update_schema_id_anchor_format.ts";
import { themeColorPropertyKeyMigration } from "../components/migrations/0071_theme_color_property_keys.ts";
import { mainContentWrapperMigration } from "../components/migrations/0073_main_content_wrapper.ts";
import { normalizeFooterLogoImageMigration } from "../components/migrations/0075_normalize_footer_logo_image.ts";
import { slotMappedCardsMigration } from "../components/migrations/0076_slot_mapped_cards.ts";

describe("migrate", () => {
  it("successfully applies a migration", async () => {
    const migratedData = migrate(
      exampleDataBefore,
      migrationRegistry,
      {
        components: {},
      },
      {}
    );
    expect(migratedData).toEqual(exampleDataAfter);
  });

  it("successfully applies root migration", async () => {
    const migratedData = migrate(
      exampleRootDataBefore,
      [addIdToSchema],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual(exampleRootDataAfter);
  });

  it("wraps header and footer siblings around a new MainContent component", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          { type: "ExpandedHeader", props: { id: "header" } },
          { type: "BannerSection", props: { id: "banner" } },
          { type: "ExpandedFooter", props: { id: "footer" } },
        ],
        zones: {},
      },
      [mainContentWrapperMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        { type: "ExpandedHeader", props: { id: "header" } },
        {
          type: "MainContent",
          props: {
            id: "MainContent-default",
            content: [{ type: "BannerSection", props: { id: "banner" } }],
          },
        },
        { type: "ExpandedFooter", props: { id: "footer" } },
      ],
      zones: {},
    });
  });

  it("wraps locator content in MainContent when there is no header or footer", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [{ type: "Locator", props: { id: "locator" } }],
        zones: {},
      },
      [mainContentWrapperMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "MainContent",
          props: {
            id: "MainContent-default",
            content: [{ type: "Locator", props: { id: "locator" } }],
          },
        },
      ],
      zones: {},
    });
  });

  it("wraps all top-level body components in MainContent when there is no page chrome", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          { type: "BannerSection", props: { id: "banner" } },
          { type: "CustomCodeSection", props: { id: "custom-code" } },
        ],
        zones: {},
      },
      [mainContentWrapperMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "MainContent",
          props: {
            id: "MainContent-default",
            content: [
              { type: "BannerSection", props: { id: "banner" } },
              { type: "CustomCodeSection", props: { id: "custom-code" } },
            ],
          },
        },
      ],
      zones: {},
    });
  });

  it("keeps non-edge headers inside MainContent to preserve content order", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          { type: "BannerSection", props: { id: "banner" } },
          { type: "ExpandedHeader", props: { id: "header" } },
          { type: "HeroSection", props: { id: "hero" } },
        ],
        zones: {},
      },
      [mainContentWrapperMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "MainContent",
          props: {
            id: "MainContent-default",
            content: [
              { type: "BannerSection", props: { id: "banner" } },
              { type: "ExpandedHeader", props: { id: "header" } },
              { type: "HeroSection", props: { id: "hero" } },
            ],
          },
        },
      ],
      zones: {},
    });
  });

  it("keeps trailing custom code outside MainContent without moving it ahead of the footer", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          { type: "ExpandedHeader", props: { id: "header" } },
          { type: "BannerSection", props: { id: "banner" } },
          { type: "ExpandedFooter", props: { id: "footer" } },
          { type: "CustomCodeSection", props: { id: "custom-code" } },
        ],
        zones: {},
      },
      [mainContentWrapperMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        { type: "ExpandedHeader", props: { id: "header" } },
        {
          type: "MainContent",
          props: {
            id: "MainContent-default",
            content: [{ type: "BannerSection", props: { id: "banner" } }],
          },
        },
        { type: "ExpandedFooter", props: { id: "footer" } },
        { type: "CustomCodeSection", props: { id: "custom-code" } },
      ],
      zones: {},
    });
  });

  it("successfully applies migration based on document data", async () => {
    const migratedData = migrate(
      exampleBasicDataBefore,
      [
        {
          BasicSection: {
            action: "updated",
            propTransformation: (props, document) => {
              return { ...props, text: document.fieldB };
            },
          },
        },
      ],
      {
        components: {},
      },
      exampleDocument
    );

    expect(migratedData).toEqual(exampleBasicDataAfter);
  });

  it("recursively migrates legacy ThemeColor keys while preserving non-legacy textColor values", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "ComponentA",
            props: {
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                  isDarkBackground: false,
                },
              },
              cards: [
                {
                  answerColor: {
                    bgColor: "bg-palette-primary-dark",
                    textColor: "text-white",
                  },
                },
              ],
            },
          },
          {
            type: "ComponentB",
            props: {
              slotProps: {
                child: {
                  linkColor: {
                    bgColor: "bg-palette-secondary",
                    textColor: "text-palette-secondary-contrast",
                    isDarkBackground: true,
                  },
                },
              },
            },
          },
          {
            type: "Banner",
            props: {
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
                textColor: {
                  bgColor: "bg-palette-primary",
                  textColor: "text-palette-primary-contrast",
                },
              },
            },
          },
          {
            type: "ComponentC",
            props: {
              styles: {
                cta: {
                  textColor: "palette-primary-contrast",
                },
              },
            },
          },
        ],
        zones: {},
      },
      [themeColorPropertyKeyMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "ComponentA",
          props: {
            styles: {
              backgroundColor: {
                selectedColor: "white",
                contrastingColor: "black",
                isDarkColor: false,
              },
            },
            cards: [
              {
                answerColor: {
                  selectedColor: "palette-primary-dark",
                  contrastingColor: "white",
                },
              },
            ],
          },
        },
        {
          type: "ComponentB",
          props: {
            slotProps: {
              child: {
                linkColor: {
                  selectedColor: "palette-secondary",
                  contrastingColor: "palette-secondary-contrast",
                  isDarkColor: true,
                },
              },
            },
          },
        },
        {
          type: "Banner",
          props: {
            styles: {
              backgroundColor: {
                selectedColor: "white",
                contrastingColor: "black",
              },
              textColor: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
            },
          },
        },
        {
          type: "ComponentC",
          props: {
            styles: {
              cta: {
                textColor: "palette-primary-contrast",
              },
            },
          },
        },
      ],
      zones: {},
    });
  });

  it("updates top-level schemaMarkup @id to the new anchor format", async () => {
    const data = {
      root: {
        props: {
          version: 0,
          schemaMarkup: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Thing",
            "@id": "https://[[siteDomain]]/[[uid]]#customtag",
          }),
        },
      },
      content: [],
      zones: {},
    } as any;
    const migratedData = migrate(
      data,
      [updateSchemaIdAnchorFormat],
      {
        components: {},
      },
      {}
    );
    expect((migratedData.root.props as Record<string, any>)?.schemaMarkup).toBe(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Thing",
        "@id": "https://[[siteDomain]]/#[[uid]]-customtag",
      })
    );
  });

  it("does not rewrite unrelated custom schemaMarkup @id values", async () => {
    const schemaMarkup = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": "https://example.com/custom-id",
    });
    const data = {
      root: {
        props: {
          version: 0,
          schemaMarkup,
        },
      },
      content: [],
      zones: {},
    } as any;
    const migratedData = migrate(
      data,
      [updateSchemaIdAnchorFormat],
      {
        components: {},
      },
      {}
    );

    expect((migratedData.root.props as Record<string, any>)?.schemaMarkup).toBe(
      schemaMarkup
    );
  });

  it("normalizes malformed ExpandedFooter logo slot localized image data", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "ExpandedFooter",
            props: {
              id: "ExpandedFooter-test",
              slots: {
                LogoSlot: [
                  {
                    type: "FooterLogoSlot",
                    props: {
                      id: "FooterLogoSlot-test",
                      data: {
                        image: {
                          en: {
                            url: "https://example.com/stale.png",
                            height: 100,
                            width: 100,
                          },
                          hasLocalizedValue: "true",
                          constantValueEnabled: true,
                          constantValue: {
                            en: {
                              url: "https://example.com/current.png",
                              height: 200,
                              width: 200,
                            },
                            hasLocalizedValue: "true",
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
        zones: {},
      },
      [normalizeFooterLogoImageMigration],
      footerLogoSlotMigrationConfig,
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "ExpandedFooter",
          props: {
            id: "ExpandedFooter-test",
            slots: {
              LogoSlot: [
                {
                  type: "FooterLogoSlot",
                  props: {
                    id: "FooterLogoSlot-test",
                    data: {
                      image: {
                        field: "",
                        constantValueEnabled: true,
                        constantValue: {
                          en: {
                            url: "https://example.com/current.png",
                            height: 200,
                            width: 200,
                          },
                          hasLocalizedValue: "true",
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
      zones: {},
    });
  });

  it("preserves active ExpandedFooter logo slot entity image data while removing stale localized data", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "ExpandedFooter",
            props: {
              id: "ExpandedFooter-test",
              slots: {
                LogoSlot: [
                  {
                    type: "FooterLogoSlot",
                    props: {
                      id: "FooterLogoSlot-test",
                      data: {
                        image: {
                          en: {
                            url: "https://example.com/stale.png",
                            height: 100,
                            width: 100,
                          },
                          hasLocalizedValue: "true",
                          field: "logo",
                          constantValueEnabled: false,
                          constantValue: {
                            en: {
                              url: "https://example.com/fallback.png",
                              height: 200,
                              width: 200,
                            },
                            hasLocalizedValue: "true",
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
        zones: {},
      },
      [normalizeFooterLogoImageMigration],
      footerLogoSlotMigrationConfig,
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "ExpandedFooter",
          props: {
            id: "ExpandedFooter-test",
            slots: {
              LogoSlot: [
                {
                  type: "FooterLogoSlot",
                  props: {
                    id: "FooterLogoSlot-test",
                    data: {
                      image: {
                        field: "logo",
                        constantValueEnabled: false,
                        constantValue: {
                          en: {
                            url: "https://example.com/fallback.png",
                            height: 200,
                            width: 200,
                          },
                          hasLocalizedValue: "true",
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
      zones: {},
    });
  });

  it("wraps legacy ExpandedFooter logo slot localized image data as a constant value", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "ExpandedFooter",
            props: {
              id: "ExpandedFooter-test",
              slots: {
                LogoSlot: [
                  {
                    type: "FooterLogoSlot",
                    props: {
                      id: "FooterLogoSlot-test",
                      data: {
                        image: {
                          en: {
                            url: "https://example.com/legacy.png",
                            height: 100,
                            width: 100,
                          },
                          hasLocalizedValue: "true",
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        zones: {},
      },
      [normalizeFooterLogoImageMigration],
      footerLogoSlotMigrationConfig,
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "ExpandedFooter",
          props: {
            id: "ExpandedFooter-test",
            slots: {
              LogoSlot: [
                {
                  type: "FooterLogoSlot",
                  props: {
                    id: "FooterLogoSlot-test",
                    data: {
                      image: {
                        field: "",
                        constantValue: {
                          en: {
                            url: "https://example.com/legacy.png",
                            height: 100,
                            width: 100,
                          },
                          hasLocalizedValue: "true",
                        },
                        constantValueEnabled: true,
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
      zones: {},
    });
  });

  it("migrates linked EventCardsWrapper data to slot-mapped cards while preserving card ids", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "EventCardsWrapper",
            props: {
              id: "EventCardsWrapper-test",
              data: {
                field: "c_eventsSection",
                constantValueEnabled: false,
                constantValue: [{ id: "EventCard-1" }, { id: "EventCard-2" }],
              },
              slots: {
                CardSlot: [
                  {
                    type: "EventCard",
                    props: { id: "EventCard-1", slots: {} },
                  },
                  {
                    type: "EventCard",
                    props: { id: "EventCard-2", slots: {} },
                  },
                ],
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData.content[0]?.props.data).toEqual({
      field: "c_eventsSection.events",
      constantValueEnabled: false,
      constantValue: [{ id: "EventCard-1" }, { id: "EventCard-2" }],
      mappings: {
        image: {
          field: "image",
          constantValueEnabled: false,
          constantValue: undefined,
        },
        title: {
          field: "title",
          constantValueEnabled: false,
          constantValue: undefined,
        },
        dateTime: {
          field: "dateTime",
          constantValueEnabled: false,
          constantValue: undefined,
        },
        description: {
          field: "description",
          constantValueEnabled: false,
          constantValue: undefined,
        },
        cta: {
          field: "cta",
          constantValueEnabled: false,
          constantValue: undefined,
        },
      },
    });
    expect(migratedData.content[0]?.props.slots.CardSlot).toEqual([
      { type: "EventCard", props: { id: "EventCard-1", slots: {} } },
      { type: "EventCard", props: { id: "EventCard-2", slots: {} } },
    ]);
  });

  it("leaves manual EventCardsWrapper data unchanged", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "EventCardsWrapper",
            props: {
              id: "EventCardsWrapper-test",
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [{ id: "EventCard-1" }],
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData.content[0]?.props.data).toEqual({
      field: "",
      constantValueEnabled: true,
      constantValue: [{ id: "EventCard-1" }],
    });
  });

  it("migrates linked FAQSection data to slot-mapped cards while preserving slot content", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "FAQSection",
            props: {
              id: "FAQSection-test",
              data: {
                field: "c_faqSection",
                constantValueEnabled: false,
                constantValue: [{ id: "FAQCard-1" }],
              },
              slots: {
                CardSlot: [
                  {
                    type: "FAQCard",
                    props: {
                      id: "FAQCard-1",
                      data: {
                        question: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: { defaultValue: "Manual question" },
                        },
                        answer: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: {
                            defaultValue: { html: "<p>Manual answer</p>" },
                          },
                        },
                      },
                      slots: {},
                    },
                  },
                ],
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData.content[0]?.props.data).toEqual({
      field: "c_faqSection.faqs",
      constantValueEnabled: false,
      constantValue: [{ id: "FAQCard-1" }],
      mappings: {
        question: {
          field: "question",
          constantValueEnabled: false,
          constantValue: undefined,
        },
        answer: {
          field: "answer",
          constantValueEnabled: false,
          constantValue: undefined,
        },
      },
    });
    expect(migratedData.content[0]?.props.slots.CardSlot[0]?.props.id).toBe(
      "FAQCard-1"
    );
  });

  it("leaves already migrated FAQSection data unchanged", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "FAQSection",
            props: {
              id: "FAQSection-test",
              data: {
                field: "c_faqSection.faqs",
                constantValueEnabled: false,
                constantValue: [],
                mappings: {
                  question: {
                    field: "question",
                    constantValueEnabled: false,
                    constantValue: undefined,
                  },
                  answer: {
                    field: "answer",
                    constantValueEnabled: false,
                    constantValue: undefined,
                  },
                },
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData.content[0]?.props.data).toEqual({
      field: "c_faqSection.faqs",
      constantValueEnabled: false,
      constantValue: [],
      mappings: {
        question: {
          field: "question",
          constantValueEnabled: false,
          constantValue: undefined,
        },
        answer: {
          field: "answer",
          constantValueEnabled: false,
          constantValue: undefined,
        },
      },
    });
  });

  it("migrates linked ProductCardsWrapper data to slot-mapped cards", async () => {
    const migratedData = migrate(
      {
        root: { props: { version: 0 } },
        content: [
          {
            type: "ProductCardsWrapper",
            props: {
              id: "ProductCardsWrapper-test",
              data: {
                field: "c_productsSection",
                constantValueEnabled: false,
                constantValue: [{ id: "ProductCard-1" }],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: { id: "ProductCard-1", slots: {} },
                  },
                ],
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      { components: {} },
      {}
    );

    expect(migratedData.content[0]?.props.data).toMatchObject({
      field: "c_productsSection.products",
      constantValueEnabled: false,
      constantValue: [{ id: "ProductCard-1" }],
      mappings: {
        image: { field: "image" },
        brow: { field: "brow" },
        name: { field: "name" },
        price: {
          value: { field: "price.value" },
          currencyCode: { field: "price.currencyCode" },
        },
        description: { field: "description" },
        cta: { field: "cta" },
      },
    });
  });

  it("migrates linked TestimonialCardsWrapper data to slot-mapped cards", async () => {
    const migratedData = migrate(
      {
        root: { props: { version: 0 } },
        content: [
          {
            type: "TestimonialCardsWrapper",
            props: {
              id: "TestimonialCardsWrapper-test",
              data: {
                field: "c_testimonialsSection",
                constantValueEnabled: false,
                constantValue: [{ id: "TestimonialCard-1" }],
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      { components: {} },
      {}
    );

    expect(migratedData.content[0]?.props.data).toMatchObject({
      field: "c_testimonialsSection.testimonials",
      mappings: {
        description: { field: "description" },
        contributorName: { field: "contributorName" },
        contributionDate: { field: "contributionDate" },
      },
    });
  });

  it("migrates linked InsightCardsWrapper data to slot-mapped cards", async () => {
    const migratedData = migrate(
      {
        root: { props: { version: 0 } },
        content: [
          {
            type: "InsightCardsWrapper",
            props: {
              id: "InsightCardsWrapper-test",
              data: {
                field: "c_insightsSection",
                constantValueEnabled: false,
                constantValue: [{ id: "InsightCard-1" }],
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      { components: {} },
      {}
    );

    expect(migratedData.content[0]?.props.data).toMatchObject({
      field: "c_insightsSection.insights",
      mappings: {
        image: { field: "image" },
        name: { field: "name" },
        category: { field: "category" },
        publishTime: { field: "publishTime" },
        description: { field: "description" },
        cta: { field: "cta" },
      },
    });
  });

  it("migrates linked TeamCardsWrapper data to slot-mapped cards", async () => {
    const migratedData = migrate(
      {
        root: { props: { version: 0 } },
        content: [
          {
            type: "TeamCardsWrapper",
            props: {
              id: "TeamCardsWrapper-test",
              data: {
                field: "c_teamSection",
                constantValueEnabled: false,
                constantValue: [{ id: "TeamCard-1" }],
              },
            },
          },
        ],
        zones: {},
      },
      [slotMappedCardsMigration],
      { components: {} },
      {}
    );

    expect(migratedData.content[0]?.props.data).toMatchObject({
      field: "c_teamSection.people",
      mappings: {
        headshot: { field: "headshot" },
        name: { field: "name" },
        title: { field: "title" },
        phoneNumber: { field: "phoneNumber" },
        email: { field: "email" },
        cta: { field: "cta" },
      },
    });
  });
});

const migration: Migration = {
  CoreInfoSection: {
    action: "removed",
  },
  BannerSection: { action: "renamed", newName: "ThinBannerSection" },
  HeroSection: {
    action: "updated",
    propTransformation: ({
      data: { businessName, ...otherData },
      ...props
    }) => ({
      ...props,
      data: otherData,
      businessName: businessName,
    }),
  },
};

const alreadyAppliedMigration: Migration = {
  HeroSection: {
    action: "renamed",
    newName: "RenamedSection",
  },
};

export const migrationRegistry: MigrationRegistry = [
  alreadyAppliedMigration,
  migration,
];

const footerLogoSlotMigrationConfig = {
  components: {
    ExpandedFooter: {
      fields: {
        slots: {
          type: "object",
          objectFields: {
            LogoSlot: { type: "slot" },
          },
        },
      },
    },
    FooterLogoSlot: {
      fields: {},
    },
  },
} as any;

const exampleDataBefore = {
  root: {
    props: {
      version: 1,
    },
  },
  content: [
    {
      type: "BannerSection",
      props: {
        text: {
          field: "",
          constantValue: "Banner Text",
          constantValueEnabled: true,
        },
        textAlignment: "center",
        backgroundColor: {
          selectedColor: "palette-primary-dark",
          contrastingColor: "white",
        },
        liveVisibility: true,
        id: "BannerSection-4e3cf9a3-d987-4cae-a0cb-db48d270414f",
      },
    },
    {
      type: "CoreInfoSection",
      props: {
        styles: {
          headingLevel: 3,
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
        },
        address: {
          headingText: {
            field: "",
            constantValue: "Information",
            constantValueEnabled: true,
          },
          address: {
            field: "address",
            constantValue: {
              line1: "",
              city: "",
              postalCode: "",
              countryCode: "",
            },
          },
          showGetDirectionsLink: true,
        },
        phoneNumbers: {
          phoneNumber: [
            {
              number: { field: "mainPhone", constantValue: "" },
              label: "Phone",
            },
          ],
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
        },
        emails: {
          emails: { field: "emails", constantValue: [] },
          listLength: 1,
        },
        hours: {
          headingText: {
            field: "",
            constantValue: "Hours",
            constantValueEnabled: true,
          },
          hours: { field: "hours", constantValue: {} },
          startOfWeek: "today",
          collapseDays: false,
          showAdditionalHoursText: true,
        },
        services: {
          headingText: {
            field: "",
            constantValue: "Services",
            constantValueEnabled: true,
          },
          servicesList: { field: "services", constantValue: [] },
        },
        liveVisibility: true,
        id: "CoreInfoSection-490a5a66-5674-4fe1-9215-cdf2bfb9d3b0",
      },
    },
    {
      type: "HeroSection",
      props: {
        data: {
          businessName: { field: "name", constantValue: "Business Name" },
          localGeoModifier: {
            field: "address.city",
            constantValue: "Geomodifier Name",
          },
          hours: { field: "hours", constantValue: {} },
          hero: {
            field: "",
            constantValue: {
              image: {
                height: 360,
                width: 640,
                url: "https://placehold.co/640x360",
              },
              primaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
              secondaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
            },
            constantValueOverride: {
              image: false,
              primaryCta: false,
              secondaryCta: false,
            },
          },
        },
        styles: {
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
          imageOrientation: "right",
          businessNameLevel: 3,
          localGeoModifierLevel: 1,
          primaryCTA: "primary",
          secondaryCTA: "secondary",
        },
        liveVisibility: true,
        id: "HeroSection-d92bd0a9-4c1f-4c59-ba97-c2a1ec77860f",
      },
    },
  ],
  zones: {},
};

const exampleDataAfter = {
  root: {
    props: {
      version: 2,
    },
  },
  content: [
    {
      type: "ThinBannerSection",
      props: {
        text: {
          field: "",
          constantValue: "Banner Text",
          constantValueEnabled: true,
        },
        textAlignment: "center",
        backgroundColor: {
          selectedColor: "palette-primary-dark",
          contrastingColor: "white",
        },
        liveVisibility: true,
        id: "BannerSection-4e3cf9a3-d987-4cae-a0cb-db48d270414f",
      },
    },
    {
      type: "HeroSection",
      props: {
        businessName: { field: "name", constantValue: "Business Name" },
        data: {
          localGeoModifier: {
            field: "address.city",
            constantValue: "Geomodifier Name",
          },
          hours: { field: "hours", constantValue: {} },
          hero: {
            field: "",
            constantValue: {
              image: {
                height: 360,
                width: 640,
                url: "https://placehold.co/640x360",
              },
              primaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
              secondaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
            },
            constantValueOverride: {
              image: false,
              primaryCta: false,
              secondaryCta: false,
            },
          },
        },
        styles: {
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
          imageOrientation: "right",
          businessNameLevel: 3,
          localGeoModifierLevel: 1,
          primaryCTA: "primary",
          secondaryCTA: "secondary",
        },
        liveVisibility: true,
        id: "HeroSection-d92bd0a9-4c1f-4c59-ba97-c2a1ec77860f",
      },
    },
  ],
  zones: {},
};

const exampleRootDataBefore = {
  root: {
    props: {
      version: 0,
      schemaMarkup:
        '{"@context":"https://schema.org","@type":"LocalBusiness","name":"[[name]]","address":{"@type":"PostalAddress","streetAddress":"[[address.line1]]","addressLocality":"[[address.city]]","addressRegion":"[[address.region]]","postalCode":"[[address.postalCode]]","addressCountry":"[[address.countryCode]]"},"openingHours":"[[hours]]","image":"[[photoGallery]]","description":"[[description]]","telephone":"[[mainPhone]]","paymentAccepted":"[[paymentOptions]]","hasOfferCatalog":"[[services]]"}',
    },
  },
  content: [],
  zones: {},
};

const exampleRootDataAfter = {
  root: {
    props: {
      version: 1,
      schemaMarkup:
        '{"@context":"https://schema.org","@type":"LocalBusiness","name":"[[name]]","address":{"@type":"PostalAddress","streetAddress":"[[address.line1]]","addressLocality":"[[address.city]]","addressRegion":"[[address.region]]","postalCode":"[[address.postalCode]]","addressCountry":"[[address.countryCode]]"},"openingHours":"[[hours]]","image":"[[photoGallery]]","description":"[[description]]","telephone":"[[mainPhone]]","paymentAccepted":"[[paymentOptions]]","hasOfferCatalog":"[[services]]","@id":"[[siteDomain]]/[[path]]"}',
    },
  },
  content: [],
  zones: {},
};

const exampleBasicDataBefore = {
  root: {},
  zones: {},
  content: [
    {
      type: "BasicSection",
      props: {
        text: "Some text",
      },
    },
  ],
};

const exampleDocument = {
  fieldA: "Value A",
  fieldB: "Value B",
};

const exampleBasicDataAfter = {
  root: {
    props: {
      version: 1,
    },
  },
  zones: {},
  content: [
    {
      type: "BasicSection",
      props: {
        text: "Value B",
      },
    },
  ],
};
