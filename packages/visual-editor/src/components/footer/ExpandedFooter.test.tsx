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
  {
    name: "version 72 - left align",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
          showLogo: true,
          showSocialLinks: true,
          showUtilityImages: true,
        },
        secondaryFooter: {
          show: true,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "FooterLogoSlot-5da1d856-b4a9-461f-a46b-f0cad85cf2a0",
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
              id: "FooterSocialLinksSlot-1d47a44b-b005-48f3-a752-cca35bfacd99",
              data: {
                xLink: "https://x.com/yext",
                facebookLink: "https://facebook.com/yext",
                instagramLink: "https://instagram.com/yext",
                linkedInLink: "https://linkedin.com/yext",
                pinterestLink: "https://pinterest.com/yext",
                tiktokLink: "https://toktok.com/yext",
                youtubeLink: "https://youtube.com/yext",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              id: "FooterUtilityImagesSlot-5970de53-4a54-44c7-8bf8-dd5174b1a304",
              data: {
                utilityImages: [
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/100",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/100",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/100",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                ],
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
              id: "FooterLinksSlot-bb67b3bd-2278-448b-ab22-7ebb5c0971bf",
              data: {
                links: testFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
              desktopContentAlignment: "left",
              mobileContentAlignment: "left",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              id: "FooterExpandedLinksWrapper-fb327817-0277-4a86-87a5-b2e0c7708b4a",
              data: {
                sections: [
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: testFooterLinks,
                  },
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: testFooterLinks,
                  },
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: testFooterLinks,
                  },
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: testFooterLinks,
                  },
                ],
              },
              desktopContentAlignment: "left",
              mobileContentAlignment: "left",
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-cc5ea123-215e-43e7-a7c7-e8ea0e0c57e8",
              styles: {
                backgroundColor: {
                  selectedColor: "palette-primary-light",
                  contrastingColor: "black",
                },
                desktopContentAlignment: "left",
                mobileContentAlignment: "left",
                showLinks: true,
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      id: "FooterLinksSlot-b6e926ee-f05e-4497-b9f0-19c61bc21e5b",
                      data: {
                        links: testFooterLinks,
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "left",
                      desktopContentAlignment: "left",
                      mobileContentAlignment: "left",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightMessageSlot-157bbb0d-1b24-4e19-9f2d-f0eb5b22a858",
                      data: {
                        text: {
                          defaultValue: "",
                          en: "Copyright 2026",
                          hasLocalizedValue: "true",
                        },
                      },
                      desktopContentAlignment: "left",
                      mobileContentAlignment: "left",
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
          backgroundColor: {
            selectedColor: "palette-primary-dark",
            contrastingColor: "white",
          },
          linksPosition: "right",
          desktopContentAlignment: "left",
          mobileContentAlignment: "left",
        },
        maxWidth: "theme",
      },
      analytics: {
        scope: "expandedFooter",
      },
      id: "ExpandedFooter-c6944f8d-b211-4c4f-82d3-84cdebc75586",
      ignoreLocaleWarning: ["slots.ExpandedLinksWrapperSlot"],
    },
    version: 72,
  },
  {
    name: "version 72 - center align",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: true,
          showLogo: true,
          showSocialLinks: true,
          showUtilityImages: true,
        },
        secondaryFooter: {
          show: true,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "FooterLogoSlot-5da1d856-b4a9-461f-a46b-f0cad85cf2a0",
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
              id: "FooterSocialLinksSlot-1d47a44b-b005-48f3-a752-cca35bfacd99",
              data: {
                xLink: "https://x.com/yext",
                facebookLink: "https://facebook.com/yext",
                instagramLink: "",
                linkedInLink: "https://linkedin.com/yext",
                pinterestLink: "",
                tiktokLink: "https://toktok.com/yext",
                youtubeLink: "https://youtube.com/yext",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              id: "FooterUtilityImagesSlot-5970de53-4a54-44c7-8bf8-dd5174b1a304",
              data: {
                utilityImages: [
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/100",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/100",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                ],
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
              id: "FooterLinksSlot-bb67b3bd-2278-448b-ab22-7ebb5c0971bf",
              data: {
                links: testFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
              desktopContentAlignment: "center",
              mobileContentAlignment: "center",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [
          {
            type: "FooterExpandedLinksWrapper",
            props: {
              id: "FooterExpandedLinksWrapper-fb327817-0277-4a86-87a5-b2e0c7708b4a",
              data: {
                sections: [
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: testFooterLinks,
                  },
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: testFooterLinks,
                  },
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: [
                      testFooterLink,
                      {
                        linkType: "URL",
                        label: {
                          defaultValue: "Footer Link",
                          en: "Long Footer Link That Wraps onto another line",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                        normalizeLink: true,
                        openInNewTab: false,
                      },
                      testFooterLink,
                      testFooterLink,
                      testFooterLink,
                    ],
                  },
                  {
                    label: {
                      defaultValue: "Footer Label",
                    },
                    links: testFooterLinks,
                  },
                ],
              },
              desktopContentAlignment: "center",
              mobileContentAlignment: "center",
            },
          },
        ],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-cc5ea123-215e-43e7-a7c7-e8ea0e0c57e8",
              styles: {
                backgroundColor: {
                  selectedColor: "palette-primary-dark",
                  contrastingColor: "white",
                },
                desktopContentAlignment: "center",
                mobileContentAlignment: "center",
                showLinks: true,
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      id: "FooterLinksSlot-b6e926ee-f05e-4497-b9f0-19c61bc21e5b",
                      data: {
                        links: [
                          testFooterLink,
                          testFooterLink,
                          {
                            linkType: "URL",
                            label: {
                              defaultValue: "Footer Link",
                              en: "Long Footer Link that pushes the content onto another line",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            normalizeLink: true,
                            openInNewTab: false,
                          },
                          testFooterLink,
                          testFooterLink,
                          {
                            linkType: "URL",
                            label: {
                              defaultValue: "Footer Link",
                              en: "Long Footer Link that pushes the content onto another line",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            normalizeLink: true,
                            openInNewTab: false,
                          },
                          testFooterLink,
                        ],
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "left",
                      desktopContentAlignment: "center",
                      mobileContentAlignment: "center",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightMessageSlot-157bbb0d-1b24-4e19-9f2d-f0eb5b22a858",
                      data: {
                        text: {
                          defaultValue: "",
                          en: "Copyright 2026",
                          hasLocalizedValue: "true",
                        },
                      },
                      desktopContentAlignment: "center",
                      mobileContentAlignment: "center",
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
          backgroundColor: {
            selectedColor: "palette-tertiary-light",
            contrastingColor: "black",
          },
          linksPosition: "right",
          desktopContentAlignment: "center",
          mobileContentAlignment: "center",
        },
        maxWidth: "theme",
      },
      analytics: {
        scope: "expandedFooter",
      },
      id: "ExpandedFooter-c6944f8d-b211-4c4f-82d3-84cdebc75586",
      ignoreLocaleWarning: ["slots.PrimaryLinksWrapperSlot"],
    },
    version: 72,
  },
  {
    name: "version 72 - right align",
    document: {
      name: "Galaxy Grill",
    },
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
          showLogo: true,
          showSocialLinks: true,
          showUtilityImages: true,
        },
        secondaryFooter: {
          show: true,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "FooterLogoSlot-929e7f9d-d584-4254-b25f-f7a8716a21e4",
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
                width: 300,
                aspectRatio: 2,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              id: "FooterSocialLinksSlot-36f24f14-9717-46a1-9b67-f2433e52ca91",
              data: {
                xLink: "https://x.com/yext",
                facebookLink: "https://facebook.com/yext",
                instagramLink: "https://instagram.com/yext",
                linkedInLink: "https://linkedin.com/yext",
                pinterestLink: "https://pinterest.com/yext",
                tiktokLink: "https://tiktok.com/yext",
                youtubeLink: "https://youtube.com/yext",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              id: "FooterUtilityImagesSlot-4f35cbae-64bc-4171-acef-3d94397ac925",
              data: {
                utilityImages: [
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/50",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/50",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                ],
              },
              styles: {
                width: 0,
                aspectRatio: 2,
              },
              desktopContentAlignment: "right",
              mobileContentAlignment: "right",
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              id: "FooterLinksSlot-71a71e2a-04e8-4084-8254-376ceb1bf811",
              data: {
                links: testFooterLinks,
              },
              variant: "primary",
              eventNamePrefix: "primary",
              desktopContentAlignment: "right",
              mobileContentAlignment: "right",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-ea5b1f47-e4d0-46a8-8be1-46b51b04becc",
              styles: {
                backgroundColor: {
                  selectedColor: "palette-primary",
                  contrastingColor: "palette-primary-contrast",
                },
                desktopContentAlignment: "right",
                mobileContentAlignment: "right",
                showLinks: true,
              },
              maxWidth: "theme",
              slots: {
                SecondaryLinksWrapperSlot: testFooterLinks,
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightMessageSlot-03e62a36-a4a3-45d3-a042-f6f98c4b88f5",
                      data: {
                        text: {
                          defaultValue: "",
                          en: "Copyright [[name]] 2026",
                          hasLocalizedValue: "true",
                        },
                      },
                      desktopContentAlignment: "right",
                      mobileContentAlignment: "right",
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
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
          linksPosition: "right",
          desktopContentAlignment: "right",
          mobileContentAlignment: "right",
        },
        maxWidth: "theme",
      },
      analytics: {
        scope: "expandedFooter",
      },
      id: "ExpandedFooter-0c742c63-1b54-4081-b51e-082dc06a1eca",
      ignoreLocaleWarning: ["slots.ExpandedLinksWrapperSlot"],
    },
    version: 72,
  },
  {
    name: "version 72 - left links, desktop center, mobile left, hide secondary links",
    document: {},
    props: {
      data: {
        primaryFooter: {
          expandedFooter: false,
          showLogo: true,
          showSocialLinks: false,
          showUtilityImages: true,
        },
        secondaryFooter: {
          show: true,
        },
      },
      slots: {
        LogoSlot: [
          {
            type: "FooterLogoSlot",
            props: {
              id: "FooterLogoSlot-a70c052c-0aee-4323-8636-774ba23849ea",
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
                width: 300,
                aspectRatio: 4,
              },
            },
          },
        ],
        SocialLinksSlot: [
          {
            type: "FooterSocialLinksSlot",
            props: {
              id: "FooterSocialLinksSlot-49c9ab2c-47a3-42fb-931e-53a5ba6a50fb",
              data: {
                xLink: "https://x.com/yext",
                facebookLink: "https://facebook.com/yext",
                instagramLink: "https://instagram.com/yext",
                linkedInLink: "https://linkedin.com/yext",
                pinterestLink: "https://pinterest.com/yext",
                tiktokLink: "https://tiktok.com/yext",
                youtubeLink: "https://youtube.com/yext",
              },
            },
          },
        ],
        UtilityImagesSlot: [
          {
            type: "FooterUtilityImagesSlot",
            props: {
              id: "FooterUtilityImagesSlot-354fe973-8bba-413b-ba63-5ba377e3a2a3",
              data: {
                utilityImages: [
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/50",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/50",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/50",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                  {
                    image: {
                      en: {
                        alternateText: "",
                        url: "https://placehold.co/50",
                        height: 1,
                        width: 1,
                      },
                      hasLocalizedValue: "true",
                    },
                  },
                ],
              },
              styles: {
                width: 0,
                aspectRatio: 2,
              },
              desktopContentAlignment: "center",
              mobileContentAlignment: "left",
            },
          },
        ],
        PrimaryLinksWrapperSlot: [
          {
            type: "FooterLinksSlot",
            props: {
              id: "FooterLinksSlot-786dc607-f1b1-4ffc-a019-e72e75556310",
              data: {
                links: [
                  {
                    linkType: "URL",
                    label: {
                      defaultValue: "Footer Link",
                      en: "Long footer label 123456",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    normalizeLink: true,
                    openInNewTab: true,
                  },
                  {
                    linkType: "URL",
                    label: {
                      defaultValue: "Footer Link",
                      en: "Long footer label 123456",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    normalizeLink: true,
                    openInNewTab: true,
                  },
                  {
                    linkType: "URL",
                    label: {
                      defaultValue: "Footer Link",
                      en: "Long footer label 123456",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    normalizeLink: true,
                    openInNewTab: true,
                  },
                  {
                    linkType: "URL",
                    label: {
                      defaultValue: "Footer Link",
                      en: "Long footer label 123456",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    normalizeLink: true,
                    openInNewTab: true,
                  },
                  {
                    linkType: "URL",
                    label: {
                      defaultValue: "Footer Link",
                      en: "Long footer label 123456",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    normalizeLink: true,
                    openInNewTab: true,
                  },
                  {
                    linkType: "URL",
                    label: {
                      defaultValue: "Footer Link",
                      en: "Long footer label 123456",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    normalizeLink: true,
                    openInNewTab: true,
                  },
                  {
                    linkType: "URL",
                    label: {
                      defaultValue: "Footer Link",
                      en: "Long footer label that will wrap onto a new line on mobile 123",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    normalizeLink: true,
                    openInNewTab: true,
                  },
                ],
              },
              variant: "primary",
              eventNamePrefix: "primary",
              desktopContentAlignment: "center",
              mobileContentAlignment: "left",
            },
          },
        ],
        ExpandedLinksWrapperSlot: [],
        SecondaryFooterSlot: [
          {
            type: "SecondaryFooterSlot",
            props: {
              id: "SecondaryFooterSlot-185eb096-fb9e-4f97-a9e7-3510ce6d4555",
              styles: {
                backgroundColor: {
                  selectedColor: "palette-primary-light",
                  contrastingColor: "black",
                },
                desktopContentAlignment: "center",
                mobileContentAlignment: "left",
                showLinks: false,
              },
              maxWidth: "fullWidth",
              slots: {
                SecondaryLinksWrapperSlot: [
                  {
                    type: "FooterLinksSlot",
                    props: {
                      id: "FooterLinksSlot-eb951c27-a139-479a-9d39-f3b3785fc0ef",
                      data: {
                        links: testFooterLinks,
                      },
                      variant: "secondary",
                      eventNamePrefix: "secondary",
                      alignment: "left",
                      desktopContentAlignment: "center",
                      mobileContentAlignment: "left",
                    },
                  },
                ],
                CopyrightSlot: [
                  {
                    type: "CopyrightMessageSlot",
                    props: {
                      id: "CopyrightMessageSlot-a22553ba-3c9d-40a5-b7ec-b14971bfd301",
                      data: {
                        text: {
                          defaultValue: "",
                          en: "Copyright [[name]] 2026",
                          hasLocalizedValue: "true",
                        },
                      },
                      desktopContentAlignment: "center",
                      mobileContentAlignment: "left",
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
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
          linksPosition: "left",
          desktopContentAlignment: "center",
          mobileContentAlignment: "left",
        },
        maxWidth: "fullWidth",
      },
      analytics: {
        scope: "expandedFooter",
      },
      id: "ExpandedFooter-faded33b-f5c4-4b2c-92a3-dc858e7a206b",
      ignoreLocaleWarning: [
        "slots.ExpandedLinksWrapperSlot",
        "slots.SocialLinksSlot",
      ],
    },
    version: 72,
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
