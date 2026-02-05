import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import { ProductSection } from "./ProductSection.tsx";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
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

const version59Props = {
  styles: {
    backgroundColor: {
      bgColor: "bg-palette-primary-light",
      textColor: "text-black",
    },
    cardVariant: "immersive",
    showSectionHeading: false,
  },
  slots: {
    SectionHeadingSlot: [
      {
        type: "HeadingTextSlot",
        props: {
          id: "HeadingTextSlot-7714726b-bde2-4143-a31d-e4f1c905c262",
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
          styles: {
            level: 2,
            align: "left",
          },
        },
      },
    ],
    CardsWrapperSlot: [
      {
        type: "ProductCardsWrapper",
        props: {
          id: "ProductCardsWrapper-9e683b11-b47a-4659-9b91-a28a5fd9ac18",
          data: {
            field: "",
            constantValueEnabled: true,
            constantValue: [
              {
                id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d",
              },
              {
                id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9",
              },
              {
                id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b",
              },
            ],
          },
          styles: {
            showImage: true,
            showBrow: true,
            showTitle: true,
            showPrice: true,
            showDescription: true,
            showCTA: true,
          },
          slots: {
            CardSlot: [
              {
                type: "ProductCard",
                props: {
                  id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d",
                  index: 0,
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
                          id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d-image",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                width: 640,
                                height: 360,
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            aspectRatio: 1.78,
                            width: 640,
                            imageConstrain: "fill",
                          },
                          sizes: {
                            base: "calc(100vw - 32px)",
                            md: "calc((maxWidth - 32px) / 2)",
                            lg: "calc((maxWidth - 32px) / 3)",
                          },
                          showImageConstrain: false,
                          hideWidthProp: true,
                        },
                      },
                    ],
                    BrowSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d-brow",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Category","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700 !important; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Category</strong></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "sm",
                          },
                        },
                      },
                    ],
                    TitleSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d-title",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Product Name",
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            level: 3,
                            align: "left",
                            semanticLevelOverride: 3,
                          },
                        },
                      },
                    ],
                    PriceSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d-price",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$123.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700 !important; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$123.00</strong></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "base",
                          },
                        },
                      },
                    ],
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d-description",
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
                          styles: {
                            variant: "base",
                          },
                        },
                      },
                    ],
                    CTASlot: [
                      {
                        type: "CTASlot",
                        props: {
                          id: "ProductCard-53e2a6bb-f03e-4dde-8557-39ee3851e46d-cta",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Learn More",
                                  hasLocalizedValue: "true",
                                },
                                link: "#",
                                linkType: "URL",
                                ctaType: "textAndLink",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "secondary",
                            presetImage: "app-store",
                          },
                          eventName: "cta0",
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    price: true,
                    brow: true,
                    description: true,
                    cta: true,
                  },
                  imageStyles: {
                    aspectRatio: 1.78,
                    width: 640,
                  },
                  parentStyles: {
                    showImage: true,
                    showBrow: true,
                    showTitle: true,
                    showPrice: true,
                    showDescription: true,
                    showCTA: true,
                  },
                },
              },
              {
                type: "ProductCard",
                props: {
                  id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9",
                  index: 1,
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
                          id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9-image",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                width: 640,
                                height: 360,
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            aspectRatio: 1.78,
                            width: 640,
                            imageConstrain: "fill",
                          },
                          sizes: {
                            base: "calc(100vw - 32px)",
                            md: "calc((maxWidth - 32px) / 2)",
                            lg: "calc((maxWidth - 32px) / 3)",
                          },
                          showImageConstrain: false,
                          hideWidthProp: true,
                        },
                      },
                    ],
                    BrowSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9-brow",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Category","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700 !important; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Category</strong></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "sm",
                          },
                        },
                      },
                    ],
                    TitleSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9-title",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Product Name",
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            level: 3,
                            align: "left",
                            semanticLevelOverride: 3,
                          },
                        },
                      },
                    ],
                    PriceSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9-price",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$123.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700 !important; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$123.00</strong></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "base",
                          },
                        },
                      },
                    ],
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9-description",
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
                          styles: {
                            variant: "base",
                          },
                        },
                      },
                    ],
                    CTASlot: [
                      {
                        type: "CTASlot",
                        props: {
                          id: "ProductCard-e04a7b8e-e139-47ec-9d98-e9585a30d0f9-cta",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Learn More",
                                  hasLocalizedValue: "true",
                                },
                                link: "#",
                                linkType: "URL",
                                ctaType: "textAndLink",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "secondary",
                            presetImage: "app-store",
                          },
                          eventName: "cta1",
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    price: true,
                    brow: true,
                    description: true,
                    cta: true,
                  },
                  imageStyles: {
                    aspectRatio: 1.78,
                    width: 640,
                  },
                  parentStyles: {
                    showImage: true,
                    showBrow: true,
                    showTitle: true,
                    showPrice: true,
                    showDescription: true,
                    showCTA: true,
                  },
                },
              },
              {
                type: "ProductCard",
                props: {
                  id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b",
                  index: 2,
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
                          id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b-image",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                width: 640,
                                height: 360,
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            aspectRatio: 1.78,
                            width: 640,
                            imageConstrain: "fill",
                          },
                          sizes: {
                            base: "calc(100vw - 32px)",
                            md: "calc((maxWidth - 32px) / 2)",
                            lg: "calc((maxWidth - 32px) / 3)",
                          },
                          showImageConstrain: false,
                          hideWidthProp: true,
                        },
                      },
                    ],
                    BrowSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b-brow",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Category","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700 !important; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Category</strong></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "sm",
                          },
                        },
                      },
                    ],
                    TitleSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b-title",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Product Name",
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            level: 3,
                            align: "left",
                            semanticLevelOverride: 3,
                          },
                        },
                      },
                    ],
                    PriceSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b-price",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$123.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700 !important; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$123.00</strong></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "base",
                          },
                        },
                      },
                    ],
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b-description",
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
                          styles: {
                            variant: "base",
                          },
                        },
                      },
                    ],
                    CTASlot: [
                      {
                        type: "CTASlot",
                        props: {
                          id: "ProductCard-db5a8fe5-e985-41f7-a418-d0fae29a4f5b-cta",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Learn More",
                                  hasLocalizedValue: "true",
                                },
                                link: "#",
                                linkType: "URL",
                                ctaType: "textAndLink",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "secondary",
                            presetImage: "app-store",
                          },
                          eventName: "cta2",
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    price: true,
                    brow: true,
                    description: true,
                    cta: true,
                  },
                  imageStyles: {
                    aspectRatio: 1.78,
                    width: 640,
                  },
                  parentStyles: {
                    showImage: true,
                    showBrow: true,
                    showTitle: true,
                    showPrice: true,
                    showDescription: true,
                    showCTA: true,
                  },
                },
              },
            ],
          },
        },
      },
    ],
  },
  analytics: {
    scope: "productsSection",
  },
  liveVisibility: true,
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
    name: "version 32 props with static values",
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
    version: 32,
  },
  {
    name: "version 32 props with entity values",
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
    version: 32,
  },
  {
    name: "version 54 - products with immersive variant",
    document: productsData,
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-background-2",
          textColor: "text-foreground",
        },
        cardVariant: "immersive",
        showImage: true,
        showBrow: true,
        showTitle: true,
        showPrice: true,
        showDescription: true,
        showCTA: true,
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Immersive Variant",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "ProductCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [{}],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-background-1",
                          textColor: "text-foreground",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
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
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                                imageConstrain: "fill",
                              },
                            },
                          },
                        ],
                        BrowSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Brow Text","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Brow Text</strong></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "sm" },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "left" },
                            },
                          },
                        ],
                        PriceSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$10.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$10.00</strong></p>',
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
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Description","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Description</span></p>',
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
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "CTA",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "secondary",
                                presetImage: "app-store",
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
          },
        ],
      },
      analytics: { scope: "productsSection" },
      liveVisibility: true,
    },
    version: 54,
  },
  {
    name: "version 54 - products with classic variant",
    document: productsData,
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-background-2",
          textColor: "text-foreground",
        },
        cardVariant: "classic",
        showImage: true,
        showBrow: true,
        showTitle: true,
        showPrice: true,
        showDescription: true,
        showCTA: true,
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Classic Variant",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "ProductCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [{}],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-background-1",
                          textColor: "text-foreground",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
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
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                                imageConstrain: "fill",
                              },
                            },
                          },
                        ],
                        BrowSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Brow Text","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Brow Text</strong></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "sm" },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "left" },
                            },
                          },
                        ],
                        PriceSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$10.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$10.00</strong></p>',
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
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Description","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Description</span></p>',
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
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "CTA",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "secondary",
                                presetImage: "app-store",
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
          },
        ],
      },
      analytics: { scope: "productsSection" },
      liveVisibility: true,
    },
    version: 54,
  },
  {
    name: "version 54 - products with classic variant - tall images",
    document: productsData,
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-background-2",
          textColor: "text-foreground",
        },
        cardVariant: "classic",
        showImage: true,
        showBrow: true,
        showTitle: true,
        showPrice: true,
        showDescription: true,
        showCTA: true,
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Classic Variant",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "ProductCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [{}],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-background-1",
                          textColor: "text-foreground",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
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
                              styles: {
                                aspectRatio: 0.5,
                                width: 640,
                                imageConstrain: "fill",
                              },
                            },
                          },
                        ],
                        BrowSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Brow Text","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Brow Text</strong></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "sm" },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "left" },
                            },
                          },
                        ],
                        PriceSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$10.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$10.00</strong></p>',
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
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Description","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Description</span></p>',
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
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "CTA",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "secondary",
                                presetImage: "app-store",
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
          },
        ],
      },
      analytics: { scope: "productsSection" },
      liveVisibility: true,
    },
    version: 54,
  },
  {
    name: "version 54 - products with classic variant - short images",
    document: productsData,
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-background-2",
          textColor: "text-foreground",
        },
        cardVariant: "classic",
        showImage: true,
        showBrow: true,
        showTitle: true,
        showPrice: true,
        showDescription: true,
        showCTA: true,
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Classic Variant",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "ProductCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [{}],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-background-1",
                          textColor: "text-foreground",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
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
                              styles: {
                                aspectRatio: 1,
                                width: 64,
                                imageConstrain: "fill",
                              },
                            },
                          },
                        ],
                        BrowSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Brow Text","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Brow Text</strong></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "sm" },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "left" },
                            },
                          },
                        ],
                        PriceSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$10.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$10.00</strong></p>',
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
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Description","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Description</span></p>',
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
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "CTA",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "secondary",
                                presetImage: "app-store",
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
          },
        ],
      },
      analytics: { scope: "productsSection" },
      liveVisibility: true,
    },
    version: 54,
  },
  {
    name: "version 54 - products with minimal variant",
    document: productsData,
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-background-2",
          textColor: "text-foreground",
        },
        cardVariant: "minimal",
        showImage: true,
        showBrow: true,
        showTitle: true,
        showPrice: true,
        showDescription: true,
        showCTA: true,
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Minimal Variant",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "ProductCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [{}],
              },
              slots: {
                CardSlot: [
                  {
                    type: "ProductCard",
                    props: {
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-background-1",
                          textColor: "text-foreground",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
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
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                                imageConstrain: "fill",
                              },
                            },
                          },
                        ],
                        BrowSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Brow Text","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>Brow Text</strong></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "sm" },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Title",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { level: 3, align: "left" },
                            },
                          },
                        ],
                        PriceSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"$10.00","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 700; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><strong>$10.00</strong></p>',
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
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Description","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Description</span></p>',
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
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "CTA",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "secondary",
                                presetImage: "app-store",
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
          },
        ],
      },
      analytics: { scope: "productsSection" },
      liveVisibility: true,
    },
    version: 54,
  },
  {
    name: "[immersive] version 59 with showSectionHeading, showImage false",
    document: productsData,
    props: {
      ...version59Props,
      styles: {
        ...version59Props.styles,
        showSectionHeading: false,
      },
      slots: {
        ...version59Props.slots,
        CardsWrapperSlot: [
          {
            ...version59Props.slots.CardsWrapperSlot?.[0],
            props: {
              ...version59Props.slots.CardsWrapperSlot?.[0].props,
              styles: {
                ...version59Props.slots.CardsWrapperSlot?.[0].props.styles,
                showImage: false,
              },
            },
          },
        ],
      },
    },
    version: 59,
  },
  {
    name: "[minimal] version 59 with showCTA, showBrow, showTitle false",
    document: productsData,
    props: {
      ...version59Props,
      styles: {
        ...version59Props.styles,
        cardVariant: "minimal",
      },
      slots: {
        ...version59Props.slots,
        CardsWrapperSlot: [
          {
            ...version59Props.slots.CardsWrapperSlot?.[0],
            props: {
              ...version59Props.slots.CardsWrapperSlot?.[0].props,
              styles: {
                ...version59Props.slots.CardsWrapperSlot?.[0].props.styles,
                showCTA: false,
                showBrow: false,
                showTitle: false,
              },
            },
          },
        ],
      },
    },
    version: 59,
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
      ).toMatchScreenshot({ customThreshold: 10 });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `ProductSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({ customThreshold: 10 });
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
