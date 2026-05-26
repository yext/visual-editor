import React from "react";
import { useTranslation } from "react-i18next";
import { type CTAProps, CTA } from "../atoms/cta.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { getCTAType } from "../../internal/utils/ctaFieldUtils.ts";
import { type ComprehensiveCTAValue } from "../../fields/styledFields/ComprehensiveCTAField.tsx";
import {
  FOOD_DELIVERY_SERVICES,
  type EnhancedTranslatableCTA,
} from "../../types/types.ts";
import { type StyledButtonValue } from "../../fields/styledFields/StyledButtonField.tsx";
import { type StyledLinkValue } from "../../fields/styledFields/StyledLinkField.tsx";
import { defaultBaseTextStyles } from "../../fields/styledFields/baseText.tsx";

export type ComprehensiveCTARenderProps = {
  value?: Partial<ComprehensiveCTAValue>;
  label?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  eventName?: string;
  target?: CTAProps["target"];
  alwaysHideCaret?: boolean;
  onClick?: CTAProps["onClick"];
};

const defaultButtonStyleValue: StyledButtonValue = {
  ...defaultBaseTextStyles,
  borderRadius: "default",
  letterSpacing: "default",
};

const defaultLinkStyleValue: StyledLinkValue = {
  ...defaultBaseTextStyles,
  letterSpacing: "default",
  includeCaret: "default",
};

const defaultComprehensiveCTAValue: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValueEnabled: true,
      constantValue: {
        ctaType: "textAndLink",
        label: { defaultValue: "Call to Action" },
        link: { defaultValue: "#" },
        linkType: "URL",
      },
      selectedType: "textAndLink",
    },
    openInNewTab: false,
    buttonText: { defaultValue: "Button" },
    customId: "",
    customClass: "",
    dataAttributes: [],
    ariaLabel: { defaultValue: "Button" },
  },
  styles: {
    variant: "primary",
    presetImage: "app-store",
    button: defaultButtonStyleValue,
    link: defaultLinkStyleValue,
  },
};

const normalizeComprehensiveCTAValue = (
  value?: Partial<ComprehensiveCTAValue>
): ComprehensiveCTAValue => ({
  ...defaultComprehensiveCTAValue,
  ...value,
  data: {
    ...defaultComprehensiveCTAValue.data,
    ...value?.data,
    cta: {
      ...defaultComprehensiveCTAValue.data.cta,
      ...value?.data?.cta,
      constantValue: {
        ...defaultComprehensiveCTAValue.data.cta.constantValue,
        ...value?.data?.cta?.constantValue,
      },
    },
  },
  styles: {
    ...defaultComprehensiveCTAValue.styles,
    ...value?.styles,
    button: {
      ...defaultButtonStyleValue,
      ...value?.styles?.button,
    },
    link: {
      ...defaultLinkStyleValue,
      ...value?.styles?.link,
    },
  },
});

const resolveTextStyleValue = (value: string | undefined) =>
  value && value !== "default" ? value : undefined;

const getComprehensiveCTAStyle = (
  value: ComprehensiveCTAValue
): React.CSSProperties | undefined => {
  const ctaType =
    value.data.actionType === "button"
      ? "textAndLink"
      : getCTAType(value.data.cta).ctaType;

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
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currentValue = normalizeComprehensiveCTAValue(value);

  const actionType = currentValue.data.actionType;
  const { ctaType } =
    actionType === "link"
      ? getCTAType(currentValue.data.cta)
      : { ctaType: "textAndLink" as const };
  const resolvedCta =
    actionType === "link"
      ? (resolveComponentData(currentValue.data.cta, locale, streamDocument) as
          | EnhancedTranslatableCTA
          | undefined)
      : undefined;

  const resolvedButtonLabel = currentValue.data.buttonText
    ? resolveComponentData(currentValue.data.buttonText, locale, streamDocument)
    : "";
  const resolvedFieldAriaLabel = currentValue.data.ariaLabel
    ? resolveComponentData(currentValue.data.ariaLabel, locale, streamDocument)
    : "";

  let resolvedLinkLabel =
    resolvedCta &&
    resolveComponentData(resolvedCta.label, locale, streamDocument);

  if (
    actionType === "link" &&
    !currentValue.data.cta.constantValueEnabled &&
    ctaType === "getDirections"
  ) {
    resolvedLinkLabel = t("getDirections", "Get Directions");
  }

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
      ? resolvedFieldAriaLabel || undefined
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
      ctaType={ctaType}
      dataAttributes={
        actionType === "button"
          ? toDataAttributes(currentValue.data.dataAttributes)
          : undefined
      }
      eventName={eventName ?? currentValue.eventName}
      id={actionType === "button" ? currentValue.data.customId : undefined}
      label={effectiveLabel}
      link={
        actionType === "link" && resolvedCta
          ? resolveComponentData(resolvedCta.link, locale, streamDocument)
          : undefined
      }
      linkType={
        actionType === "link" && resolvedCta ? resolvedCta.linkType : undefined
      }
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
