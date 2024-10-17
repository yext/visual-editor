import { Puck, Config, InitialHistory } from "@measured/puck";
import React, { useCallback, useEffect } from "react";
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
  themeInitialHistory?: ThemeSaveState;
  setThemeInitialHistory: (themeHistory: ThemeSaveState) => void;
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
  themeInitialHistory,
  setThemeInitialHistory,
  clearThemeHistory,
  sendDevThemeSaveStateData,
  buildThemeLocalStorageKey,
}: InternalThemeEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state
  const [themeHistory, setThemeHistory] = useState(themeInitialHistory);

  useEffect(() => {
    setThemeHistory(themeInitialHistory);
  }, [themeInitialHistory]);

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

  const handleThemeChange = (newHistory: ThemeSaveState) => {
    if (!themeConfig) {
      return;
    }

    window.localStorage.setItem(
      buildThemeLocalStorageKey(),
      JSON.stringify(newHistory.history)
    );

    if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
      devLogger.logFunc("sendDevThemeSaveStateData");
      sendDevThemeSaveStateData({
        payload: {
          devThemeSaveStateData: JSON.stringify(
            newHistory.history[newHistory.index]
          ),
        },
      });
    } else {
      devLogger.logFunc("saveTheme");
      saveThemeSaveState({
        payload: {
          history: JSON.stringify(newHistory.history),
          index: newHistory.index,
        },
      });
    }

    updateThemeInEditor(newHistory.history[newHistory.index], themeConfig);
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

  const fieldsOverride = useCallback(() => {
    if (!themeInitialHistory) {
      return <></>;
    }

    const [internalThemeHistory, setInternalThemeHistory] =
      useState(themeInitialHistory);

    const internalHandleThemeChance = (
      topLevelKey: string,
      newValue: Record<string, any>
    ) => {
      if (!internalThemeHistory) {
        return;
      }

      const newThemeValues = {
        ...internalThemeHistory.history[internalThemeHistory.index],
        ...generateCssVariablesFromPuckFields(newValue, topLevelKey),
      };
      const newHistory = {
        history: [...internalThemeHistory.history, newThemeValues],
        index: internalThemeHistory.index + 1,
      };

      setInternalThemeHistory(newHistory);
      handleThemeChange(newHistory);
    };

    return (
      <ThemeSidebar
        themeConfig={themeConfig}
        themeValues={internalThemeHistory.history[internalThemeHistory.index]}
        onThemeChange={internalHandleThemeChance}
      />
    );
  }, [themeInitialHistory]);

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
              setThemeInitialHistory={setThemeInitialHistory}
              clearThemeHistory={clearThemeHistory}
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
