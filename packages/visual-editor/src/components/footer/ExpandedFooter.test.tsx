import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { SlotsCategoryComponents } from "../categories/SlotsCategory.tsx";
import { Render, Config } from "@puckeditor/core";
import { page } from "@vitest/browser/context";
import { ExpandedFooter, validPatterns } from "./ExpandedFooter.tsx";

const testLogoUrl: string = "https://placehold.co/100";

const testFooterLink = {
  linkType: "URL" as const,
  label: { en: "Footer Link", hasLocalizedValue: "true" as const },
  link: "#",
};

const testFooterLinks = [
  testFooterLink,
  testFooterLink,
  testFooterLink,
  testFooterLink,
];

const testExternalFooterLinks = [
  testFooterLink,
  { ...testFooterLink, openInNewTab: true },
  testFooterLink,
  { ...testFooterLink, openInNewTab: true },
];

const tests: ComponentTest[] = [
  {
    name: "default props",
    document: {},
    props: { ...ExpandedFooter.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 20 props - expanded full width",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: {
            url: "https://placehold.co/100",
            width: 100,
            height: 100,
            alternateText: { en: "Logo", hasLocalizedValue: "true" },
          },
          footerLinks: [
            testFooterLink,
            testFooterLink,
            testFooterLink,
            testFooterLink,
            testFooterLink,
          ],
          xLink: "https://x.com/yext",
          facebookLink: "https://facebook.com/yext",
          instagramLink: "https://instagram.com/yext",
          pinterestLink: "https://pinterest.com/yext",
          linkedInLink: "https://linkedin.com/in/yext",
          youtubeLink: "https://youtube.com/c/yext",
          tiktokLink: "https://tiktok.com/@yext",
          utilityImages: [
            {
              image: {
                url: "https://placehold.co/20",
                width: 20,
                height: 20,
                alternateText: {
                  en: "Placeholder 1",
                  hasLocalizedValue: "true",
                },
              },
              linkTarget: "https://yext.com",
            },
            {
              image: {
                url: "https://placehold.co/50x20",
                width: 50,
                height: 20,
                alternateText: {
                  hasLocalizedValue: "true",
                },
              },
            },
          ],
          expandedFooter: true,
          expandedFooterLinks: [
            {
              label: "Footer Label LONG LONG LONG",
              links: [testFooterLink, testFooterLink],
            },
            {
              label: "Footer Label",
              links: [
                testFooterLink,
                {
                  linkType: "URL",
                  label: {
                    en: "Footer Link LONG LONG LONG LONG",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                },
                testFooterLink,
                testFooterLink,
                testFooterLink,
              ],
            },
            {
              label: "Footer Label",
              links: [testFooterLink, testFooterLink, testFooterLink],
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "Copyright 2025", hasLocalizedValue: "true" },
          secondaryFooterLinks: [
            testFooterLink,
            testFooterLink,
            testFooterLink,
            testFooterLink,
          ],
        },
      },
      styles: {
        primaryFooter: {
          logo: { width: 200, aspectRatio: 4 },
          utilityImages: { width: 50, aspectRatio: 1.78 },
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-white",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
        maxWidth: "full",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 20,
  },
  {
    name: "version 42 props - basic",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: testLogoUrl,
                    height: 100,
                    width: 100,
                    alternateText: { en: "Logo", hasLocalizedValue: "true" },
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                width: 100,
                aspectRatio: 1.78,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              data: {
                xLink: "",
                facebookLink: "",
                instagramLink: "",
                linkedInLink: "",
                pinterestLink: "",
                tiktokLink: "",
                youtubeLink: "",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              data: {
                utilityImages: [],
              },
              styles: {
                width: 60,
                aspectRatio: 1,
              },
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              data: {
                links: testFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              data: {
                sections: [
                  {
                    label: { en: "Footer Label", hasLocalizedValue: "true" },
                    links: testFooterLinks,
                  },
                ],
              },
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              data: {
                show: false,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
                linksAlignment: "left",
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      data: {
                        links: testFooterLinks,
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "left",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      data: {
                        text: {
                          field: "",
                          constantValue: {
                            en: "",
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      alignment: "left",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 0,
            aspectRatio: 1.78,
          },
          utilityImages: {
            width: 0,
            aspectRatio: 1,
          },
          backgroundColor: {
            bgColor: "bg-palette-primary-dark",
            textColor: "text-white",
          },
          linksAlignment: "right",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 42,
  },
  {
    name: "version 42 props - expanded with all data",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: true,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: testLogoUrl,
                    height: 100,
                    width: 100,
                    alternateText: { en: "Logo", hasLocalizedValue: "true" },
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                width: 200,
                aspectRatio: 4,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              data: {
                xLink: "https://x.com/yext",
                facebookLink: "https://facebook.com/yext",
                instagramLink: "https://instagram.com/yext",
                linkedInLink: "https://linkedin.com/in/yext",
                pinterestLink: "https://pinterest.com/yext",
                tiktokLink: "https://tiktok.com/@yext",
                youtubeLink: "https://youtube.com/c/yext",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              data: {
                utilityImages: [
                  {
                    image: {
                      url: "https://placehold.co/20",
                      width: 20,
                      height: 20,
                      alternateText: {
                        en: "Placeholder 1",
                        hasLocalizedValue: "true",
                      },
                    },
                    linkTarget: "https://yext.com",
                  },
                  {
                    image: {
                      url: "https://placehold.co/50x20",
                      width: 50,
                      height: 20,
                      alternateText: {
                        hasLocalizedValue: "true",
                      },
                    },
                  },
                ],
              },
              styles: {
                width: 50,
                aspectRatio: 1.78,
              },
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              data: {
                links: testFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              data: {
                sections: [
                  {
                    label: {
                      en: "Footer Label LONG LONG LONG",
                      hasLocalizedValue: "true",
                    },
                    links: [testFooterLink, testFooterLink],
                  },
                  {
                    label: { en: "Footer Label", hasLocalizedValue: "true" },
                    links: [
                      testFooterLink,
                      {
                        linkType: "URL",
                        label: {
                          en: "Footer Link LONG LONG LONG LONG",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                      },
                      ...testFooterLinks,
                    ],
                  },
                  {
                    label: { en: "Footer Label", hasLocalizedValue: "true" },
                    links: testFooterLinks,
                  },
                ],
              },
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              data: {
                show: true,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-tertiary-light",
                  textColor: "text-black",
                },
                linksAlignment: "right",
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      data: {
                        links: testFooterLinks,
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "right",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      data: {
                        text: {
                          field: "",
                          constantValue: {
                            en: "Copyright 2025",
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      alignment: "right",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 200,
            aspectRatio: 4,
          },
          utilityImages: {
            width: 50,
            aspectRatio: 1.78,
          },
          backgroundColor: {
            bgColor: "bg-palette-primary-dark",
            textColor: "text-white",
          },
          linksAlignment: "right",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 42,
  },
  {
    name: "version 42 props - no data",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              data: {
                image: {
                  field: "",
                  constantValue: undefined,
                  constantValueEnabled: false,
                },
              },
              styles: {
                width: 0,
                aspectRatio: 1.78,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              data: {
                xLink: "",
                facebookLink: "",
                instagramLink: "",
                linkedInLink: "",
                pinterestLink: "",
                tiktokLink: "",
                youtubeLink: "",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              data: {
                utilityImages: [],
              },
              styles: {
                width: 0,
                aspectRatio: 1,
              },
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              data: {
                links: [],
              },
              variant: "primary",
              eventNamePrefix: "primary",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              data: {
                sections: [],
              },
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              data: {
                show: true,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
                linksAlignment: "right",
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      data: {
                        links: [],
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "right",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      data: {
                        text: {
                          field: "",
                          constantValue: {
                            en: "",
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      alignment: "right",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 0,
            aspectRatio: 1.78,
          },
          utilityImages: {
            width: 0,
            aspectRatio: 1,
          },
          backgroundColor: {
            bgColor: "bg-white",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 42,
  },
  {
    name: "version 48 props",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: true,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "LogoSlot-v48",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://placehold.co/100",
                      height: 100,
                      width: 100,
                      alternateText: "Logo",
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                width: 0,
                aspectRatio: 1.78,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              id: "SocialLinksSlot-v48",
              data: {
                xLink: "https://x.com/yext",
                facebookLink: "https://facebook.com/yext",
                instagramLink: "https://instagram.com/yext",
                linkedInLink: "https://linkedin.com/in/yext",
                pinterestLink: "https://pinterest.com/yext",
                tiktokLink: "https://tiktok.com/@yext",
                youtubeLink: "https://youtube.com/c/yext",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              id: "UtilityImagesSlot-v48",
              data: {
                utilityImages: [
                  {
                    image: {
                      en: {
                        url: "https://placehold.co/20",
                        width: 20,
                        height: 20,
                        alternateText: "Utility 1",
                      },
                      hasLocalizedValue: "true",
                    },
                    linkTarget: "https://yext.com",
                  },
                  {
                    image: {
                      en: {
                        url: "https://placehold.co/50x20",
                        width: 50,
                        height: 20,
                        alternateText: "Utility 2",
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                ],
              },
              styles: {
                width: 50,
                aspectRatio: 1.78,
              },
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              id: "PrimaryLinksWrapperSlot-v48",
              data: {
                links: [
                  {
                    label: {
                      en: "Link 1",
                      hasLocalizedValue: "true",
                    },
                    link: {
                      en: "#",
                      hasLocalizedValue: "true",
                    },
                    linkType: "URL",
                  },
                ],
              },
              variant: "primary",
              eventNamePrefix: "primary",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              id: "ExpandedLinksWrapperSlot-v48",
              data: {
                sections: [
                  {
                    label: {
                      en: "Section 1",
                      hasLocalizedValue: "true",
                    },
                    links: [
                      {
                        label: {
                          en: "Link 1",
                          hasLocalizedValue: "true",
                        },
                        link: {
                          en: "#",
                          hasLocalizedValue: "true",
                        },
                        linkType: "URL",
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-v48",
              data: {
                show: true,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-tertiary-light",
                  textColor: "text-black",
                },
                linksAlignment: "right",
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      id: "SecondaryLinksWrapperSlot-v48",
                      data: {
                        links: [
                          {
                            label: {
                              en: "Privacy Policy",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                          },
                        ],
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "right",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightSlot-v48",
                      data: {
                        text: {
                          field: "",
                          constantValue: {
                            en: "Copyright 2025",
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      alignment: "right",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 0,
            aspectRatio: 1.78,
          },
          utilityImages: {
            width: 0,
            aspectRatio: 1,
          },
          backgroundColor: {
            bgColor: "bg-white",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 48,
  },
  {
    name: "version 51 - with external links, centered secondary links",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "LogoSlot-v50",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://placehold.co/100",
                      height: 100,
                      width: 100,
                      alternateText: "Logo",
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                width: 0,
                aspectRatio: 1.78,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              data: {
                xLink: "",
                facebookLink: "",
                instagramLink: "",
                linkedInLink: "",
                pinterestLink: "",
                tiktokLink: "",
                youtubeLink: "",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              data: {
                utilityImages: [],
              },
              styles: {
                width: 60,
                aspectRatio: 1,
              },
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              id: "PrimaryLinksWrapperSlot-v50",
              data: {
                links: testExternalFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              id: "ExpandedLinksWrapperSlot-v50",
              data: {
                sections: [
                  {
                    label: {
                      en: "Section 1",
                      hasLocalizedValue: "true",
                    },
                    links: testExternalFooterLinks,
                  },
                ],
              },
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-v50",
              data: {
                show: true,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-tertiary-light",
                  textColor: "text-black",
                },
                linksPosition: "center",
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      id: "SecondaryLinksWrapperSlot-v50",
                      data: {
                        links: testExternalFooterLinks,
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "center",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightSlot-v50",
                      data: {
                        text: {
                          field: "",
                          constantValue: {
                            en: "Copyright 2025",
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      alignment: "center",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 0,
            aspectRatio: 1.78,
          },
          utilityImages: {
            width: 0,
            aspectRatio: 1,
          },
          backgroundColor: {
            bgColor: "bg-white",
            textColor: "text-black",
          },
          linksPosition: "right",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 51,
  },
  {
    name: "version 51 - with external links, centered secondary links - Dark BG",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "LogoSlot-v50",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://placehold.co/100",
                      height: 100,
                      width: 100,
                      alternateText: "Logo",
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                width: 0,
                aspectRatio: 1.78,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              data: {
                xLink: "",
                facebookLink: "",
                instagramLink: "",
                linkedInLink: "",
                pinterestLink: "",
                tiktokLink: "",
                youtubeLink: "",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              data: {
                utilityImages: [],
              },
              styles: {
                width: 60,
                aspectRatio: 1,
              },
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              id: "PrimaryLinksWrapperSlot-v50",
              data: {
                links: testExternalFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              id: "ExpandedLinksWrapperSlot-v50",
              data: {
                sections: [
                  {
                    label: {
                      en: "Section 1",
                      hasLocalizedValue: "true",
                    },
                    links: testExternalFooterLinks,
                  },
                ],
              },
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-v50",
              data: {
                show: true,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-dark",
                  textColor: "text-white",
                },
                linksPosition: "center",
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      id: "SecondaryLinksWrapperSlot-v50",
                      data: {
                        links: testExternalFooterLinks,
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "center",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightSlot-v50",
                      data: {
                        text: {
                          field: "",
                          constantValue: {
                            en: "Copyright 2025",
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      alignment: "center",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 0,
            aspectRatio: 1.78,
          },
          utilityImages: {
            width: 0,
            aspectRatio: 1,
          },
          backgroundColor: {
            bgColor: "bg-palette-primary-dark",
            textColor: "text-white",
          },
          linksPosition: "right",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 51,
  },
  {
    name: "version 71 props with color overrides",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "FooterLogoSlot-e621dc94-a3ff-4846-a23f-c793440b6c69",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
                    height: 100,
                    width: 100,
                    alternateText: {
                      defaultValue: "Logo",
                    },
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                width: 100,
                aspectRatio: 1,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              id: "FooterSocialLinksSlot-4397ea9d-bb3d-48e9-a608-0251eff97525",
              data: {
                xLink: "",
                facebookLink: "",
                instagramLink: "https://instagram.com/yext",
                linkedInLink: "",
                pinterestLink: "",
                tiktokLink: "https://tiktok.com/yext",
                youtubeLink: "",
              },
              styles: {
                iconColor: {
                  selectedColor: "palette-quaternary",
                  contrastingColor: "palette-quaternary-contrast",
                },
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              id: "FooterUtilityImagesSlot-b6953f68-3801-47b0-8550-40d881bc4354",
              data: {
                utilityImages: [],
              },
              styles: {
                width: 0,
                aspectRatio: 1,
              },
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              id: "FooterLinksSlot-bf17b472-5c3b-49aa-ad8e-1a59377168b5",
              data: {
                links: testFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
              color: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
            },
          },
        ],
        ExpandedLinksWrapperSlot: [],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-e836fe93-221d-4e4d-9dae-ffefc0cd63cc",
              data: {
                show: true,
              },
              styles: {
                backgroundColor: {
                  selectedColor: "palette-primary-light",
                  contrastingColor: "black",
                },
                linksPosition: "left",
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      id: "FooterLinksSlot-0a8b14c2-d14b-4dcd-b6ec-eba94fa55625",
                      data: {
                        links: testFooterLinks,
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "left",
                      color: {
                        selectedColor: "palette-secondary",
                        contrastingColor: "palette-secondary-contrast",
                      },
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightMessageSlot-1bb649f3-3343-40e7-b1aa-076d1918a277",
                      data: {
                        text: {
                          defaultValue: "",
                          en: "Copyright 2026",
                          hasLocalizedValue: "true",
                        },
                      },
                      alignment: "left",
                    },
                  },
                ],
              },
              ignoreLocaleWarning: [],
            },
          },
        ],
      },
      styles: {
        primaryFooter: {
          backgroundColor: {
            selectedColor: "palette-primary-light",
            contrastingColor: "black",
          },
          linksPosition: "right",
        },
        maxWidth: "theme",
      },
      analytics: {
        scope: "expandedFooter",
      },
      id: "ExpandedFooter-190ea081-2f4e-488d-bbd7-34155cd64516",
      ignoreLocaleWarning: ["slots.ExpandedLinksWrapperSlot"],
    },
    version: 71,
  },
];

const socialLinkTestCases = [
  {
    name: "valid social links",
    links: {
      xLink: "https://x.com/yext",
      facebookLink: "https://facebook.com/yext",
      instagramLink: "https://instagram.com/yext",
      pinterestLink: "https://pinterest.com/yext",
      linkedInLink: "https://linkedin.com/in/yext",
      youtubeLink: "https://youtube.com/c/yext",
      tiktokLink: "https://tiktok.com/@yext",
    },
    expected: true,
  },
  {
    name: "invalid social links",
    links: {
      xLink: "http://x.com/",
      facebookLink: "facebook.com/",
      instagramLink: "not-a-link",
      pinterestLink: "pinterest.com/yext",
      linkedInLink: "linkedin.com/yext",
      youtubeLink: "https://youtube.com/",
      tiktokLink: "https://tiktok.com/",
    },
    expected: false,
  },
];

describe("ExpandedFooter", async () => {
  const puckConfig: Config = {
    components: { ExpandedFooter, ...SlotsCategoryComponents },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };

  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      name,
      document,
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
              type: "ExpandedFooter",
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
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(
        `ExpandedFooter/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);

      // Intentionally skip WCAG check for tests of color overrides
      if (name !== "version 71 props with color overrides") {
        expect(results).toHaveNoViolations();
      }

      if (interactions) {
        await interactions(page);
        await expect(
          `ExpandedFooter/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
  it.each(socialLinkTestCases)(
    "should validate $name",
    ({ links, expected }) => {
      for (const [key, regex] of Object.entries(validPatterns)) {
        const result = regex.test(links[key as keyof typeof links] || "");
        expect(result).toBe(expected);
      }
    }
  );
});
