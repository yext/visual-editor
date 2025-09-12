import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, LinkType } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.js";
import { themeManagerCn } from "@yext/visual-editor";
import { FaAngleRight } from "react-icons/fa";
import { getDirections } from "@yext/pages-components";
import { PresetImageType } from "../../types/types";
import { presetImageIcons } from "../../utils/presetImageIcons";

export type CTAProps = {
  // Core props
  label: React.ReactNode;
  ctaType?: "textAndLink" | "getDirections" | "presetImage";

  // ctaType specific props
  link?: string;
  linkType?: LinkType;
  coordinate?: { latitude: number; longitude: number };
  presetImageType?: PresetImageType;

  // Styling and behavior props
  variant?: ButtonProps["variant"];
  className?: string;
  eventName?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  alwaysHideCaret?: boolean;
  ariaLabel?: string;
};

/**
 * The different visual variants for CTA buttons.
 * "primary": the default button style. A button filled with the primary theme color.
 * "secondary": an outlined button style. A button with a border in the primary theme color and transparent background.
 * "link": a text link style. A button with no border or background, just a hyperlink in the link theme color.
 * "directoryLink": a text link style optimized for directory listings.
 * "headerFooterMainLink": a text link style optimized for main links in the header and footer.
 * "headerFooterSecondaryLink": a text link style optimized for secondary links in the header and footer.
 */
export type CTAVariant = ButtonProps["variant"];

// useResolvedCtaProps resolves the CTA props based on the current context and ctaType
const useResolvedCtaProps = (props: CTAProps) => {
  const {
    ctaType = "textAndLink",
    variant,
    className,
    alwaysHideCaret,
    ariaLabel,
  } = props;
  const { t } = useTranslation();

  const resolvedDynamicProps = useMemo(() => {
    switch (ctaType) {
      case "getDirections":
        const getDirectionsLink = props.coordinate
          ? getDirections(
              undefined,
              undefined,
              undefined,
              { provider: "google" },
              props.coordinate
            )
          : "#";
        return {
          link: getDirectionsLink || "#",
          linkType: "DRIVING_DIRECTIONS" as const,
          label: props.label || "Get Directions",
          ariaLabel: ariaLabel || "Get Directions",
        };
      case "presetImage":
        if (!props.presetImageType) {
          return null;
        }
        return {
          link: props.link || "#",
          linkType: props.linkType ?? "URL",
          label: presetImageIcons[props.presetImageType],
          ariaLabel:
            ariaLabel ||
            t("buttonWithIcon", `Button with {{presetImageType}} icon`, {
              presetImageType: props.presetImageType,
            }),
        };

      case "textAndLink":
      default:
        return {
          link: props.link || "#",
          linkType: props.linkType ?? "URL",
          label: props.label,
          ariaLabel: ariaLabel ?? "",
        };
    }
  }, [props, ariaLabel]);

  if (!resolvedDynamicProps) {
    return null;
  }

  const buttonVariant = ctaType === "presetImage" ? "link" : variant;

  const showCaret =
    !alwaysHideCaret &&
    ctaType !== "presetImage" &&
    variant === "link" &&
    resolvedDynamicProps.linkType !== "EMAIL" &&
    resolvedDynamicProps.linkType !== "PHONE";

  const buttonClassName = themeManagerCn(
    "flex",
    {
      // Let preset images determine their natural size - no forced width constraints
      "w-fit h-[51px] items-center justify-center": ctaType === "presetImage",
      // Special handling for Uber Eats to give it more visual prominence
      "!w-auto":
        ctaType === "presetImage" && props.presetImageType === "uber-eats",
    },
    className
  );

  return {
    ...resolvedDynamicProps,
    buttonVariant,
    buttonClassName,
    showCaret,
  };
};

export const CTA = (props: CTAProps) => {
  const { eventName, target, variant, ctaType } = props;

  const resolvedProps = useResolvedCtaProps(props);

  if (!resolvedProps) {
    return null;
  }

  const {
    link,
    linkType,
    label,
    ariaLabel,
    buttonVariant,
    buttonClassName,
    showCaret,
  } = resolvedProps;

  return (
    <Button asChild className={buttonClassName} variant={buttonVariant}>
      <Link
        cta={{ link, linkType }}
        eventName={eventName}
        target={target}
        aria-label={ariaLabel || undefined}
      >
        {label}
        {ctaType !== "presetImage" && (
          <FaAngleRight
            size="12px"
            // For directoryLink, the theme value for caret is ignored
            className={variant === "directoryLink" ? "block sm:hidden" : ""}
            // display does not support custom Tailwind utilities so the property must be set directly
            style={{
              display:
                variant === "directoryLink"
                  ? undefined
                  : showCaret
                    ? "inline-block"
                    : "none",
            }}
          />
        )}
      </Link>
    </Button>
  );
};
