import "@yext/visual-editor/style.css";
import {
  GetHeadConfig,
  GetPath,
  HeadConfig,
  Template,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
} from "@yext/pages";
import { componentRegistry } from "../ve.config";
import {
  applyTheme,
  Editor,
  VisualEditorProvider,
  YextSchemaField,
  defaultThemeConfig,
  createSearchHeadlessConfig,
} from "@yext/visual-editor";
import { buildSchema } from "../utils/buildSchema.ts";
import tailwindConfig from "../../tailwind.config";
import { devTemplateStream } from "../dev.config";
import React from "react";
import {
  // CloudChoice,
  // CloudRegion,
  // Environment,
  // HeadlessConfig,
  provideHeadless,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";

export const config = {
  name: "dev-location",
  stream: {
    $id: "dev-location-stream",
    filter: {
      entityTypes: ["location"],
    },
    fields: [
      "id",
      "uid",
      "meta",
      "slug",
      "name",
      "hours",
      "dineInHours",
      "driveThroughHours",
      "address",
      "yextDisplayCoordinate",
      "c_productSection.sectionTitle",
      "c_productSection.linkedProducts.name",
      "c_productSection.linkedProducts.c_productPromo",
      "c_productSection.linkedProducts.c_description",
      "c_productSection.linkedProducts.c_coverPhoto",
      "c_productSection.linkedProducts.c_productCTA",
      "c_hero",
      "c_faqSection.linkedFAQs.question",
      "c_faqSection.linkedFAQs.answerV2",
      "dm_directoryParents_default_directory.slug",
      "dm_directoryParents_default_directory.name",
      "dm_directoryChildren.name",
      "dm_directoryChildren.address",
      "dm_directoryChildren.slug",
      "dm_directoryChildren.hours",
      "dm_directoryChildren.timezone",
      "additionalHoursText",
      "mainPhone",
      "emails",
      "services",
      "c_deliveryPromo",
    ],
    localization: {
      locales: ["en"],
    },
  },
  additionalProperties: {
    isVETemplate: true,
  },
} as const satisfies TemplateConfig;

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  return {
    title: document.name,
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    tags: [
      {
        type: "link",
        attributes: {
          rel: "icon",
          type: "image/x-icon",
        },
      },
    ],
    other: [
      applyTheme(document, defaultThemeConfig),
      buildSchema(document),
    ].join("\n"),
  };
};

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  const localePath = document.locale !== "en" ? `${document.locale}/` : "";
  return document.address
    ? `${localePath}${document.address.region}/${document.address.city}/${
        document.address.line1
      }-${document.id.toString()}`
    : `${localePath}${document.id.toString()}`;
};

const Dev: Template<TemplateRenderProps> = (props) => {
  const [themeMode, setThemeMode] = React.useState<boolean>(false);
  const { document } = props;
  const entityFields = devTemplateStream.stream.schema
    .fields as unknown as YextSchemaField[];

  const searchHeadlessConfig = createSearchHeadlessConfig(document);
  if (!searchHeadlessConfig) {
    return <></>;
  }
  const searcher = provideHeadless(searchHeadlessConfig);

  // Uncomment this to use the config object directly while we're waiting for other work to be done
  // const config = {
  //   apiKey: "",
  //   experienceKey: "jacob-test",
  //   locale: "en",
  //   experienceVersion: "STAGING",
  //   verticalKey: "locations",
  //   cloudRegion: CloudRegion.US,
  //   cloudChoice: CloudChoice.GLOBAL_MULTI,
  //   environment: Environment.PROD,
  // };
  // const searcher = provideHeadless(config);

  return (
    <div>
      <div className={"flex-container"}>
        <button
          className={"toggle-button"}
          onClick={() => {
            setThemeMode(!themeMode);
          }}
        >
          {themeMode ? "Theme Mode" : "Layout Mode"}
        </button>
      </div>
      <div>
        <SearchHeadlessProvider searcher={searcher}>
          <VisualEditorProvider
            templateProps={props}
            entityFields={{ fields: entityFields }}
            tailwindConfig={tailwindConfig}
          >
            <Editor
              document={document}
              componentRegistry={componentRegistry}
              themeConfig={defaultThemeConfig}
              localDev={true}
              forceThemeMode={themeMode}
            />
          </VisualEditorProvider>
        </SearchHeadlessProvider>
      </div>
    </div>
  );
};

export default Dev;
