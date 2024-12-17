import "./index.css";
import React, { useEffect, useState } from "react";
import { LoadingScreen } from "../../internal/puck/components/LoadingScreen.tsx";
import { Toaster } from "../../internal/puck/ui/Toaster.tsx";
import { type Config } from "@measured/puck";
import "@measured/puck/puck.css";
import { DevLogger } from "../../utils/devLogger.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { useQuickFindShortcut } from "../../internal/hooks/useQuickFindShortcut.ts";
import { useCommonMessageReceivers } from "../../internal/hooks/useMessageReceivers.ts";
import { LayoutEditor } from "../../internal/components/LayoutEditor.tsx";
import { ThemeEditor } from "../../internal/components/ThemeEditor.tsx";
import { useCommonMessageSenders } from "../../internal/hooks/useMessageSenders.ts";

const devLogger = new DevLogger();

export type EditorProps = {
  document: any;
  componentRegistry: Map<string, Config<any>>;
  themeConfig?: ThemeConfig;
};

export const Editor = ({
  document,
  componentRegistry,
  themeConfig,
}: EditorProps) => {
  if (document) {
    devLogger.logData("DOCUMENT", document);
  }

  const [devPageSets, setDevPageSets] = useState<any>(undefined);
  const [devSiteStream, setDevSiteStream] = useState<any>(undefined);
  const [parentLoaded, setParentLoaded] = useState<boolean>(false);

  const {
    templateMetadata,
    puckConfig,
    layoutData,
    layoutDataFetched,
    themeData,
    themeDataFetched,
  } = useCommonMessageReceivers(componentRegistry);

  const { pushPageSets } = useCommonMessageSenders();

  useQuickFindShortcut();

  // redirect to 404 page when going to /edit page outside of Storm
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ancestors = window.location.ancestorOrigins;
      if (ancestors.length === 0) {
        window.location.assign("/404.html");
      } else if (
        !ancestors[0].includes("pagescdn") &&
        !ancestors[0].includes("yext.com") &&
        !ancestors[0].includes("localhost")
      ) {
        window.location.assign("/404.html");
      } else {
        setParentLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
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

  const isLoading =
    !puckConfig ||
    !templateMetadata ||
    !document ||
    !layoutDataFetched ||
    !themeDataFetched;

  const progress: number =
    60 * // @ts-expect-error adding bools is fine
    ((!!puckConfig +
      !!templateMetadata +
      !!document +
      layoutDataFetched +
      themeDataFetched) /
      5);

  return (
    <>
      {!isLoading ? (
        templateMetadata.isThemeMode ? (
          <ThemeEditor
            puckConfig={puckConfig}
            templateMetadata={templateMetadata}
            layoutData={layoutData!}
            themeData={themeData!}
            themeConfig={themeConfig}
          />
        ) : (
          <LayoutEditor
            puckConfig={puckConfig}
            templateMetadata={templateMetadata}
            layoutData={layoutData!}
            themeData={themeData!}
            themeConfig={themeConfig}
          />
        )
      ) : (
        parentLoaded && <LoadingScreen progress={progress} />
      )}
      <Toaster closeButton richColors />
    </>
  );
};
