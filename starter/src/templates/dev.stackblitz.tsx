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
import { componentRegistry } from "../ve.config.simple";
import {
  applyTheme,
  Editor,
  VisualEditorProvider,
  YextSchemaField,
  defaultThemeConfig,
  applyAnalytics,
  applyHeaderScript,
} from "@yext/visual-editor";
import tailwindConfig from "../../tailwind.config";
import React from "react";
import { SchemaWrapper } from "@yext/pages-components";

export const config = {
  name: "dev-location-stackblitz",
  stream: {
    $id: "dev-location-stackblitz-stream",
    filter: {
      entityTypes: ["location"],
    },
    fields: [
      "id",
      "uid",
      "meta",
      "slug",
      "name",
      "address",
      "yextDisplayCoordinate",
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
      applyAnalytics(document),
      applyHeaderScript(document),
      applyTheme(document, defaultThemeConfig),
      SchemaWrapper(document._schema),
      // Prevent Vite client script loading in StackBlitz
      `<script>
        (function() {
          // Check if we're in StackBlitz
          var isStackBlitz = window.location.hostname.includes('webcontainer.io');
          
          if (isStackBlitz) {
            // Prevent Vite client script from loading
            window.__VITE_CLIENT_SCRIPT__ = false;
            window.__VITE_IS_IMPORT__ = false;
            window.__VITE_HMR__ = false;
            
            // Override any Vite client loading attempts
            if (window.__vite_is_import) {
              window.__vite_is_import = function() { return false; };
            }
            
            // Block WebSocket connections
            var originalWebSocket = window.WebSocket;
            window.WebSocket = function(url, protocols) {
              // Block Vite HMR WebSocket connections
              if (url && (url.includes('24678') || url.includes('vite') || url.includes('hmr'))) {
                console.log('Blocked Vite WebSocket connection:', url);
                return {
                  readyState: 3, // CLOSED
                  send: function() {},
                  close: function() {},
                  addEventListener: function() {},
                  removeEventListener: function() {},
                };
              }
              return new originalWebSocket(url, protocols);
            };
            
            // Prevent automatic Vite client injection
            Object.defineProperty(document, 'currentScript', {
              get: function() { return null; },
              configurable: true
            });
          }
        })();
      </script>`,
    ].join("\n"),
  };
};

export const getPath: GetPath<TemplateProps> = () => {
  return "dev-location-stackblitz";
};

const DevStackBlitz: Template<TemplateRenderProps> = (props) => {
  const [themeMode, setThemeMode] = React.useState<boolean>(false);
  const { document } = props;

  // Simplified entity fields for StackBlitz
  const entityFields = [
    {
      name: "name",
      displayName: "Name",
    },
    {
      name: "address",
      displayName: "Address",
    },
  ] as YextSchemaField[];

  const displayNames = {
    name: "Name",
    address: "Address",
  };

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

export default DevStackBlitz;
