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
  BackgroundStyle,
  CTAProps,
  TranslatableCTA,
  pt,
  PageSection,
  TranslatableStringField,
  useDocument,
  resolveComponentData,
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
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.tsx";

const PLACEHOLDER_IMAGE = "https://placehold.co/100";
const defaultMainLink = {
  linkType: "URL" as const,
  label: { en: "Main Header Link", hasLocalizedValue: "true" as const },
  link: "#",
};
const defaultSecondaryLink = {
  linkType: "URL" as const,
  label: { en: "Secondary Header Link", hasLocalizedValue: "true" as const },
  link: "#",
};

export interface ExpandedHeaderData {
  /** Content for the main primary header bar. */
  primaryHeader: {
    logo: string;
    links: TranslatableCTA[];
    primaryCTA?: TranslatableCTA;
    showPrimaryCTA: boolean;
    secondaryCTA?: TranslatableCTA;
    showSecondaryCTA: boolean;
  };

  /** Content for the secondary header (top bar). */
  secondaryHeader: {
    show: boolean;
    showLanguageDropdown: boolean;
    secondaryLinks: TranslatableCTA[];
  };
}

export interface ExpandedHeaderStyles {
  /** Styling for the main, primary header bar. */
  primaryHeader: {
    logo: ImageStylingProps;
    backgroundColor?: BackgroundStyle;
    primaryCtaVariant: CTAProps["variant"];
    secondaryCtaVariant: CTAProps["variant"];
  };
  /** Styling for the secondary header (top bar). */
  secondaryHeader: {
    backgroundColor?: BackgroundStyle;
  };
}

export interface ExpandedHeaderProps {
  /**
   * This object contains all the content for both header tiers.
   * @propCategory Data Props
   */
  data: ExpandedHeaderData;

  /**
   * This object contains properties for customizing the appearance of both header tiers.
   * @propCategory Style Props
   */
  styles: ExpandedHeaderStyles;

