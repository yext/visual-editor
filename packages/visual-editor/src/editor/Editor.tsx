import "./index.css";
import React, { ErrorInfo, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingScreen } from "../internal/puck/components/LoadingScreen.tsx";
import { Toaster } from "../internal/puck/ui/Toaster.tsx";
import { type Config } from "@measured/puck";
import "@measured/puck/puck.css";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { DevLogger } from "../utils/devLogger.ts";
import { ThemeConfig } from "../utils/themeResolver.ts";
import { useQuickFindShortcut } from "../internal/hooks/useQuickFindShortcut.ts";
import {
  useCommonMessageReceivers,
  TemplateMetadataContext,
} from "../internal/hooks/useMessageReceivers.ts";
import { LayoutEditor } from "../internal/components/LayoutEditor.tsx";
import { ThemeEditor } from "../internal/components/ThemeEditor.tsx";
import { useCommonMessageSenders } from "../internal/hooks/useMessageSenders.ts";
import { useProgress } from "../internal/hooks/useProgress.ts";
import { i18nPlatformInstance } from "../utils/i18n/platform.ts";

const devLogger = new DevLogger();

// For hybrid developement use of existing components
// See hybrid-development.md for more details
export interface metadata {
  // The environment variable that stores the content endpoint ID
  contentEndpointIdEnvVar?: string;
  // The environment variable that stores the entity type
  entityTypeEnvVar?: string;
  // The environment variable that stores the experience key
  experienceKeyEnvVar?: string;
}

export type EditorProps = {
  document: any;
  componentRegistry: Map<string, Config<any>>;
  themeConfig?: ThemeConfig;
  // localDev is used for running VE outside of the platform
  localDev?: boolean;
  // forceThemeMode is used with localDev to load the theme editor
  forceThemeMode?: boolean;
  metadata?: metadata; // passed into puck's global metadata
};

export const Editor = ({
  document,
  componentRegistry,
  themeConfig,
  localDev,
  forceThemeMode,
  metadata,
}: EditorProps) => {
  if (document) {
    devLogger.logData("DOCUMENT", document);
  }

  const [devPageSets, setDevPageSets] = useState<any>(undefined);
  const [devSiteStream, setDevSiteStream] = useState<any>(undefined);
  const [parentLoaded, setParentLoaded] = useState<boolean>(false);
  const entityFields = useEntityFields();

  const {
    templateMetadata,
    puckConfig,
    layoutData,
    layoutDataFetched,
    themeData,
    themeDataFetched,
  } = useCommonMessageReceivers(componentRegistry, !!localDev);

  const { pushPageSets, sendError } = useCommonMessageSenders();

  useQuickFindShortcut();

  const logError = (error: Error, info: ErrorInfo) => {
    sendError({
      payload: { error, info },
    });
  };

  // redirect to 404 page when going to /edit outside of iframe
  useEffect(() => {
    if (typeof window !== "undefined" && !localDev) {
      if (window.parent !== window.self) {
        setParentLoaded(true);
      } else {
        window.location.assign("/404.html");
      }
    }
  }, []);

  useEffect(() => {
    // templateMetadata.isDevMode indicates in-platform dev mode
    if (templateMetadata?.isDevMode) {
      try {
        // @ts-expect-error pageSets is a global variable set by pagesJS
        setDevPageSets(pageSets);
        // @ts-expect-error siteStream is a global variable set by pagesJS
        setDevSiteStream(siteStream);
        // eslint-disable-next-line
      } catch (ignored) {
        console.warn("pageSets are not defined");
      }
    }
  }, [templateMetadata?.isDevMode]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      templateMetadata?.isDevMode &&
      devPageSets
    ) {
      pushPageSets({
        payload: { ...devPageSets, siteStream: devSiteStream },
      });
    }
  }, [templateMetadata?.isDevMode, devPageSets]);

  useEffect(() => {
    if (templateMetadata?.platformLocale) {
      i18nPlatformInstance.changeLanguage(templateMetadata?.platformLocale);
    }
  }, [templateMetadata?.platformLocale]);

  const { isLoading, progress } = useProgress({
    maxProgress: 60,
    completionCriteria: [
      !!puckConfig,
      !!templateMetadata,
      !!document,
      layoutDataFetched,
      themeDataFetched,
      entityFields !== null,
    ],
  });

  return (
    <TemplateMetadataContext.Provider value={templateMetadata!}>
      <ErrorBoundary fallback={<></>} onError={logError}>
        {!isLoading ? (
          templateMetadata?.isThemeMode || forceThemeMode ? (
            <ThemeEditor
              puckConfig={puckConfig!}
              templateMetadata={templateMetadata!}
              layoutData={layoutData!}
              themeData={themeData!}
              themeConfig={themeConfig}
              localDev={!!localDev}
              metadata={metadata}
            />
          ) : (
            <LayoutEditor
              puckConfig={puckConfig!}
              templateMetadata={templateMetadata!}
              layoutData={layoutData!}
              themeData={themeData!}
              themeConfig={themeConfig}
              localDev={!!localDev}
              metadata={metadata}
            />
          )
        ) : (
          parentLoaded && (
            <LoadingScreen
              progress={progress}
              platformLanguageIsSet={!!templateMetadata?.platformLocale}
            />
          )
        )}
        <Toaster closeButton richColors />
      </ErrorBoundary>
    </TemplateMetadataContext.Provider>
  );
};
