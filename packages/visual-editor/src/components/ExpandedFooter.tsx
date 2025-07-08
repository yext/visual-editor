import * as React from "react";
import {
  AnalyticsScopeProvider,
  ComplexImageType,
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
  TranslatableStringField,
  TranslatableString,
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
import { linkTypeOptions } from "../internal/puck/constant-value-fields/CallToAction.tsx";

const PLACEHOLDER_LOGO_IMAGE: string = "https://placehold.co/100";

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
      expandedFooterLinks: {
        label: TranslatableString;
        links: TranslatableCTA[];
      }[];
    };
    secondaryFooter: {
      show: boolean;
      copyrightMessage: TranslatableString;
      secondaryFooterLinks: TranslatableCTA[];
    };
  };
  styles: {
    primaryFooter: {
      backgroundColor?: BackgroundStyle;
      linksAlignment: "left" | "right";
      logoWidth: number;
      utilityImagesWidth: number;
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
                      "text"
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
                }),
              },
            }
          ),
          footerLinks: YextField(msg("fields.footerLinks", "Footer Links"), {
            type: "array",
            arrayFields: {
              label: TranslatableStringField(
                msg("fields.label", "Label"),
                "text"
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
              "text"
            ),
            secondaryFooterLinks: YextField(
              msg("fields.secondaryFooterLinks", "Secondary Footer Links"),
              {
                type: "array",
                arrayFields: {
                  label: TranslatableStringField(
                    msg("fields.label", "Label"),
                    "text"
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
          logoWidth: YextField(msg("fields.logoWidth", "Logo Width"), {
            type: "number",
            min: 100,
          }),
          utilityImagesWidth: YextField(
            msg("fields.utilityImagesWidth", "Utility Images Width"),
            {
              type: "number",
              min: 60,
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
    expandedFooterLinks,
    expandedFooter,
  } = primaryFooter;
  const { show, copyrightMessage, secondaryFooterLinks } = secondaryFooter;
  const { backgroundColor, logoWidth, utilityImagesWidth } = primaryFooterStyle;
  const { backgroundColor: secondaryBackgroundColor } = secondaryFooterStyle;
  const { i18n, t } = useTranslation();

  return (
    <>
      <div
        className="hidden md:flex flex-col min-h-screen"
        aria-label={t("expandedFooterDesktop", "Expanded Footer Desktop")}
      >
        <div className="flex-1" />
        <PageSection
          as="footer"
          verticalPadding={"footer"}
          background={backgroundColor}
          className={`flex flex-row justify-start w-full items-start gap-10`}
        >
          <div className="flex flex-col gap-8">
            <EntityField
              constantValueEnabled
              displayName={pt("fields.logo", "Logo")}
            >
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
                constantValueEnabled
                displayName={pt("fields.utilityImages", "Utility Images")}
              >
                <div className="grid grid-cols-3 gap-8">
                  {utilityImages.map((item, index) => (
                    <FooterLogo
                      key={index}
                      logo={buildComplexUtilityImage(item.url, logoWidth)}
                      logoWidth={utilityImagesWidth}
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
              {expandedFooterLinks.map((item, index) => (
                <EntityField
                  constantValueEnabled
                  key={index}
                  displayName={pt(
                    "fields.expandedFooterLinks",
                    "Expanded Footer Links"
                  )}
                >
                  <ExpandedFooterLinks
                    label={resolveTranslatableString(item.label, i18n.language)}
                    links={item.links}
                  />
                </EntityField>
              ))}
            </div>
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
        </PageSection>
        {show && (
          <PageSection
            as="footer"
            verticalPadding={"footerSecondary"}
            background={secondaryBackgroundColor}
            className={`space-y-5`}
          >
            <EntityField
              constantValueEnabled
              displayName={pt(
                "fields.secondaryFooterLinks",
                "Secondary Footer Links"
              )}
            >
              <FooterLinks links={secondaryFooterLinks} type="Secondary" />
            </EntityField>
            {copyrightMessage && (
              <EntityField
                constantValueEnabled
                displayName={pt("fields.copyrightMessage", "Copyright Message")}
              >
                <Body variant="xs">
                  {resolveTranslatableString(copyrightMessage, i18n.language)}
                </Body>
              </EntityField>
            )}
          </PageSection>
        )}
      </div>
      <div
        id="mobile-footer-menu"
        className={`md:hidden flex flex-col min-h-screen`}
        aria-label={t("expandedFooterMobile", "Expanded Footer Mobile")}
      >
        <div className="flex-1" />
        <PageSection
          as="footer"
          background={backgroundColor}
          verticalPadding={"footer"}
          className="flex flex-col gap-8"
        >
          <EntityField
            constantValueEnabled
            displayName={pt("fields.logo", "Logo")}
          >
            <FooterLogo
              logo={buildComplexLogoImage(logo, logoWidth)}
              logoWidth={logoWidth}
            />
          </EntityField>

          {expandedFooter ? (
            <div className="grid grid-cols-1 w-full gap-6">
              {expandedFooterLinks.map((item, index) => (
                <EntityField
                  constantValueEnabled
                  key={index}
                  displayName={pt(
                    "fields.expandedFooterLinks",
                    "Expanded Footer Links"
                  )}
                >
                  <ExpandedFooterLinks
                    label={resolveTranslatableString(item.label, i18n.language)}
                    links={item.links}
                  />
                </EntityField>
              ))}
            </div>
          ) : (
            <EntityField
              constantValueEnabled
              displayName={pt("fields.footerLinks", "Footer Links")}
            >
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
              constantValueEnabled
              displayName={pt("fields.utilityImages", "Utility Images")}
            >
              <div className="grid grid-cols-3 gap-8">
                {utilityImages.map((item, index) => (
                  <FooterLogo
                    key={index}
                    logo={buildComplexUtilityImage(item.url, logoWidth)}
                    logoWidth={utilityImagesWidth}
                  />
                ))}
              </div>
            </EntityField>
          )}
        </PageSection>
        {show && (
          <PageSection
            as="footer"
            className="flex flex-col gap-5"
            background={secondaryBackgroundColor}
            verticalPadding={"footerSecondary"}
          >
            <EntityField
              constantValueEnabled
              displayName={pt(
                "fields.secondaryFooterLinks",
                "Secondary Footer Links"
              )}
            >
              <FooterLinks links={secondaryFooterLinks} type="Secondary" />
            </EntityField>

            {copyrightMessage && (
              <EntityField
                constantValueEnabled
                displayName={pt("fields.copyrightMessage", "Copyright Message")}
              >
                <Body variant="xs" className="text-center">
                  {resolveTranslatableString(copyrightMessage, i18n.language)}
                </Body>
              </EntityField>
            )}
          </PageSection>
        )}
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
                  : "headerFooterSecondaryLink"
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
  const { t } = useTranslation();

  const icons = [
    {
      link: xLink,
      icon: <FaXTwitter className="h-6 w-6 md:h-5 md:w-5" />,
      label: "X (Twitter)",
      prefix: "",
      valid: /^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}$/.test(xLink),
    },
    {
      link: facebookLink,
      icon: <FaFacebook className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Facebook",
      prefix: "",
      valid: /^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9.-]+$/.test(
        facebookLink
      ),
    },
    {
      link: instagramLink,
      icon: <FaInstagram className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Instagram",
      prefix: "",
      valid: /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]{1,30}\/?$/.test(
        instagramLink
      ),
    },
    {
      link: pinterestLink,
      icon: <FaPinterest className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Pinterest",
      prefix: "",
      valid: /^https:\/\/(www\.)?pinterest\.com\/[A-Za-z0-9_-]+\/?$/.test(
        pinterestLink
      ),
    },
    {
      link: linkedInLink,
      icon: <FaLinkedinIn className="h-6 w-6 md:h-5 md:w-5" />,
      label: "LinkedIn",
      prefix: "",
      valid:
        /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9-%_]+\/?$/.test(
          linkedInLink
        ),
    },
    {
      link: youtubeLink,
      icon: <FaYoutube className="h-6 w-6 md:h-5 md:w-5" />,
      label: "YouTube",
      prefix: "",
      valid:
        /^https:\/\/(www\.)?youtube\.com\/(channel|user|c)\/[A-Za-z0-9_-]+$|^https:\/\/youtu\.be\/[A-Za-z0-9_-]+$/.test(
          youtubeLink
        ),
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
            alwaysHideCaret={true}
          />
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
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
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
        expandedFooterLinks: [
          {
            label: "Footer Label",
            links: [
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
            ],
          },
          {
            label: "Footer Label",
            links: [
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
            ],
          },
          {
            label: "Footer Label",
            links: [
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
            ],
          },
          {
            label: "Footer Label",
            links: [
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
              {
                label: { en: "Footer Link", hasLocalizedValue: "true" },
                linkType: "URL",
                link: "#",
              },
            ],
          },
        ],
      },
      secondaryFooter: {
        show: false,
        copyrightMessage: { en: "", hasLocalizedValue: "true" },
        secondaryFooterLinks: [
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
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
        utilityImagesWidth: 60,
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
