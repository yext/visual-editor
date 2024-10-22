import { Puck, Config, InitialHistory } from "@measured/puck";
import React, { useCallback, useState, useEffect } from "react";
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
  themeInitialHistories?: ThemeHistories;
  setThemeInitialHistories: (themeHistory: ThemeHistories) => void;
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
  themeInitialHistories,
  setThemeInitialHistories,
  clearThemeHistory,
  sendDevThemeSaveStateData,
  buildThemeLocalStorageKey,
}: InternalThemeEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state
  const [themeHistories, setThemeHistories] = useState<
    ThemeHistories | undefined
  >();

  useEffect(() => {
    setThemeHistories(themeInitialHistories);
  }, [themeInitialHistories]);

  // Handles sending the sendDevThemeSaveStateData on initial load so that nothing isn't rendered for preview.
  // Subsequent changes are sent via handleChange in ThemeSidebar.tsx.
  useEffect(() => {
    const themeToSend = themeHistories?.histories[themeHistories.index]?.data;

    devLogger.logFunc("sendDevThemeSaveStateData useEffect");
    sendDevThemeSaveStateData({
      payload: { devThemeSaveStateData: JSON.stringify(themeToSend) },
    });
  }, [themeHistories, templateMetadata]);

  const handlePublishTheme = async () => {
    devLogger.logFunc("saveThemeData");
    if (!themeHistories) {
      return;
    }

    const currentThemeHistory = themeHistories.histories[themeHistories.index];

    publishThemeConfiguration({
      payload: {
        saveThemeData: JSON.stringify(currentThemeHistory.data),
      },
    });

    clearThemeHistory();

    setThemeInitialHistories({
      histories: [currentThemeHistory],
      index: 0,
    });
  };

  const handleThemeChange = (newHistory: ThemeHistories) => {
    if (!themeConfig) {
      return;
    }

    window.localStorage.setItem(
      buildThemeLocalStorageKey(),
      JSON.stringify(newHistory.histories)
    );

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

    updateThemeInEditor(
      newHistory.histories[newHistory.index]?.data,
      themeConfig
    );

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

  const sidebarOverride = useCallback(() => {
    const [internalThemeHistories, setInternalThemeHistories] = useState(
      themeInitialHistories!
    );

    const handleThemeChangeInternal = (topLevelKey: string, newValue: any) => {
      if (!internalThemeHistories || !themeConfig) {
        return;
      }

      const newThemeValues = {
        ...internalThemeHistories.histories[internalThemeHistories.index]?.data,
        ...generateCssVariablesFromPuckFields(newValue, topLevelKey),
      };

      const newHistory = {
        histories: [
          ...internalThemeHistories.histories,
          { id: uuidv4(), data: newThemeValues },
        ] as ThemeHistory[],
        index: internalThemeHistories.histories.length,
      };

      setInternalThemeHistories(newHistory);
      handleThemeChange(newHistory);
    };

    return (
      <ThemeSidebar
        themeConfig={themeConfig}
        themeValues={
          internalThemeHistories.histories[internalThemeHistories.index].data
        }
        onThemeChange={handleThemeChangeInternal}
      />
    );
  }, [themeInitialHistories]);

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
              themeHistories={themeHistories}
              onPublishTheme={handlePublishTheme}
              isDevMode={templateMetadata.isDevMode}
              setThemeInitialHistories={setThemeInitialHistories}
              clearThemeHistory={clearThemeHistory}
              puckInitialHistory={puckInitialHistory}
            />
          ),
          actionBar: () => <></>,
          components: () => <></>,
          fields: sidebarOverride,
        }}
      />
    </EntityFieldProvider>
  );
};
