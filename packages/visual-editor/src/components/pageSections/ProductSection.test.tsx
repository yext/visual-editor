import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  ProductSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
import { page } from "@vitest/browser/context";

const productsData = {
  products: [
    {
      category: "Burgers",
      cta: {
        label: "Order Now",
        link: "order",
        linkType: "OTHER",
      },
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our signature burger! A juicy beef patty topped with melted cheese, crisp lettuce, ripe tomato, and our special Galaxy sauce, all served on a toasted sesame seed bun.</span></p>',
      },
      image: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
        width: 2048,
      },
      name: "Galaxy Burger",
    },
    {
      image: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
        width: 2048,
      },
      name: "Galaxy Salad",
    },
    {
      category: "Desserts",
      cta: {
        label: "Order Now",
        link: "order",
        linkType: "OTHER",
      },
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Indulge in our decadent milkshake! Thick and creamy, topped with whipped cream, chocolate shavings, and a cherry. The perfect sweet treat.</span></p>',
      },
      name: "Galaxy Milkshake",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...ProductSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_products: productsData },
    props: { ...ProductSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { c_products: productsData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        products: {
          field: "c_products",
          constantValue: { products: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        headingLevel: 6,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { c_products: productsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: true,
        },
        products: {
          field: "c_products",
          constantValue: {
            products: [
              {
                name: "Product 1",
                category: "Category",
                description: "Description",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 7 props with entity values",
    document: { c_products: productsData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        products: {
          field: "c_products",
          constantValue: { products: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 4,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 7 props with constant value",
    document: { c_products: productsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: true,
        },
        products: {
          field: "c_products",
          constantValue: {
            products: [
              {
                name: "Product 1",
                category: "Category",
                description: "Description",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 15 props with missing ctaType",
    document: { c_products: productsData, name: "Test" },
    props: {
      data: {
        heading: {
          field: "",
          constantValue: "[[name]]",
          constantValueEnabled: true,
        },
        products: {
          field: "c_products",
          constantValue: {
            products: [
              {
                name: "Product 1",
                category: "Category",
                description: "Description",
                cta: {
                  label: "CTA",
                  // Missing link, linkType, and ctaType - should be added by migration
                },
              },
              {
                name: "Product 2",
                category: "Category 2",
                description: "Description 2",
                cta: {
                  label: "CTA 2",
                  link: "#",
                  linkType: "URL",
                  // Missing ctaType - should be added by migration
                },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 15,
  },
  {
    name: "version 29 props with static values",
    document: { c_products: productsData, name: "Test" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary",
          textColor: "text-palette-primary-contrast",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-8c2d7066-d8e9-47d9-a420-ee89a1795ff8",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "[[name]] Products",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "right" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "ProductCardsWrapper",
            props: {
              id: "ProductCardsWrapper-4f4e925f-25cd-4615-b0d3-7b5a21a410dd",
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [
                  { id: "ProductCard-default-1" },
                  { id: "ProductCard-default-2" },
                  { id: "ProductCard-default-3" },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-162401b8-f4e1-4f73-9d40-fb1299951a1e",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/640x360",
                                    height: 360,
                                    width: 640,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { aspectRatio: 1.78, width: 640 },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-6b5b8525-036d-43ea-ac46-cf8041fbb985",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Product Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "right" },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-5cb69e51-cb98-4393-8f10-b8f227fdf401",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: { json: "", html: "" },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-d82798ae-f766-4d2a-9b88-1d5477a573ff",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-427000eb-1c26-4321-aa55-ac7800af58c2",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "primary" },
                            },
                          },
                        ],
                      },
                      id: "ProductCard-default-1",
                      conditionalRender: { category: true },
                    },
                  },
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-ba20fc94-7f82-4c36-af81-ba067eb39e71",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    alternateText: "",
                                    url: "https://placehold.co/320x180",
                                    height: 1,
                                    width: 1,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { aspectRatio: 1.78, width: 640 },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-542210cc-9fae-45ac-8792-57a71732dd95",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Product Title 2",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "right" },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-f1d33009-b6be-40d6-8289-bcc01d57d589",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: "",
                                      html: "<b>category</b>",
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-27f671db-08bd-4699-a781-40fbf7aeb3f7",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-d035c2c9-669f-49f4-912a-718e22f71222",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: {
                                      en: "Learn More 2",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "primary" },
                            },
                          },
                        ],
                      },
                      id: "ProductCard-default-2",
                      conditionalRender: { category: true },
                    },
                  },
                  {
                    type: "ProductCard",
                    props: {
                      id: "ProductCard-default-3",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-1edadda8-6f4a-4296-a838-0ba5bfcc8779",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/640x360",
                                    height: 360,
                                    width: 640,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { aspectRatio: 1.78, width: 640 },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-64578b7c-3b3a-4a1b-b9a8-b7854a78ab08",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Product Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "right" },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-8c612aa1-c657-4dcc-b695-4df24dd6cd17",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Category, Pricing, etc","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Category, Pricing, etc</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-157ee96e-7fb1-45b0-8029-3978eada840b",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-d206c297-d93c-4f36-a093-4ef152f23f93",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "primary" },
                            },
                          },
                        ],
                      },
                      conditionalRender: { category: true },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      analytics: { scope: "productsSection" },
      liveVisibility: true,
    },
    version: 29,
  },
  {
    name: "version 29 props with entity values",
    document: { c_products: productsData, name: "Product Section" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-c4a5497b-e4cf-4103-ae10-4504a3d43a8e",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Products",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 4, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "ProductCardsWrapper",
            props: {
              id: "ProductCardsWrapper-4dced17d-3c2c-4286-b1a2-3ec17dc3cbcc",
              data: {
                field: "c_products",
                constantValueEnabled: false,
                constantValue: [
                  { id: "ProductCard-default-1" },
                  { id: "ProductCard-default-2" },
                  { id: "ProductCard-default-3" },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-secondary-dark",
                          textColor: "text-white",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-8aa155d3-8798-4dd3-8e20-2d72c37adce3",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/640x360",
                                    height: 360,
                                    width: 640,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { aspectRatio: 1.78, width: 640 },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-853d43a0-bbbf-4479-876a-5e86d064b811",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Product Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 5, align: "left" },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-c9e40d05-a957-4c7f-b2e3-92b1d8bbf082",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Category, Pricing, etc","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Category, Pricing, etc</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-039baccd-ac55-4bb2-9042-b344968d9166",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-cd6d5587-c989-4479-9150-4484c241a983",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "link" },
                            },
                          },
                        ],
                      },
                      id: "ProductCard-default-1",
                      conditionalRender: { category: true },
                    },
                  },
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-secondary-dark",
                          textColor: "text-white",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-12f16c06-b4ef-45fa-af06-364eeb6cb6e0",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/640x360",
                                    height: 360,
                                    width: 640,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { aspectRatio: 1.78, width: 640 },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-17d2f581-1b33-42e1-99f9-e62afc00ecf2",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Product Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 5, align: "left" },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-b4bb04e3-9de2-4dac-8f9a-f6644daea928",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Category, Pricing, etc","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Category, Pricing, etc</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-8afec621-27e3-43ac-b969-4d9bffb465e9",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-6afb3bcb-7b71-4400-9e03-700b707ec567",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "link" },
                            },
                          },
                        ],
                      },
                      id: "ProductCard-default-2",
                      conditionalRender: { category: true },
                    },
                  },
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-secondary-dark",
                          textColor: "text-white",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-94068217-7af3-4916-97f3-84f4d2f9460f",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/640x360",
                                    height: 360,
                                    width: 640,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { aspectRatio: 1.78, width: 640 },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-11974e85-81ff-4bc0-ad2e-da3ad209e2ae",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Product Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 5, align: "left" },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-a15b1219-a6de-47ee-a44e-c6df469d5bd2",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Category, Pricing, etc","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Category, Pricing, etc</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-fbe67f9f-022e-4602-83e6-debe14b4da80",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-4a8a10ff-241e-401d-9749-2691361483d2",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "link" },
                            },
                          },
                        ],
                      },
                      id: "ProductCard-default-3",
                      conditionalRender: { category: true },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      analytics: { scope: "productsSection" },
      liveVisibility: true,
    },
    version: 29,
  },
];

describe("ProductSection", async () => {
  const puckConfig: Config = {
    components: { ProductSection, ...SlotsCategoryComponents },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      document,
      name,
      props,
      interactions,
      version,
      viewport: { width, height, name: viewportName },
    }) => {
      const data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "ProductSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      const updatedData = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render
            config={puckConfig}
            data={updatedData}
            metadata={{ streamDocument: document }}
          />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(
        `ProductSection/[${viewportName}] ${name}`
      ).toMatchScreenshot({ useFullPage: true });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `ProductSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({ useFullPage: true });
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
