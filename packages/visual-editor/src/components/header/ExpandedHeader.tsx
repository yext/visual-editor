import * as React from "react";
import {
  AnalyticsScopeProvider,
  ComplexImageType,
} from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  CTA,
  EntityField,
  backgroundColors,
  Image,
  msg,
  YextField,
  BackgroundStyle,
  CTAProps,
  TranslatableCTA,
  pt,
  PageSection,
  useDocument,
  resolveComponentData,
  PageSectionProps,
  useOverflow,
  AssetImageType,
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
} from "../contentBlocks/image/styling.ts";

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
    logo: AssetImageType;
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
  /** The maximum width of the header */
  maxWidth: PageSectionProps["maxWidth"];
  /** Whether the header is "sticky" or not */
  headerPosition: "sticky" | "scrollsWithPage";
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
  analytics: {
    scope?: string;
  };

  /**
   * Indicates which props should not be checked for missing translations.
   * @internal
   */
  ignoreLocaleWarning?: string[];
}

const expandedHeaderSectionFields: Fields<ExpandedHeaderProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      primaryHeader: YextField(msg("fields.primaryHeader", "Primary Header"), {
        type: "object",
        objectFields: {
          logo: YextField(msg("fields.logo", "Logo"), {
            type: "image",
          }),
          links: YextField(msg("fields.links", "Links"), {
            type: "array",
            arrayFields: {
              label: YextField(msg("fields.label", "Label"), {
                type: "translatableString",
                filter: { types: ["type.string"] },
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
            getItemSummary: (item, i) => {
              const { i18n } = useTranslation();
              return (
                resolveComponentData(item.label, i18n.language) ||
                pt("Link", "Link") + " " + ((i ?? 0) + 1)
              );
            },
          }),
          primaryCTA: YextField(msg("fields.primaryCTA", "Primary CTA"), {
            type: "object",
            objectFields: {
              label: YextField(msg("fields.label", "Label"), {
                type: "translatableString",
                filter: { types: ["type.string"] },
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
              label: YextField(msg("fields.label", "Label"), {
                type: "translatableString",
                filter: { types: ["type.string"] },
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
                  label: YextField(msg("fields.label", "Label"), {
                    type: "translatableString",
                    filter: { types: ["type.string"] },
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
                getItemSummary: (item, i) => {
                  const { i18n } = useTranslation();
                  return (
                    resolveComponentData(item.label, i18n.language) ||
                    pt("Link", "Link") + " " + ((i ?? 0) + 1)
                  );
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
      maxWidth: YextField(msg("fields.maxWidth", "Max Width"), {
        type: "maxWidth",
      }),
      headerPosition: YextField(
        msg("fields.headerPosition", "Header Position"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.scrollsWithPage", "Scrolls with Page"),
              value: "scrollsWithPage",
            },
            { label: msg("fields.options.sticky", "Sticky"), value: "sticky" },
          ],
        }
      ),
    },
  }),
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

const ExpandedHeaderWrapper: React.FC<ExpandedHeaderProps> = ({
  data,
  styles,
}: ExpandedHeaderProps) => {
  const { t } = useTranslation();
  const streamDocument = useDocument();
  const { primaryHeader, secondaryHeader } = data;
  const {
    primaryHeader: primaryHeaderStyle,
    secondaryHeader: secondaryHeaderStyle,
    maxWidth,
  } = styles;
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
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const showHamburger = useOverflow(containerRef, contentRef);

  const hasNavContent =
    !!(primaryCTA?.label && primaryCTA?.link) ||
    !!(secondaryCTA?.label && secondaryCTA?.link) ||
    !!links.some((l) => l.label && l.link) ||
    !!(
      show &&
      (secondaryLinks.some((l) => l.label && l.link) || showLanguageDropdown)
    );

  const navContent = (
    <>
      <EntityField
        constantValueEnabled
        displayName={pt("fields.primaryHeaderLinks", "Primary Header Links")}
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
    </>
  );

  return (
    <div
      className={`flex flex-col ${
        styles.headerPosition === "sticky" ? "sticky top-0 z-50" : ""
      }`}
    >
      {/* Secondary Header (Top Bar) */}
      <div className="hidden md:flex flex-col">
        {show && (
          <div className="hidden md:flex">
            <PageSection
              maxWidth={maxWidth}
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
          </div>
        )}
      </div>

      {/* Primary Header */}
      <div className="flex flex-col">
        <PageSection
          maxWidth={maxWidth}
          verticalPadding={"header"}
          background={backgroundColor}
          className="flex flex-row justify-between w-full items-center gap-8"
        >
          <EntityField
            constantValueEnabled
            displayName={pt("fields.logoUrl", "Logo")}
          >
            {/* Mobile Logo */}
            <div className="block md:hidden">
              <HeaderLogo
                logo={buildComplexImage(logo, logoStyle.width ?? 100)}
                logoWidth={logoStyle.width ?? 100}
                aspectRatio={logoStyle.aspectRatio}
              />
            </div>
            {/* Desktop Logo */}
            <div className="hidden md:block">
              <HeaderLogo
                logo={buildComplexImage(logo, logoStyle.width ?? 200)}
                logoWidth={logoStyle.width ?? 200}
                aspectRatio={logoStyle.aspectRatio}
              />
            </div>
          </EntityField>

          {/* Desktop Navigation & Mobile Hamburger */}
          {hasNavContent && (
            <div
              className="flex-grow flex justify-end items-center min-w-0"
              ref={containerRef}
            >
              {/* 1. The "Measure" Div: Always rendered but visually hidden. */}
              {/* Its width is our source of truth. */}
              <div
                ref={contentRef}
                className="flex items-center gap-8 invisible h-0"
              >
                {navContent}
              </div>

              {/* 2. The "Render" Div: Conditionally shown or hidden based on the measurement. */}
              <div
                className={`hidden md:flex items-center gap-8 absolute ${
                  showHamburger
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100 pointer-events-auto"
                }`}
              >
                {navContent}
              </div>

              {/* Hamburger Button - Shown when nav overflows or on small screens */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={
                  isMobileMenuOpen
                    ? t("closeMenu", "Close menu")
                    : t("openMenu", "Open menu")
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                className={`text-xl z-10 ${
                  showHamburger ? "md:block" : "md:hidden"
                }`}
              >
                {isMobileMenuOpen ? (
                  <FaTimes size="1.5rem" />
                ) : (
                  <FaBars size="1.5rem" />
                )}
              </button>
            </div>
          )}
        </PageSection>
      </div>

      {/* Mobile Menu Panel (Flyout) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className={`transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {/* ... Mobile menu sections remain the same ... */}
          <PageSection
            verticalPadding={"sm"}
            background={backgroundColor}
            maxWidth={maxWidth}
          >
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
          {/* Secondary Header (Mobile menu) */}
          {show && (
            <div className="flex md:hidden">
              <PageSection
                maxWidth={maxWidth}
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
            </div>
          )}
          {(showPrimaryCTA || showSecondaryCTA) && (
            <PageSection
              verticalPadding={"sm"}
              background={backgroundColor}
              maxWidth={maxWidth}
            >
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
    </div>
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
      link={resolveComponentData(item.link, i18n.language, streamDocument)}
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
    <figure style={{ width: `${props.logoWidth}px` }}>
      <Image
        image={props.logo.image}
        aspectRatio={
          props.aspectRatio || props.logo.image.width / props.logo.image.height
        }
      />
    </figure>
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
            link={resolveComponentData(
              primaryCTA?.link,
              i18n.language,
              streamDocument
            )}
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
            link={resolveComponentData(
              secondaryCTA.link,
              i18n.language,
              streamDocument
            )}
            linkType={secondaryCTA.linkType}
          />
        </EntityField>
      )}
    </div>
  );
};

const buildComplexImage = (
  image: AssetImageType,
  width: number
): ComplexImageType => {
  const safeUrl = image?.url || PLACEHOLDER_IMAGE;
  const { entityDocument } = useDocument();
  const { i18n } = useTranslation();
  const altText = resolveComponentData(
    image?.alternateText ?? "",
    i18n.language,
    entityDocument
  );

  return {
    image: {
      url: safeUrl,
      width,
      height: width / 2,
      alternateText: altText,
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
        logo: {
          url: PLACEHOLDER_IMAGE,
          alternateText: { en: "Logo", hasLocalizedValue: "true" },
          width: 100,
          height: 100,
        },
        links: [defaultMainLink, defaultMainLink, defaultMainLink],
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
      maxWidth: "theme",
      headerPosition: "scrollsWithPage",
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
        objectFields: {
          ...stylesFields,
          // re-generate max width options
          maxWidth: YextField(msg("fields.maxWidth", "Max Width"), {
            type: "maxWidth",
          }),
        },
      },
    };
  },
  resolveData: (data) => {
    const hiddenProps: string[] = [];

    if (!data.props.data.secondaryHeader?.show) {
      hiddenProps.push("data.secondaryHeader");
    }

    if (!data.props.data.primaryHeader.showPrimaryCTA) {
      hiddenProps.push("data.primaryHeader.primaryCTA");
    }

    if (!data.props.data.primaryHeader.showSecondaryCTA) {
      hiddenProps.push("data.primaryHeader.secondaryCTA");
    }

    return {
      ...data,
      props: {
        ...data.props,
        ignoreLocaleWarning: hiddenProps,
      },
    };
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "expandedHeader"}>
      <ExpandedHeaderWrapper {...props} />
    </AnalyticsScopeProvider>
  ),
};
