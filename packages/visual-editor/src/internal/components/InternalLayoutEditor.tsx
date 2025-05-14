import {
  Puck,
  Data,
  Config,
  type History,
  InitialHistory,
  AppState,
} from "@measured/puck";
import React from "react";
import { useState, useRef, useCallback } from "react";
import { ApprovalModal } from "./modals/ApprovalModal.tsx";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityTooltipsProvider } from "../../editor/EntityField.tsx";
import { LayoutSaveState } from "../types/saveState.ts";
import { LayoutHeader } from "../puck/components/LayoutHeader.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import { YextEntityFieldSelector } from "../../editor/YextEntityFieldSelector.tsx";
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
  sendForApproval: (data: any) => void;
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
  sendForApproval,
  sendDevSaveStateData,
  buildVisualConfigLocalStorageKey,
  localDev,
}: InternalLayoutEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state
  const [clearLocalChangesModalOpen, setClearLocalChangesModalOpen] =
    useState<boolean>(false);
  const historyIndex = useRef<number>(0);
  const [approvalModalOpen, setApprovalModalOpen] =
    React.useState<boolean>(true);
  const [approvalModalData, setApprovalModalData] = React.useState<Data>();

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

  const handleSendForApproval = async ({
    data,
    comment,
  }: {
    data: Data;
    comment: string;
  }) => {
    setApprovalModalOpen(false);
    sendForApproval({
      payload: {
        layoutData: JSON.stringify(data),
        comment: comment,
      },
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
    <>
      <ApprovalModal
        open={approvalModalOpen}
        onOpenChange={setApprovalModalOpen}
        onSend={async (comment: string) => {
          if (!approvalModalData) {
            throw new Error("Cannot submit undefined data for approval");
          }
          await handleSendForApproval({
            data: approvalModalData,
            comment: comment,
          });
        }}
      />
      <EntityTooltipsProvider>
        <Puck
          config={puckConfigWithRootFields}
          data={{}} // we use puckInitialHistory instead
          initialHistory={puckInitialHistory}
          onChange={change}
          overrides={{
            header: () => (
              <LayoutHeader
                templateMetadata={templateMetadata}
                clearLocalChangesModalOpen={clearLocalChangesModalOpen}
                setClearLocalChangesModalOpen={setClearLocalChangesModalOpen}
                onClearLocalChanges={handleClearLocalChanges}
                onHistoryChange={handleHistoryChange}
                onPublishLayout={handlePublishLayout}
                openApprovalModal={(data: Data) => {
                  setApprovalModalOpen(true);
                  setApprovalModalData(data);
                }}
                isDevMode={templateMetadata.isDevMode}
              />
            ),
          }}
        />
      </EntityTooltipsProvider>
    </>
  );
};
