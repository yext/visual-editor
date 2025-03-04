export const getEditTemplate = (): string => {
  return `import {
  applyTheme,
  Editor,
  usePlatformBridgeDocument,
  usePlatformBridgeEntityFields,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { componentRegistry } from "../ve.config";
import {
  GetPath,
  TemplateProps,
  TemplateConfig,
  HeadConfig,
  TemplateRenderProps,
  GetHeadConfig,
} from "@yext/pages";
import { themeConfig } from "../../theme.config";
import tailwindConfig from "../../tailwind.config";

// Editor is avaliable at /edit
export const getPath: GetPath<TemplateProps> = () => {
  return "edit";
};

export const config: TemplateConfig = {
  name: "edit",
};

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  return {
    other: applyTheme(document, themeConfig),
  };
};

// Render the editor
const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();

  return (
    <VisualEditorProvider
      templateProps={{
        document: entityDocument
      }}
      entityFields={entityFields}
      tailwindConfig={tailwindConfig}
    >
      <Editor
        document={entityDocument}
        componentRegistry={componentRegistry}
        themeConfig={themeConfig}
      />
    </VisualEditorProvider>
  );
};

export default Edit;
`;
};

export const getMainTemplate = (): string => {
  return `import "@yext/visual-editor/style.css";
import {
  Template,
  GetPath,
  TemplateProps,
  TemplateRenderProps,
  GetHeadConfig,
  HeadConfig,
  TagType,
} from "@yext/pages";
import { Render } from "@measured/puck";
import { mainConfig } from "../ve.config";
import {
  applyTheme,
  VisualEditorProvider,
  normalizeSlug,
  getPageMetadata,
  applyAnalytics,
} from "@yext/visual-editor";
import { themeConfig } from "../../theme.config";
import { buildSchema } from "../utils/buildSchema.js";
import { AnalyticsProvider } from "@yext/pages-components";

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  const { title, description } = getPageMetadata(document);
  const faviconUrl = document?._site?.favicon?.url;

  return {
    title: title,
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
      ...(description
          ? [
            {
              type: "meta" as TagType,
              attributes: {
                name: "description",
                content: description,
              },
            },
          ]
          : []),
      ...(faviconUrl
        ? [
            {
              type: "link" as TagType,
              attributes: {
                rel: "icon",
                type: "image/x-icon",
                href: faviconUrl,
              },
            },
          ]
        : []),
    ],
    other: [
      applyAnalytics(document),
      applyTheme(document, themeConfig),
      buildSchema(document),
    ].join("\\n"),
  };
};

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  if (!document?.__?.layout) {
    // temporary: guard for generated repo-based static page
    return \`static-\${Math.floor(Math.random() * (10000 - 1))}\`;
  }

  if (document.slug) {
    return document.slug;
  }

  const localePath = document.locale !== "en" ? \`\${document.locale}/\` : "";
  const path = document.address
    ? \`\${localePath}\${document.address.region}/\${document.address.city}/\${document.address.line1}\`
    : \`\${localePath}\${document.id}\`;

  return normalizeSlug(path);
};

const Location: Template<TemplateRenderProps> = (props) => {
  const { document } = props;
  // temporary: guard for generated repo-based static page
  if (!document?.__?.layout) {
    return <></>;
  }

  return (
    <AnalyticsProvider
      apiKey={document?._env?.YEXT_PUBLIC_EVENTS_API_KEY}
      templateData={props}
      currency="USD"
    >
      <VisualEditorProvider templateProps={props}>
        <Render config={mainConfig} data={JSON.parse(document.__.layout)} />
      </VisualEditorProvider>
    </AnalyticsProvider>
  );
};

export default Location;
`;
};
