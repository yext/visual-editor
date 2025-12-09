import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, setDeep } from "@measured/puck";
import "@yext/pages-components/style.css";
import {
  BackgroundStyle,
  CTA,
  CTAVariant,
  YextField,
  backgroundColors,
  msg,
  resolveDataFromParent,
} from "@yext/visual-editor";

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
  const resolvedColor = color ?? backgroundColors.color1.value;

  return (
    <CTA
      ctaType="getDirections"
      className="font-bold"
      eventName={`getDirections`}
      label={t("getDirections", "Get Directions")}
      linkType={"DRIVING_DIRECTIONS"}
      target="_blank"
      variant={variant}
      color={resolvedColor}
    />
  );
};

export const GetDirections: ComponentConfig<{ props: GetDirectionsProps }> = {
  label: msg("components.getDirections", "Get Directions"),
  fields: getDirectionsFields,
  defaultProps: {
    variant: "primary",
    color: backgroundColors.color1.value,
  },
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(getDirectionsFields, data);
    const ctaVariant = data.props.variant;
    const showColor = ctaVariant === "primary" || ctaVariant === "secondary";
    setDeep(updatedFields, "styles.objectFields.color.visible", showColor);
    return updatedFields;
  },
  render: (props) => <GetDirectionsComponent {...props} />,
};