  /** @internal */
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
            defaultItemProps: defaultMainLink,
          }),
          primaryCTA: YextField(msg("fields.primaryCTA", "Primary CTA"), {
            type: "object",
            objectFields: {
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
          }),
          showPrimaryCTA: YextField(
            msg("fields.showPrimaryCTA", "Show Primary CTA"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.show", "Show"), value: true },
                { label: msg("fields.options.hide", "Hide"), value: false },
              ],
            }
          ),
          secondaryCTA: YextField(msg("fields.secondaryCTA", "Secondary CTA"), {
            type: "object",
            objectFields: {
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
          }),
          showSecondaryCTA: YextField(
            msg("fields.showSecondaryCTA", "Show Secondary CTA"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.show", "Show"), value: true },
                { label: msg("fields.options.hide", "Hide"), value: false },
              ],
            }
          ),
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
                defaultItemProps: defaultSecondaryLink,
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
  const streamDocument = useDocument();
  const {
    logo,
    links,
    primaryCTA,
    secondaryCTA,
    showPrimaryCTA,
    showSecondaryCTA,
  } = primaryHeader;
  const { show, showLanguageDropdown, secondaryLinks } = secondaryHeader;
  const {
    backgroundColor,
    logo: logoStyle,
    primaryCtaVariant,
    secondaryCtaVariant,
  } = primaryHeaderStyle;
  const { backgroundColor: secondaryBackgroundColor } = secondaryHeaderStyle;
  const languageDropDownProps =
    parseDocumentForLanguageDropdown(streamDocument);
  const showLanguageSelector =
    languageDropDownProps && languageDropDownProps.locales?.length > 1;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const showMobileMenu =
    (primaryCTA?.label && primaryCTA?.link) ||
    (secondaryCTA?.label && secondaryCTA?.link) ||
    links.some((l) => l.label && l.link) ||
    (show &&
      (secondaryLinks.some((l) => l.label && l.link) || showLanguageDropdown));

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
              logo={buildComplexImage(logo, logoStyle.width ?? 200)}
              logoWidth={logoStyle.width ?? 200}
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
            {(showPrimaryCTA || showSecondaryCTA) && (
              <HeaderCtas
                primaryCTA={primaryCTA}
                secondaryCTA={secondaryCTA}
                primaryVariant={primaryCtaVariant}
                secondaryVariant={secondaryCtaVariant}
                showPrimaryCTA={showPrimaryCTA}
                showSecondaryCTA={showSecondaryCTA}
              />
            )}
          </div>
        </PageSection>
      </div>
      <div
        className="flex md:hidden flex-col"
        aria-label={t("expandedHeaderMobile", "Expanded Header Mobile")}
      >
        <PageSection
          verticalPadding={"header"}
          background={backgroundColor}
          className="flex items-center justify-between"
        >
          <HeaderLogo
            logo={buildComplexImage(logo, logoStyle.width || 100)}
            logoWidth={logoStyle.width || 100}
            aspectRatio={logoStyle.aspectRatio}
          />

          {showMobileMenu && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={
                isOpen
                  ? t("closeMenu", "Close menu")
                  : t("openMenu", "Open menu")
              }
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="text-xl"
            >
              {isOpen ? <FaTimes size="1.5rem" /> : <FaBars size="1.5rem" />}
            </button>
          )}
        </PageSection>
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

          {(showPrimaryCTA || showSecondaryCTA) && (
            <PageSection verticalPadding={"sm"} background={backgroundColor}>
              <HeaderCtas
                primaryCTA={primaryCTA}
                secondaryCTA={secondaryCTA}
                primaryVariant={primaryCtaVariant}
                secondaryVariant={secondaryCtaVariant}
                showPrimaryCTA={showPrimaryCTA}
                showSecondaryCTA={showSecondaryCTA}
              />
            </PageSection>
          )}
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
  const streamDocument = useDocument();
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
      label={resolveComponentData(item.label, i18n.language, streamDocument)}
      linkType={item.linkType}
      link={item.link}
      className="justify-start w-full text-left"
    />
  );

  return (
    <nav aria-label={`${type} Header Links`}>
      <ul className="flex flex-col md:flex-row gap-0 md:gap-6 md:items-center">
        {links
          .filter((item) => !!item?.link)
          .map((item, index) => {
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
                {links
                  .filter((item) => !!item?.link)
                  .slice(MAX_VISIBLE)
                  .map((item, index) => (
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
  showPrimaryCTA: boolean;
  showSecondaryCTA: boolean;
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const {
    primaryCTA,
    secondaryCTA,
    primaryVariant,
    secondaryVariant,
    showPrimaryCTA,
    showSecondaryCTA,
  } = props;

  if (!primaryCTA && !secondaryCTA) {
    return;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-2 md:items-center">
      {showPrimaryCTA && primaryCTA?.link && primaryCTA?.label && (
        <EntityField
          constantValueEnabled
          displayName={pt("fields.primaryCta", "Primary CTA")}
        >
          <CTA
            eventName={`primaryCta`}
            variant={primaryVariant}
            label={resolveComponentData(
              primaryCTA?.label,
              i18n.language,
              streamDocument
            )}
            link={primaryCTA.link}
            linkType={primaryCTA.linkType}
          />
        </EntityField>
      )}
      {showSecondaryCTA && secondaryCTA?.link && secondaryCTA?.label && (
        <EntityField
          constantValueEnabled
          displayName={pt("fields.secondaryCta", "Secondary CTA")}
        >
          <CTA
            eventName={`secondaryCta`}
            variant={secondaryVariant}
            label={resolveComponentData(
              secondaryCTA.label,
              i18n.language,
              streamDocument
            )}
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

/**
 * The Expanded Header is a two-tiered component for websites with complex navigation needs. It consists of a primary header for the main logo, navigation links, and calls-to-action, plus an optional secondary "top bar" for utility links (like "Contact Us" or "Log In") and a language selector.
 * Available on Location templates.
 */
export const ExpandedHeader: ComponentConfig<ExpandedHeaderProps> = {
  label: msg("components.expandedHeader", "Expanded Header"),
  fields: expandedHeaderSectionFields,
  defaultProps: {
    data: {
      primaryHeader: {
        logo: PLACEHOLDER_IMAGE,
        links: [
          defaultMainLink,
          defaultMainLink,
          defaultMainLink,
          defaultMainLink,
        ],
        primaryCTA: {
          label: { en: "Call to Action", hasLocalizedValue: "true" },
          link: "#",
          linkType: "URL",
        },
        showPrimaryCTA: true,
        secondaryCTA: {
          label: { en: "Call to Action", hasLocalizedValue: "true" },
          link: "#",
          linkType: "URL",
        },
        showSecondaryCTA: true,
      },
      secondaryHeader: {
        show: false,
        showLanguageDropdown: false,
        secondaryLinks: [
          defaultSecondaryLink,
          defaultSecondaryLink,
          defaultSecondaryLink,
          defaultSecondaryLink,
          defaultSecondaryLink,
        ],
      },
    },
    styles: {
      primaryHeader: {
        logo: {
          width: undefined,
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
