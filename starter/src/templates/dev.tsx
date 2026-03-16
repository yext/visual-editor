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
import { Data, Render } from "@puckeditor/core";
import * as lzstring from "lz-string";

const EMPTY_PUCK_DATA: Data = {
  root: {},
  content: [],
  zones: {},
};

type PuckHistoryEntry = {
  state?: {
    data?: Data;
  };
};

const hashCode = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const chr = value.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash);
};

const getVisualConfigLocalStorageKeyForDev = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const cleanUrl = window.location.href.split("?")[0];
  const layoutHash = hashCode(cleanUrl);
  return `devTEMPLATE_devLAYOUT_${layoutHash}`;
};

const readCurrentPuckDataFromHistory = (storageKey: string | null): Data => {
  if (!storageKey || typeof window === "undefined") {
    return EMPTY_PUCK_DATA;
  }

  const compressedHistory = window.localStorage.getItem(storageKey);
  if (!compressedHistory) {
    return EMPTY_PUCK_DATA;
  }

  try {
    const decompressedHistory = lzstring.decompress(compressedHistory);
    if (!decompressedHistory) {
      return EMPTY_PUCK_DATA;
    }

    const histories = JSON.parse(decompressedHistory) as PuckHistoryEntry[];
    const currentData = histories[histories.length - 1]?.state?.data;
    return currentData ?? EMPTY_PUCK_DATA;
  } catch (error) {
    console.warn("Failed to read preview layout history from localStorage", {
      error,
      storageKey,
    });
    return EMPTY_PUCK_DATA;
  }
};

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
      "ref_listings",
    ],
    localization: {
      locales: ["en", "zh_hans_hk", "fr-CA"],
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
      // Prevent Vite client script loading in StackBlitz
      `<script>
        (function() {
          // Check if we're in StackBlitz
          var isStackBlitz = window.location.hostname.includes('webcontainer.io');
          
          if (isStackBlitz) {
            // Block WebSocket connections for Vite HMR
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
          }
        })();
      </script>`,
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
  const localePath = document.locale !== "en" ? `${document.locale}/` : "";
  return document.address
    ? `${localePath}${document.address.region}/${document.address.city}/${
        document.address.line1
      }-${document.id.toString()}`
    : `${localePath}${document.id.toString()}`;
};

const Dev: Template<TemplateRenderProps> = (props) => {
  const [themeMode, setThemeMode] = React.useState<boolean>(false);
  const [currentPuckData, setCurrentPuckData] =
    React.useState<Data>(EMPTY_PUCK_DATA);
  const { document } = props;
  const puckConfig = componentRegistry.dev;
  const entityFields = devTemplateStream.stream.schema
    .fields as unknown as YextSchemaField[];
  const displayNames = devTemplateStream.apiNamesToDisplayNames as Record<
    string,
    string
  >;
  const isPreviewMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("vePreview") === "1";
  const previewStorageKey = React.useMemo(
    () => getVisualConfigLocalStorageKeyForDev(),
    [],
  );

  React.useEffect(() => {
    if (!isPreviewMode || typeof window === "undefined") {
      return;
    }

    const refreshPuckData = () => {
      setCurrentPuckData(readCurrentPuckDataFromHistory(previewStorageKey));
    };

    refreshPuckData();

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === previewStorageKey) {
        refreshPuckData();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [isPreviewMode, previewStorageKey]);

  const openPreview = () => {
    if (typeof window === "undefined") {
      return;
    }

    const previewUrl = new URL(window.location.href);
    previewUrl.searchParams.set("vePreview", "1");
    window.location.assign(previewUrl.toString());
  };

  const goBackToEditor = () => {
    if (typeof window === "undefined") {
      return;
    }

    const editorUrl = new URL(window.location.href);
    editorUrl.searchParams.delete("vePreview");
    window.location.assign(editorUrl.toString());
  };

  return (
    <div>
      <div className={"flex-container"}>
        {isPreviewMode ? (
          <button className={"toggle-button"} onClick={goBackToEditor}>
            Back to Editor
          </button>
        ) : (
          <>
            <button
              className={"toggle-button"}
              onClick={() => {
                setThemeMode(!themeMode);
              }}
            >
              {themeMode ? "Theme Mode" : "Layout Mode"}
            </button>
            <button className={"toggle-button"} onClick={openPreview}>
              Open Preview
            </button>
          </>
        )}
      </div>
      <div>
        <VisualEditorProvider
          templateProps={props}
          entityFields={{ fields: entityFields, displayNames: displayNames }}
          tailwindConfig={tailwindConfig}
        >
          {isPreviewMode ? (
            <Render
              config={puckConfig}
              data={currentPuckData}
              metadata={{ streamDocument: document }}
            />
          ) : (
            <Editor
              document={document}
              componentRegistry={componentRegistry}
              themeConfig={defaultThemeConfig}
              localDev={true}
              forceThemeMode={themeMode}
            />
          )}
        </VisualEditorProvider>
      </div>
    </div>
  );
};

export default Dev;
