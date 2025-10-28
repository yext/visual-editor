import { AnalyticsScopeProvider } from "@yext/pages-components";
import { ComponentConfig, Fields, Slot, PuckComponent } from "@measured/puck";
import {
  backgroundColors,
  msg,
  YextField,
  BackgroundStyle,
  PageSection,
  Background,
  PageSectionProps,
  themeManagerCn,
} from "@yext/visual-editor";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/image/styling.ts";
import { defaultCopyrightMessageSlotProps } from "./CopyrightMessageSlot.tsx";

const PLACEHOLDER_LOGO_IMAGE: string = "https://placehold.co/100";

const defaultLink = {
  linkType: "URL" as const,
  label: {
    en: "Footer Link",
    hasLocalizedValue: "true" as const,
  },
  link: "#",
};

const defaultLinks = [
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
];

export const validPatterns: Record<string, RegExp> = {
  xLink: /^https:\/\/(www\.)?(x\.com|twitter\.com)\/.+/,
  facebookLink: /^https:\/\/(www\.)?facebook\.com\/.+/,
  instagramLink: /^https:\/\/(www\.)?instagram\.com\/.+/,
  pinterestLink: /^https:\/\/(www\.)?pinterest\.com\/.+/,
  linkedInLink: /^https:\/\/(www\.)?linkedin\.com\/.+/,
  youtubeLink: /^(https:\/\/(www\.)?youtube\.com\/.+|https:\/\/youtu\.be\/.+)$/,
  tiktokLink: /^https:\/\/(www\.)?tiktok\.com\/.+/,
};

export interface ExpandedFooterData {
  /** Content for the primary footer bar. */
  primaryFooter: {
    /**
     * Whether to expand the footer to show additional link categories.
     * expandedFooter: false uses a single row of footerLinks.
     * expandedFooter: true uses multiple columns of expandedFooterLinks.
     */
    expandedFooter: boolean;
  };
}

export interface ExpandedFooterStyles {
  /** Styling for the primary footer bar. */
  primaryFooter: {
    backgroundColor?: BackgroundStyle;
    linksAlignment: "left" | "right";
    logo: ImageStylingProps;
    utilityImages: ImageStylingProps;
  };
  /** The maximum width of the footer. */
  maxWidth: PageSectionProps["maxWidth"];
}

export interface ExpandedFooterProps {
  /**
   * This object contains all the content for both footer tiers.
   * @propCategory Data Props
   */
  data: ExpandedFooterData;

  /**
   * This object contains properties for customizing the appearance of both footer tiers.
   * @propCategory Style Props
   */
  styles: ExpandedFooterStyles;

