import "./index.css";
import React, { ErrorInfo, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingScreen } from "../internal/puck/components/LoadingScreen.tsx";
import { Toaster } from "../internal/puck/ui/Toaster.tsx";
import { type Config, type Data } from "@puckeditor/core";
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
import {
  i18nPlatformInstance,
  loadPlatformTranslations,
} from "../utils/i18n/platform.ts";
import { StreamDocument } from "../utils/types/StreamDocument.ts";
import {
  createDefaultThemeConfig,
  defaultThemeConfig,
} from "../components/DefaultThemeConfig.ts";
import {
  defaultFonts,
  loadFontsIntoDOM,
} from "../utils/fonts/visualEditorFonts.ts";
import { migrate } from "../utils/migrate.ts";
import { migrationRegistry } from "../components/migrations/migrationRegistry.ts";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";
import { processTemplateLayoutData } from "../utils/defaultLayoutTranslations.ts";

const devLogger = new DevLogger();

// For hybrid development use of existing components
// see hybrid-development.md for more details
export interface Metadata {
  // The environment variable that stores the content endpoint ID
  contentEndpointIdEnvVar?: string;
  // The environment variable that stores the entity type
  entityTypeEnvVar?: string;
  // The environment variable that stores the experience key
  experienceKeyEnvVar?: string;
  // The custom function to resolve the url template (aka path)
  resolveUrlTemplate?: (
    streamDocument: StreamDocument,
    locale: string,
    relativePrefixToRoot: string
  ) => string;
  // The stream document for the current page
  streamDocument?: StreamDocument;
}

declare module "@puckeditor/core" {
  export interface PuckMetadata extends Metadata {}
}

export type EditorProps = {
  document: any;
  componentRegistry: Record<string, Config<any>>;
  themeConfig?: ThemeConfig;
  // localDev is used for running VE outside of the platform
  localDev?: boolean;
  // forceThemeMode is used with localDev to load the theme editor
  forceThemeMode?: boolean;
  metadata?: Metadata; // passed into puck's global metadata
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
  } = useCommonMessageReceivers(componentRegistry, !!localDev, document);

  const { pushPageSets, sendError } = useCommonMessageSenders();

  useQuickFindShortcut();

  const logError = (error: Error, info: ErrorInfo) => {
    sendError({
      payload: { error, info, type: "editor" },
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

  // Loads all Google and custom fonts in the theme editor for the font dropdown
  useEffect(() => {
    if (typeof window !== "undefined" && templateMetadata?.isThemeMode) {
      loadFontsIntoDOM(
        window.document,
        defaultFonts,
        templateMetadata?.customFonts ?? {},
        "visual-editor-default-fonts"
      );
    }
  }, [templateMetadata?.customFonts, templateMetadata?.isThemeMode]);

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
    let isCurrent = true;

    const handlePlatformLocaleChange = async () => {
      if (templateMetadata?.platformLocale) {
        const expectedLocale = templateMetadata.platformLocale;
        try {
          await loadPlatformTranslations(expectedLocale);
          // Additional check to avoid race conditions when locale changes quickly
          if (
            isCurrent &&
            templateMetadata?.platformLocale === expectedLocale
          ) {
            i18nPlatformInstance.changeLanguage(expectedLocale);
          }
        } catch (error) {
          console.error("Failed to load platform translations:", error);
        }
      }
    };

    handlePlatformLocaleChange();

    return () => {
      isCurrent = false;
    };
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

  let finalThemeConfig = themeConfig;
  // If themeConfig is the default and there are custom fonts, create a new default theme config with the custom fonts.
  // In the case of a hybrid developer with a custom themeConfig, we cannot adjust their themeConfig to have custom fonts.
  // The hybrid developer must provide a themeConfig that includes their custom fonts if they want to use them.
  if (themeConfig === defaultThemeConfig && templateMetadata?.customFonts) {
    finalThemeConfig = createDefaultThemeConfig(templateMetadata?.customFonts);
  }

  const [processedLayoutData, setProcessedLayoutData] = useState<Data>();
  const [processedLayoutReady, setProcessedLayoutReady] =
    useState<boolean>(false);
  const templateId = templateMetadata?.templateId ?? "";

  useEffect(() => {
    if (isLoading || !layoutData || !puckConfig || !templateId) {
      setProcessedLayoutData(undefined);
      setProcessedLayoutReady(false);
      return;
    }

    let isCurrent = true;
    setProcessedLayoutReady(false);

    const buildProcessedLayout = async () => {
      try {
        const resolvedLayoutData = await processTemplateLayoutData({
          layoutData,
          streamDocument: document,
          templateId,
          buildProcessedLayout: () =>
            migrate(layoutData, migrationRegistry, puckConfig, document),
        });

        if (!isCurrent) {
          return;
        }

        setProcessedLayoutData(resolvedLayoutData);
        setProcessedLayoutReady(true);
      } catch (error) {
        console.error("Failed to process template layout data:", error);
        if (isCurrent) {
          setProcessedLayoutData(undefined);
          setProcessedLayoutReady(false);
        }
      }
    };

    buildProcessedLayout();

    return () => {
      isCurrent = false;
    };
  }, [isLoading, layoutData, puckConfig, templateId]);

  const editorReady = !isLoading && processedLayoutReady;
  const shouldShowLoading = localDev || parentLoaded;

  return (
    <ErrorProvider>
      <TemplateMetadataContext.Provider value={templateMetadata!}>
        <ErrorBoundary fallback={<></>} onError={logError}>
          {editorReady ? (
            templateMetadata?.isThemeMode || forceThemeMode ? (
              <ThemeEditor
                puckConfig={puckConfig!}
                templateMetadata={templateMetadata!}
                layoutData={processedLayoutData!}
                themeData={themeData!}
                themeConfig={finalThemeConfig}
                localDev={!!localDev}
                metadata={{ ...metadata, streamDocument: document }}
              />
            ) : (
              <LayoutEditor
                puckConfig={puckConfig!}
                templateMetadata={templateMetadata!}
                layoutData={processedLayoutData!}
                themeData={themeData!}
                themeConfig={finalThemeConfig}
                localDev={!!localDev}
                metadata={{ ...metadata, streamDocument: document }}
                streamDocument={document}
              />
            )
          ) : (
            shouldShowLoading && (
              <LoadingScreen
                progress={progress}
                platformLanguageIsSet={!!templateMetadata?.platformLocale}
              />
            )
          )}
          <Toaster closeButton richColors />
        </ErrorBoundary>
      </TemplateMetadataContext.Provider>
    </ErrorProvider>
  );
};
