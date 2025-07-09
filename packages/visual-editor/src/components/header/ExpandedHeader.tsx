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
  PageSection,
  TranslatableStringField,
  ImageWrapperProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { FaTimes, FaBars } from "react-icons/fa";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  LanguageDropdown,
  parseDocumentForLanguageDropdown,
} from "./languageDropdown.tsx";
import { linkTypeOptions } from "../../internal/puck/constant-value-fields/CallToAction.tsx";
import { ImageWrapperFields } from "../contentBlocks/Image.tsx";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.tsx";

const PLACEHOLDER_IMAGE = "https://placehold.co/100";

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
      logo: ImageStylingProps;
      backgroundColor?: BackgroundStyle;
      primaryCtaVariant: CTAProps["variant"];
      secondaryCtaVariant: CTAProps["variant"];
    };
    secondaryHeader: {
      backgroundColor?: BackgroundStyle;
    };
  };
  analytics?: {
    scope?: string;
  };
}

const expandedHeaderSectionFields: Fields<ExpandedHeaderProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      primaryHeader: YextField(msg("fields.primaryHeader", "Primary Header"), {
        type: "object",
        objectFields: {
          logo: YextField(msg("fields.logo", "Logo"), {
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
          primaryCTA: YextField(msg("fields.primaryCTA", "Primary CTA"), {
            type: "object",
            objectFields: {
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
          secondaryCTA: YextField(msg("fields.secondaryCTA", "Secondary CTA"), {
            type: "object",
            objectFields: {
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
      primaryHeader: YextField(msg("fields.primaryHeader", "Primary Header"), {
        type: "object",
        objectFields: {
          logo: YextField(msg("fields.logo", "Logo"), {
            type: "object",
            objectFields: ImageStylingFields,
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
  const { t } = useTranslation();
  const { logo, links, primaryCTA, secondaryCTA } = primaryHeader;
  const { show, showLanguageDropdown, secondaryLinks } = secondaryHeader;
  const {
    backgroundColor,
    logo: logoStyle,
    primaryCtaVariant,
    secondaryCtaVariant,
  } = primaryHeaderStyle;
  const { backgroundColor: secondaryBackgroundColor } = secondaryHeaderStyle;
  const languageDropDownProps = parseDocumentForLanguageDropdown(document);
  const showLanguageSelector =
    languageDropDownProps && languageDropDownProps.locales?.length > 1;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <>
      <div
        className="hidden md:flex flex-col"
        aria-label={t("expandedHeaderDesktop", "Expanded Header Desktop")}
      >
        {show && (
          <PageSection
            verticalPadding={"sm"}
            background={secondaryBackgroundColor}
            className="flex justify-end gap-6 items-center"
          >
            <EntityField
              constantValueEnabled
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
          </PageSection>
        )}
        <PageSection
          verticalPadding={"header"}
          background={backgroundColor}
          className="flex flex-row justify-between w-full items-center gap-8"
        >
          <EntityField
            constantValueEnabled
            displayName={pt("fields.logoUrl", "Logo")}
          >
            <HeaderLogo
              logo={buildComplexImage(logo, logoStyle.width || 100)}
              logoWidth={logoStyle.width || 100}
              aspectRatio={logoStyle.aspectRatio}
            />
          </EntityField>
          <div className="flex gap-8 items-center">
            <EntityField
              constantValueEnabled
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
        </PageSection>
      </div>
      <div
        className="flex md:hidden items-center justify-between px-4 py-2"
        aria-label={t("expandedHeaderMobile", "Expanded Header Mobile")}
      >
        <HeaderLogo
          logo={buildComplexImage(logo, logoStyle.width || 100)}
          logoWidth={logoStyle.width || 100}
          aspectRatio={logoStyle.aspectRatio}
        />

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            isOpen ? t("closeMenu", "Close menu") : t("openMenu", "Open menu")
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
          <PageSection verticalPadding={"sm"} background={backgroundColor}>
            <EntityField
              constantValueEnabled
              displayName={pt(
                "fields.primaryHeaderLinks",
                "Primary Header Links"
              )}
            >
              <HeaderLinks links={links} />
            </EntityField>
          </PageSection>
          {show && (
            <PageSection
              verticalPadding={"sm"}
              background={secondaryBackgroundColor}
            >
              <EntityField
                constantValueEnabled
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
            </PageSection>
          )}

          <PageSection verticalPadding={"sm"} background={backgroundColor}>
            <HeaderCtas
              document={document}
              primaryCTA={primaryCTA}
              secondaryCTA={secondaryCTA}
              primaryVariant={primaryCtaVariant}
              secondaryVariant={secondaryCtaVariant}
            />
          </PageSection>
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
  const MAX_VISIBLE = 5;
  const isSecondary = type === "Secondary";

  const renderLink = (
    item: TranslatableCTA,
    index: number,
    ctaType: string
  ) => (
    <CTA
      variant={
        type === "Primary"
          ? "headerFooterMainLink"
          : "headerFooterSecondaryLink"
      }
      eventName={`cta.${ctaType}.${index}`}
      label={resolveTranslatableString(item.label, i18n.language)}
      linkType={item.linkType}
      link={item.link}
      className="justify-start w-full text-left"
    />
  );

  return (
    <nav aria-label={`${type} Header Links`}>
      <ul className="flex flex-col md:flex-row gap-0 md:gap-6 md:items-center">
        {links.map((item, index) => {
          const isOverflowed = isSecondary && index >= MAX_VISIBLE;
          return (
            <li
              key={`${type.toLowerCase()}.${index}`}
              className={`py-4 md:py-0 ${isOverflowed ? "md:hidden" : ""}`}
            >
              {renderLink(item, index, type.toLowerCase())}
            </li>
          );
        })}

        {isSecondary && links.length > MAX_VISIBLE && (
          <li className="hidden md:block py-4 md:py-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-row md:items-center gap-4 justify-between w-full">
                <div className="flex gap-4 items-center">
                  <FaBars />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border rounded shadow-md p-2 min-w-[200px] z-[9999]">
                {links.slice(MAX_VISIBLE).map((item, index) => (
                  <DropdownMenuItem
                    key={`overflow-${index}`}
                    className="cursor-pointer p-2 text-body-sm-fontSize hover:bg-gray-100"
                  >
                    {renderLink(item, index + MAX_VISIBLE, "overflow")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
      </ul>
    </nav>
  );
};

const HeaderLogo = (props: {
  logo: ComplexImageType;
  logoWidth?: number;
  aspectRatio?: number;
}) => {
  return (
    <MaybeLink href={props.logo.image.url} alwaysHideCaret={true}>
      <figure style={{ width: `${props.logoWidth}px` }}>
        <Image
          image={props.logo.image}
          aspectRatio={
            props.aspectRatio ||
            props.logo.image.width / props.logo.image.height
          }
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-2 md:items-center">
      {primaryCTA?.label && (
        <EntityField
          constantValueEnabled
          displayName={pt("fields.primaryCta", "Primary CTA")}
        >
          <CTA
            eventName={`primaryCta`}
            variant={primaryVariant}
            label={resolveTranslatableString(primaryCTA?.label, i18n.language)}
            link={primaryCTA.link}
            linkType={primaryCTA.linkType}
          />
        </EntityField>
      )}
      {secondaryCTA?.label && (
        <EntityField
          constantValueEnabled
          displayName={pt("fields.secondaryCta", "Secondary CTA")}
        >
          <CTA
            eventName={`secondaryCta`}
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
  const safeUrl = url || PLACEHOLDER_IMAGE;
  return {
    image: {
      url: safeUrl,
      width,
      height: width / 2,
      alternateText: "Logo",
    },
  };
};

export const ExpandedHeader: ComponentConfig<ExpandedHeaderProps> = {
  label: msg("components.expandedHeader", "Expanded Header"),
  fields: expandedHeaderSectionFields,
  defaultProps: {
    data: {
      primaryHeader: {
        logo: PLACEHOLDER_IMAGE,
        links: [
          {
            linkType: "URL",
            label: { en: "Main Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Main Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Main Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Main Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Main Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
        ],
        primaryCTA: {
          label: { en: "Call to Action", hasLocalizedValue: "true" },
          link: "#",
          linkType: "URL",
        },
        secondaryCTA: {
          label: { en: "Call to Action", hasLocalizedValue: "true" },
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
            label: { en: "Secondary Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Secondary Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Secondary Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Secondary Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Secondary Header Link", hasLocalizedValue: "true" },
            link: "#",
          },
        ],
      },
    },
    styles: {
      primaryHeader: {
        logo: {
          width: 0,
          aspectRatio: 2,
        },
        backgroundColor: backgroundColors.background1.value,
        primaryCtaVariant: "primary",
        secondaryCtaVariant: "secondary",
      },
      secondaryHeader: {
        backgroundColor: backgroundColors.background2.value,
      },
    },
    analytics: {
      scope: "expandedHeader",
    },
  },
  resolveFields: (_data, { fields }) => {
    const showSecondaryHeader = _data.props.data.secondaryHeader?.show;

    const dataFields = {
      // @ts-expect-error ts(2339) objectFields exists ts(2339) objectFields exists
      ...fields.data.objectFields,
    };

    const stylesFields = {
      // @ts-expect-error ts(2339) objectFields exists ts(2339) objectFields exists
      ...fields.styles.objectFields,
    };

    const primaryHeaderFields = {
      ...dataFields.primaryHeader.objectFields,
    };

    const secondaryHeaderFields = {
      ...dataFields.secondaryHeader.objectFields,
    };

    if (!showSecondaryHeader) {
      delete secondaryHeaderFields.showLanguageDropdown;
      delete secondaryHeaderFields.secondaryLinks;
      delete stylesFields.secondaryHeader;
    }

    return {
      ...fields,
      data: {
        ...fields.data,
        objectFields: {
          ...dataFields,
          primaryHeader: {
            ...dataFields.primaryHeader,
            objectFields: primaryHeaderFields,
          },
          secondaryHeader: {
            ...dataFields.secondaryHeader,
            objectFields: secondaryHeaderFields,
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
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "expandedHeader"}>
      <ExpandedHeaderWrapper {...props} />
    </AnalyticsScopeProvider>
  ),
};
