import {
  Puck,
  Data,
  Config,
  type History,
  InitialHistory,
  AppState,
} from "@measured/puck";
import React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityFieldProvider } from "../../components/editor/EntityField.tsx";
import { LayoutSaveState } from "../types/saveState.ts";
import { LayoutHeader } from "../puck/components/LayoutHeader.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import { YextEntityFieldSelector } from "../../components/editor/YextEntityFieldSelector.tsx";
import * as lzstring from "lz-string";

const devLogger = new DevLogger();

type InternalLayoutEditorProps = {
  puckConfig: Config;
  puckInitialHistory: InitialHistory | undefined;
  isLoading: boolean;
  clearHistory: () => void;
  templateMetadata: TemplateMetadata;
  layoutSaveState: LayoutSaveState | undefined;
  saveLayoutSaveState: (data: any) => void;
  publishLayout: (data: any) => void;
  sendDevSaveStateData: (data: any) => void;
  buildVisualConfigLocalStorageKey: () => string;
  localDev: boolean;
};

// Render Puck editor
export const InternalLayoutEditor = ({
  puckConfig,
  puckInitialHistory,
  isLoading,
  clearHistory,
  templateMetadata,
  layoutSaveState,
  saveLayoutSaveState,
  publishLayout,
  sendDevSaveStateData,
  buildVisualConfigLocalStorageKey,
  localDev,
}: InternalLayoutEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state
  const [clearLocalChangesModalOpen, setClearLocalChangesModalOpen] =
    useState<boolean>(false);
  const historyIndex = useRef<number>(0);

  /**
   * When the Puck history changes save it to localStorage and send a message
   * to the parent which saves the state to the VES database.
   */
  const handleHistoryChange = useCallback(
    (histories: History<Partial<AppState>>[], index: number) => {
      if (
        index !== 0 &&
        historyIndex.current !== index &&
        histories.length > 0
      ) {
        devLogger.logFunc("handleHistoryChange");
        devLogger.logData("PUCK_INDEX", index);
        devLogger.logData("PUCK_HISTORY", histories);
        historyIndex.current = index;

        if (localDev || templateMetadata.isDevMode) {
          devLogger.logFunc("saveLayoutToLocalStorage");
          window.localStorage.setItem(
            buildVisualConfigLocalStorageKey(),
            lzstring.compress(JSON.stringify(histories))
          );
          if (localDev) {
            return;
          }
        }

        if (layoutSaveState?.hash !== histories[index].id) {
          if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
            devLogger.logFunc("sendDevSaveStateData");
            sendDevSaveStateData({
              payload: {
                devSaveStateData: JSON.stringify(histories[index].state.data),
              },
            });
          } else {
            devLogger.logFunc("saveLayoutSaveState");
            saveLayoutSaveState({
              payload: {
                hash: histories[index].id,
                history: JSON.stringify(histories[index].state),
              },
            });
          }
        }
      }
    },
    [templateMetadata, buildVisualConfigLocalStorageKey, layoutSaveState]
  );

  const handleClearLocalChanges = () => {
    clearHistory();
    historyIndex.current = 0;
  };

  const handlePublishLayout = async (data: Data) => {
    publishLayout({
      payload: { layoutData: JSON.stringify(data) },
    });
  };

  const change = async () => {
    if (isLoading) {
      return;
    }
    if (!canEdit) {
      setCanEdit(true);
      return;
    }
  };

  const puckConfigWithRootFields = React.useMemo(() => {
    return {
      ...puckConfig,
      root: {
        ...puckConfig.root,
        fields: {
          title: YextEntityFieldSelector<any, string>({
            label: "Title",
            filter: {
              types: ["type.string"],
            },
          }),
          description: YextEntityFieldSelector<any, string>({
            label: "Description",
            filter: {
              types: ["type.string"],
            },
          }),
        },
        defaultProps: {
          title: {
            field: "name",
            constantValue: "",
            constantValueEnabled: false,
          },
          description: {
            field: "description",
            constantValue: "",
            constantValueEnabled: false,
          },
        },
      },
    };
  }, [puckConfig]);

  return (
    <EntityFieldProvider>
      <Puck
        config={puckConfigWithRootFields}
        data={{}} // we use puckInitialHistory instead
        initialHistory={puckInitialHistory}
        onChange={change}
        overrides={{
          header: () => (
            <LayoutHeader
              clearLocalChangesModalOpen={clearLocalChangesModalOpen}
              setClearLocalChangesModalOpen={setClearLocalChangesModalOpen}
              onClearLocalChanges={handleClearLocalChanges}
              onHistoryChange={handleHistoryChange}
              onPublishLayout={handlePublishLayout}
              isDevMode={templateMetadata.isDevMode}
            />
          ),
          iframe: ({ children, document }) => {
            useEffect(() => {
              if (!document) return;

              // Ensure Mapbox script is loaded in the iframe
              if (!document.getElementById("mapbox-script")) {
                const script = document.createElement("script");
                script.id = "mapbox-script";
                script.src =
                  "https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.js";
                document.body.appendChild(script);
              }

              // Ensure Mapbox stylesheet is loaded in the iframe
              if (!document.getElementById("mapbox-stylesheet")) {
                const link = document.createElement("link");
                link.id = "mapbox-stylesheet";
                link.href =
                  "https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.css";
                link.rel = "stylesheet";
                document.body.appendChild(link);
              }
            }, [document]);
            return <>{children}</>;
          },
        }}
        // iframe={{enabled:false}}
      />
    </EntityFieldProvider>
  );
};
