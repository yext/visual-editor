import {
  backgroundColors,
  PageSection,
  VisibilityWrapper,
  YextField,
  i18n,
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
  data: YextField(i18n("Data"), {
    type: "object",
    objectFields: {
      apiKey: YextField(i18n("API Key"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(i18n("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: i18n("Show"), value: true },
      { label: i18n("Hide"), value: false },
    ],
  }),
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
  label: i18n("Static Map Section"),
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
