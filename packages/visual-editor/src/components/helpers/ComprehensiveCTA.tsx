import React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { type CTAProps, CTA } from "../atoms/cta.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import {
  type ComprehensiveCTAValue,
  defaultButtonStyleValue,
  defaultLinkStyleValue,
} from "../../fields/styledFields/ComprehensiveCTAField.tsx";
import {
  FOOD_DELIVERY_SERVICES,
  type EnhancedTranslatableCTA,
} from "../../types/types.ts";
import { type StyledButtonValue } from "../../fields/styledFields/StyledButtonField.tsx";
import { type StyledLinkValue } from "../../fields/styledFields/StyledLinkField.tsx";

export type ComprehensiveCTARenderProps = {
  value?: Omit<Partial<ComprehensiveCTAValue>, "data" | "sx"> & {
    /** Puck maps CSS string intersections as objects; both types carry the same CSS values. */
    sx?:
      | React.CSSProperties
      | Parameters<PuckComponent<{ sx: React.CSSProperties }>>[0]["sx"];
    data?: Omit<
      ComprehensiveCTAValue["data"],
      "cta" | "buttonText" | "ariaLabel"
    > & {
      cta?: Omit<EnhancedTranslatableCTA, "label" | "link"> & {
        label?: string;
        link?: string;
      };
      buttonText?: string;
      ariaLabel?: string;
    };
  };
  label?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  eventName?: string;
  target?: CTAProps["target"];
  alwaysHideCaret?: boolean;
  onClick?: CTAProps["onClick"];
};

const resolveTextStyleValue = (value: string | undefined) =>
  value && value !== "default" ? value : undefined;

const getComprehensiveCTAStyle = (
  value: NonNullable<ComprehensiveCTARenderProps["value"]>
): React.CSSProperties | undefined => {
  const ctaType =
    value.data?.actionType === "button"
      ? "textAndLink"
      : value.data?.cta?.ctaType;

  if (ctaType === "presetImage") {
    return value.sx as React.CSSProperties | undefined;
  }

  const typographyStyles: StyledButtonValue | StyledLinkValue =
    value.styles?.variant === "link"
      ? (value.styles?.link ?? value.styles?.button ?? defaultLinkStyleValue)
      : (value.styles?.button ?? defaultButtonStyleValue);

  const style: React.CSSProperties & {
    "--display-link-caret"?: string;
  } = {
    ...(value.sx as React.CSSProperties),
  };

  const fontFamily = resolveTextStyleValue(typographyStyles.fontFamily);
  const fontSize = resolveTextStyleValue(typographyStyles.fontSize);
  const fontWeight = resolveTextStyleValue(typographyStyles.fontWeight);
  const fontStyle = resolveTextStyleValue(typographyStyles.fontStyle);
  const textTransform = resolveTextStyleValue(typographyStyles.textTransform);
  const letterSpacing = resolveTextStyleValue(typographyStyles.letterSpacing);

  if (fontFamily) {
    style.fontFamily = fontFamily;
  }
  if (fontSize) {
    style.fontSize = fontSize;
  }
  if (fontWeight) {
    style.fontWeight = fontWeight;
  }
  if (fontStyle) {
    style.fontStyle = fontStyle as React.CSSProperties["fontStyle"];
  }
  if (textTransform) {
    style.textTransform = textTransform as React.CSSProperties["textTransform"];
  }
  if (letterSpacing) {
    style.letterSpacing = letterSpacing;
  }

  if ("borderRadius" in typographyStyles) {
    const borderRadius = resolveTextStyleValue(typographyStyles.borderRadius);
    if (borderRadius) {
      style.borderRadius = borderRadius;
    }
  }

  if ("includeCaret" in typographyStyles) {
    const includeCaret = resolveTextStyleValue(typographyStyles.includeCaret);
    if (includeCaret) {
      style["--display-link-caret"] = includeCaret;
    }
  }

  return Object.keys(style).length ? style : undefined;
};

const toDataAttributes = (
  dataAttributes: ComprehensiveCTAValue["data"]["dataAttributes"]
) => {
  if (!dataAttributes?.length) {
    return undefined;
  }

  return dataAttributes.reduce(
    (acc, { key, value }) => {
      const trimmedKey = key?.trim();
      if (!trimmedKey) {
        return acc;
      }

      const normalizedKey = trimmedKey.startsWith("data-")
        ? trimmedKey
        : `data-${trimmedKey}`;
      acc[normalizedKey as `data-${string}`] = value ?? "";
      return acc;
    },
    {} as Record<`data-${string}`, string>
  );
};

/** Render transformed CTA content while retaining action, styling, and analytics behavior. */
export const ComprehensiveCTA = ({
  value,
  label,
  ariaLabel,
  className,
  style,
  eventName,
  target,
  alwaysHideCaret,
  onClick,
}: ComprehensiveCTARenderProps): React.ReactElement | null => {
  const actionType = value?.data?.actionType ?? "link";
  const ctaType =
    actionType === "button" ? "textAndLink" : value?.data?.cta?.ctaType;
  const cta = value?.data?.cta;

  const effectiveLabel =
    label !== undefined
      ? label
      : actionType === "button"
        ? value?.data?.buttonText
        : cta?.label;

  const showCTA =
    label !== undefined
      ? label !== null && label !== false
      : actionType === "button"
        ? Boolean(value?.data?.buttonText?.trim())
        : Boolean(cta && (ctaType === "presetImage" || cta?.label));

  if (!showCTA) {
    return null;
  }

  const resolvedClassName = themeManagerCn(
    value?.className,
    actionType === "link" &&
      ctaType === "presetImage" &&
      value?.styles?.presetImage &&
      (FOOD_DELIVERY_SERVICES as readonly string[]).includes(
        value?.styles?.presetImage
      )
      ? "!justify-start"
      : undefined,
    actionType === "button" ? value?.data?.customClass : undefined,
    className
  );

  const resolvedStyle = {
    ...getComprehensiveCTAStyle(value ?? {}),
    ...style,
  };

  const resolvedAriaLabel =
    ariaLabel ??
    (actionType === "button"
      ? value?.data?.ariaLabel || undefined
      : typeof effectiveLabel === "string"
        ? effectiveLabel
        : undefined);

  return (
    <CTA
      actionType={actionType}
      ariaLabel={resolvedAriaLabel}
      alwaysHideCaret={alwaysHideCaret}
      className={resolvedClassName}
      color={value?.styles?.color}
      ctaType={ctaType}
      dataAttributes={
        actionType === "button"
          ? toDataAttributes(value?.data?.dataAttributes)
          : undefined
      }
      eventName={eventName ?? value?.eventName}
      id={actionType === "button" ? value?.data?.customId : undefined}
      label={effectiveLabel}
      link={
        actionType === "link" && ctaType !== "getDirections" && cta
          ? cta.link
          : undefined
      }
      linkType={actionType === "link" && cta ? cta.linkType : undefined}
      normalizeLink={true}
      onClick={onClick}
      openInNewTab={
        actionType === "link" ? value?.data?.openInNewTab : undefined
      }
      presetImageType={
        actionType === "link" ? value?.styles?.presetImage : undefined
      }
      setPadding={true}
      style={resolvedStyle}
      target={target}
      variant={value?.styles?.variant ?? "primary"}
    />
  );
};
