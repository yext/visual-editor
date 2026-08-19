/* SECTION_LIBRARY_GENERATED_FILE */
import "@yext/visual-editor/style.css";
import "../index.css";
import { Render, resolveAllData } from "@puckeditor/core";
import { AnalyticsProvider, SchemaWrapper } from "@yext/pages-components";
import {
  type GetHeadConfig,
  type GetPath,
  type HeadConfig,
  type TagType,
  type Template,
  type TemplateProps,
  type TemplateRenderProps,
  type TransformProps,
} from "@yext/pages";
import {
  applyAnalytics,
  applyCertifiedFacts,
  applyHeaderScript,
  applyTheme,
  defaultThemeConfig,
  getCanonicalUrl,
  getPageMetadata,
  getSchema,
  GTMBody,
  injectTranslations,
  resolveUrlTemplate,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { sectionLibraryConfig } from "__SECTION_LIBRARY_CONFIG_PATH__";
/* SECTION_LIBRARY_MAPBOX_IMPORT */

const layoutId = "__SECTION_LIBRARY_LAYOUT_ID__";

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (
  data
): HeadConfig => {
  const { title, description } = getPageMetadata(data.document);
  const faviconUrl =
    data.document?._favicon ?? data.document?._site?.favicon?.url;
  return {
    title: title ?? "",
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    tags: [
      ...(data.document.siteDomain
        ? [
            {
              type: "link" as TagType,
              attributes: {
                rel: "canonical",
                href: getCanonicalUrl(data),
              },
            },
          ]
        : []),
      ...(description
        ? [
            {
              type: "meta" as TagType,
              attributes: { name: "description", content: description },
            },
          ]
        : []),
      ...(faviconUrl
        ? [
            {
              type: "link" as TagType,
              attributes: {
                rel: "icon",
                type: "image/png",
                href: faviconUrl,
              },
            },
          ]
        : []),
    ],
    other: [
      applyAnalytics(data.document),
      applyHeaderScript(data.document),
      applyTheme(data.document, data.relativePrefixToRoot, defaultThemeConfig),
      SchemaWrapper(getSchema(data)),
      applyCertifiedFacts(data.document),
    ].join("\n"),
  };
};

export const getPath: GetPath<TemplateProps> = ({
  document,
  relativePrefixToRoot,
}) => {
  return resolveUrlTemplate(document, relativePrefixToRoot);
};

export const transformProps: TransformProps<TemplateProps> = async (props) => {
  const layout = props.document.__?.layout;
  if (!layout) {
    throw new Error(
      `Section Library layout ${layoutId} is missing layout data`
    );
  }
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(layout);
  } catch {
    throw new Error(
      `Section Library layout ${layoutId} has invalid layout data`
    );
  }
  props.document.__.layout = JSON.stringify(
    await resolveAllData(data, sectionLibraryConfig, {
      streamDocument: props.document,
    })
  );
  return {
    ...props,
    document: props.document,
    translations: await injectTranslations(props.document),
  };
};

const SectionLibraryLayout: Template<TemplateRenderProps> = (props) => {
  const layout = props.document.__?.layout;
  if (!layout) {
    throw new Error(
      `Section Library layout ${layoutId} is missing layout data`
    );
  }
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(layout);
  } catch {
    throw new Error(
      `Section Library layout ${layoutId} has invalid layout data`
    );
  }
  return (
    <>
      {/* SECTION_LIBRARY_MAPBOX_ASSETS */}
      <AnalyticsProvider
        apiKey={props.document?._env?.YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY}
        templateData={props}
        currency="USD"
      >
        <VisualEditorProvider templateProps={props}>
          <GTMBody>
            <Render
              config={sectionLibraryConfig}
              data={data}
              metadata={{ streamDocument: props.document }}
            />
          </GTMBody>
        </VisualEditorProvider>
      </AnalyticsProvider>
    </>
  );
};

export default SectionLibraryLayout;
