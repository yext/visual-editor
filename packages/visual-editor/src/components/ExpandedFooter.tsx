import * as React from "react";
import {
  AnalyticsScopeProvider,
  ComplexImageType,
  CTA as CTAType,
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
  Background,
  Body,
  resolveTranslatableString,
  usePlatformTranslation,
} from "@yext/visual-editor";
import { useState } from "react";
import { t } from "i18next";
import { FaTimes, FaBars } from "react-icons/fa";
import {
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";

const PLACEHOLDER_LOGO_IMAGE: string = "https://placehold.co/100X50";
const PLACEHOLDER_UTILITY_IMAGES: string = "https://placehold.co/60X60";

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
      footerLinks: CTAType[] | undefined;
      expandedFooterItems: { label: string; links: CTAType[] }[] | undefined;
    };
    secondaryFooter: {
      show: boolean;
      copyrightMessage: string;
      secondaryFooterLinks: CTAType[];
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
                    label: YextField("Label", { type: "text" }),
                    link: YextField("Link", { type: "text" }),
                    linkType: YextField("Link Type", { type: "text" }),
                  },
                }),
              },
            }
          ),
          footerLinks: YextField(msg("fields.footerLinks", "Footer Links"), {
            type: "array",
            arrayFields: {
              label: YextField("Label", { type: "text" }),
              link: YextField("Link", { type: "text" }),
              linkType: YextField("Link Type", { type: "text" }),
            },
          }),
        },
      }),
      secondaryFooter: YextField(
        msg("fields.secondaryFooter", "Secondary Footer"),
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
                  label: YextField("Label", { type: "text" }),
                  link: YextField("Link", { type: "text" }),
                  linkType: YextField("Link Type", { type: "text" }),
                },
                getItemSummary: (_, index?: number): string => {
                  const { i18n } = usePlatformTranslation();
                  if (typeof index === "number") {
                    const translation = resolveTranslatableString(
                      `Link ${index + 1}`,
                      i18n.language
                    );
                    if (translation) {
                      return translation;
                    }
                    return pt("link", "Link");
                  }
                  return pt("link", "Link");
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
  const [isOpen, setIsOpen] = useState<boolean>(true);
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

  return (
    <>
      <div
        className="hidden md:flex flex-col"
        aria-label={t("expandedFooter", "Expanded Footer")}
      >
        <Background
          background={backgroundColor}
          className={`flex flex-row justify-start w-full items-center p-20 gap-10`}
        >
          <div className="flex flex-col gap-8">
            <FooterLogo
              logo={buildComplexLogoImage(logo, logoWidth)}
              logoWidth={logoWidth}
            />
            <FooterIcons
              xLink={xLink}
              facebookLink={facebookLink}
              instagramLink={instagramLink}
              pinterestLink={pinterestLink}
              linkedInLink={linkedInLink}
              youtubeLink={youtubeLink}
            />
            {utilityImages && (
              <div className="grid grid-cols-3 gap-8">
                {utilityImages.map((item, index) => (
                  <FooterLogo
                    key={index}
                    logo={buildComplexUtilityImage(item.url, logoWidth)}
                    logoWidth={utilityImagesStyle}
                  />
                ))}
              </div>
            )}
          </div>
          {expandedFooter && expandedFooterItems ? (
            <div className="grid grid-cols-1 md:grid-cols-4 w-full justify-between">
              {expandedFooterItems.map((item, index) => (
                <EntityField
                  key={index}
                  displayName={pt(
                    "fields.expandedFooterItems",
                    "Expanded Footer Items"
                  )}
                >
                  <ExpandedFooterLinks label={item.label} links={item.links} />
                </EntityField>
              ))}
            </div>
          ) : (
            <div className="flex w-full justify-between">
              <EntityField
                displayName={pt("fields.footerLinks", "Primary Footer Links")}
              >
                <FooterLinks links={footerLinks} />
              </EntityField>
            </div>
          )}
        </Background>
        {show && (
          <Background
            background={secondaryBackgroundColor}
            className={`space-y-5 px-20 py-10`}
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
              <Body className="text-xs">{copyrightMessage}</Body>
            )}
          </Background>
        )}
      </div>
      <div
        className="flex md:hidden items-center justify-between px-4 py-2"
        aria-label={t("expandedFooter", "Expanded Footer")}
      >
        <FooterLogo
          logo={buildComplexLogoImage(logo, logoWidth)}
          logoWidth={logoWidth}
        />

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            isOpen
              ? t("closeFooterMenu", "Close menu")
              : t("openFooterMenu", "Open menu")
          }
          aria-expanded={isOpen}
          aria-controls="mobile-footer-menu"
          className="text-xl"
        >
          {isOpen ? <FaTimes size="1.5rem" /> : <FaBars size="1.5rem" />}
        </button>
      </div>
      {isOpen && (
        <div
          id="mobile-footer-menu"
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <MobileSection background={backgroundColor}>
            <EntityField
              displayName={pt("fields.footerLinks", "Primary Footer Links")}
            >
              <FooterLinks links={footerLinks} />
            </EntityField>
            <FooterIcons
              xLink={xLink}
              facebookLink={facebookLink}
              instagramLink={instagramLink}
              pinterestLink={pinterestLink}
              linkedInLink={linkedInLink}
              youtubeLink={youtubeLink}
              // utilityImages={utilityImages}
              // count={utilityImagesCount}
            />
          </MobileSection>
          <MobileSection background={secondaryBackgroundColor} className="pb-4">
            <EntityField
              displayName={pt(
                "fields.secondaryFooterLinks",
                "Secondary Footer Links"
              )}
            >
              <FooterLinks links={secondaryFooterLinks} type="Secondary" />
            </EntityField>

            {copyrightMessage && (
              <div className="text-xs text-center mt-2">{copyrightMessage}</div>
            )}
          </MobileSection>
        </div>
      )}
    </>
  );
};

