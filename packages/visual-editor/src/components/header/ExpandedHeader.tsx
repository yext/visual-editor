import * as React from "react";
import {
  AnalyticsScopeProvider,
  ComplexImageType,
  CTA as CTAType,
  Link,
} from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  CTA,
  EntityField,
  useDocument,
  MaybeLink,
  backgroundColors,
  Image,
  msg,
  YextField,
  VisibilityWrapper,
  BackgroundStyle,
  CTAProps,
  TranslatableCTA,
  YextEntityField,
  resolveYextEntityField,
  pt,
  resolveTranslatableString,
  Background,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  LanguageDropdown,
  parseDocumentForLanguageDropdown,
} from "./languageDropdown.js";
import { useState } from "react";
import { t } from "i18next";
import { FaTimes, FaBars } from "react-icons/fa";

const PLACEHOLDER_IMAGE: ComplexImageType = {
  image: {
    url: "https://placehold.co/100X50",
    height: 50,
    width: 100,
    alternateText: "Placeholder Logo",
  },
};

export interface ExpandedHeaderProps {
  data: {
    primaryHeader: {
      logo: string;
      links: CTAType[];
      primaryCTA?: YextEntityField<TranslatableCTA>;
      secondaryCTA?: YextEntityField<TranslatableCTA>;
    };
    secondaryHeader: {
      show: boolean;
      showLanguageDropdown: boolean;
      secondaryLinks: CTAType[];
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
              label: YextField("Label", { type: "text" }),
              link: YextField("Link", { type: "text" }),
              linkType: YextField("Link Type", { type: "text" }),
            },
          }),
          primaryCTA: YextField(msg("fields.primaryCTA", "Primary CTA"), {
            type: "entityField",
            filter: {
              types: ["type.cta"],
            },
          }),
          secondaryCTA: YextField(msg("fields.secondaryCTA", "Secondary CTA"), {
            type: "entityField",
            filter: {
              types: ["type.cta"],
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
  const document = useDocument() as any;

  const { primaryHeader, secondaryHeader } = data;
  const {
    primaryHeader: primaryHeaderStyle,
    secondaryHeader: secondaryHeaderStyle,
  } = styles;
  const [isOpen, setIsOpen] = useState<boolean>(true);
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
            className="flex justify-end gap-6 py-4 px-20"
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
          <figure className="hidden md:block">
            <HeaderLogo logo={buildComplexImage(logo, logoWidth)} />
          </figure>
          <div className="flex gap-8">
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
              : "max-h-0 opacity-0 overflow-hidden"
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
          <MobileSection background={secondaryBackgroundColor} className="pb-4">
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
                background={secondaryBackgroundColor}
                {...languageDropDownProps}
                className="flex md:hidden"
              />
            )}
          </MobileSection>
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
  links: CTAType[];
  type?: "Primary" | "Secondary";
}) => {
  return (
    <nav aria-label={`${type} Header Links`}>
      <ul className="flex flex-col md:flex-row gap-4 md:gap-8 py-4 md:py-0">
        {links.map((item, index) => (
          <li key={index}>
            <Link
              eventName={`${type.toLowerCase()}Link${index}`}
              cta={{
                label: item.label,
                linkType: item.linkType,
                link: item.link,
              }}
              className={`${type === "Primary" ? `text-sm` : `text-xs`}`}
            />
          </li>
        ))}
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
      <Image
        image={props.logo.image}
        layout="auto"
        aspectRatio={props.logo.image.width / props.logo.image.height}
      />
    </MaybeLink>
  );
};

const HeaderCtas = (props: {
  primaryCTA?: YextEntityField<TranslatableCTA>;
  secondaryCTA?: YextEntityField<TranslatableCTA>;
  primaryVariant: CTAProps["variant"];
  secondaryVariant: CTAProps["variant"];
  document: any;
}) => {
  const { i18n } = useTranslation();
  const { primaryCTA, secondaryCTA, primaryVariant, secondaryVariant } = props;
  const resolvedPrimaryCta = primaryCTA
    ? resolveYextEntityField<TranslatableCTA>(document, primaryCTA)
    : undefined;

  const resolvedSecondaryCta = secondaryCTA
    ? resolveYextEntityField(document, secondaryCTA)
    : undefined;
  if (!resolvedPrimaryCta && !resolvedSecondaryCta) {
    return;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      {resolvedPrimaryCta?.label && (
        <EntityField
          displayName={pt("fields.primaryCta", "Primary CTA")}
          fieldId={primaryCTA?.field}
          constantValueEnabled={primaryCTA?.constantValueEnabled}
        >
          <CTA
            eventName={`cta`}
            variant={primaryVariant}
            label={resolveTranslatableString(
              resolvedPrimaryCta.label,
              i18n.language
            )}
            link={resolvedPrimaryCta.link}
            linkType={resolvedPrimaryCta.linkType}
          />
        </EntityField>
      )}
      {resolvedSecondaryCta?.label && (
        <EntityField
          displayName={pt("fields.secondaryCta", "Secondary CTA")}
          fieldId={secondaryCTA?.field}
          constantValueEnabled={secondaryCTA?.constantValueEnabled}
        >
          <CTA
            eventName={`cta`}
            variant={secondaryVariant}
            label={resolveTranslatableString(
              resolvedSecondaryCta.label,
              i18n.language
            )}
            link={resolvedSecondaryCta.link}
            linkType={resolvedSecondaryCta.linkType}
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
      height: width / 2,
      width: width,
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
  <section className={`px-4 ${className ?? ""}`.trim()}>
    <Background background={background}>{children}</Background>
  </section>
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
          field: "",
          constantValueEnabled: true,
          constantValue: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
        },
        secondaryCTA: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
        },
      },
      secondaryHeader: {
        show: true,
        showLanguageDropdown: true,
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
        logoWidth: 0,
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
