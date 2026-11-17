import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, LinkType } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.js";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { normalizeLink } from "../../utils/normalizeLink.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { useBackground } from "../../hooks/useBackground.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { FaAngleRight, FaExternalLinkAlt } from "react-icons/fa";
import { getDirections } from "@yext/pages-components";
import { PresetImageType, FOOD_DELIVERY_SERVICES } from "../../types/types.ts";
import { presetImageIcons } from "../../utils/presetImageIcons.tsx";
import { useThemeData } from "../../hooks/useThemeData.ts";
import {
  resolveThemeEntry,
  resolveThemeColor,
} from "../../utils/dynamicTheme.ts";
import {
  getThemeColorCssValue,
  getDefaultForegroundColor,
} from "../../utils/colors.ts";

export type CTAProps = {
  // Core props
  label: React.ReactNode;
  ctaType?: "textAndLink" | "getDirections" | "presetImage";
  actionType?: "link" | "button";

  // ctaType specific props
  link?: string;
  linkType?: LinkType;
  normalizeLink: boolean;
  presetImageType?: PresetImageType;

  // button actionType specific props
  id?: string;
  dataAttributes?: Record<`data-${string}`, string>;

  // Styling and behavior props
  actionId?: string;
  className?: string;
  style?: React.CSSProperties;
  eventName?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  alwaysHideCaret?: boolean;
  ariaLabel?: string;
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
  ) => void;
  disabled?: boolean;
  color?: ThemeColor;
  openInNewTab?: boolean;
  /**
   * When true and the selected preset presents a link, applies vertical padding (py-3) to the CTA.
   * @defaultValue false
   */
  setPadding?: boolean;
};

const presetImageTypeToName = (presetImageType: PresetImageType) => {
  switch (presetImageType) {
    case "app-store":
      return "App Store";
    case "google-play":
      return "Google Play";
    case "galaxy-store":
      return "Galaxy Store";
    case "app-gallery":
      return "App Gallery";
    case "deliveroo":
      return "Deliveroo";
    case "doordash":
      return "DoorDash";
    case "grubhub":
      return "Grubhub";
    case "skip-the-dishes":
      return "Skip The Dishes";
    case "postmates":
      return "Postmates";
    case "uber-eats":
      return "Uber Eats";
    case "ezcater":
      return "ezCater";
    default:
      return presetImageType;
  }
};

// useResolvedCtaProps resolves the CTA props based on the current context and ctaType
const useResolvedCtaProps = (
  props: CTAProps & { presentation: "button" | "link" }
) => {
  const {
    ctaType = "textAndLink",
    presentation,
    className,
    alwaysHideCaret,
    ariaLabel,
    normalizeLink: shouldNormalizeLink,
  } = props;
  const { t } = useTranslation();
  const streamDocument = useDocument();
  const background = useBackground();

  const resolvedDynamicProps = useMemo(() => {
    const resolvedLink = shouldNormalizeLink
      ? normalizeLink(props.link, props.linkType)
      : (props.link ?? "");

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
          link: resolvedLink || listingsLink || coordinateLink || "#",
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
          const buttonBackgroundColor = background?.isDarkColor
            ? "#FFFFFF"
            : "#F9F9F9";

          label = React.cloneElement(label as React.ReactElement, {
            backgroundColor: buttonBackgroundColor,
          });
        }

        return {
          link: resolvedLink || "#",
          linkType: props.linkType ?? "URL",
          label,
          ariaLabel:
            ariaLabel ||
            t("buttonWithIcon", `Button with {{presetImageType}} icon`, {
              presetImageType: presetImageTypeToName(props.presetImageType),
            }),
        };

      case "textAndLink":
      default:
        return {
          link: resolvedLink || "#",
          linkType: props.linkType ?? "URL",
          label: props.label,
          ariaLabel: ariaLabel ?? "",
        };
    }
  }, [props, streamDocument, background, shouldNormalizeLink, ariaLabel, t]);

  if (!resolvedDynamicProps) {
    return null;
  }

  const showCaret =
    !alwaysHideCaret &&
    ctaType !== "presetImage" &&
    presentation === "link" &&
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
    buttonClassName,
    showCaret,
    background,
  };
};

