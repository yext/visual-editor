import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import "@yext/pages-components/style.css";
import { CTA, CTAVariant, YextField, msg } from "@yext/visual-editor";

export type GetDirectionsProps = {
  variant: CTAVariant;
};

const getDirectionsFields: Fields<GetDirectionsProps> = {
  variant: YextField(msg("fields.variant", "Variant"), {
    type: "radio",
    options: "CTA_VARIANT",
  }),
};

const GetDirectionsComponent = ({ variant }: GetDirectionsProps) => {
  const { t } = useTranslation();

  return (
    <CTA
      ctaType="getDirections"
      className="font-bold"
      eventName={`getDirections`}
      label={t("getDirections", "Get Directions")}
      linkType={"DRIVING_DIRECTIONS"}
      target="_blank"
      variant={variant}
    />
  );
};

export const GetDirections: ComponentConfig<{ props: GetDirectionsProps }> = {
  label: msg("components.getDirections", "Get Directions"),
  fields: getDirectionsFields,
  defaultProps: {
    variant: "primary",
  },
  render: (props) => <GetDirectionsComponent {...props} />,
};
