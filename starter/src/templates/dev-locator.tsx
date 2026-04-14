import "@yext/visual-editor/editor.css";
import {
  GetHeadConfig,
  GetPath,
  HeadConfig,
  Template,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
  TransformProps,
} from "@yext/pages";
import { componentRegistry } from "../ve.config";
import {
  applyTheme,
  Editor,
  VisualEditorProvider,
  YextSchemaField,
  defaultThemeConfig,
  applyAnalytics,
  applyHeaderScript,
  getSchema,
  injectTranslations,
} from "@yext/visual-editor";
import tailwindConfig from "../../tailwind.config";
import { devTemplateStream } from "../dev.config";
import React from "react";
import { SchemaWrapper } from "@yext/pages-components";
import { installLocatorLocalDevMocks } from "../mocks/locatorLocalDev";
import { disableHmrForStackBlitz } from "../utils";

export const config = {
  name: "dev-locator",
  stream: {
    $id: "dev-locator-stream",
    filter: {
      entityTypes: ["locator"],
    },
    fields: ["id", "uid", "meta", "slug", "name"],
    localization: {
      locales: ["en"],
    },
  },
  additionalProperties: {
    isVETemplate: true,
  },
} as const satisfies TemplateConfig;

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (
  data,
): HeadConfig => {
  const { document, relativePrefixToRoot } = data;
  const schema = getSchema(data);

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
      applyAnalytics(document),
      applyHeaderScript(document),
      applyTheme(document, relativePrefixToRoot, defaultThemeConfig),
      SchemaWrapper(schema),
      disableHmrForStackBlitz,
    ].join("\n"),
  };
};

export const transformProps: TransformProps<TemplateProps<any>> = async (
  data,
) => {
  const translations = await injectTranslations(data.document);
  return { ...data, translations };
};

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return document.slug ?? document.id.toString();
};

const DevLocator: Template<TemplateRenderProps> = (props) => {
  const [themeMode, setThemeMode] = React.useState<boolean>(false);
  const mockCleanupRef = React.useRef<(() => void) | null>(null);
  const { document } = props;
  const entityFields = devTemplateStream.stream.schema
    .fields as unknown as YextSchemaField[];
  const displayNames = devTemplateStream.apiNamesToDisplayNames as Record<
    string,
    string
  >;

  React.useEffect(() => {
    if (typeof window !== "undefined" && mockCleanupRef.current === null) {
      mockCleanupRef.current = installLocatorLocalDevMocks();
    }

    return () => {
      mockCleanupRef.current?.();
      mockCleanupRef.current = null;
    };
  }, []);

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
        <VisualEditorProvider
          templateProps={props}
          entityFields={{ fields: entityFields, displayNames: displayNames }}
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
      </div>
    </div>
  );
};

export default DevLocator;
