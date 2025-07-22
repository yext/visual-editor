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
  applyAnalytics,
  applyHeaderScript,
} from "@yext/visual-editor";
import tailwindConfig from "../../tailwind.config";
import { devTemplateStream } from "../dev.config";
import React from "react";
import { SchemaWrapper } from "@yext/pages-components";

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
      "dm_directoryParents_defaultdirectory.slug",
      "dm_directoryParents_defaultdirectory.name",
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
      locales: ["en", "zh_hans_hk", "fr-CA"],
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
      // StackBlitz redirect script - runs immediately when page loads
      `<script>
        (function() {
          // Check if we're in StackBlitz (webcontainer.io domain) or if STACKBLITZ_REDIRECT is set
          var isStackBlitz = window.location.hostname.includes('webcontainer.io');
          var shouldRedirect = isStackBlitz || (typeof process !== 'undefined' && process.env && process.env.STACKBLITZ_REDIRECT === 'true');
          
          // Check if we're on the root path (not already on an entity page)
          var isRootPath = window.location.pathname === '/' || window.location.pathname === '';
          
          if (shouldRedirect && isRootPath) {
            // Redirect to a specific entity page for StackBlitz
            var defaultEntityPath = '/dev-location/dm-city-arlington';
            
            // Use replace to avoid adding to browser history
            window.location.replace(defaultEntityPath);
          }
        })();
      </script>`,
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
