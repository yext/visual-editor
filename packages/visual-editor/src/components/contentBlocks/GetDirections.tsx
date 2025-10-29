import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import { Coordinate, getDirections } from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  useDocument,
  CTA,
  CTAVariant,
  YextField,
  msg,
  resolveComponentData,
  YextEntityField,
} from "@yext/visual-editor";

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
  const { i18n, t } = useTranslation();
  const streamDocument = useDocument();
  const coordinate = resolveComponentData(
    {
      field: "yextDisplayCoordinate",
      constantValue: {},
    } as YextEntityField<Coordinate>,
    i18n.language,
    streamDocument
  );
  const listings = streamDocument.ref_listings;

  // Use listings if it exists, else use coordinate.
  const link =
    getDirections(
      undefined,
      listings,
      undefined,
      { provider: "google" },
      !listings ? coordinate : undefined
    ) ?? "#";

  return (
    <CTA
      className="font-bold"
      eventName={`getDirections`}
      label={t("getDirections", "Get Directions")}
      link={link}
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
