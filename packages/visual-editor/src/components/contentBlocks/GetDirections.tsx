import { ComponentConfig, Fields, setDeep } from "@puckeditor/core";
import "@yext/pages-components/style.css";
import { BackgroundStyle } from "../../utils/themeConfigOptions";
import { CTA, CTAVariant } from "../atoms/cta";
import { YextField } from "../../editor/YextField";
import { msg } from "../../utils/i18n/platform";
import { resolveDataFromParent } from "../../editor/ParentData";
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
      setPadding={true}
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
