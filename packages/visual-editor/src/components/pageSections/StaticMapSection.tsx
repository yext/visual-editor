import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.ts";
import { msg } from "../../utils/i18n/platform.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { YextField } from "../../editor/YextField.tsx";
import {
  MapboxStaticMapComponent,
  mapStyleField,
} from "../contentBlocks/MapboxStaticMap.tsx";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { ComponentErrorBoundary } from "../../internal/components/ComponentErrorBoundary.tsx";

export interface StaticMapData {
  /**
   * The API key used to generate the map image.
   * @defaultValue ""
   */
  apiKey: string;
}

export interface StaticMapStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * The style of the map to be displayed.
   * @defaultValue Default (streets-v12)
   */
  mapStyle: string;
}

export interface StaticMapSectionProps {
  /**
   * This object contains the configuration needed to generate the map.
   * @propCategory Data Props
   */
  data: StaticMapData;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Styles Props
   */
  styles: StaticMapStyles;
}

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
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
      mapStyle: mapStyleField,
    },
  }),
};

const StaticMapSectionWrapper: PuckComponent<StaticMapSectionProps> = ({
  data,
  styles,
  puck,
  id,
}) => {
  return (
    <PageSection
      background={styles?.backgroundColor}
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
        mapStyle={styles?.mapStyle}
        puck={puck}
        id={id}
      />
    </PageSection>
  );
};

/**
 * The Static Map Section displays a non-interactive map image of a business's location. It uses the entity's address or coordinates to generate the map and requires a valid API key from mapbox.
 * Available on Location templates.
 */
export const StaticMapSection: ComponentConfig<{
  props: StaticMapSectionProps;
}> = {
  label: msg("components.staticMapSection", "Static Map Section"),
  fields: staticMapSectionFields,
  defaultProps: {
    data: {
      apiKey: "",
    },
    liveVisibility: true,
    styles: {
      backgroundColor: backgroundColors.background1.value,
      mapStyle: "streets-v12",
    },
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <StaticMapSectionWrapper {...props} />
      </VisibilityWrapper>
    </ComponentErrorBoundary>
  ),
};
