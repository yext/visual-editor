import { setDeep } from "@puckeditor/core";
import "@yext/pages-components/style.css";
import { ThemeColor, ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { CTA, CTAVariant, isCtaVariantWithColor } from "../atoms/cta.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { useTranslation } from "react-i18next";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

export type GetDirectionsProps = {
  variant: CTAVariant;
  /** Sets the primary fill, secondary border and text, or link text color. */
  color?: ThemeColor;
  /** The text and icon color for the primary variant. */
  textColor?: ThemeColor;
};

const getDirectionsFields: YextFields<GetDirectionsProps> = {
  variant: {
    label: msg("fields.variant", "Variant"),
    type: "radio",
    options: ThemeOptions.CTA_VARIANT,
  },
  color: {
    type: "basicSelector",
    label: msg("fields.color", "Color"),
    options: "SITE_COLOR",
  },
  textColor: {
    type: "basicSelector",
    label: msg("fields.textColor", "Text Color"),
    options: "SITE_COLOR",
  },
};

const GetDirectionsComponent = ({
  variant,
  color,
  textColor,
}: GetDirectionsProps) => {
  const { t } = useTranslation();

  return (
    <CTA
      setPadding={true}
      ctaType="getDirections"
      eventName={`getDirections`}
      label={t("getDirections", "Get Directions")}
      linkType={"DRIVING_DIRECTIONS"}
      normalizeLink={false}
      target="_blank"
      variant={variant}
      color={color}
      textColor={textColor}
    />
  );
};

export const GetDirections: YextComponentConfig<GetDirectionsProps> = {
  label: msg("components.getDirections", "Get Directions"),
  fields: getDirectionsFields,
  defaultProps: {
    variant: "primary",
  },
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(getDirectionsFields, data);
    const ctaVariant = data.props.variant;
    const showColor = isCtaVariantWithColor(ctaVariant);
    setDeep(updatedFields, "color.visible", showColor);
    setDeep(updatedFields, "textColor.visible", ctaVariant === "primary");
    return updatedFields;
  },
  render: (props) => <GetDirectionsComponent {...props} />,
};
