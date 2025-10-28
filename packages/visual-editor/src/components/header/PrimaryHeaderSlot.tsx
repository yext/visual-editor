import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  YextField,
  msg,
  backgroundColors,
  BackgroundStyle,
  PageSection,
  PageSectionProps,
  CTAWrapperProps,
  useOverflow,
  ImageWrapperProps,
  resolveComponentData,
} from "@yext/visual-editor";
import { defaultHeaderLinkProps, HeaderLinksProps } from "./HeaderLinks";
import { FaTimes, FaBars } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export interface PrimaryHeaderSlotProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };

  /** @internal values that come from the parent ExpandedHeader */
  parentValues?: {
    maxWidth?: PageSectionProps["maxWidth"];
    SecondaryHeaderSlot: Slot;
  };

  /** @internal */
  conditionalRender?: {
    CTAs: boolean;
  };

  /** @internal */
  slots: {
    PrimaryCTASlot: Slot;
    SecondaryCTASlot: Slot;
    LogoSlot: Slot;
    LinksSlot: Slot;
  };
}

const primaryHeaderSlotFields: Fields<PrimaryHeaderSlotProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
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
  }),
  slots: {
    type: "object",
    objectFields: {
      PrimaryCTASlot: { type: "slot", allow: [] },
      SecondaryCTASlot: { type: "slot", allow: [] },
      LogoSlot: { type: "slot", allow: [] },
      LinksSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
  parentValues: {
    type: "object",
    objectFields: {
      SecondaryHeaderSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const PrimaryHeaderSlotWrapper: PuckComponent<PrimaryHeaderSlotProps> = ({
  styles,
  slots,
  parentValues,
  conditionalRender,
  puck,
}) => {
  const { t } = useTranslation();

  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const showHamburger = useOverflow(containerRef, contentRef);

  const showCTAs = puck.isEditing || conditionalRender?.CTAs;

  const navContent = (
    <>
      <slots.LinksSlot style={{ height: "auto" }} />
      {showCTAs && (
        <div className="flex flex-col md:flex-row gap-4 md:gap-2 md:items-center">
          <slots.PrimaryCTASlot style={{ height: "auto" }} />
          <slots.SecondaryCTASlot style={{ height: "auto" }} />
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="flex flex-col">
        <PageSection
          maxWidth={parentValues?.maxWidth}
          verticalPadding={"header"}
          background={styles.backgroundColor}
          className="flex flex-row justify-between w-full items-center gap-8"
        >
          {/* Mobile logo */}
          <div className="block md:hidden">
            <slots.LogoSlot style={{ height: "auto", width: "auto" }} />
          </div>
          {/* Desktop logo */}
          <div className="hidden md:block">
            <slots.LogoSlot style={{ height: "auto", width: "auto" }} />
          </div>
          {/* Desktop Navigation & Mobile Hamburger */}
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
              className={`text-xl z-10 ${showHamburger ? "md:block" : "md:hidden"}`}
            >
              {isMobileMenuOpen ? (
                <FaTimes size="1.5rem" />
              ) : (
                <FaBars size="1.5rem" />
              )}
            </button>
          </div>
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
            background={styles.backgroundColor}
            maxWidth={parentValues?.maxWidth}
          >
            <slots.LinksSlot style={{ height: "auto" }} />
          </PageSection>

          {/* Secondary Header (Mobile menu) */}
          {parentValues && (
            <div className="flex md:hidden">
              <parentValues.SecondaryHeaderSlot
                style={{ height: "auto", width: "100%" }}
              />
            </div>
          )}

          {showCTAs && (
            <PageSection
              verticalPadding={"sm"}
              background={styles.backgroundColor}
              maxWidth={parentValues?.maxWidth}
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-2 md:items-center">
                <slots.PrimaryCTASlot style={{ height: "auto" }} />
                <slots.SecondaryCTASlot style={{ height: "auto" }} />
              </div>
            </PageSection>
          )}
        </div>
      )}
    </>
  );
};

export const defaultPrimaryHeaderProps: PrimaryHeaderSlotProps = {
  styles: {
    backgroundColor: backgroundColors.background1.value,
  },
  slots: {
    LogoSlot: [
      {
        type: "ImageSlot",
        props: {
          data: {
            image: {
              field: "",
              constantValue: {
                url: "https://placehold.co/100",
                height: 100,
                width: 100,
              },
              constantValueEnabled: true,
            },
          },
          styles: {
            aspectRatio: 2,
            width: 100,
          },
        } satisfies ImageWrapperProps,
      },
    ],
    LinksSlot: [
      {
        type: "HeaderLinks",
        props: {
          ...defaultHeaderLinkProps,
          parentData: {
            type: "Primary",
          },
        } satisfies HeaderLinksProps,
      },
    ],
    PrimaryCTASlot: [
      {
        type: "CTASlot",
        props: {
          data: {
            show: true,
            entityField: {
              field: "",
              constantValue: {
                label: { en: "Call to Action", hasLocalizedValue: "true" },
                link: "#",
                linkType: "URL",
              },
              constantValueEnabled: true,
            },
          },
          styles: {
            displayType: "textAndLink",
            variant: "primary",
          },
          fieldsToHide: ["styles.displayType"],
        } satisfies CTAWrapperProps,
      },
    ],
    SecondaryCTASlot: [
      {
        type: "CTASlot",
        props: {
          data: {
            show: true,
            entityField: {
              field: "",
              constantValue: {
                label: { en: "Call to Action", hasLocalizedValue: "true" },
                link: "#",
                linkType: "URL",
              },
              constantValueEnabled: true,
            },
          },
          styles: {
            displayType: "textAndLink",
            variant: "secondary",
          },
          fieldsToHide: ["styles.displayType"],
        } satisfies CTAWrapperProps,
      },
    ],
  },
};

export const PrimaryHeaderSlot: ComponentConfig<{
  props: PrimaryHeaderSlotProps;
}> = {
  label: msg("components.primaryHeader", "Primary Header"),
  fields: primaryHeaderSlotFields,
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;
    const locale = streamDocument?.locale ?? "en";

    if (!streamDocument || !locale) {
      return data;
    }

    // Check if PrimaryCTA has data to display
    const showPrimaryCTA: boolean =
      data.props.slots.PrimaryCTASlot[0]?.props.data.show &&
      resolveComponentData(
        data.props.slots.PrimaryCTASlot[0]?.props.data.entityField,
        streamDocument,
        locale
      );

    const showSecondaryCTA: boolean =
      data.props.slots.SecondaryCTASlot[0]?.props.data.show &&
      resolveComponentData(
        data.props.slots.SecondaryCTASlot[0]?.props.data.entityField,
        streamDocument,
        locale
      );

    return {
      ...data,
      props: {
        ...data.props,
        conditionalRender: {
          CTAs: showPrimaryCTA || showSecondaryCTA,
        },
      },
    };
  },
  defaultProps: defaultPrimaryHeaderProps,
  render: (props) => <PrimaryHeaderSlotWrapper {...props} />,
};
