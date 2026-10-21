import { createUsePuck, resolveAllData, useGetPuck } from "@puckeditor/core";
import React from "react";
import { useDocument } from "../../hooks/useDocument.tsx";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { LayoutGenerationChatBridge } from "../generation/chat/LayoutGenerationChatBridge.tsx";
import { LayoutGenerationChatUiContext } from "../generation/chat/contexts.tsx";
import { ValidationReporters } from "../puck/components/ValidationReporters.tsx";
import { clonePuckResolveData } from "../utils/clonePuckResolveData.ts";
import { synchronizeManualCardSlots } from "../utils/synchronizeManualCardSlots.ts";

const devLogger = new DevLogger();
const usePuck = createUsePuck();

/** A stable component type keeps the chat bridge mounted on ordinary editor renders. */
export const LayoutPuckOverride = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getPuck = useGetPuck();
  const creating = React.useContext(LayoutGenerationChatUiContext)?.chat
    .isCreating;
  const creatingRef = React.useRef(creating);
  creatingRef.current = creating;
  const observedData = usePuck((puck) => puck.appState.data);
  const document = useDocument();
  const documentRef = React.useRef(document);
  if (!isDeepEqual(documentRef.current, document)) {
    documentRef.current = document;
  }
  const streamDocument = documentRef.current;

  React.useEffect(() => {
    if (creatingRef.current) {
      return;
    }
    const { appState, config, dispatch } = getPuck();
    const data = synchronizeManualCardSlots(appState.data, config);
    if (data !== appState.data) {
      dispatch({ type: "setData", data, recordHistory: false });
    }
  }, [getPuck, observedData]);

  React.useEffect(() => {
    let active = true;
    const resolveData = async () => {
      devLogger.logFunc("reloadDataOnDocumentChange");
      if (creatingRef.current) {
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
        creatingRef.current ||
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
