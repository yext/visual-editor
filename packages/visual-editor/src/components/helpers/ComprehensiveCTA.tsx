import React from "react";
import { useTranslation } from "react-i18next";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComprehensiveCTAValue } from "../../fields/fieldTransforms.tsx";
import { type CTAProps, CTA } from "../atoms/cta.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import {
  type ComprehensiveCTAValue,
  defaultButtonStyleValue,
  defaultLinkStyleValue,
} from "../../fields/styledFields/ComprehensiveCTAField.tsx";
import { FOOD_DELIVERY_SERVICES } from "../../types/types.ts";
import type { ResolvedComprehensiveCTAValue } from "../../fields/fields.ts";
import { type StyledButtonValue } from "../../fields/styledFields/StyledButtonField.tsx";
import { type StyledLinkValue } from "../../fields/styledFields/StyledLinkField.tsx";

export type ComprehensiveCTARenderProps = {
  value?: Partial<ComprehensiveCTAValue> | ResolvedComprehensiveCTAValue;
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
  value: ResolvedComprehensiveCTAValue
): React.CSSProperties | undefined => {
  const ctaType =
    value.data.actionType === "button"
      ? "textAndLink"
      : value.data.cta?.ctaType;

  if (ctaType === "presetImage") {
    return value.sx;
  }

  const typographyStyles: StyledButtonValue | StyledLinkValue =
    value.styles.variant === "link"
      ? (value.styles.link ?? value.styles.button ?? defaultLinkStyleValue)
      : (value.styles.button ?? defaultButtonStyleValue);

  const style: React.CSSProperties & {
    "--display-link-caret"?: string;
  } = {
    ...value.sx,
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

/**
 * Supports both authored props from fields without `transform: true` and resolved
 * props from fields with transforms enabled. Both paths retain styles,
 * accessibility, and interaction behavior.
 *
 * 1. Temporarily resolve authored bindings and translated text through the same
 *    resolver used by field transforms, including defaults for partial values.
 * 2. Use transformed values directly without resolving or interpolating them again.
 * 3. Render the resolved data using the shared CTA presentation.
 *
 * Remove the authored-value compatibility path once all libraries use transforms.
 */
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
}: ComprehensiveCTARenderProps) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  // Authored values retain field/constant bindings or localized text objects.
  // Partial authored values also need defaults before they can be rendered.
  const currentValue =
    !value?.data ||
    !value.styles ||
    (value.data.cta &&
      ("field" in value.data.cta || "constantValue" in value.data.cta)) ||
    typeof value.data.buttonText === "object" ||
    typeof value.data.ariaLabel === "object"
      ? // Without transforms, resolve the authored value using the page and locale.
        resolveComprehensiveCTAValue(
          value as Partial<ComprehensiveCTAValue>,
          streamDocument,
          i18n.language
        )
      : // With transforms, the value already contains resolved data; keep it as is.
        (value as ResolvedComprehensiveCTAValue);
  const actionType = currentValue.data.actionType;
  const ctaType =
    actionType === "button" ? "textAndLink" : currentValue.data.cta?.ctaType;
  const resolvedCta = currentValue.data.cta;
  const resolvedButtonLabel = currentValue.data.buttonText;
  const resolvedLinkLabel = resolvedCta?.label;

  const effectiveLabel =
    label !== undefined
      ? label
      : actionType === "button"
        ? resolvedButtonLabel
        : resolvedLinkLabel;

  const showCTA =
    label !== undefined
      ? label !== null && label !== false
      : actionType === "button"
        ? Boolean(resolvedButtonLabel?.trim())
        : Boolean(
            resolvedCta && (ctaType === "presetImage" || resolvedLinkLabel)
          );

  if (!showCTA) {
    return null;
  }

  const resolvedClassName = themeManagerCn(
    currentValue.className,
    actionType === "link" &&
      ctaType === "presetImage" &&
      currentValue.styles.presetImage &&
      (FOOD_DELIVERY_SERVICES as readonly string[]).includes(
        currentValue.styles.presetImage
      )
      ? "!justify-start"
      : undefined,
    actionType === "button" ? currentValue.data.customClass : undefined,
    className
  );

  const resolvedStyle = {
    ...getComprehensiveCTAStyle(currentValue),
    ...style,
  };

  const resolvedAriaLabel =
    ariaLabel ??
    (actionType === "button"
      ? currentValue.data.ariaLabel || undefined
      : typeof effectiveLabel === "string"
        ? effectiveLabel
        : undefined);

  return (
    <CTA
      actionType={actionType}
      ariaLabel={resolvedAriaLabel}
      alwaysHideCaret={alwaysHideCaret}
      className={resolvedClassName}
      color={currentValue.styles.color}
      // Directions are already resolved and use the ordinary link presentation.
      ctaType={ctaType === "presetImage" ? "presetImage" : "textAndLink"}
      dataAttributes={
        actionType === "button"
          ? toDataAttributes(currentValue.data.dataAttributes)
          : undefined
      }
      eventName={eventName ?? currentValue.eventName}
      id={actionType === "button" ? currentValue.data.customId : undefined}
      label={effectiveLabel}
      link={actionType === "link" && resolvedCta ? resolvedCta.link : undefined}
      linkType={
        actionType === "link" && resolvedCta ? resolvedCta.linkType : undefined
      }
      normalizeLink={true}
      onClick={onClick}
      openInNewTab={
        actionType === "link" ? currentValue.data.openInNewTab : undefined
      }
      presetImageType={
        actionType === "link" ? currentValue.styles.presetImage : undefined
      }
      setPadding={true}
      style={resolvedStyle}
      target={target}
      variant={currentValue.styles.variant}
    />
  );
};
