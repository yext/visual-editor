import { ComponentConfig, Fields, setDeep } from "@measured/puck";
import "@yext/pages-components/style.css";
import {
  BackgroundStyle,
  CTA,
  CTAVariant,
  YextField,
  msg,
  resolveDataFromParent,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export type GetDirectionsProps = {
  variant: CTAVariant;
  color?: BackgroundStyle;
};

const getDirectionsFields: Fields<GetDirectionsProps> = {
  variant: YextField(msg("fields.variant", "Variant"), {
    type: "radio",
    options: "CTA_VARIANT",
  }),
  color: YextField(msg("fields.color", "Color"), {
    type: "select",
    options: "SITE_COLOR",
  }),
};

const GetDirectionsComponent = ({ variant, color }: GetDirectionsProps) => {
  const { t } = useTranslation();

  return (
    <CTA
      setPadding="py"
      ctaType="getDirections"
      eventName={`getDirections`}
      label={t("getDirections", "Get Directions")}
      linkType={"DRIVING_DIRECTIONS"}
      target="_blank"
      variant={variant}
      color={color}
    />
  );
};

export const GetDirections: ComponentConfig<{ props: GetDirectionsProps }> = {
  label: msg("components.getDirections", "Get Directions"),
  fields: getDirectionsFields,
  defaultProps: {
    variant: "primary",
  },
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(getDirectionsFields, data);
    const ctaVariant = data.props.variant;
    const showColor = ctaVariant === "primary" || ctaVariant === "secondary";
    setDeep(updatedFields, "color.visible", showColor);
    return updatedFields;
  },
  render: (props) => <GetDirectionsComponent {...props} />,
};