  /** @internal */
  slots: {
    LogoSlot: Slot;
    SocialLinksSlot: Slot;
    UtilityImagesSlot: Slot;
    PrimaryLinksWrapperSlot: Slot;
    ExpandedLinksWrapperSlot: Slot;
    SecondaryFooterSlot: Slot;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * Indicates which props should not be checked for missing translations.
   * @internal */
  ignoreLocaleWarning?: string[];
}

const expandedFooterSectionFields: Fields<ExpandedFooterProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      primaryFooter: YextField(msg("fields.primaryFooter", "Primary Footer"), {
        type: "object",
        objectFields: {
          expandedFooter: YextField(
            msg("fields.expandFooter", "Expand Footer"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            }
          ),
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      primaryFooter: YextField(msg("fields.primaryFooter", "Primary Footer"), {
        type: "object",
        objectFields: {
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              hasSearch: true,
              options: "BACKGROUND_COLOR",
            }
          ),
          linksAlignment: YextField(
            msg("fields.linksAlignment", "Links Alignment"),
            {
              type: "radio",
              options: [
                {
                  label: msg("fields.options.left", "Left", {
                    context: "direction",
                  }),
                  value: "left",
                },
                {
                  label: msg("fields.options.right", "Right", {
                    context: "direction",
                  }),
                  value: "right",
                },
              ],
            }
          ),
          logo: YextField(msg("fields.logo", "Logo"), {
            type: "object",
            objectFields: ImageStylingFields,
          }),
          utilityImages: YextField(
            msg("fields.utilityImages", "Utility Images"),
            {
              type: "object",
              objectFields: ImageStylingFields,
            }
          ),
        },
      }),
      maxWidth: YextField(msg("fields.maxWidth", "Max Width"), {
        type: "maxWidth",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      LogoSlot: { type: "slot" },
      SocialLinksSlot: { type: "slot" },
      UtilityImagesSlot: { type: "slot" },
      PrimaryLinksWrapperSlot: { type: "slot" },
      ExpandedLinksWrapperSlot: { type: "slot" },
      SecondaryFooterSlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
};

const ExpandedFooterWrapper: PuckComponent<ExpandedFooterProps> = ({
  data,
  styles,
  slots,
  puck,
}) => {
  const { primaryFooter } = data;
  const { primaryFooter: primaryFooterStyle, maxWidth } = styles;
  const { expandedFooter } = primaryFooter;
  const { linksAlignment: primaryLinksAlignment, backgroundColor } =
    primaryFooterStyle;

  return (
    <Background className="mt-auto" ref={puck.dragRef} as="footer">
      {/* Primary footer section. */}
      <PageSection
        verticalPadding={"none"}
        background={backgroundColor}
        maxWidth={maxWidth}
        className={`py-6 sm:py-12 flex flex-col md:flex-row md:justify-start w-full md:items-start gap-6 md:gap-8`}
      >
        {/* Render in different order based on alignment */}
        {primaryLinksAlignment === "left" ? (
          <>
            {/* LEFT ALIGNED: Links first, then slots */}
            {expandedFooter ? (
              <slots.ExpandedLinksWrapperSlot
                style={{ height: "auto", flex: 1 }}
                allow={[]}
              />
            ) : (
              <slots.PrimaryLinksWrapperSlot
                style={{ height: "auto", flex: 1 }}
                allow={[]}
              />
            )}
            <div className="flex flex-col gap-6 md:gap-6 items-start">
              <slots.LogoSlot
                style={{ height: "auto", maxWidth: "max-content" }}
                allow={[]}
              />
              <div
                className={themeManagerCn(
                  "flex flex-col gap-6 items-start",
                  puck.isEditing ? "" : "hidden md:flex"
                )}
              >
                <slots.SocialLinksSlot
                  style={{ height: "auto", maxWidth: "max-content" }}
                  allow={[]}
                />
                <slots.UtilityImagesSlot
                  style={{ height: "auto", maxWidth: "max-content" }}
                  allow={[]}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* RIGHT ALIGNED (default): Slots first, then links */}
            <div className="flex flex-col gap-6 md:gap-6 items-start">
              <slots.LogoSlot
                style={{ height: "auto", maxWidth: "max-content" }}
                allow={[]}
              />
              <div
                className={themeManagerCn(
                  "flex flex-col gap-6 items-start",
                  puck.isEditing ? "" : "hidden md:flex"
                )}
              >
                <slots.SocialLinksSlot
                  style={{ height: "auto", maxWidth: "max-content" }}
                  allow={[]}
                />
                <slots.UtilityImagesSlot
                  style={{ height: "auto", maxWidth: "max-content" }}
                  allow={[]}
                />
              </div>
            </div>
            {expandedFooter ? (
              <slots.ExpandedLinksWrapperSlot
                style={{ height: "auto", flex: 1 }}
                allow={[]}
              />
            ) : (
              <slots.PrimaryLinksWrapperSlot
                style={{ height: "auto", flex: 1 }}
                allow={[]}
              />
            )}
          </>
        )}
        {/** Mobile footer icons and utility images */}
        {!puck.isEditing && (
          <div className="md:hidden flex flex-col gap-6 items-start">
            <slots.SocialLinksSlot
              style={{ height: "auto", maxWidth: "max-content" }}
              allow={[]}
            />
            <slots.UtilityImagesSlot
              style={{ height: "auto", maxWidth: "max-content" }}
              allow={[]}
            />
          </div>
        )}
      </PageSection>
      {/* Secondary footer section */}
      <slots.SecondaryFooterSlot style={{ height: "auto" }} allow={[]} />
    </Background>
  );
};

/**
 * The Expanded Footer is a comprehensive, two-tiered site-wide component for large websites. It includes a primary footer area for a logo, social media links, and utility images, and features two distinct layouts: a standard link list or an "expanded" multi-column mega-footer. It also includes an optional secondary sub-footer for copyright notices and legal links.
 * Avalible on Location templates.
 */
export const ExpandedFooter: ComponentConfig<{ props: ExpandedFooterProps }> = {
  label: msg("components.expandedFooter", "Expanded Footer"),
  fields: expandedFooterSectionFields,
  defaultProps: {
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
                  url: PLACEHOLDER_LOGO_IMAGE,
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
              links: defaultLinks,
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
              field: "",
              constantValue: [
                {
                  label: { en: "Footer Label", hasLocalizedValue: "true" },
                  links: defaultLinks,
                },
                {
                  label: { en: "Footer Label", hasLocalizedValue: "true" },
                  links: defaultLinks,
                },
                {
                  label: { en: "Footer Label", hasLocalizedValue: "true" },
                  links: defaultLinks,
                },
                {
                  label: { en: "Footer Label", hasLocalizedValue: "true" },
                  links: defaultLinks,
                },
              ],
              constantValueEnabled: true,
            },
            slots: {
              ExpandedSectionsSlot: [
                {
                  type: "FooterExpandedLinkSectionSlot",
                  props: {
                    data: {
                      label: {
                        field: "",
                        constantValue: {
                          en: "Footer Label",
                          hasLocalizedValue: "true",
                        },
                        constantValueEnabled: true,
                      },
                      links: {
                        field: "",
                        constantValue: defaultLinks,
                        constantValueEnabled: true,
                      },
                    },
                    index: 0,
                  },
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
              backgroundColor: backgroundColors.background2.value,
              linksAlignment: "left",
            },
            maxWidth: "theme",
            slots: {
              SecondaryLinksWrapperSlot: [
                {
                  type: "FooterLinksSlot",
                  props: {
                    data: {
                      links: defaultLinks,
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
                  props: defaultCopyrightMessageSlotProps,
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
        backgroundColor: backgroundColors.background6.value,
        linksAlignment: "right",
      },
      maxWidth: "theme",
    },
    analytics: {
      scope: "expandedFooter",
    },
  },
  resolveFields: (_data, { fields }) => {
    return fields;
  },
  resolveData: async (data) => {
    // Pass maxWidth to SecondaryFooterSlot
    if (
      data?.props?.slots?.SecondaryFooterSlot &&
      Array.isArray(data.props.slots.SecondaryFooterSlot)
    ) {
      data.props.slots.SecondaryFooterSlot =
        data.props.slots.SecondaryFooterSlot.map((slot: any) => ({
          ...slot,
          props: {
            ...slot.props,
            maxWidth: data.props.styles.maxWidth || "theme",
          },
        }));
    }

    return data;
  },
  inline: true,
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "expandedFooter"}>
      <ExpandedFooterWrapper {...props} />
    </AnalyticsScopeProvider>
  ),
};
