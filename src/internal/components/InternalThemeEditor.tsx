import { Puck, Config, InitialHistory } from "@measured/puck";
import React, { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityFieldProvider } from "../../components/editor/EntityField.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import ThemeSidebar from "../puck/components/ThemeSidebar.tsx";
import { ThemeConfig, ThemeConfigSection } from "../../utils/themeResolver.ts";
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
  themeHistories?: ThemeHistories;
  setThemeHistories: (themeHistory: ThemeHistories) => void;
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
  themeHistories,
  setThemeHistories,
  clearThemeHistory,
  sendDevThemeSaveStateData,
  buildThemeLocalStorageKey,
}: InternalThemeEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state
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

    publishThemeConfiguration({
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

  const handleThemeChange = (
    themeSectionKey: string,
    themeSection: ThemeConfigSection,
    newValue: Record<string, any>
  ) => {
    if (!themeHistoriesRef.current || !themeConfig) {
      return;
    }

    const newThemeValues = {
      ...themeHistoriesRef.current.histories[themeHistoriesRef.current.index]
        ?.data,
      ...generateCssVariablesFromPuckFields(
        newValue,
        themeSectionKey,
        themeSection
      ),
    };

    const newHistory = {
      histories: [
        ...themeHistoriesRef.current.histories,
        { id: uuidv4(), data: newThemeValues },
      ] as ThemeHistory[],
      index: themeHistoriesRef.current.histories.length,
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

    updateThemeInEditor(newThemeValues, themeConfig);
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
      <ThemeSidebar
        themeHistoriesRef={themeHistoriesRef}
        themeConfig={themeConfig}
        onThemeChange={handleThemeChange}
      />
    );
  }, []);

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
              setThemeHistories={setThemeHistories}
              clearThemeHistory={clearThemeHistory}
              puckInitialHistory={puckInitialHistory}
            />
          ),
          actionBar: () => <></>,
          components: () => <></>,
          fields: fieldsOverride,
        }}
      />
    </EntityFieldProvider>
  );
};
