import {
  AnalyticsScopeProvider,
  ComplexImageType,
} from "@yext/pages-components";
import { ComponentConfig, Fields, WithId, WithPuckProps } from "@measured/puck";
import {
  EntityField,
  MaybeLink,
  backgroundColors,
  Image,
  msg,
  YextField,
  BackgroundStyle,
  pt,
  Body,
  CTA,
  TranslatableCTA,
  PageSection,
  TranslatableStringField,
  TranslatableString,
  Background,
  useDocument,
  resolveComponentData,
} from "@yext/visual-editor";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPinterest,
  FaTiktok,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { linkTypeOptions } from "../../internal/puck/constant-value-fields/CallToAction.tsx";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.tsx";

const PLACEHOLDER_LOGO_IMAGE: string = "https://placehold.co/100";

const defaultExpandedFooterLinks = {
  linkType: "URL" as const,
  label: { en: "Footer Link", hasLocalizedValue: "true" as const },
  links: [],
};

const defaultFooterLink = {
  linkType: "URL" as const,
  label: { en: "Footer Link", hasLocalizedValue: "true" as const },
  link: "#",
};

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
    logo: string;
    facebookLink: string;
    instagramLink: string;
    linkedInLink: string;
    pinterestLink: string;
    tiktokLink: string;
    youtubeLink: string;
    xLink: string;
    utilityImages: { url: string; linkTarget?: string }[];
    expandedFooter: boolean;
    footerLinks: TranslatableCTA[];
    expandedFooterLinks: {
      label: TranslatableString;
      links: TranslatableCTA[];
    }[];
  };
  /** Content for the secondary header bar. */
  secondaryFooter: {
    show: boolean;
    copyrightMessage: TranslatableString;
    secondaryFooterLinks: TranslatableCTA[];
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
  /** Styling for the secondary footer bar. */
  secondaryFooter: {
    backgroundColor?: BackgroundStyle;
    linksAlignment: "left" | "right";
  };
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
  analytics?: {
    scope?: string;
  };
}

const expandedFooterSectionFields: Fields<ExpandedFooterProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      primaryFooter: YextField(msg("fields.primaryFooter", "Primary Footer"), {
        type: "object",
        objectFields: {
          logo: YextField(msg("fields.logo", "Logo"), {
            type: "text",
          }),
          facebookLink: YextField(msg("fields.facebookLink", "Facebook Link"), {
            type: "text",
          }),
          instagramLink: YextField(
            msg("fields.instagramLink", "Instagram Link"),
            {
              type: "text",
            }
          ),
          linkedInLink: YextField(msg("fields.linkedInLink", "LinkedIn Link"), {
            type: "text",
          }),
          pinterestLink: YextField(
            msg("fields.pinterestLink", "Pinterest Link"),
            {
              type: "text",
            }
          ),
          tiktokLink: YextField(msg("fields.tiktokLink", "Tiktok Link"), {
            type: "text",
          }),
          xLink: YextField(msg("fields.xLink", "X Link"), {
            type: "text",
          }),
          youtubeLink: YextField(msg("fields.youtubeLink", "YouTube Link"), {
            type: "text",
          }),
          utilityImages: YextField(
            msg("fields.utilityImages", "Utility Images"),
            {
              type: "array",
              arrayFields: {
                url: YextField(msg("fields.imageUrl", "Image URL"), {
                  type: "text",
                }),
                linkTarget: YextField(
                  msg("fields.destinationURL", "Destination URL"),
                  {
                    type: "text",
                  }
                ),
              },
            }
          ),
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
          expandedFooterLinks: YextField(
            msg("fields.expandedFooterLinks", "Expanded Footer Links"),
            {
              type: "array",
              arrayFields: {
                label: YextField(msg("fields.label", "Label"), {
                  type: "text",
                }),
                links: YextField(msg("fields.links", "Links"), {
                  type: "array",
                  arrayFields: {
                    label: TranslatableStringField(
                      msg("fields.label", "Label"),
                      { types: ["type.string"] }
                    ),
                    link: YextField(msg("fields.link", "Link"), {
                      type: "text",
                    }),
                    linkType: {
                      label: pt("fields.linkType", "Link Type"),
                      type: "select",
                      options: linkTypeOptions(),
                    },
                  },
                  defaultItemProps: defaultFooterLink,
                }),
              },
              defaultItemProps: defaultExpandedFooterLinks,
            }
          ),
          footerLinks: YextField(msg("fields.footerLinks", "Footer Links"), {
            type: "array",
            arrayFields: {
              label: TranslatableStringField(msg("fields.label", "Label"), {
                types: ["type.string"],
              }),
              link: YextField(msg("fields.link", "Link"), {
                type: "text",
              }),
              linkType: {
                label: pt("fields.linkType", "Link Type"),
                type: "select",
                options: linkTypeOptions(),
              },
            },
            defaultItemProps: defaultFooterLink,
          }),
        },
      }),
      secondaryFooter: YextField(
        msg("fields.secondaryFooterLinks", "Secondary Footer Links"),
        {
          type: "object",
          objectFields: {
            show: YextField(msg("fields.show", "Show"), {
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            }),
            copyrightMessage: TranslatableStringField(
              msg("fields.copyrightMessage", "Copyright Message"),
              { types: ["type.string"] }
            ),
            secondaryFooterLinks: YextField(
              msg("fields.secondaryFooterLinks", "Secondary Footer Links"),
              {
                type: "array",
                arrayFields: {
                  label: TranslatableStringField(msg("fields.label", "Label"), {
                    types: ["type.string"],
                  }),
                  link: YextField(msg("fields.link", "Link"), {
                    type: "text",
                  }),
                  linkType: {
                    label: pt("fields.linkType", "Link Type"),
                    type: "select",
                    options: linkTypeOptions(),
                  },
                },
                defaultItemProps: defaultFooterLink,
              }
            ),
          },
        }
      ),
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
      secondaryFooter: YextField(
        msg("fields.secondaryFooter", "Secondary Footer"),
        {
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
          },
        }
      ),
    },
  }),
};

