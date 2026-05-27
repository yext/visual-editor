import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import {
  isCtaVariantWithColor,
  type CTAVariant,
} from "../../components/atoms/cta.tsx";
import { getCTAType } from "../../internal/utils/ctaFieldUtils.ts";
import { type MsgString, pt } from "../../utils/i18n/platform.ts";
import { ThemeColor, ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { PresetImageType, TranslatableString } from "../../types/types.ts";
import { type YextCTAField } from "../CTASelectorField.tsx";
import { type YextObjectField } from "../fields.ts";
import { YextAutoField } from "../YextAutoField.tsx";
import { defaultBaseTextStyles } from "./baseText.tsx";
import { type StyledButtonValue } from "./StyledButtonField.tsx";
import { type StyledLinkValue } from "./StyledLinkField.tsx";

export type ComprehensiveCTAValue = {
  data: {
    /**
     * Whether to render the <a> or <button> tag under the hood.
     * Normal CTAs are "link".
     * Custom implementations can use "button" to integrate with custom JS.
     */
    actionType: "link" | "button";
    /** The data source for the CTA. */
    cta: YextCTAField;
    /** Whether to open the link in a new tab for actionType: "link". */
    openInNewTab: boolean;
    /** The label for actionType: "button". */
    buttonText?: TranslatableString;
    /** The id for actionType: "button". */
    customId?: string;
    /** The class names for actionType: "button". */
    customClass?: string;
    /** The data attributes for actionType: "button". */
    dataAttributes?: Array<{ key: string; value: string }>;
    /** The aria label for actionType: "button". */
    ariaLabel?: TranslatableString;
  };
  styles: {
    /** The visual variant of the CTA. */
    variant: CTAVariant;
    /** The preset image to use when cta.selectedType is "presetImage". */
    presetImage?: PresetImageType;
    /** The color of the button or link when cta.selectedType is not "presetImage". */
    color?: ThemeColor;
    /** The theme styling when the variant is "primary" or "secondary" */
    button?: StyledButtonValue;
    /** The theme styling when the variant is "link". */
    link?: StyledLinkValue;
  };
  /** @internal Additional class names to pass to the underlying component. */
  className?: string;
  /** @internal Additional styles to pass to the underlying component. */
  sx?: React.CSSProperties;
  /** @internal The event name to use for Yext Analytics. */
  eventName?: string;
};

export type ComprehensiveCTAField = BaseField & {
  type: "comprehensiveCTA";
  label?: string | MsgString;
  visible?: boolean;
  disableConstantValueToggle?: boolean;
};

type ComprehensiveCTAFieldProps = FieldProps<
  ComprehensiveCTAField,
  ComprehensiveCTAValue
>;

const defaultStyledButtonValue: StyledButtonValue = {
  ...defaultBaseTextStyles,
  borderRadius: "default",
  letterSpacing: "default",
};

const defaultStyledLinkValue: StyledLinkValue = {
  ...defaultBaseTextStyles,
  letterSpacing: "default",
  includeCaret: "default",
};

const defaultComprehensiveCTAValue: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        ctaType: "textAndLink",
        label: "Call to Action",
        link: "#",
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
    button: defaultStyledButtonValue,
    link: defaultStyledLinkValue,
  },
};

