import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, LinkType } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.js";
import {
  BackgroundStyle,
  normalizeSlug,
  themeManagerCn,
  useBackground,
  useDocument,
} from "@yext/visual-editor";
import { FaAngleRight, FaExternalLinkAlt } from "react-icons/fa";
import { getDirections } from "@yext/pages-components";
import { PresetImageType, FOOD_DELIVERY_SERVICES } from "../../types/types";
import { presetImageIcons } from "../../utils/presetImageIcons";
import { normalizeThemeColor } from "../../utils/normalizeThemeColor.js";

export type CTAProps = {
  // Core props
  label: React.ReactNode;
  ctaType?: "textAndLink" | "getDirections" | "presetImage";

  // ctaType specific props
  link?: string;
  linkType?: LinkType;
  presetImageType?: PresetImageType;

  // Styling and behavior props
  variant?: ButtonProps["variant"];
  className?: string;
  eventName?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  alwaysHideCaret?: boolean;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  disabled?: boolean;
  color?: BackgroundStyle;
  openInNewTab?: boolean;
  /**
   * When true and variant is "link", applies vertical padding (py-3) to the CTA.
   * @default false
   */
  setPadding?: boolean;
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
  const streamDocument = useDocument();
  const background = useBackground();

  const resolvedDynamicProps = useMemo(() => {
    switch (ctaType) {
      case "getDirections": {
        const listings = streamDocument.ref_listings ?? [];
        const listingsLink = getDirections(
          undefined,
          listings,
          undefined,
          { provider: "google" },
          undefined
        );
        const coordinateLink = getDirections(
          undefined,
          undefined,
          undefined,
          { provider: "google" },
          streamDocument.yextDisplayCoordinate
        );
        // Prefer hardcoded link, then listings link, then coordinate link
        // User settable link props should not be used for get directions
        return {
          link: props.link || listingsLink || coordinateLink || "#",
          linkType: "DRIVING_DIRECTIONS" as const,
          label: props.label || t("getDirections", "Get Directions"),
          ariaLabel: ariaLabel || t("getDirections", "Get Directions"),
        };
      }
      case "presetImage":
        if (!props.presetImageType) {
          return null;
        }

        let label = presetImageIcons[props.presetImageType];

        if (
          props.presetImageType &&
          (FOOD_DELIVERY_SERVICES as readonly string[]).includes(
            props.presetImageType
          ) &&
          React.isValidElement(label)
        ) {
          const buttonBackgroundColor = background?.isDarkBackground
            ? "#FFFFFF"
            : "#F9F9F9";

          label = React.cloneElement(label as React.ReactElement, {
            backgroundColor: buttonBackgroundColor,
          });
        }

        return {
          link: props.link || "#",
          linkType: props.linkType ?? "URL",
          label,
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
  }, [props, streamDocument, background]);

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
      // Special handling for food delivery services to give them more visual prominence
      "!w-auto":
        ctaType === "presetImage" &&
        props.presetImageType &&
        (FOOD_DELIVERY_SERVICES as readonly string[]).includes(
          props.presetImageType
        ),
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
  const {
    eventName,
    target,
    variant,
    ctaType,
    onClick,
    disabled = false,
    color,
    openInNewTab = false,
    setPadding = false,
  } = props;

  const { t } = useTranslation();
  const resolvedProps = useResolvedCtaProps(props);
  const isDarkBG = useBackground()?.isDarkBackground;
  const dynamicStyle: React.CSSProperties = (() => {
    const bg = normalizeThemeColor(color?.bgColor);
    const textColor = normalizeThemeColor(color?.textColor);
    const border = bg && `var(--colors-${bg})`;

    if (variant === "primary") {
      return {
        backgroundColor: bg && `var(--colors-${bg})`,
        color: textColor && `var(--colors-${textColor})`,
        borderColor: border,
      };
    }

    if (variant === "secondary" && !isDarkBG) {
      return {
        borderColor: border,
        color: border,
      };
    }

    return {};
  })();

  const disabledStyle: React.CSSProperties = {
    ...(ctaType !== "presetImage" ? dynamicStyle : undefined),
    cursor: "default",
    pointerEvents: "auto",
  };

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

  const linkContent = (
    <>
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
    </>
  );

  if (disabled) {
    return (
      <Button
        className={buttonClassName}
        variant={buttonVariant}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={disabledStyle}
      >
        {linkContent}
      </Button>
    );
  }

  // Normalize link for all link types except EMAIL and PHONE
  const normalizedLink =
    linkType === "EMAIL" || linkType === "PHONE"
      ? link
      : normalizeSlug(link) || "#";

  const computedAriaLabel =
    openInNewTab && ariaLabel && ariaLabel.trim() !== ""
      ? t("aria.opensInNewTab", "{{label}} (opens in a new tab)", {
          label: ariaLabel,
        })
      : ariaLabel || undefined;

  const linkPadding: ButtonProps["linkPadding"] =
    buttonVariant === "link" && setPadding ? "yOnly" : "none";

  return (
    <Button
      style={ctaType !== "presetImage" ? dynamicStyle : undefined}
      asChild
      className={buttonClassName}
      variant={buttonVariant}
      linkPadding={linkPadding}
    >
      <Link
        cta={{ link: normalizedLink, linkType }}
        eventName={eventName}
        target={openInNewTab ? "_blank" : target}
        aria-label={computedAriaLabel}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={onClick}
        // textTransform has to be applied via styles because there is no custom tailwind utility
        style={{
          // @ts-expect-error ts(2322) the css variable here resolves to a valid enum value
          textTransform: buttonVariant?.toLowerCase().includes("link")
            ? "var(--textTransform-link-textTransform)"
            : "var(--textTransform-button-textTransform)",
        }}
      >
        {linkContent}
        {openInNewTab && (
          <FaExternalLinkAlt
            aria-hidden="true"
            className="inline-block ml-1 w-3 h-3 align-middle relative -top-px"
          />
        )}
      </Link>
    </Button>
  );
};
