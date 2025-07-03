import * as React from "react";
import {
  AnalyticsScopeProvider,
  ComplexImageType,
  Link,
} from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  EntityField,
  MaybeLink,
  backgroundColors,
  Image,
  msg,
  YextField,
  VisibilityWrapper,
  BackgroundStyle,
  pt,
  Body,
  CTA,
  TranslatableCTA,
  resolveTranslatableString,
  PageSection,
} from "@yext/visual-editor";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPinterest,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const PLACEHOLDER_LOGO_IMAGE: string = "https://placehold.co/100X50";

export interface ExpandedFooterProps {
  data: {
    primaryFooter: {
      logo: string;
      xLink: string;
      facebookLink: string;
      instagramLink: string;
      pinterestLink: string;
      linkedInLink: string;
      youtubeLink: string;
      utilityImages: { url: string }[];
      expandedFooter: boolean;
      footerLinks: TranslatableCTA[];
      expandedFooterItems: { label: string; links: TranslatableCTA[] }[];
    };
    secondaryFooter: {
      show: boolean;
      copyrightMessage: string;
      secondaryFooterLinks: TranslatableCTA[];
    };
  };
  styles: {
    primaryFooter: {
      backgroundColor?: BackgroundStyle;
      linksAlignment: "left" | "right";
      logoWidth: number;
      utilityImages: number;
    };
    secondaryFooter: {
      backgroundColor?: BackgroundStyle;
      linksAlignment: "left" | "right";
    };
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const expandedFooterSectionFields: Fields<ExpandedFooterProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      primaryFooter: YextField(msg("fields.primaryFooter", "Primary Footer"), {
        type: "object",
        objectFields: {
          logo: YextField(msg("fields.logoUrl", "Logo"), {
            type: "text",
          }),
          xLink: YextField(msg("fields.xLink", "X Link"), {
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
          pinterestLink: YextField(
            msg("fields.pinterestLink", "Pinterest Link"),
            {
              type: "text",
            }
          ),
          linkedInLink: YextField(msg("fields.linkedInLink", "LinkedIn Link"), {
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
                url: YextField("Image URL", { type: "text" }),
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
          expandedFooterItems: YextField(
            msg("fields.expandedFooterItems", "Expanded Footer Items"),
            {
              type: "array",
              arrayFields: {
                label: YextField(msg("fields.label", "Label"), {
                  type: "text",
                }),
                links: YextField(msg("fields.links", "Links"), {
                  type: "array",
                  arrayFields: {
                    label: YextField(msg("fields.label", "Label"), {
                      type: "text",
                    }),
                    link: YextField(msg("fields.link", "Link"), {
                      type: "text",
                    }),
                    linkType: YextField(msg("fields.linkType", "Link Type"), {
                      type: "text",
                    }),
                  },
                }),
              },
            }
          ),
          footerLinks: YextField(msg("fields.footerLinks", "Footer Links"), {
            type: "array",
            arrayFields: {
              label: YextField(msg("fields.label", "Label"), {
                type: "text",
              }),
              link: YextField(msg("fields.link", "Link"), {
                type: "text",
              }),
              linkType: YextField(msg("fields.linkType", "Link Type"), {
                type: "text",
              }),
            },
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
            copyrightMessage: YextField(
              msg("fields.copyrightMessage", "Copyright Message"),
              {
                type: "text",
              }
            ),
            secondaryFooterLinks: YextField(
              msg("fields.secondaryFooterLinks", "Secondary Footer Links"),
              {
                type: "array",
                arrayFields: {
                  label: YextField(msg("fields.label", "Label"), {
                    type: "text",
                  }),
                  link: YextField(msg("fields.link", "Link"), {
                    type: "text",
                  }),
                  linkType: YextField(msg("fields.linkType", "Link Type"), {
                    type: "text",
                  }),
                },
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
                { label: msg("fields.options.left", "Left"), value: "left" },
                { label: msg("fields.options.right", "Right"), value: "right" },
              ],
            }
          ),
          logoWidth: YextField(msg("fields.logoWidth", "Logo"), {
            type: "number",
            min: 0,
          }),
          utilityImages: YextField(
            msg("fields.utilityImages", "Utility Images"),
            {
              type: "number",
              min: 0,
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
                  { label: msg("fields.options.left", "Left"), value: "left" },
                  {
                    label: msg("fields.options.right", "Right"),
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
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const ExpandedFooterWrapper: React.FC<ExpandedFooterProps> = ({
  data,
  styles,
}: ExpandedFooterProps) => {
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
    utilityImages,
    expandedFooterItems,
    expandedFooter,
  } = primaryFooter;
  const { show, copyrightMessage, secondaryFooterLinks } = secondaryFooter;
  const {
    backgroundColor,
    logoWidth,
    utilityImages: utilityImagesStyle,
  } = primaryFooterStyle;
  const { backgroundColor: secondaryBackgroundColor } = secondaryFooterStyle;
  const { t } = useTranslation();

  return (
    <>
      <div
        className="hidden md:flex flex-col"
        aria-label={t("expandedFooterDesktop", "Expanded Footer Desktop")}
      >
        <PageSection
          as="footer"
          verticalPadding={"footer"}
          background={backgroundColor}
          className={`flex flex-row justify-start w-full items-start gap-10`}
        >
          <div className="flex flex-col gap-8">
            <EntityField displayName={pt("fields.logo", "Logo")}>
              <FooterLogo
                logo={buildComplexLogoImage(logo, logoWidth)}
                logoWidth={logoWidth}
              />
            </EntityField>
            <FooterIcons
              xLink={xLink}
              facebookLink={facebookLink}
              instagramLink={instagramLink}
              pinterestLink={pinterestLink}
              linkedInLink={linkedInLink}
              youtubeLink={youtubeLink}
            />
            {utilityImages && utilityImages.length >= 1 && (
              <EntityField
                displayName={pt("fields.utilityImages", "Utility Images")}
              >
                <div className="grid grid-cols-3 gap-8">
                  {utilityImages.map((item, index) => (
                    <FooterLogo
                      key={index}
                      logo={buildComplexUtilityImage(item.url, logoWidth)}
                      logoWidth={utilityImagesStyle}
                    />
                  ))}
                </div>
              </EntityField>
            )}
          </div>
          {expandedFooter ? (
            <div
              aria-label={pt("footerLinks", "Footer Links")}
              className="grid grid-cols-1 md:grid-cols-4 w-full text-center"
            >
              {expandedFooterItems.map((item, index) => (
                <EntityField
                  key={index}
                  displayName={pt(
                    "fields.expandedFooterLinks",
                    "Expanded Footer Links"
                  )}
                >
                  <ExpandedFooterLinks label={item.label} links={item.links} />
                </EntityField>
              ))}
            </div>
          ) : (
            <div className="w-full">
              <EntityField
                displayName={pt("fields.footerLinks", "Footer Links")}
              >
                <FooterLinks links={footerLinks} type="Primary" />
              </EntityField>
            </div>
          )}
        </PageSection>
        {show && (
          <PageSection
            as="footer"
            verticalPadding={"footer_secondary"}
            background={secondaryBackgroundColor}
            className={`space-y-5`}
          >
            <EntityField
              displayName={pt(
                "fields.secondaryFooterLinks",
                "Secondary Footer Links"
              )}
            >
              <FooterLinks links={secondaryFooterLinks} type="Secondary" />
            </EntityField>
            {copyrightMessage && (
              <EntityField
                displayName={pt("fields.copyrightMessage", "Copyright Message")}
              >
                <Body className="text-xs">{copyrightMessage}</Body>
              </EntityField>
            )}
          </PageSection>
        )}
      </div>
      <div
        id="mobile-footer-menu"
        className={`md:hidden block`}
        aria-label={t("expandedFooterMobile", "Expanded Footer Mobile")}
      >
        <PageSection
          as="footer"
          background={backgroundColor}
          verticalPadding={"footer"}
          className="flex flex-col gap-8"
        >
          <EntityField displayName={pt("fields.logo", "Logo")}>
            <FooterLogo
              logo={buildComplexLogoImage(logo, logoWidth)}
              logoWidth={logoWidth}
            />
          </EntityField>

          {expandedFooter ? (
            <div className="grid grid-cols-1 w-full gap-6">
              {expandedFooterItems.map((item, index) => (
                <EntityField
                  key={index}
                  displayName={pt(
                    "fields.expandedFooterLinks",
                    "Expanded Footer Links"
                  )}
                >
                  <ExpandedFooterLinks label={item.label} links={item.links} />
                </EntityField>
              ))}
            </div>
          ) : (
            <EntityField displayName={pt("fields.footerLinks", "Footer Links")}>
              <FooterLinks links={footerLinks} type="Primary" />
            </EntityField>
          )}
          <FooterIcons
            xLink={xLink}
            facebookLink={facebookLink}
            instagramLink={instagramLink}
            pinterestLink={pinterestLink}
            linkedInLink={linkedInLink}
            youtubeLink={youtubeLink}
          />
          {utilityImages && utilityImages.length >= 1 && (
            <EntityField
              displayName={pt("fields.utilityImages", "Utility Images")}
            >
              <div className="grid grid-cols-3 gap-8">
                {utilityImages.map((item, index) => (
                  <FooterLogo
                    key={index}
                    logo={buildComplexUtilityImage(item.url, logoWidth)}
                    logoWidth={utilityImagesStyle}
                  />
                ))}
              </div>
            </EntityField>
          )}
        </PageSection>
        <PageSection
          as="footer"
          className="flex flex-col gap-5"
          background={secondaryBackgroundColor}
          verticalPadding={"footer_secondary"}
        >
          <EntityField
            displayName={pt(
              "fields.secondaryFooterLinks",
              "Secondary Footer Links"
            )}
          >
            <FooterLinks links={secondaryFooterLinks} type="Secondary" />
          </EntityField>

          {copyrightMessage && (
            <EntityField
              displayName={pt("fields.copyrightMessage", "Copyright Message")}
            >
              <Body className="text-xs text-center">{copyrightMessage}</Body>
            </EntityField>
          )}
        </PageSection>
      </div>
    </>
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
                  : "headerSecondaryLink"
              }
              eventName={`cta.${type.toLowerCase()}.${index}-Link-${index + 1}`}
              label={resolveTranslatableString(item.label, i18n.language)}
              linkType={item.linkType}
              link={item.link}
              className={`justify-center md:justify-start`}
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

  return (
    <ul className={`flex flex-col items-center md:items-start gap-4`}>
      <li>
        <Body>{label}</Body>
      </li>
      {links.map((item, index) => (
        <li key={index}>
          <CTA
            variant={"headerFooterMainLink"}
            eventName={`cta${index}-Link-${index + 1}`}
            label={resolveTranslatableString(item.label, i18n.language)}
            linkType={item.linkType}
            link={item.link}
            className={`justify-start `}
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
}) => {
  return (
    <MaybeLink href={props.logoLink}>
      <div
        className="mx-auto md:ml-0"
        style={{ width: `${props.logoWidth}px` }}
      >
        <Image
          image={props.logo.image}
          layout="auto"
          aspectRatio={props.logo.image.width / props.logo.image.height}
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
}: {
  xLink: string;
  facebookLink: string;
  instagramLink: string;
  pinterestLink: string;
  linkedInLink: string;
  youtubeLink: string;
}) => {
  const isValid = {
    x: /^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}$/,
    facebook: /^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9.-]+$/,
    instagram: /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]{1,30}\/?$/,
    pinterest: /^https:\/\/(www\.)?pinterest\.com\/[A-Za-z0-9_-]+\/?$/,
    linkedin:
      /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9-%_]+\/?$/,
    youtube:
      /^https:\/\/(www\.)?youtube\.com\/(channel|user|c)\/[A-Za-z0-9_-]+\/?$|^https:\/\/youtu\.be\/[A-Za-z0-9_-]+$/,
  };

  const icons = [
    {
      link: xLink,
      icon: <FaXTwitter className="h-6 w-6 md:h-5 md:w-5" />,
      label: "X (Twitter)",
      valid: isValid.x.test(xLink),
    },
    {
      link: facebookLink,
      icon: <FaFacebook className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Facebook",
      valid: isValid.facebook.test(facebookLink),
    },
    {
      link: instagramLink,
      icon: <FaInstagram className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Instagram",
      valid: isValid.instagram.test(instagramLink),
    },
    {
      link: pinterestLink,
      icon: <FaPinterest className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Pinterest",
      valid: isValid.pinterest.test(pinterestLink),
    },
    {
      link: linkedInLink,
      icon: <FaLinkedinIn className="h-6 w-6 md:h-5 md:w-5" />,
      label: "LinkedIn",
      valid: isValid.linkedin.test(linkedInLink),
    },
    {
      link: youtubeLink,
      icon: <FaYoutube className="h-6 w-6 md:h-5 md:w-5" />,
      label: "YouTube",
      valid: isValid.youtube.test(youtubeLink),
    },
  ];

  const filteredIcons = icons.filter((icon) => icon.valid);

  if (filteredIcons.length === 0) return null;

  return (
    <EntityField displayName={pt("fields.socialLinks", "Social Links")}>
      <div className="flex gap-6 items-center justify-center md:justify-start">
        {filteredIcons.map(({ link, icon, label }, index) => (
          <Link
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-xl hover:opacity-80 transition-opacity"
          >
            {icon}
          </Link>
        ))}
      </div>
    </EntityField>
  );
};

export const ExpandedFooter: ComponentConfig<ExpandedFooterProps> = {
  label: msg("components.expandedFooter", "Expanded Footer"),
  fields: expandedFooterSectionFields,

  defaultProps: {
    data: {
      primaryFooter: {
        logo: PLACEHOLDER_LOGO_IMAGE,
        footerLinks: [
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
        ],
        xLink: "",
        facebookLink: "",
        instagramLink: "",
        pinterestLink: "",
        linkedInLink: "",
        youtubeLink: "",
        utilityImages: [],
        expandedFooter: false,
        expandedFooterItems: [
          {
            label: "Footer Label",
            links: [
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
            ],
          },
          {
            label: "Footer Label",
            links: [
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
            ],
          },
          {
            label: "Footer Label",
            links: [
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
            ],
          },
          {
            label: "Footer Label",
            links: [
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Footer Link",
                link: "#",
              },
            ],
          },
        ],
      },
      secondaryFooter: {
        show: false,
        copyrightMessage: "",
        secondaryFooterLinks: [
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Footer Link",
            link: "#",
          },
        ],
      },
    },
    styles: {
      primaryFooter: {
        logoWidth: 100,
        backgroundColor: backgroundColors.background6.value,
        linksAlignment: "left",
        utilityImages: 60,
      },
      secondaryFooter: {
        backgroundColor: backgroundColors.background2.value,
        linksAlignment: "left",
      },
    },
    analytics: {
      scope: "expandedFooter",
    },
    liveVisibility: true,
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
      delete primaryFooterFields.expandedFooterItems;
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
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "expandedFooter"}>
      <VisibilityWrapper
        liveVisibility={!!props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <ExpandedFooterWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
