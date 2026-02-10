import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { act, render as reactRender, waitFor } from "@testing-library/react";
import { BannerSection } from "../pageSections/Banner.tsx";
import { ExpandedHeader } from "./ExpandedHeader.tsx";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../migrations/migrationRegistry.ts";
import { SlotsCategoryComponents } from "../categories/SlotsCategory.tsx";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page, type BrowserPage } from "@vitest/browser/context";
import { defaultBannerProps } from "../pageSections/Banner.tsx";

const clickMenuIfVisible = async (page: BrowserPage) => {
  const menuButton = page.getByLabelText("Open menu");
  const menuElement = menuButton.query() as HTMLElement | null;
  const isVisible =
    !!menuElement &&
    menuElement.getClientRects().length > 0 &&
    window.getComputedStyle(menuElement).visibility !== "hidden";

  if (isVisible) {
    await act(async () => {
      await menuButton.click();
      await delay(1000); // wait for menu animation
    });
  }
};

const tests: ComponentTest[] = [
  {
    name: "default props",
    document: {},
    props: { ...ExpandedHeader.defaultProps },
    version: migrationRegistry.length,
    interactions: async (page) => {
      await clickMenuIfVisible(page);
    },
  },
  {
    name: "version 51 - default props",
    document: {},
    version: 51,
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-70f753c1-8d01-4a2b-83bf-d71940d9240e",
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "ImageSlot-ed9031f7-9558-4f9f-b4ff-6a34fe5d5e6c",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 1,
                        width: 100,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-5bdf0f71-4dbc-4a47-b871-7ab1913ba6b4",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-398461a7-5ffd-4f09-82d0-ed9b3a1b3c91",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                            ctaType: "textAndLink",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        variant: "primary",
                        presetImage: "app-store",
                      },
                      eventName: "primaryCta",
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-7a346368-1917-457b-aa51-e2156cadb8e4",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
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
                      eventName: "secondaryCta",
                    },
                  },
                ],
              },
              parentValues: {
                maxWidth: "theme",
                SecondaryHeaderSlot: [
                  {
                    type: "SecondaryHeaderSlot",
                    props: {
                      id: "SecondaryHeaderSlot-534a7a74-9e98-4b18-b04d-d882afba2525",
                      data: {
                        show: true,
                        showLanguageDropdown: false,
                      },
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        LinksSlot: [
                          {
                            type: "HeaderLinks",
                            props: {
                              id: "HeaderLinks-9f78ac1e-d274-4dd6-84d3-61d4430464fd",
                              data: {
                                links: [
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                ],
                              },
                              parentData: {
                                type: "Secondary",
                              },
                            },
                          },
                        ],
                      },
                      parentStyles: {
                        maxWidth: "theme",
                      },
                    },
                  },
                ],
              },
              conditionalRender: {
                navContent: true,
                CTAs: true,
                hasLogoImage: true,
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              id: "SecondaryHeaderSlot-534a7a74-9e98-4b18-b04d-d882afba2525",
              data: {
                show: true,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-9f78ac1e-d274-4dd6-84d3-61d4430464fd",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Secondary",
                      },
                    },
                  },
                ],
              },
              parentStyles: {
                maxWidth: "theme",
              },
            },
          },
        ],
      },
      analytics: {
        scope: "expandedHeader",
      },
      id: "ExpandedHeader-7f0d9f16-d898-4cc2-807c-09a2cc27b2e9",
      ignoreLocaleWarning: [],
    },
  },
  {
    name: "version 51 - primary header only",
    document: {},
    version: 51,
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-70f753c1-8d01-4a2b-83bf-d71940d9240e",
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-dark",
                  textColor: "text-white",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "ImageSlot-ed9031f7-9558-4f9f-b4ff-6a34fe5d5e6c",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 2,
                        width: 200,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-5bdf0f71-4dbc-4a47-b871-7ab1913ba6b4",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header 1",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header 2",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header 3",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: true,
                          },
                        ],
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-398461a7-5ffd-4f09-82d0-ed9b3a1b3c91",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
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
                      eventName: "primaryCta",
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-7a346368-1917-457b-aa51-e2156cadb8e4",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                            ctaType: "presetImage",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        variant: "secondary",
                        presetImage: "google-play",
                      },
                      eventName: "secondaryCta",
                    },
                  },
                ],
              },
              parentValues: {
                maxWidth: "theme",
                SecondaryHeaderSlot: [
                  {
                    type: "SecondaryHeaderSlot",
                    props: {
                      id: "SecondaryHeaderSlot-534a7a74-9e98-4b18-b04d-d882afba2525",
                      data: {
                        show: true,
                        showLanguageDropdown: false,
                      },
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        LinksSlot: [
                          {
                            type: "HeaderLinks",
                            props: {
                              id: "HeaderLinks-9f78ac1e-d274-4dd6-84d3-61d4430464fd",
                              data: {
                                links: [
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Secondary Header 1",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                ],
                              },
                              parentData: {
                                type: "Secondary",
                              },
                            },
                          },
                        ],
                      },
                      parentStyles: {
                        maxWidth: "theme",
                      },
                    },
                  },
                ],
              },
              conditionalRender: {
                navContent: true,
                CTAs: true,
                hasLogoImage: true,
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              id: "SecondaryHeaderSlot-534a7a74-9e98-4b18-b04d-d882afba2525",
              data: {
                show: false,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-9f78ac1e-d274-4dd6-84d3-61d4430464fd",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Secondary Header 1",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Secondary",
                      },
                    },
                  },
                ],
              },
              parentStyles: {
                maxWidth: "theme",
              },
            },
          },
        ],
      },
      analytics: {
        scope: "expandedHeader",
      },
      id: "ExpandedHeader-7f0d9f16-d898-4cc2-807c-09a2cc27b2e9",
      ignoreLocaleWarning: [],
    },
  },
  {
    name: "version 51 - missing content",
    document: {},
    version: 51,
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-70f753c1-8d01-4a2b-83bf-d71940d9240e",
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-dark",
                  textColor: "text-white",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "ImageSlot-ed9031f7-9558-4f9f-b4ff-6a34fe5d5e6c",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            en: {
                              alternateText: "",
                              url: "",
                              height: 0,
                              width: 0,
                            },
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 2,
                        width: 200,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-5bdf0f71-4dbc-4a47-b871-7ab1913ba6b4",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Single Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-398461a7-5ffd-4f09-82d0-ed9b3a1b3c91",
                      data: {
                        show: false,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
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
                      eventName: "primaryCta",
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-7a346368-1917-457b-aa51-e2156cadb8e4",
                      data: {
                        show: false,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                            ctaType: "presetImage",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        variant: "secondary",
                        presetImage: "google-play",
                      },
                      eventName: "secondaryCta",
                    },
                  },
                ],
              },
              parentValues: {
                maxWidth: "theme",
                SecondaryHeaderSlot: [
                  {
                    type: "SecondaryHeaderSlot",
                    props: {
                      id: "SecondaryHeaderSlot-534a7a74-9e98-4b18-b04d-d882afba2525",
                      data: {
                        show: true,
                        showLanguageDropdown: false,
                      },
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        LinksSlot: [
                          {
                            type: "HeaderLinks",
                            props: {
                              id: "HeaderLinks-9f78ac1e-d274-4dd6-84d3-61d4430464fd",
                              data: {
                                links: [
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Secondary Header 1",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                ],
                              },
                              parentData: {
                                type: "Secondary",
                              },
                            },
                          },
                        ],
                      },
                      parentStyles: {
                        maxWidth: "theme",
                      },
                    },
                  },
                ],
              },
              conditionalRender: {
                navContent: true,
                CTAs: true,
                hasLogoImage: true,
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              id: "SecondaryHeaderSlot-534a7a74-9e98-4b18-b04d-d882afba2525",
              data: {
                show: false,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-9f78ac1e-d274-4dd6-84d3-61d4430464fd",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Secondary Header 1",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Secondary",
                      },
                    },
                  },
                ],
              },
              parentStyles: {
                maxWidth: "theme",
              },
            },
          },
        ],
      },
      analytics: {
        scope: "expandedHeader",
      },
      id: "ExpandedHeader-7f0d9f16-d898-4cc2-807c-09a2cc27b2e9",
      ignoreLocaleWarning: [],
    },
  },
  {
    name: "version 51 - full width fixed",
    document: {},
    version: 51,
    props: {
      styles: {
        maxWidth: "fullWidth",
        headerPosition: "fixed",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-d36bbc28-ae36-4f9d-ab9c-db7401484ae7",
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "ImageSlot-86b7d3be-4ebe-48cb-80f3-525b471903b1",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 1,
                        width: 100,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-82da829b-e0b1-4933-bdfd-734f921006f0",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-a6866ab7-d85a-4a73-8689-9c3241bf4dfc",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                            ctaType: "textAndLink",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        variant: "primary",
                        presetImage: "app-store",
                      },
                      eventName: "primaryCta",
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-44fe09bb-6f80-4497-90fa-4dcb4023fde7",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
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
                      eventName: "secondaryCta",
                    },
                  },
                ],
              },
              parentValues: {
                maxWidth: "fullWidth",
                SecondaryHeaderSlot: [
                  {
                    type: "SecondaryHeaderSlot",
                    props: {
                      id: "SecondaryHeaderSlot-037aec8e-d6ff-4548-9f48-8ba6532d0b4f",
                      data: {
                        show: true,
                        showLanguageDropdown: false,
                      },
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-quaternary",
                          textColor: "text-palette-quaternary-contrast",
                        },
                      },
                      slots: {
                        LinksSlot: [
                          {
                            type: "HeaderLinks",
                            props: {
                              id: "HeaderLinks-a6ec7c1d-8b2b-482b-a14b-140bf8150de0",
                              data: {
                                links: [
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                ],
                              },
                              parentData: {
                                type: "Secondary",
                              },
                            },
                          },
                        ],
                      },
                      parentStyles: {
                        maxWidth: "fullWidth",
                      },
                    },
                  },
                ],
              },
              conditionalRender: {
                navContent: true,
                CTAs: true,
                hasLogoImage: true,
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              id: "SecondaryHeaderSlot-037aec8e-d6ff-4548-9f48-8ba6532d0b4f",
              data: {
                show: true,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-quaternary",
                  textColor: "text-palette-quaternary-contrast",
                },
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-a6ec7c1d-8b2b-482b-a14b-140bf8150de0",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Secondary",
                      },
                    },
                  },
                ],
              },
              parentStyles: {
                maxWidth: "fullWidth",
              },
            },
          },
        ],
      },
      analytics: {
        scope: "expandedHeader",
      },
      id: "ExpandedHeader-9239219a-05ad-443f-8860-d3938e247fa6",
      ignoreLocaleWarning: [],
    },
  },
  {
    name: "version 51 - desktop overflow",
    document: {},
    version: 51,
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-23aa0607-2a83-41cf-b36a-36a0eeb99e4c",
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "ImageSlot-9b6d313d-fa4c-4f1b-aa90-d504aea526ef",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 1,
                        width: 100,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-f903fab4-d45c-4572-9234-a4dae7d862f7",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-24ede16f-e523-45a0-9460-c2449b68fb98",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                            ctaType: "textAndLink",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        variant: "primary",
                        presetImage: "app-store",
                      },
                      eventName: "primaryCta",
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-aeaf7242-5032-4c46-9071-39a948023d18",
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
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
                      eventName: "secondaryCta",
                    },
                  },
                ],
              },
              parentValues: {
                maxWidth: "theme",
                SecondaryHeaderSlot: [
                  {
                    type: "SecondaryHeaderSlot",
                    props: {
                      id: "SecondaryHeaderSlot-e0a7f8d7-2dac-40e5-a926-cbd4f48f8bb5",
                      data: {
                        show: true,
                        showLanguageDropdown: false,
                      },
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        LinksSlot: [
                          {
                            type: "HeaderLinks",
                            props: {
                              id: "HeaderLinks-82c7d87f-c5b0-46b7-af82-a38e2a76b0b8",
                              data: {
                                links: [
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                ],
                              },
                              parentData: {
                                type: "Secondary",
                              },
                            },
                          },
                        ],
                      },
                      parentStyles: {
                        maxWidth: "theme",
                      },
                    },
                  },
                ],
              },
              conditionalRender: {
                navContent: true,
                CTAs: true,
                hasLogoImage: true,
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              id: "SecondaryHeaderSlot-e0a7f8d7-2dac-40e5-a926-cbd4f48f8bb5",
              data: {
                show: true,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-82c7d87f-c5b0-46b7-af82-a38e2a76b0b8",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link Very Long English Label For The Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link Very Long English Label For The Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link Very Long English Label For The Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link Very Long English Label For The Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link Very Long English Label For The Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link Very Long English Label For The Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      parentData: {
                        type: "Secondary",
                      },
                    },
                  },
                ],
              },
              parentStyles: {
                maxWidth: "theme",
              },
            },
          },
        ],
      },
      analytics: {
        scope: "expandedHeader",
      },
      id: "ExpandedHeader-70fb98cd-f0d2-45ed-ba5d-2baf4402b4e8",
      ignoreLocaleWarning: [],
    },
  },
  {
    name: "version 61 - with collapsed links",
    document: { locale: "en" },
    version: 61,
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-996a93fa-0573-4e85-b7d4-a0557c34de80",
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "ImageSlot-d8f45d66-bf1a-4976-be17-66297cbd1446",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 1,
                        width: 100,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-cbe2d09d-1bc3-46d6-972c-a5dee04939f9",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                        collapsedLinks: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Collapsed Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Collapsed Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      styles: {
                        align: "right",
                        variant: "sm",
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-2f4b8de7-2325-4cfd-b8d0-b658fe54b29e",
                      data: {
                        show: true,
                        actionType: "link",
                        buttonText: {
                          en: "Button",
                          hasLocalizedValue: "true",
                        },
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                            ctaType: "textAndLink",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        variant: "primary",
                        presetImage: "app-store",
                      },
                      eventName: "primaryCta",
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-b994a083-2777-4b99-b2cf-eeaa6b2ae048",
                      data: {
                        show: true,
                        actionType: "link",
                        buttonText: {
                          en: "Button",
                          hasLocalizedValue: "true",
                        },
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
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
                      eventName: "secondaryCta",
                    },
                  },
                ],
              },
              parentValues: {
                maxWidth: "theme",
                SecondaryHeaderSlot: [
                  {
                    type: "SecondaryHeaderSlot",
                    props: {
                      id: "SecondaryHeaderSlot-f4a68f18-447d-4524-8a71-ac440ddff3b0",
                      data: {
                        show: true,
                        showLanguageDropdown: false,
                      },
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        LinksSlot: [
                          {
                            type: "HeaderLinks",
                            props: {
                              id: "HeaderLinks-461c03db-1dc0-4135-9ff0-a5a5df6f8325",
                              data: {
                                links: [
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                ],
                                collapsedLinks: [],
                              },
                              styles: {
                                align: "right",
                                variant: "sm",
                              },
                              parentData: {
                                type: "Secondary",
                              },
                            },
                          },
                        ],
                      },
                      parentStyles: {
                        maxWidth: "theme",
                      },
                    },
                  },
                ],
              },
              conditionalRender: {
                navContent: true,
                CTAs: true,
                hasLogoImage: true,
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              id: "SecondaryHeaderSlot-f4a68f18-447d-4524-8a71-ac440ddff3b0",
              data: {
                show: true,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-461c03db-1dc0-4135-9ff0-a5a5df6f8325",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                        collapsedLinks: [],
                      },
                      styles: {
                        align: "right",
                        variant: "sm",
                      },
                      parentData: {
                        type: "Secondary",
                      },
                    },
                  },
                ],
              },
              parentStyles: {
                maxWidth: "theme",
              },
            },
          },
        ],
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    interactions: async (page) => {
      await clickMenuIfVisible(page);
    },
  },
  {
    name: "version 61 - with long primary links, styled links, and collapsed links",
    document: { locale: "en" },
    version: 61,
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-996a93fa-0573-4e85-b7d4-a0557c34de80",
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "ImageSlot-d8f45d66-bf1a-4976-be17-66297cbd1446",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 1,
                        width: 100,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-cbe2d09d-1bc3-46d6-972c-a5dee04939f9",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Long Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Long Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Long Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Long Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                        collapsedLinks: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Collapsed Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Collapsed Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                      },
                      styles: {
                        align: "right",
                        variant: "lg",
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-2f4b8de7-2325-4cfd-b8d0-b658fe54b29e",
                      data: {
                        show: true,
                        actionType: "link",
                        buttonText: {
                          en: "Button",
                          hasLocalizedValue: "true",
                        },
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                            ctaType: "textAndLink",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        variant: "primary",
                        presetImage: "app-store",
                      },
                      eventName: "primaryCta",
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "CTASlot-b994a083-2777-4b99-b2cf-eeaa6b2ae048",
                      data: {
                        show: true,
                        actionType: "link",
                        buttonText: {
                          en: "Button",
                          hasLocalizedValue: "true",
                        },
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
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
                      eventName: "secondaryCta",
                    },
                  },
                ],
              },
              parentValues: {
                maxWidth: "theme",
                SecondaryHeaderSlot: [
                  {
                    type: "SecondaryHeaderSlot",
                    props: {
                      id: "SecondaryHeaderSlot-f4a68f18-447d-4524-8a71-ac440ddff3b0",
                      data: {
                        show: true,
                        showLanguageDropdown: false,
                      },
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        LinksSlot: [
                          {
                            type: "HeaderLinks",
                            props: {
                              id: "HeaderLinks-461c03db-1dc0-4135-9ff0-a5a5df6f8325",
                              data: {
                                links: [
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                  {
                                    linkType: "URL",
                                    label: {
                                      en: "Header Link",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    openInNewTab: false,
                                  },
                                ],
                                collapsedLinks: [],
                              },
                              styles: {
                                align: "right",
                                variant: "sm",
                              },
                              parentData: {
                                type: "Secondary",
                              },
                            },
                          },
                        ],
                      },
                      parentStyles: {
                        maxWidth: "theme",
                      },
                    },
                  },
                ],
              },
              conditionalRender: {
                navContent: true,
                CTAs: true,
                hasLogoImage: true,
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              id: "SecondaryHeaderSlot-f4a68f18-447d-4524-8a71-ac440ddff3b0",
              data: {
                show: true,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      id: "HeaderLinks-461c03db-1dc0-4135-9ff0-a5a5df6f8325",
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            openInNewTab: false,
                          },
                        ],
                        collapsedLinks: [],
                      },
                      styles: {
                        align: "center",
                        variant: "base",
                        weight: "bold",
                        color: {
                          bgColor: "bg-palette-quaternary",
                          textColor: "text-palette-quaternary-contrast",
                        },
                      },
                      parentData: {
                        type: "Secondary",
                      },
                    },
                  },
                ],
              },
              parentStyles: {
                maxWidth: "theme",
              },
            },
          },
        ],
      },
      analytics: {
        scope: "expandedHeader",
      },
      id: "ExpandedHeader-bedfd350-33d8-494b-aa43-9001761de0f1",
    },
    interactions: async (page) => {
      await clickMenuIfVisible(page);
    },
  },
];

describe("ExpandedHeader", async () => {
  const puckConfig: Config = {
    components: { ExpandedHeader, BannerSection, ...SlotsCategoryComponents },
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
      // if the header position is fixed, render another section beneath the header
      const content =
        props.styles?.headerPosition === "fixed"
          ? [
              {
                type: "ExpandedHeader",
                props: props,
              },
              {
                type: "BannerSection",
                props: defaultBannerProps,
              },
            ]
          : [
              {
                type: "ExpandedHeader",
                props: props,
              },
            ];

      const data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: content,
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
        `ExpandedHeader/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `ExpandedHeader/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
