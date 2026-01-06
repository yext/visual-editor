import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
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
    name: "version 10 props",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: testLogoUrl,
          footerLinks: testFooterLinks,
          xLink: "",
          facebookLink: "",
          instagramLink: "",
          pinterestLink: "",
          linkedInLink: "",
          youtubeLink: "",
          tiktokLink: "",
          utilityImages: [],
          expandedFooter: false,
          expandedFooterLinks: [
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
          ],
        },
        secondaryFooter: {
          show: false,
          copyrightMessage: { en: "", hasLocalizedValue: "true" },
          secondaryFooterLinks: testFooterLinks,
        },
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
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          linksAlignment: "left",
        },
      },
      analytics: {
        scope: "expandedFooter",
      },
    },
    version: 10,
  },
  {
    name: "version 10 props - expanded",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: testLogoUrl,
          footerLinks: testFooterLinks,
          xLink: "https://x.com/yext",
          facebookLink: "https://facebook.com/yext",
          instagramLink: "https://instagram.com/yext",
          pinterestLink: "https://pinterest.com/yext",
          linkedInLink: "https://linkedin.com/in/yext",
          youtubeLink: "https://youtube.com/c/yext",
          tiktokLink: "https://tiktok.com/@yext",
          utilityImages: [
            {
              url: "https://placehold.co/20",
              linkTarget: "https://yext.com",
            },
            { url: "https://placehold.co/50x20" },
          ],
          expandedFooter: true,
          expandedFooterLinks: [
            {
              label: "Footer Label LONG LONG LONG",
              links: testFooterLinks,
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
                ...testFooterLinks,
              ],
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "Copyright 2025", hasLocalizedValue: "true" },
          secondaryFooterLinks: testFooterLinks,
        },
      },
      styles: {
        primaryFooter: {
          logo: { width: 200, aspectRatio: 4 },
          utilityImages: { width: 50, aspectRatio: 1.78 },
          backgroundColor: {
            bgColor: "bg-palette-primary-dark",
            textColor: "text-white",
          },
          linksAlignment: "right",
        },
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-palette-tertiary-light",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 10,
  },
  {
    name: "version 10 props - no data",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: "",
          footerLinks: [],
          xLink: "",
          facebookLink: "",
          instagramLink: "",
          pinterestLink: "",
          linkedInLink: "",
          youtubeLink: "",
          tiktokLink: "",
          utilityImages: [],
          expandedFooter: false,
          expandedFooterLinks: [],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "", hasLocalizedValue: "true" },
          secondaryFooterLinks: [],
        },
      },
      styles: {
        primaryFooter: {
          logo: { width: undefined, aspectRatio: 1 },
          utilityImages: { width: undefined, aspectRatio: 1 },
          backgroundColor: {
            bgColor: "bg-white",
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
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 10,
  },
  {
    name: "version 19 props - expanded",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: testLogoUrl,
          footerLinks: testFooterLinks,
          xLink: "https://x.com/yext",
          facebookLink: "https://facebook.com/yext",
          instagramLink: "",
          pinterestLink: "",
          linkedInLink: "",
          youtubeLink: "",
          tiktokLink: "",
          utilityImages: [
            {
              url: "https://placehold.co/20",
              linkTarget: "https://yext.com",
            },
          ],
          expandedFooter: true,
          expandedFooterLinks: [
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: {
            en: "",
            hasLocalizedValue: "true",
          },
          secondaryFooterLinks: testFooterLinks,
        },
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
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          linksAlignment: "left",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 19,
  },
  {
    name: "version 20 props - expanded",
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
    name: "version 20 props - expanded",
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
      ).toMatchScreenshot({ useFullPage: true });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

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