const FooterLinks = ({
  links,
  type = "Primary",
}: {
  links: CTAType[];
  type?: "Primary" | "Secondary";
}) => {
  return (
    <nav aria-label={`${type} Footer Links`}>
      <ul
        className={`flex flex-col ${type === "Primary" ? `md:flex-col` : `md:flex-row md:gap-8`} gap-4  py-4 md:py-0`}
      >
        {links.map((item, index) => (
          <li key={index}>
            <Link
              eventName={`${type.toLowerCase()}FooterLink${index}`}
              cta={{
                label: item.label,
                linkType: item.linkType,
                link: item.link,
              }}
              className={`text-sm`}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

const ExpandedFooterLinks = ({
  links,
  type = "Primary",
  label,
}: {
  links: CTAType[];
  type?: "Primary" | "Secondary";
  label: string;
}) => {
  return (
    <nav aria-label={`${type} Footer Links`}>
      <ul
        className={`flex flex-col ${type === "Primary" ? `md:flex-col` : `md:flex-row md:gap-8`} gap-4  py-4 md:py-0`}
      >
        <li>
          <Body variant={"sm"}>{label}</Body>
        </li>
        {links.map((item, index) => (
          <li key={index}>
            <Link
              eventName={`${type.toLowerCase()}FooterLink${index}`}
              cta={{
                label: item.label,
                linkType: item.linkType,
                link: item.link,
              }}
              className={`text-sm`}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

const FooterLogo = (props: {
  logo: ComplexImageType;
  logoLink?: string;
  logoWidth?: number;
}) => {
  return (
    <MaybeLink href={props.logoLink}>
      <div className="flex mr-2" style={{ width: `${props.logoWidth}px` }}>
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

const MobileSection = ({
  children,
  background,
  className,
}: {
  children: React.ReactNode;
  background?: BackgroundStyle;
  className?: string;
}) => (
  <section>
    <Background
      className={`px-4 ${className ?? ""}`.trim()}
      background={background}
    >
      {children}
    </Background>
  </section>
);
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
  const icons = [
    { link: xLink, icon: <FaXTwitter />, label: "X (Twitter)" },
    { link: facebookLink, icon: <FaFacebookF />, label: "Facebook" },
    { link: instagramLink, icon: <FaInstagram />, label: "Instagram" },
    { link: pinterestLink, icon: <FaPinterestP />, label: "Pinterest" },
    { link: linkedInLink, icon: <FaLinkedinIn />, label: "LinkedIn" },
    { link: youtubeLink, icon: <FaYoutube />, label: "YouTube" },
  ];

  return (
    <div className="flex gap-6 items-center">
      {icons
        // .filter(({ link }) => !!link)
        .map(({ link, icon, label }, index) => (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-xl hover:opacity-80 transition-opacity"
          >
            {icon}
          </a>
        ))}
    </div>
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
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
            link: "#",
          },
        ],
        xLink: "",
        facebookLink: "",
        instagramLink: "",
        pinterestLink: "",
        linkedInLink: "",
        youtubeLink: "",
        utilityImages: [
          { url: PLACEHOLDER_UTILITY_IMAGES },
          { url: PLACEHOLDER_UTILITY_IMAGES },
          { url: PLACEHOLDER_UTILITY_IMAGES },
          { url: PLACEHOLDER_UTILITY_IMAGES },
        ],
        expandedFooter: false,
        expandedFooterItems: [
          {
            label: "Label 1",
            links: [
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
            ],
          },
          {
            label: "Label 2",
            links: [
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
                link: "#",
              },
              {
                linkType: "URL",
                label: "Main Footer Link",
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
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Footer Link",
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

    const primaryFooterFields = {
      // @ts-expect-error ts(2339) objectFields exists
      ...fields.data.objectFields.primaryFooter.objectFields,
    };

    if (expanded) {
      delete primaryFooterFields.footerLinks;
    } else {
      delete primaryFooterFields.expandedFooterItems;
    }

    return {
      ...fields,
      data: {
        ...fields.data,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields exists
          ...fields.data.objectFields,
          primaryFooter: {
            // @ts-expect-error ts(2339) objectFields exists
            ...fields.data.objectFields.primaryFooter,
            objectFields: primaryFooterFields,
          },
        },
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