const ExpandedFooterWrapper = ({
  data,
  styles,
  puck,
}: WithId<WithPuckProps<ExpandedFooterProps>>) => {
  const { primaryFooter, secondaryFooter } = data;
  const {
    primaryFooter: primaryFooterStyle,
    secondaryFooter: secondaryFooterStyle,
  } = styles;
  const {
    logo,
    footerLinks,
    xLink,
    facebookLink,
    instagramLink,
    pinterestLink,
    linkedInLink,
    youtubeLink,
    tiktokLink,
    utilityImages,
    expandedFooterLinks,
    expandedFooter,
  } = primaryFooter;
  const { show, copyrightMessage, secondaryFooterLinks } = secondaryFooter;
  const {
    linksAlignment: primaryLinksAlignment,
    backgroundColor,
    logo: { width: logoWidth, aspectRatio: aspectRatioForLogo },
    utilityImages: {
      width: utilityImagesWidth,
      aspectRatio: aspectRatioForUtilityImages,
    },
  } = primaryFooterStyle;
  const {
    backgroundColor: secondaryBackgroundColor,
    linksAlignment: secondaryLinksAlignment,
  } = secondaryFooterStyle;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  return (
    <Background className="mt-auto" ref={puck.dragRef} as="footer">
      <PageSection
        verticalPadding={"footer"}
        background={backgroundColor}
        className={`flex flex-col ${primaryLinksAlignment === "right" ? `md:flex-row` : `md:flex-row-reverse`} md:justify-start w-full md:items-start gap-8 md:gap-10`}
      >
        <div
          className={`flex flex-col gap-10 md:gap-8 ${primaryLinksAlignment === "left" ? `items-end` : `items-start`}`}
        >
          {logo && (
            <EntityField
              constantValueEnabled
              displayName={pt("fields.logo", "Logo")}
            >
              <FooterLogo
                aspectRatio={aspectRatioForLogo}
                logo={buildComplexLogoImage(logo, logoWidth || 100)}
                logoWidth={logoWidth || 100}
              />
            </EntityField>
          )}
          <div className="hidden md:block space-y-8">
            <FooterIcons
              xLink={xLink}
              facebookLink={facebookLink}
              instagramLink={instagramLink}
              pinterestLink={pinterestLink}
              linkedInLink={linkedInLink}
              youtubeLink={youtubeLink}
              tiktokLink={tiktokLink}
            />
            {utilityImages && utilityImages.length >= 1 && (
              <EntityField
                constantValueEnabled
                displayName={pt("fields.utilityImages", "Utility Images")}
              >
                <div className="grid grid-cols-3 gap-8">
                  {utilityImages.map((item, index) => (
                    <FooterLogo
                      aspectRatio={aspectRatioForUtilityImages}
                      key={index}
                      logo={buildComplexUtilityImage(
                        item.url,
                        utilityImagesWidth || 60
                      )}
                      logoWidth={utilityImagesWidth || 60}
                    />
                  ))}
                </div>
              </EntityField>
            )}
          </div>
        </div>
        {expandedFooter ? (
          <EntityField
            constantValueEnabled
            displayName={pt(
              "fields.expandedFooterLinks",
              "Expanded Footer Links"
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 w-full text-center md:text-left justify-items-center md:justify-items-start gap-6">
              {expandedFooterLinks.map((item, index) => (
                <ExpandedFooterLinks
                  label={resolveComponentData(
                    item.label,
                    i18n.language,
                    streamDocument
                  )}
                  links={item.links}
                  key={index}
                />
              ))}
            </div>
          </EntityField>
        ) : (
          <div className="w-full">
            <EntityField
              constantValueEnabled
              displayName={pt("fields.footerLinks", "Footer Links")}
            >
              <FooterLinks links={footerLinks} type="Primary" />
            </EntityField>
          </div>
        )}
        <div className="md:hidden block space-y-10">
          <FooterIcons
            xLink={xLink}
            facebookLink={facebookLink}
            instagramLink={instagramLink}
            pinterestLink={pinterestLink}
            linkedInLink={linkedInLink}
            youtubeLink={youtubeLink}
            tiktokLink={tiktokLink}
          />
          {utilityImages && utilityImages.length >= 1 && (
            <EntityField
              constantValueEnabled
              displayName={pt("fields.utilityImages", "Utility Images")}
            >
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-3 flex justify-center">
                  {utilityImages.map((item, index) => (
                    <FooterLogo
                      aspectRatio={aspectRatioForUtilityImages}
                      key={index}
                      logo={buildComplexUtilityImage(
                        item.url,
                        logoWidth || 100
                      )}
                      logoWidth={utilityImagesWidth || 100}
                    />
                  ))}
                </div>
              </div>
            </EntityField>
          )}
        </div>
      </PageSection>
      {show && (
        <PageSection
          verticalPadding={"footerSecondary"}
          background={secondaryBackgroundColor}
          className={`flex flex-col gap-5 ${secondaryLinksAlignment === "left" ? "md:items-start" : "md:items-end"}`}
        >
          {secondaryFooterLinks?.length >= 1 && (
            <EntityField
              constantValueEnabled
              displayName={pt(
                "fields.secondaryFooterLinks",
                "Secondary Footer Links"
              )}
            >
              <FooterLinks links={secondaryFooterLinks} type="Secondary" />
            </EntityField>
          )}
          {copyrightMessage && (
            <EntityField
              constantValueEnabled
              displayName={pt("fields.copyrightMessage", "Copyright Message")}
            >
              <Body variant="xs" className="text-center md:text-left">
                {resolveComponentData(
                  copyrightMessage,
                  i18n.language,
                  streamDocument
                )}
              </Body>
            </EntityField>
          )}
        </PageSection>
      )}
    </Background>
  );
};

const FooterLinks = ({
  links,
  type = "Primary",
}: {
  links: TranslatableCTA[];
  type?: "Primary" | "Secondary";
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  return (
    <ul
      className={`w-full ${type === "Secondary" ? "gap-4 flex flex-col md:flex-row" : "grid grid-cols-1 md:grid-cols-5 gap-6"}`}
    >
      {links.map((item, index) => {
        return (
          <li key={`${type.toLowerCase()}.${index}`}>
            <CTA
              variant={
                type === "Primary"
                  ? "headerFooterMainLink"
                  : "headerFooterSecondaryLink"
              }
              eventName={`cta.${type.toLowerCase()}.${index}-Link-${index + 1}`}
              label={resolveComponentData(
                item.label,
                i18n.language,
                streamDocument
              )}
              linkType={item.linkType}
              link={item.link}
              className="justify-center md:justify-start block break-words whitespace-normal"
            />
          </li>
        );
      })}
    </ul>
  );
};

const ExpandedFooterLinks = ({
  links,
  label,
}: {
  links: TranslatableCTA[];
  label: string;
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  return (
    <ul className={`flex flex-col items-center md:items-start gap-4 w-full`}>
      <li className="w-full">
        <Body className="break-words">{label}</Body>
      </li>
      {links.map((item, index) => (
        <li key={index} className="w-full">
          <CTA
            variant={"headerFooterMainLink"}
            eventName={`cta${index}-Link-${index + 1}`}
            label={resolveComponentData(
              item.label,
              i18n.language,
              streamDocument
            )}
            linkType={item.linkType}
            link={item.link}
            className={"justify-start block break-words whitespace-normal"}
          />
        </li>
      ))}
    </ul>
  );
};

const FooterLogo = (props: {
  logo: ComplexImageType;
  logoLink?: string;
  logoWidth?: number;
  aspectRatio: any;
}) => {
  return (
    <MaybeLink href={props.logoLink} alwaysHideCaret={true}>
      <div style={{ width: `${props.logoWidth}px` }}>
        <Image
          image={props.logo.image}
          aspectRatio={
            props.aspectRatio ||
            props.logo.image.width / props.logo.image.height
          }
        />
      </div>
    </MaybeLink>
  );
};

const buildComplexLogoImage = (
  url: string | undefined,
  width: number
): ComplexImageType => {
  return {
    image: {
      url: url!,
      alternateText: "Logo",
      height: width / 2,
      width: width,
    },
  };
};

const buildComplexUtilityImage = (
  url: string | undefined,
  width: number
): ComplexImageType => {
  return {
    image: {
      url: url!,
      height: width,
      width: width,
      alternateText: "Utility Image",
    },
  };
};

const FooterIcons = ({
  xLink,
  facebookLink,
  instagramLink,
  pinterestLink,
  linkedInLink,
  youtubeLink,
  tiktokLink,
}: {
  xLink: string;
  facebookLink: string;
  instagramLink: string;
  pinterestLink: string;
  linkedInLink: string;
  youtubeLink: string;
  tiktokLink: string;
}) => {
  const { t } = useTranslation();

  const icons = [
    {
      link: xLink,
      icon: <FaXTwitter className="h-6 w-6 md:h-5 md:w-5" />,
      label: "X (Twitter)",
      valid: validPatterns.xLink.test(xLink),
    },
    {
      link: facebookLink,
      icon: <FaFacebook className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Facebook",
      valid: validPatterns.facebookLink.test(facebookLink),
    },
    {
      link: instagramLink,
      icon: <FaInstagram className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Instagram",
      valid: validPatterns.instagramLink.test(instagramLink),
    },
    {
      link: pinterestLink,
      icon: <FaPinterest className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Pinterest",
      valid: validPatterns.pinterestLink.test(pinterestLink),
    },
    {
      link: linkedInLink,
      icon: <FaLinkedinIn className="h-6 w-6 md:h-5 md:w-5" />,
      label: "LinkedIn",
      valid: validPatterns.linkedInLink.test(linkedInLink),
    },
    {
      link: youtubeLink,
      icon: <FaYoutube className="h-6 w-6 md:h-5 md:w-5" />,
      label: "YouTube",
      valid: validPatterns.youtubeLink.test(youtubeLink),
    },
    {
      link: tiktokLink,
      icon: <FaTiktok className="h-6 w-6 md:h-5 md:w-5" />,
      label: "TikTok",
      valid: validPatterns.tiktokLink.test(tiktokLink),
    },
  ];

  const filteredIcons = icons.filter(({ valid }) => valid);

  if (filteredIcons.length === 0) return null;

  return (
    <EntityField
      constantValueEnabled
      displayName={pt("fields.socialLinks", "Social Links")}
    >
      <div className="flex gap-6 items-center justify-center md:justify-start">
        {filteredIcons.map(({ link, icon, label }, index) => (
          <CTA
            key={index}
            label={icon}
            link={link}
            linkType="URL"
            variant="link"
            eventName={`socialLink.${label.toLowerCase()}`}
            ariaLabel={`${label} ${t("link", "link")}`}
            alwaysHideCaret
            className="block break-words whitespace-normal"
          />
        ))}
      </div>
    </EntityField>
  );
};

/**
 * The Expanded Footer is a comprehensive, two-tiered site-wide component for large websites. It includes a primary footer area for a logo, social media links, and utility images, and features two distinct layouts: a standard link list or an "expanded" multi-column mega-footer. It also includes an optional secondary sub-footer for copyright notices and legal links.
 * Avalible on Location templates.
 */
export const ExpandedFooter: ComponentConfig<ExpandedFooterProps> = {
  label: msg("components.expandedFooter", "Expanded Footer"),
  fields: expandedFooterSectionFields,
  defaultProps: {
    data: {
      primaryFooter: {
        logo: PLACEHOLDER_LOGO_IMAGE,
        footerLinks: [
          defaultFooterLink,
          defaultFooterLink,
          defaultFooterLink,
          defaultFooterLink,
          defaultFooterLink,
        ],
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
            links: [
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
            ],
          },
          {
            label: "Footer Label",
            links: [
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
            ],
          },
          {
            label: "Footer Label",
            links: [
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
            ],
          },
          {
            label: "Footer Label",
            links: [
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
              defaultFooterLink,
            ],
          },
        ],
      },
      secondaryFooter: {
        show: false,
        copyrightMessage: { en: "", hasLocalizedValue: "true" },
        secondaryFooterLinks: [
          defaultFooterLink,
          defaultFooterLink,
          defaultFooterLink,
          defaultFooterLink,
          defaultFooterLink,
        ],
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
        backgroundColor: backgroundColors.background6.value,
        linksAlignment: "right",
      },
      secondaryFooter: {
        backgroundColor: backgroundColors.background2.value,
        linksAlignment: "left",
      },
    },
    analytics: {
      scope: "expandedFooter",
    },
  },
  resolveFields: (_data, { fields }) => {
    const expanded = _data.props.data.primaryFooter.expandedFooter;
    const showSecondaryFooter = _data.props.data.secondaryFooter.show;

    const primaryFooterFields = {
      // @ts-expect-error ts(2339) objectFields exists
      ...fields.data.objectFields.primaryFooter.objectFields,
    };
    const secondaryFooterFields = {
      // @ts-expect-error ts(2339) objectFields exists
      ...fields.data.objectFields.secondaryFooter.objectFields,
    };
    const stylesFields = {
      // @ts-expect-error ts(2339) objectFields exists
      ...fields.styles.objectFields,
    };
    const secondaryFooterStyles = {
      // @ts-expect-error ts(2339) objectFields exists
      ...fields.styles.objectFields.secondaryFooter.objectFields,
    };

    if (expanded) {
      delete primaryFooterFields.footerLinks;
    } else {
      delete primaryFooterFields.expandedFooterLinks;
    }

    if (!showSecondaryFooter) {
      delete secondaryFooterFields.secondaryFooterLinks;
      delete secondaryFooterFields.copyrightMessage;
      delete stylesFields.secondaryFooter;
    } else {
      stylesFields.secondaryFooter = {
        // @ts-expect-error ts(2339) objectFields exists ts(2339) objectFields exists
        ...fields.styles.objectFields.secondaryFooter,
        objectFields: secondaryFooterStyles,
      };
    }

    return {
      ...fields,
      data: {
        ...fields.data,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields exists ts(2339) objectFields exists
          ...fields.data.objectFields,
          primaryFooter: {
            // @ts-expect-error ts(2339) objectFields exists
            ...fields.data.objectFields.primaryFooter,
            objectFields: primaryFooterFields,
          },
          secondaryFooter: {
            // @ts-expect-error ts(2339) objectFields exists
            ...fields.data.objectFields.secondaryFooter,
            objectFields: secondaryFooterFields,
          },
        },
      },
      styles: {
        ...fields.styles,
        objectFields: stylesFields,
      },
    };
  },
  inline: true,
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "expandedFooter"}>
      <ExpandedFooterWrapper {...props} />
    </AnalyticsScopeProvider>
  ),
};
