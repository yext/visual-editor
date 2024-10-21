import { Puck, Config, InitialHistory } from "@measured/puck";
import React from "react";
import { useState } from "react";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityFieldProvider } from "../../components/EntityField.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import ThemeSidebar from "../puck/components/ThemeSidebar.tsx";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { ThemeHeader } from "../puck/components/ThemeHeader.tsx";
import { generateCssVariablesFromPuckFields } from "../utils/internalThemeResolver.ts";
import { updateThemeInEditor } from "../../utils/applyTheme.ts";
import { v4 as uuidv4 } from "uuid";
import { ThemeHistories, ThemeHistory } from "../types/themeData.ts";

const devLogger = new DevLogger();

type InternalThemeEditorProps = {
  puckConfig: Config;
  puckInitialHistory: InitialHistory | undefined;
  isLoading: boolean;
  templateMetadata: TemplateMetadata;
  publishThemeConfiguration: (data: any) => void;
  themeConfig?: ThemeConfig;
  saveThemeSaveState: (data: any) => void;
  themeHistory?: ThemeHistories;
  setThemeHistory: (themeHistory: ThemeHistories) => void;
  clearThemeHistory: () => void;
  sendDevThemeSaveStateData: (data: any) => void;
  buildThemeLocalStorageKey: () => string;
};

// Render Puck editor
export const InternalThemeEditor = ({
  puckConfig,
  puckInitialHistory,
  isLoading,
  templateMetadata,
  publishThemeConfiguration,
  themeConfig,
  saveThemeSaveState,
  themeHistory,
  setThemeHistory,
  clearThemeHistory,
  sendDevThemeSaveStateData,
  buildThemeLocalStorageKey,
}: InternalThemeEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state

  const handlePublishTheme = async () => {
    devLogger.logFunc("saveThemeData");
    publishThemeConfiguration({
      payload: {
        saveThemeData: JSON.stringify(
          themeHistory?.histories?.[themeHistory.index]?.state?.data
        ),
      },
    });
  };

  const handleThemeChange = (topLevelKey: string, newValue: any) => {
    if (!themeHistory || !themeConfig) {
      return;
    }

    const newThemeValues = {
      ...themeHistory.histories[themeHistory.index]?.state?.data,
      ...generateCssVariablesFromPuckFields(newValue, topLevelKey),
    };

    const newHistory = {
      histories: [
        ...themeHistory.histories,
        { id: uuidv4(), state: { data: newThemeValues } },
      ] as ThemeHistory[],
      index: themeHistory.histories.length,
    };

    window.localStorage.setItem(
      buildThemeLocalStorageKey(),
      JSON.stringify(newHistory.histories)
    );

    if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
      devLogger.logFunc("sendDevThemeSaveStateData");
      sendDevThemeSaveStateData({
        payload: {
          devThemeSaveStateData: JSON.stringify(
            newHistory.histories[newHistory.index]?.state?.data
          ),
        },
      });
    } else {
      devLogger.logFunc("saveTheme");
      saveThemeSaveState({
        payload: {
          history: JSON.stringify(
            newHistory.histories[newHistory.index]?.state?.data
          ),
          hash: newHistory.histories[newHistory.index]?.id,
        },
      });
    }

    updateThemeInEditor(newThemeValues, themeConfig);
    setThemeHistory(newHistory);
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

  return (
    <EntityFieldProvider>
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
        overrides={{
          header: () => (
            <ThemeHeader
              themeConfig={themeConfig}
              themeHistory={themeHistory}
              onPublishTheme={handlePublishTheme}
              isDevMode={templateMetadata.isDevMode}
              setThemeHistory={setThemeHistory}
              clearThemeHistory={clearThemeHistory}
              puckInitialHistory={puckInitialHistory}
            />
          ),
          actionBar: () => <></>,
          components: () => <></>,
          fields: () => (
            <ThemeSidebar
              themeConfig={themeConfig}
              themeHistory={themeHistory!.histories}
              onThemeChange={handleThemeChange}
            />
          ),
        }}
      />
    </EntityFieldProvider>
  );
};