export const ComprehensiveCTAFieldOverride = ({
  field,
  value,
  onChange,
}: ComprehensiveCTAFieldProps) => {
  const currentValue: ComprehensiveCTAValue = {
    ...defaultComprehensiveCTAValue,
    ...value,
    data: {
      ...defaultComprehensiveCTAValue.data,
      ...value?.data,
    },
    styles: {
      ...defaultComprehensiveCTAValue.styles,
      ...value?.styles,
      button: {
        ...defaultStyledButtonValue,
        ...value?.styles?.button,
      },
      link: {
        ...defaultStyledLinkValue,
        ...value?.styles?.link,
      },
    },
  };

  const actionType = currentValue.data.actionType;
  const ctaType = getCTAType(currentValue.data.cta).ctaType;
  const effectiveCtaType = actionType === "button" ? "textAndLink" : ctaType;
  const showButtonFields = actionType === "button";
  const showPresetImageField = effectiveCtaType === "presetImage";
  const showColorField =
    isCtaVariantWithColor(currentValue.styles.variant) && !showPresetImageField;
  const showButtonStyleFields =
    !showPresetImageField && currentValue.styles.variant !== "link";
  const showLinkStyleFields =
    !showPresetImageField && currentValue.styles.variant === "link";

  const dataField = React.useMemo<
    YextObjectField<ComprehensiveCTAValue["data"]>
  >(
    () => ({
      type: "object",
      objectFields: {
        actionType: {
          type: "radio",
          label: pt("fields.actionType", "Action Type"),
          options: [
            { label: pt("fields.options.link", "Link"), value: "link" },
            { label: pt("fields.options.button", "Button"), value: "button" },
          ],
        },
        cta: {
          type: "ctaSelector",
          label: pt("fields.cta", "CTA"),
          disableConstantValueToggle: field.disableConstantValueToggle,
          visible: !showButtonFields,
        },
        openInNewTab: {
          type: "radio",
          label: pt("fields.openInNewTab", "Open in New Tab"),
          options: [
            { label: pt("fields.options.yes", "Yes"), value: true },
            { label: pt("fields.options.no", "No"), value: false },
          ],
          visible: !showButtonFields,
        },
        buttonText: {
          type: "translatableString",
          label: pt("fields.buttonText", "Button Text"),
          filter: { types: ["type.string"] },
          visible: showButtonFields,
        },
        customId: {
          type: "text",
          label: pt("fields.customId", "Custom ID"),
          visible: showButtonFields,
        },
        customClass: {
          type: "text",
          label: pt("fields.customClass", "Custom Class"),
          visible: showButtonFields,
        },
        dataAttributes: {
          type: "array",
          label: pt("fields.dataAttributes", "Data Attributes"),
          defaultItemProps: {
            key: "",
            value: "",
          },
          arrayFields: {
            key: {
              label: pt("fields.key", "Key"),
              type: "text",
            },
            value: {
              label: pt("fields.value", "Value"),
              type: "text",
            },
          },
          getItemSummary: (item: { key?: string }, index?: number) =>
            item?.key?.trim()
              ? item.key
              : `${pt("dataAttribute", "Attribute")} ${(index ?? 0) + 1}`,
          visible: showButtonFields,
        },
        ariaLabel: {
          type: "translatableString",
          label: pt("fields.ariaLabel", "Aria Label"),
          filter: { types: ["type.string"] },
          visible: showButtonFields,
        },
      },
    }),
    [field.disableConstantValueToggle, showButtonFields]
  );

  const stylesField = React.useMemo<
    YextObjectField<ComprehensiveCTAValue["styles"]>
  >(
    () => ({
      type: "object",
      objectFields: {
        variant: {
          type: "radio",
          label: pt("fields.variant", "Variant"),
          options: ThemeOptions.CTA_VARIANT,
          visible: !showPresetImageField,
        },
        presetImage: {
          type: "basicSelector",
          label: pt("fields.presetImage", "Preset Image"),
          options: "PRESET_IMAGE",
          visible: showPresetImageField,
        },
        color: {
          type: "basicSelector",
          label: pt("fields.color", "Color"),
          options: "SITE_COLOR",
          visible: showColorField,
        },
        button: {
          type: "styledButton",
          label: pt("fields.buttonStyles", "Button Styles"),
          visible: showButtonStyleFields,
        },
        link: {
          type: "styledLink",
          label: pt("fields.linkStyles", "Link Styles"),
          visible: showLinkStyleFields,
        },
      },
    }),
    [
      showButtonStyleFields,
      showColorField,
      showLinkStyleFields,
      showPresetImageField,
    ]
  );

  return (
    <div>
      {field.label && <FieldLabel label={pt(field.label)} />}
      <div className="ObjectField">
        <div className="ObjectField-fieldset ve-flex ve-flex-col ve-gap-3">
          <div>
            <FieldLabel label={pt("fields.data", "Data")} />
            <YextAutoField
              field={dataField}
              onChange={(nextValue, uiState) =>
                onChange(
                  {
                    ...currentValue,
                    data: nextValue,
                  },
                  uiState
                )
              }
              value={currentValue.data}
            />
          </div>
          <div>
            <FieldLabel label={pt("fields.styles", "Styles")} />
            <YextAutoField
              field={stylesField}
              onChange={(nextValue, uiState) =>
                onChange(
                  {
                    ...currentValue,
                    styles: nextValue,
                  },
                  uiState
                )
              }
              value={currentValue.styles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
