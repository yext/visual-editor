import {
  Puck,
  Config,
  InitialHistory,
  FieldLabel,
  legacySideBarPlugin,
} from "@puckeditor/core";
import React, { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityTooltipsProvider } from "../../editor/EntityField.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import { ThemeEditorRightSidebar } from "../puck/components/theme-editor-sidebars/ThemeEditorRightSidebar.tsx";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { ThemeHeader } from "../puck/components/ThemeHeader.tsx";
import { updateThemeInEditor } from "../../utils/applyTheme.ts";
import { loadMapboxIntoIframe } from "../utils/loadMapboxIntoIframe.tsx";
import { v4 as uuidv4 } from "uuid";
import { ThemeHistories, ThemeHistory } from "../types/themeData.ts";
import * as lzstring from "lz-string";
import { Metadata } from "../../editor/Editor.tsx";

const devLogger = new DevLogger();
// Used because we want the sidebar to be hidden
const legacySidebar = legacySideBarPlugin();

type InternalThemeEditorProps = {
  puckConfig: Config;
  puckInitialHistory: InitialHistory | undefined;
  isLoading: boolean;
  templateMetadata: TemplateMetadata;
  publishTheme: (data: any) => void;
  themeConfig?: ThemeConfig;
  saveThemeSaveState: (data: any) => void;
  themeHistories?: ThemeHistories;
  setThemeHistories: (themeHistory: ThemeHistories) => void;
  clearThemeHistory: () => void;
  sendDevThemeSaveStateData: (data: any) => void;
  buildThemeLocalStorageKey: () => string;
  localDev: boolean;
  metadata?: Metadata;
};

// Render Puck editor
export const InternalThemeEditor = ({
  puckConfig,
  puckInitialHistory,
  isLoading,
  templateMetadata,
  publishTheme,
  themeConfig,
  saveThemeSaveState,
  themeHistories,
  setThemeHistories,
  clearThemeHistory,
  sendDevThemeSaveStateData,
  buildThemeLocalStorageKey,
  localDev,
  metadata,
}: InternalThemeEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state
  const [clearLocalChangesModalOpen, setClearLocalChangesModalOpen] =
    useState<boolean>(false);

  // Puck remounts the sidebar overrides each render so they have to be
  // wrapped in useCallback to maintain internal state. Refs can be used
  // to pass parent state into the overrides.
  const themeHistoriesRef = useRef(themeHistories);

  useEffect(() => {
    themeHistoriesRef.current = themeHistories;
  }, [themeHistories]);

  const handlePublishTheme = async () => {
    devLogger.logFunc("saveThemeData");
    if (!themeHistories) {
      return;
    }

    const currentThemeHistory = themeHistories.histories[themeHistories.index];

    publishTheme({
      payload: {
        saveThemeData: JSON.stringify(currentThemeHistory.data),
      },
    });

    clearThemeHistory();

    setThemeHistories({
      histories: [currentThemeHistory],
      index: 0,
    });
  };

  const handleThemeChange = (newThemeValues: Record<string, any>) => {
    if (!themeHistoriesRef.current || !themeConfig) {
      return;
    }

    const newHistory = {
      histories: [
        ...themeHistoriesRef.current.histories.slice(
          0,
          themeHistoriesRef.current.index + 1
        ),
        { id: uuidv4(), data: newThemeValues },
      ] as ThemeHistory[],
      index: themeHistoriesRef.current.index + 1,
    };

    if (localDev || templateMetadata.isDevMode) {
      devLogger.logFunc("saveThemeToLocalStorage");
      window.localStorage.setItem(
        buildThemeLocalStorageKey(),
        lzstring.compress(JSON.stringify(newHistory.histories))
      );
      updateThemeInEditor(newThemeValues, themeConfig, true);
      setThemeHistories(newHistory);
      return;
    }

    if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
      devLogger.logFunc("sendDevThemeSaveStateData");
      sendDevThemeSaveStateData({
        payload: {
          devThemeSaveStateData: JSON.stringify(
            newHistory.histories[newHistory.index]?.data
          ),
        },
      });
    } else {
      devLogger.logFunc("saveTheme");
      saveThemeSaveState({
        payload: {
          history: JSON.stringify(newHistory.histories[newHistory.index]?.data),
          hash: newHistory.histories[newHistory.index]?.id,
        },
      });
    }

    updateThemeInEditor(newThemeValues, themeConfig, true);
    setThemeHistories(newHistory);
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

  const fieldsOverride = useCallback(() => {
    return (
      <ThemeEditorRightSidebar
        themeHistoriesRef={themeHistoriesRef}
        themeConfig={themeConfig}
        onThemeChange={handleThemeChange}
      />
    );
  }, []);

  return (
    <EntityTooltipsProvider>
      <Puck
        config={puckConfig}
        data={{}} // we use puckInitialHistory instead
        initialHistory={puckInitialHistory}
        onChange={change}
        permissions={{
          drag: false,
          duplicate: false,
          delete: false,
          insert: false,
          edit: false,
        }}
        plugins={[legacySidebar]}
        overrides={{
          header: () => (
            <ThemeHeader
              themeConfig={themeConfig}
              themeHistories={themeHistories}
              onPublishTheme={handlePublishTheme}
              isDevMode={templateMetadata.isDevMode}
              setThemeHistories={setThemeHistories}
              clearThemeHistory={clearThemeHistory}
              puckInitialHistory={puckInitialHistory}
              clearLocalChangesModalOpen={clearLocalChangesModalOpen}
              setClearLocalChangesModalOpen={setClearLocalChangesModalOpen}
              totalEntityCount={templateMetadata.totalEntityCount}
              localDev={localDev}
            />
          ),
          actionBar: () => <></>,
          drawer: () => <></>,
          fields: fieldsOverride,
          iframe: loadMapboxIntoIframe,
          // oxlint-disable-next-line no-unused-vars removed all icons from all field labels
          fieldLabel: ({ icon, children, ...rest }) => (
            <FieldLabel {...rest}>{children}</FieldLabel>
          ),
        }}
        metadata={metadata}
      />
    </EntityTooltipsProvider>
  );
};
