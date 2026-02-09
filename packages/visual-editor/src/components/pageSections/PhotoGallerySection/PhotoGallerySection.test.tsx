import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import { PhotoGallerySection } from "./PhotoGallerySection.tsx";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory.tsx";
import { Render, Config } from "@puckeditor/core";
import { page } from "@vitest/browser/context";

const photoGalleryData = [
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
  },
  {
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
  },
  {
    image: {
      height: 2048,
      thumbnails: [
        {
          height: 2048,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
          width: 2048,
        },
        {
          height: 1900,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/1900x1900.jpg",
          width: 1900,
        },
        {
          height: 619,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/619x619.jpg",
          width: 619,
        },
        {
          height: 450,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/450x450.jpg",
          width: 450,
        },
        {
          height: 196,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/196x196.jpg",
          width: 196,
        },
      ],
      url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
      width: 2048,
    },
  },
  {
    image: {
      height: 2048,
      thumbnails: [
        {
          height: 2048,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/2048x2048.jpg",
          width: 2048,
        },
        {
          height: 1900,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/1900x1900.jpg",
          width: 1900,
        },
        {
          height: 619,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/619x619.jpg",
          width: 619,
        },
        {
          height: 450,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/450x450.jpg",
          width: 450,
        },
        {
          height: 196,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/196x196.jpg",
          width: 196,
        },
      ],
      url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/2048x2048.jpg",
      width: 2048,
    },
  },
];

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...PhotoGallerySection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { photoGallery: photoGalleryData },
    props: { ...PhotoGallerySection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { photoGallery: photoGalleryData, name: "Test Name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
      },
      sectionHeading: {
        text: {
          field: "name",
          constantValue: "Gallery",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        level: 2,
      },
      images: {
        images: {
          field: "photoGallery",
          constantValue: [
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
          ],
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        imageStyle: {
          layout: "auto",
          height: 570,
          width: 1000,
          aspectRatio: 1.25,
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { photoGallery: photoGalleryData },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
      },
      sectionHeading: {
        text: {
          field: "name",
          constantValue: "Gallery",
          constantValueEnabled: true,
        },
        level: 5,
      },
      images: {
        images: {
          field: "photoGallery",
          constantValue: [
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
          ],
          constantValueEnabled: true,
        },
        imageStyle: {
          layout: "fixed",
          height: 50,
          width: 50,
          aspectRatio: 1.25,
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 1 props with entity values",
    document: { photoGallery: photoGalleryData, name: "Test Name" },
    props: {
      data: {
        heading: {
          constantValue: "Gallery",
          constantValueEnabled: false,
          constantValueOverride: {},
          field: "name",
        },
        images: {
          constantValue: [
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
          ],
          constantValueEnabled: false,
          constantValueOverride: {},
          field: "photoGallery",
        },
      },
      liveVisibility: true,
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        headingLevel: 2,
        imageStyle: {
          aspectRatio: 1.25,
          height: 570,
          layout: "auto",
          width: 1000,
        },
      },
    },
    version: 1,
  },
  {
    name: "version 1 props with constant value",
    document: { photoGallery: photoGalleryData },
    props: {
      data: {
        heading: {
          constantValue: "Gallery",
          constantValueEnabled: true,
          field: "name",
        },
        images: {
          constantValue: [
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
          ],
          constantValueEnabled: true,
          field: "photoGallery",
        },
      },
      liveVisibility: true,
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 5,
        imageStyle: {
          aspectRatio: 1.25,
          height: 50,
          layout: "fixed",
          width: 50,
        },
      },
    },
    version: 1,
  },
  {
    name: "version 38 props with entity values",
    document: { photoGallery: photoGalleryData, name: "Test Name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "name",
                  constantValue: "Gallery",
                  constantValueEnabled: false,
                },
              },
              styles: {
                level: 2,
                align: "left",
              },
            },
          },
        ],
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              data: {
                images: {
                  field: "photoGallery",
                  constantValue: [],
                  constantValueEnabled: false,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.25,
                  width: 1000,
                },
              },
            },
          },
        ],
      },
      liveVisibility: true,
    },
    version: 38,
  },
  {
    name: "version 38 props with constant value",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: "Gallery Slots",
                  constantValueEnabled: true,
                },
              },
              styles: {
                level: 5,
                align: "left",
              },
            },
          },
        ],
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              data: {
                images: {
                  field: "photoGallery",
                  constantValue: [
                    {
                      height: 570,
                      url: "https://placehold.co/1000x570/png",
                      width: 1000,
                    },
                    {
                      height: 570,
                      url: "https://placehold.co/1000x570/png",
                      width: 1000,
                    },
                    {
                      height: 570,
                      url: "https://placehold.co/1000x570/png",
                      width: 1000,
                    },
                  ],
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.25,
                  width: 1000,
                },
              },
            },
          },
        ],
      },
      liveVisibility: true,
    },
    version: 38,
  },
  {
    name: "version 50 props with localized constant values",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-3c58d37f-7f1d-46ad-8938-e72ac3013b39",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Gallery",
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
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              id: "PhotoGalleryWrapper-96ee4ed8-d5f7-451a-ac90-8657c4526c42",
              data: {
                images: {
                  field: "",
                  constantValue: [
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        es: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                        width: 1000,
                        height: 570,
                        assetImage: {
                          name: "Placeholder",
                        },
                      },
                    },
                  ],
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.78,
                },
              },
            },
          },
        ],
      },
      liveVisibility: true,
      id: "PhotoGallerySection-c8c122c3-2493-449b-a399-9f36a3372fed",
    },
    version: 50,
  },
  {
    name: "version 53 gallery variant with 3 images",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        variant: "gallery",
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-3c58d37f-7f1d-46ad-8938-e72ac3013b39",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Gallery",
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
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              id: "PhotoGalleryWrapper-96ee4ed8-d5f7-451a-ac90-8657c4526c42",
              data: {
                images: {
                  field: "",
                  constantValue: [
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        es: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                        width: 1000,
                        height: 570,
                        assetImage: {
                          name: "Placeholder",
                        },
                      },
                    },
                  ],
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.78,
                },
                carouselImageCount: 1,
              },
              parentData: {
                variant: "gallery",
              },
            },
          },
        ],
      },
      liveVisibility: true,
      id: "PhotoGallerySection-c8c122c3-2493-449b-a399-9f36a3372fed",
    },
    version: 53,
  },
  {
    name: "version 53 gallery variant with 1 image",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        variant: "gallery",
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-3c58d37f-7f1d-46ad-8938-e72ac3013b39",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Gallery",
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
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              id: "PhotoGalleryWrapper-96ee4ed8-d5f7-451a-ac90-8657c4526c42",
              data: {
                images: {
                  field: "",
                  constantValue: [
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                  ],
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.78,
                },
                carouselImageCount: 1,
              },
              parentData: {
                variant: "gallery",
              },
            },
          },
        ],
      },
      liveVisibility: true,
      id: "PhotoGallerySection-c8c122c3-2493-449b-a399-9f36a3372fed",
    },
    version: 53,
  },
  {
    name: "version 53 carousel variant with carouselImageCount 1",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        variant: "carousel",
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-3c58d37f-7f1d-46ad-8938-e72ac3013b39",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Gallery",
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
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              id: "PhotoGalleryWrapper-96ee4ed8-d5f7-451a-ac90-8657c4526c42",
              data: {
                images: {
                  field: "",
                  constantValue: [
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                        width: 1000,
                        height: 570,
                        assetImage: {
                          name: "Placeholder",
                        },
                      },
                    },
                  ],
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.78,
                },
                carouselImageCount: 1,
              },
              parentData: {
                variant: "carousel",
              },
            },
          },
        ],
      },
      liveVisibility: true,
      id: "PhotoGallerySection-c8c122c3-2493-449b-a399-9f36a3372fed",
    },
    version: 53,
  },
  {
    name: "version 53 carousel variant with carouselImageCount 2",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        variant: "carousel",
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-3c58d37f-7f1d-46ad-8938-e72ac3013b39",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Gallery",
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
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              id: "PhotoGalleryWrapper-96ee4ed8-d5f7-451a-ac90-8657c4526c42",
              data: {
                images: {
                  field: "",
                  constantValue: [
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                        width: 1000,
                        height: 570,
                        assetImage: {
                          name: "Placeholder",
                        },
                      },
                    },
                  ],
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.78,
                },
                carouselImageCount: 2,
              },
              parentData: {
                variant: "carousel",
              },
            },
          },
        ],
      },
      liveVisibility: true,
      id: "PhotoGallerySection-c8c122c3-2493-449b-a399-9f36a3372fed",
    },
    version: 53,
  },
  {
    name: "version 53 carousel variant with carouselImageCount 3",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        variant: "carousel",
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-3c58d37f-7f1d-46ad-8938-e72ac3013b39",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Gallery",
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
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              id: "PhotoGalleryWrapper-96ee4ed8-d5f7-451a-ac90-8657c4526c42",
              data: {
                images: {
                  field: "",
                  constantValue: [
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        en: {
                          alternateText: "",
                          url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                          height: 1,
                          width: 1,
                        },
                        hasLocalizedValue: "true",
                      },
                    },
                    {
                      assetImage: {
                        url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=570&width=1000&fit=max",
                        width: 1000,
                        height: 570,
                        assetImage: {
                          name: "Placeholder",
                        },
                      },
                    },
                  ],
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.78,
                },
                carouselImageCount: 3,
              },
              parentData: {
                variant: "carousel",
              },
            },
          },
        ],
      },
      liveVisibility: true,
      id: "PhotoGallerySection-c8c122c3-2493-449b-a399-9f36a3372fed",
    },
    version: 53,
  },
  {
    name: "version 59 with showSectionHeading false",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        variant: "gallery",
        showSectionHeading: false,
      },
      slots: {
        PhotoGalleryWrapper: [
          {
            type: "PhotoGalleryWrapper",
            props: {
              data: {
                images: {
                  field: "",
                  constantValue: photoGalleryData,
                  constantValueEnabled: true,
                },
              },
              styles: {
                image: {
                  aspectRatio: 1.78,
                },
              },
            },
          },
        ],
      },
      liveVisibility: true,
    },
    version: 59,
  },
];

describe("PhotoGallerySection", async () => {
  const puckConfig: Config = {
    components: { PhotoGallerySection, ...SlotsCategoryComponents },
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
              type: "PhotoGallerySection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        if (data.content[0].props.styles?.variant === "gallery") {
          expect(images.every((i) => i.complete)).toBe(true);
        } else {
          const imagesPerSlide =
            data.content[0].props.slots?.PhotoGalleryWrapper[0].props.styles
              ?.carouselImageCount ?? 1;
          expect(images.slice(0, imagesPerSlide).every((i) => i.complete)).toBe(
            true
          );
        }
      });

      await expect(
        `PhotoGallerySection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `PhotoGallerySection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
