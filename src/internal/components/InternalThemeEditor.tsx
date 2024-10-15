import { Puck, Config, InitialHistory } from "@measured/puck";
import React from "react";
import { useState } from "react";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityFieldProvider } from "../../components/EntityField.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import ThemeSidebar from "../puck/components/ThemeSidebar.tsx";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { ThemeSaveState } from "../types/themeSaveState.ts";
import { ThemeHeader } from "../puck/components/ThemeHeader.tsx";
import { generateCssVariablesFromPuckFields } from "../utils/internalThemeResolver.ts";
import { updateThemeInEditor } from "../../utils/applyTheme.ts";

const devLogger = new DevLogger();

type InternalThemeEditorProps = {
  puckConfig: Config;
  puckInitialHistory: InitialHistory | undefined;
  isLoading: boolean;
  templateMetadata: TemplateMetadata;
  publishThemeConfiguration: (data: any) => void;
  themeConfig?: ThemeConfig;
  saveThemeSaveState: (data: any) => void;
  themeHistory?: ThemeSaveState;
  setThemeHistory: (themeHistory: ThemeSaveState) => void;
  clearThemeHistory: () => void;
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
}: InternalThemeEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state

  const handlePublishTheme = async () => {
    devLogger.logFunc("saveThemeData");
    publishThemeConfiguration({
      payload: {
        saveThemeData: JSON.stringify(
          themeHistory?.history[themeHistory?.index]
        ),
      },
    });
  };

  const handleThemeChange = (topLevelKey: string, newValue: any) => {
    if (!themeHistory || !themeConfig) {
      return;
    }

    const newThemeValues = {
      ...themeHistory.history[themeHistory.index],
      ...generateCssVariablesFromPuckFields(newValue, topLevelKey),
    };

    const newHistory = {
      history: [...themeHistory.history, newThemeValues],
      index: themeHistory.index + 1,
    };

    if (!templateMetadata.isDevMode) {
      saveThemeSaveState({
        payload: {
          history: JSON.stringify(newHistory.history),
          index: newHistory.index,
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
              handlePublishTheme={handlePublishTheme}
              isDevMode={templateMetadata.isDevMode}
              setThemeHistory={setThemeHistory}
              clearThemeHistory={clearThemeHistory}
            />
          ),
          actionBar: () => <></>,
          components: () => <></>,
          fields: () => (
            <ThemeSidebar
              themeConfig={themeConfig}
              themeHistory={themeHistory!}
              handleThemeChange={handleThemeChange}
            />
          ),
        }}
      />
    </EntityFieldProvider>
  );
};