export const CTA = (props: CTAProps) => {
  const {
    eventName,
    target,
    style,
    ctaType,
    onClick,
    disabled = false,
    color,
    openInNewTab = false,
    setPadding = false,
    actionType = "link",
    id,
    dataAttributes,
  } = props;

  const { t } = useTranslation();
  const theme = useThemeData();
  const action = resolveThemeEntry(theme.actions, props.actionId);
  const resolvedProps = useResolvedCtaProps({
    ...props,
    presentation: action.presentation,
  });
  const isButton = actionType === "button";

  if (!resolvedProps) {
    return null;
  }

  const { link, linkType, label, ariaLabel, buttonClassName, showCaret } =
    resolvedProps;
  const presetBackground =
    action.presentation === "button"
      ? resolveThemeColor(theme, action.default.backgroundColor)
      : undefined;
  const unfilled =
    presetBackground === "transparent" ||
    /^#[0-9a-f]{6}00$/i.test(presetBackground ?? "");
  const dynamicStyle: React.CSSProperties =
    action.presentation === "button" && !unfilled
      ? {
          background: getThemeColorCssValue(color),
          color: getThemeColorCssValue(getDefaultForegroundColor(color)),
          borderColor: getThemeColorCssValue(color, true),
        }
      : {
          color: getThemeColorCssValue(color, true),
          ...(action.presentation === "button"
            ? { borderColor: getThemeColorCssValue(color, true) }
            : {}),
        };
  const disabledStyle: React.CSSProperties = {
    ...(ctaType !== "presetImage" ? dynamicStyle : undefined),
    cursor: "default",
    pointerEvents: "auto",
  };

  const linkContent = (
    <>
      {label}
      {ctaType !== "presetImage" && (
        <FaAngleRight
          size="12px"
          style={{
            display: showCaret ? "var(--ve-action-caret, none)" : "none",
          }}
        />
      )}
    </>
  );

  if (disabled) {
    return (
      <Button
        type="button"
        className={buttonClassName}
        actionId={action.id}
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
        style={{
          ...disabledStyle,

          ...style,
        }}
      >
        {linkContent}
      </Button>
    );
  }

  const computedAriaLabel = isButton
    ? ariaLabel || undefined
    : openInNewTab && ariaLabel && ariaLabel.trim() !== ""
      ? t("aria.opensInNewTab", "{{label}} (opens in a new tab)", {
          label: ariaLabel,
        })
      : ariaLabel || undefined;

  const linkPadding: ButtonProps["linkPadding"] =
    action.presentation === "link" && setPadding ? "yOnly" : "none";

  if (isButton) {
    return (
      <Button
        id={id}
        type="button"
        style={{
          ...(ctaType !== "presetImage" ? dynamicStyle : undefined),
          ...style,
        }}
        className={buttonClassName}
        actionId={action.id}
        linkPadding={linkPadding}
        aria-label={computedAriaLabel}
        onClick={onClick}
        {...dataAttributes}
      >
        {linkContent}
      </Button>
    );
  }

  return (
    <Button
      style={{
        ...(ctaType !== "presetImage" ? dynamicStyle : undefined),
        ...style,
      }}
      asChild
      className={buttonClassName}
      actionId={action.id}
      linkPadding={linkPadding}
    >
      <Link
        cta={{ link: link || "#", linkType }}
        eventName={eventName}
        target={openInNewTab ? "_blank" : target}
        aria-label={computedAriaLabel}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={onClick}
        // textTransform has to be applied via styles because there is no custom tailwind utility
        style={{
          ...(ctaType !== "presetImage" ? dynamicStyle : undefined),
          ...style,
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
