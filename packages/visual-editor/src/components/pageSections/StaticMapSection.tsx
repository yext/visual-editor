import {
  backgroundColors,
  msg,
  PageSection,
  VisibilityWrapper,
  YextField,
} from "@yext/visual-editor";
import { MapboxStaticMapComponent } from "../contentBlocks/MapboxStaticMap.tsx";
import { ComponentConfig, Fields } from "@measured/puck";

export type StaticMapSectionProps = {
  data: {
    apiKey: string;
  };
  liveVisibility: boolean;
};

const staticMapSectionFields: Fields<StaticMapSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      apiKey: YextField(msg("fields.apiKey", "API Key"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: true },
      ],
    }
  ),
};

export const StaticMapSectionWrapper = ({ data }: StaticMapSectionProps) => {
  return (
    <PageSection
      background={backgroundColors.background1.value}
      className={`flex items-center`}
    >
      <MapboxStaticMapComponent
        apiKey={data.apiKey}
        coordinate={{
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
        }}
      />
    </PageSection>
  );
};

export const StaticMapSection: ComponentConfig<StaticMapSectionProps> = {
  label: msg("components.staticMapSection", "Static Map Section"),
  fields: staticMapSectionFields,
  defaultProps: {
    data: {
      apiKey: "",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <StaticMapSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
