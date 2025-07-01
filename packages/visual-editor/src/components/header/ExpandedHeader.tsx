import * as React from "react";
import {
  AnalyticsScopeProvider,
  ComplexImageType,
} from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  CTA,
  EntityField,
  MaybeLink,
  backgroundColors,
  Image,
  msg,
  YextField,
  VisibilityWrapper,
  BackgroundStyle,
  CTAProps,
  TranslatableCTA,
  pt,
  resolveTranslatableString,
  Background,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  LanguageDropdown,
  parseDocumentForLanguageDropdown,
} from "./languageDropdown.js";
import { t } from "i18next";
import { FaTimes, FaBars } from "react-icons/fa";

const PLACEHOLDER_IMAGE: ComplexImageType = {
  image: {
    url: "https://placehold.co/100x50",
    height: 50,
    width: 100,
    alternateText: "Placeholder Logo",
  },
};

export interface ExpandedHeaderProps {
  data: {
    primaryHeader: {
      logo: string;
      links: TranslatableCTA[];
      primaryCTA?: TranslatableCTA;
      secondaryCTA?: TranslatableCTA;
    };
    secondaryHeader: {
      show: boolean;
      showLanguageDropdown: boolean;
      secondaryLinks: TranslatableCTA[];
    };
  };
  styles: {
    primaryHeader: {
      logoWidth: number;
      backgroundColor?: BackgroundStyle;
      primaryCtaVariant: CTAProps["variant"];
      secondaryCtaVariant: CTAProps["variant"];
      align: "left" | "right";
    };
    secondaryHeader: {
      backgroundColor?: BackgroundStyle;
    };
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const expandedHeaderSectionFields: Fields<ExpandedHeaderProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      primaryHeader: YextField(msg("fields.primaryHeader", "Primary Header"), {
        type: "object",
        objectFields: {
          logo: YextField(msg("fields.logoUrl", "Logo"), {
            type: "text",
          }),
          links: YextField(msg("fields.links", "Links"), {
            type: "array",
            arrayFields: {
              label: YextField(msg("fields.label", "Label"), { type: "text" }),
              link: YextField(msg("fields.link", "Link"), { type: "text" }),
              linkType: YextField(msg("fields.linkType", "Link Type"), {
                type: "text",
              }),
            },
          }),
          primaryCTA: YextField(msg("fields.primaryCTA", "Primary CTA"), {
            type: "object",
            objectFields: {
              label: YextField(msg("fields.label", "Label"), { type: "text" }),
              link: YextField(msg("fields.link", "Link"), { type: "text" }),
              linkType: YextField(msg("fields.linkType", "Link Type"), {
                type: "text",
              }),
            },
          }),
          secondaryCTA: YextField(msg("fields.secondaryCTA", "Secondary CTA"), {
            type: "object",
            objectFields: {
              label: YextField(msg("fields.label", "Label"), { type: "text" }),
              link: YextField(msg("fields.link", "Link"), { type: "text" }),
              linkType: YextField(msg("fields.linkType", "Link Type"), {
                type: "text",
              }),
            },
          }),
        },
      }),
      secondaryHeader: YextField(
        msg("fields.secondaryHeader", "Secondary Header"),
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
            showLanguageDropdown: YextField(
              msg("fields.showLanguageDropdown", "Show Language Dropdown"),
              {
                type: "radio",
                options: [
                  { label: msg("fields.options.yes", "Yes"), value: true },
                  { label: msg("fields.options.no", "No"), value: false },
                ],
              }
            ),
            secondaryLinks: YextField(
              msg("fields.secondaryLinks", "Secondary Links"),
              {
                type: "array",
                arrayFields: {
                  label: YextField("Label", { type: "text" }),
                  link: YextField("Link", { type: "text" }),
                  linkType: YextField("Link Type", { type: "text" }),
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
      primaryHeader: YextField(msg("fields.primaryHeader", "Primary Header"), {
        type: "object",
        objectFields: {
          logoWidth: YextField(msg("fields.logoWidth", "Logo Width"), {
            type: "number",
            min: 0,
          }),
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              hasSearch: true,
              options: "BACKGROUND_COLOR",
            }
          ),
          primaryCtaVariant: YextField(
            msg("fields.primaryCTAVariant", "Primary CTA Variant"),
            {
              type: "radio",
              options: "CTA_VARIANT",
            }
          ),
          secondaryCtaVariant: YextField(
            msg("fields.secondaryCTAVariant", "Secondary CTA Variant"),
            {
              type: "radio",
              options: "CTA_VARIANT",
            }
          ),
          align: YextField(msg("fields.align", "Align"), {
            type: "radio",
            options: [
              { label: msg("fields.options.left", "Left"), value: "left" },
              { label: msg("fields.options.right", "Right"), value: "right" },
            ],
          }),
        },
      }),
      secondaryHeader: YextField(
        msg("fields.secondaryHeader", "Secondary Header"),
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

const ExpandedHeaderWrapper: React.FC<ExpandedHeaderProps> = ({
  data,
  styles,
}: ExpandedHeaderProps) => {
  const { primaryHeader, secondaryHeader } = data;
  const {
    primaryHeader: primaryHeaderStyle,
    secondaryHeader: secondaryHeaderStyle,
  } = styles;
  const [isOpen, setIsOpen] = React.useState<boolean>(true);
  const { logo, links, primaryCTA, secondaryCTA } = primaryHeader;
  const { show, showLanguageDropdown, secondaryLinks } = secondaryHeader;
  const { backgroundColor, logoWidth, primaryCtaVariant, secondaryCtaVariant } =
    primaryHeaderStyle;
  const { backgroundColor: secondaryBackgroundColor } = secondaryHeaderStyle;
  const languageDropDownProps = parseDocumentForLanguageDropdown(document);
  const showLanguageSelector =
    languageDropDownProps && languageDropDownProps.locales?.length > 1;

  return (
    <>
      <div
        className="hidden md:flex flex-col"
        aria-label={t("expandedHeader", "Expanded Header")}
      >
        {show && (
          <Background
            background={secondaryBackgroundColor}
            className="flex justify-end gap-6 py-4 px-20 items-center"
          >
            <EntityField
              displayName={pt(
                "fields.secondaryHeaderLinks",
                "Secondary Header Links"
              )}
            >
              <HeaderLinks links={secondaryLinks} type="Secondary" />
            </EntityField>
            {showLanguageDropdown && showLanguageSelector && (
              <LanguageDropdown
                {...languageDropDownProps}
                className="hidden md:flex"
              />
            )}
          </Background>
        )}
        <Background
          background={backgroundColor}
          className="flex flex-row justify-between w-full items-center py-6 px-20"
        >
          <EntityField displayName={pt("fields.logo", "Logo")}>
            <HeaderLogo
              logo={buildComplexImage(logo, logoWidth)}
              logoWidth={logoWidth}
            />
          </EntityField>
          <div className="flex gap-8 items-center">
            <EntityField
              displayName={pt(
                "fields.primaryHeaderLinks",
                "Primary Header Links"
              )}
            >
              <HeaderLinks links={links} />
            </EntityField>
            <HeaderCtas
              document={document}
              primaryCTA={primaryCTA}
              secondaryCTA={secondaryCTA}
              primaryVariant={primaryCtaVariant}
              secondaryVariant={secondaryCtaVariant}
            />
          </div>
        </Background>
      </div>
      <div
        className="flex md:hidden items-center justify-between px-4 py-2"
        aria-label={t("expandedHeader", "Expanded Header")}
      >
        <HeaderLogo
          logo={buildComplexImage(logo, logoWidth)}
          logoWidth={logoWidth}
        />

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            isOpen
              ? t("closeHeaderMenu", "Close menu")
              : t("openHeaderMenu", "Open menu")
          }
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          className="text-xl"
        >
          {isOpen ? <FaTimes size="1.5rem" /> : <FaBars size="1.5rem" />}
        </button>
      </div>
      {isOpen && (
        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0 overflow-scroll"
          }`}
        >
          <MobileSection background={backgroundColor}>
            <EntityField
              displayName={pt(
                "fields.primaryHeaderLinks",
                "Primary Header Links"
              )}
            >
              <HeaderLinks links={links} />
            </EntityField>
          </MobileSection>
          {show && (
            <MobileSection background={secondaryBackgroundColor}>
              <EntityField
                displayName={pt(
                  "fields.secondaryHeaderLinks",
                  "Secondary Header Links"
                )}
              >
                <HeaderLinks links={secondaryLinks} type="Secondary" />
              </EntityField>
            </MobileSection>
          )}
          {showLanguageDropdown && showLanguageSelector && (
            <LanguageDropdown
              background={secondaryBackgroundColor}
              {...languageDropDownProps}
              className="flex md:hidden"
            />
          )}
          <MobileSection className="py-4" background={backgroundColor}>
            <HeaderCtas
              document={document}
              primaryCTA={primaryCTA}
              secondaryCTA={secondaryCTA}
              primaryVariant={primaryCtaVariant}
              secondaryVariant={secondaryCtaVariant}
            />
          </MobileSection>
        </div>
      )}
    </>
  );
};

const HeaderLinks = ({
  links,
  type = "Primary",
}: {
  links: TranslatableCTA[];
  type?: "Primary" | "Secondary";
}) => {
  const { i18n } = useTranslation();

  return (
    <nav aria-label={`${type} Header Links`}>
      <ul className="flex flex-col justify-start md:flex-row flex flex-col md:flex-row gap-0 md:gap-6">
        {links.map((item, index) => {
          return (
            <li key={`${type.toLowerCase()}.${index}`} className="py-4 md:py-0">
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
                className={`justify-start `}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const HeaderLogo = (props: {
  logo: ComplexImageType;
  logoLink?: string;
  logoWidth?: number;
}) => {
  return (
    <MaybeLink href={props.logoLink}>
      <figure style={{ width: `${props.logoWidth}px` }}>
        <Image
          image={props.logo.image}
          layout="auto"
          aspectRatio={props.logo.image.width / props.logo.image.height}
        />
      </figure>
    </MaybeLink>
  );
};

const HeaderCtas = (props: {
  primaryCTA?: TranslatableCTA;
  secondaryCTA?: TranslatableCTA;
  primaryVariant: CTAProps["variant"];
  secondaryVariant: CTAProps["variant"];
  document: any;
}) => {
  const { i18n } = useTranslation();
  const { primaryCTA, secondaryCTA, primaryVariant, secondaryVariant } = props;

  if (!primaryCTA && !secondaryCTA) {
    return;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-2">
      {primaryCTA?.label && (
        <EntityField displayName={pt("fields.primaryCta", "Primary CTA")}>
          <CTA
            eventName={`cta`}
            variant={primaryVariant}
            label={resolveTranslatableString(primaryCTA?.label, i18n.language)}
            link={primaryCTA.link}
            linkType={primaryCTA.linkType}
          />
        </EntityField>
      )}
      {secondaryCTA?.label && (
        <EntityField displayName={pt("fields.secondaryCta", "Secondary CTA")}>
          <CTA
            eventName={`cta`}
            variant={secondaryVariant}
            label={resolveTranslatableString(secondaryCTA.label, i18n.language)}
            link={secondaryCTA.link}
            linkType={secondaryCTA.linkType}
          />
        </EntityField>
      )}
    </div>
  );
};

const buildComplexImage = (
  url: string | undefined,
  width: number
): ComplexImageType => {
  const safeUrl = url || PLACEHOLDER_IMAGE.image.url;
  return {
    image: {
      url: safeUrl,
      width,
      height: width / 2,
      alternateText: "Logo",
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
  <Background
    as="section"
    className={`px-4 ${className ?? ""}`.trim()}
    background={background}
  >
    {children}
  </Background>
);

export const ExpandedHeader: ComponentConfig<ExpandedHeaderProps> = {
  label: msg("components.expandedHeader", "Expanded Header"),
  defaultProps: {
    data: {
      primaryHeader: {
        logo: PLACEHOLDER_IMAGE.image.url,
        links: [
          {
            linkType: "URL",
            label: "Main Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Main Header Link",
            link: "#",
          },
        ],
        primaryCTA: {
          label: "Call to Action",
          link: "#",
          linkType: "URL",
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          linkType: "URL",
        },
      },
      secondaryHeader: {
        show: false,
        showLanguageDropdown: false,
        secondaryLinks: [
          {
            linkType: "URL",
            label: "Secondary Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Secondary Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Secondary Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Secondary Header Link",
            link: "#",
          },
          {
            linkType: "URL",
            label: "Secondary Header Link",
            link: "#",
          },
        ],
      },
    },
    styles: {
      primaryHeader: {
        logoWidth: 100,
        backgroundColor: backgroundColors.background1.value,
        primaryCtaVariant: "primary",
        secondaryCtaVariant: "secondary",
        align: "left",
      },
      secondaryHeader: {
        backgroundColor: backgroundColors.background2.value,
      },
    },
    analytics: {
      scope: "expandedHeader",
    },
    liveVisibility: true,
  },
  fields: expandedHeaderSectionFields,
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "expandedHeader"}>
      <VisibilityWrapper
        liveVisibility={!!props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <ExpandedHeaderWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
