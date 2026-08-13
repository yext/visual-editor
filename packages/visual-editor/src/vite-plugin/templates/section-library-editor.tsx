/* SECTION_LIBRARY_GENERATED_FILE */
import "@yext/visual-editor/editor.css";
import "../index.css";
import {
  type GetHeadConfig,
  type GetPath,
  type HeadConfig,
  type TemplateConfig,
  type TemplateProps,
  type TemplateRenderProps,
} from "@yext/pages";
import {
  applyTheme,
  defaultThemeConfig,
  Editor,
  usePlatformBridgeDocument,
  usePlatformBridgeEntityFields,
  VisualEditorProvider,
} from "@yext/visual-editor";
import tailwindConfig from "../../tailwind.config";
import { sectionLibraryConfig } from "../library/.generated/libraryConfig";

const editorPath = "__SECTION_LIBRARY_EDITOR_PATH__";
const editorName = "__SECTION_LIBRARY_EDITOR_NAME__";

export const getPath: GetPath<TemplateProps> = () => editorPath;
export const config: TemplateConfig = { name: editorName };
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => ({
  title: editorName,
  other: applyTheme(document, "./", defaultThemeConfig),
});

const Edit = (): JSX.Element => {
  const document = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();
  return (
    <VisualEditorProvider
      templateProps={{ document }}
      entityFields={entityFields}
      tailwindConfig={tailwindConfig}
    >
      <Editor
        document={document}
        componentRegistry={{ main: sectionLibraryConfig }}
        themeConfig={defaultThemeConfig}
      />
    </VisualEditorProvider>
  );
};

export default Edit;
