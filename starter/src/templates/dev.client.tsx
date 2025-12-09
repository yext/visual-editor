import { Template, TemplateRenderProps } from "@yext/pages";
import {
  Editor,
  VisualEditorProvider,
  YextSchemaField,
  defaultThemeConfig,
} from "@yext/visual-editor";
import "@yext/visual-editor/editor.css";
import React from "react";
import tailwindConfig from "../../tailwind.config";
import { devTemplateStream } from "../dev.config";
import { componentRegistry } from "../ve.config";

const Dev: Template<TemplateRenderProps> = (props) => {
  const [themeMode, setThemeMode] = React.useState<boolean>(false);
  const { document } = props;
  const entityFields = devTemplateStream.stream.schema
    .fields as unknown as YextSchemaField[];
  const displayNames = devTemplateStream.apiNamesToDisplayNames as Record<
    string,
    string
  >;

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

export default Dev;
