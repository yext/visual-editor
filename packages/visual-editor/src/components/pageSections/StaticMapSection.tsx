import {
  backgroundColors,
  PageSection,
  VisibilityWrapper,
  YextField,
} from "@yext/visual-editor";
import { MapboxStaticMapComponent } from "../contentBlocks/MapboxStaticMap.tsx";
import { ComponentConfig, Fields } from "@measured/puck";

export type StaticMapSectionProps = {
  apiKey: string;
  liveVisibility: boolean;
};

const staticMapSectionFields: Fields<StaticMapSectionProps> = {
  apiKey: YextField("API Key", {
    type: "text",
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

export const StaticMapSectionWrapper = (props: StaticMapSectionProps) => {
  return (
    <PageSection
      background={backgroundColors.background1.value}
      className={`flex items-center`}
    >
      <MapboxStaticMapComponent
        apiKey={props.apiKey}
        coordinate={{
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
          constantValueEnabled: false,
        }}
      />
    </PageSection>
  );
};

export const StaticMapSection: ComponentConfig<StaticMapSectionProps> = {
  label: "Mapbox Static Map",
  fields: staticMapSectionFields,
  defaultProps: {
    apiKey: "",
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
