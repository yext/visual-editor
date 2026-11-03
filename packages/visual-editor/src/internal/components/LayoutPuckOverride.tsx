import { createUsePuck, resolveAllData, useGetPuck } from "@puckeditor/core";
import React from "react";
import { useDocument } from "../../hooks/useDocument.tsx";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { LayoutGenerationChatBridge } from "../layoutGeneration/chat/LayoutGenerationChatBridge.tsx";
import { LayoutGenerationChatUiContext } from "../layoutGeneration/chat/contexts.tsx";
import { synchronizeManualCardSlots } from "../layoutGeneration/shared/synchronizeManualCardSlots.ts";
import { ValidationReporters } from "../puck/components/ValidationReporters.tsx";
import { clonePuckResolveData } from "../utils/clonePuckResolveData.ts";

const devLogger = new DevLogger();
const usePuck = createUsePuck();

/** Wrap the Puck editor in a chat bridge that remains mounted on ordinary editor renders. */
export const LayoutPuckOverride = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getPuck = useGetPuck();
  const puckData = usePuck((puck) => puck.appState.data);
  const document = useDocument();

  const isGenerationActive = React.useContext(LayoutGenerationChatUiContext)
    ?.chat.isGeneratingPage;
  const isGenerationActiveRef = React.useRef(isGenerationActive);
  isGenerationActiveRef.current = isGenerationActive;

  const documentRef = React.useRef(document);
  if (!isDeepEqual(documentRef.current, document)) {
    documentRef.current = document;
  }
  const streamDocument = documentRef.current;

  React.useEffect(() => {
    if (isGenerationActiveRef.current) {
      return;
    }
    const { appState, config, dispatch } = getPuck();
    const data = synchronizeManualCardSlots(appState.data, config);
    if (data !== appState.data) {
      dispatch({ type: "setData", data, recordHistory: false });
    }
  }, [getPuck, puckData]);

  React.useEffect(() => {
    let active = true;
    const resolveData = async () => {
      devLogger.logFunc("reloadDataOnDocumentChange");
      if (isGenerationActiveRef.current) {
        return;
      }
      const { appState, config, dispatch } = getPuck();
      const resolvedData = await resolveAllData(
        clonePuckResolveData(appState.data),
        config,
        { streamDocument }
      );
      if (
        !active ||
        isGenerationActiveRef.current ||
        getPuck().appState.data !== appState.data
      ) {
        return;
      }
      devLogger.logData("RESOLVED_LAYOUT_DATA", resolvedData);
      if (isDeepEqual(appState.data, resolvedData)) {
        devLogger.log(
          "reloadDataOnDocumentChange - no layout changes detected"
        );
        return;
      }
      dispatch({ type: "setData", data: resolvedData });
    };
    void resolveData();
    return () => {
      active = false;
    };
  }, [getPuck, streamDocument]);

  return (
    <>
      <ValidationReporters />
      <LayoutGenerationChatBridge streamDocument={streamDocument} />
      {children}
    </>
  );
};
