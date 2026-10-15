import React from "react";
import { resolveAllData, useGetPuck } from "@puckeditor/core";
import { LocalEditorChatBridge } from "../../local-editor/chat/LocalEditorChatBridge.tsx";
import { ValidationReporters } from "../puck/components/ValidationReporters.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { clonePuckResolveData } from "../utils/clonePuckResolveData.ts";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import { DevLogger } from "../../utils/devLogger.ts";

const devLogger = new DevLogger();

/** A stable component type keeps the chat bridge mounted on ordinary editor renders. */
export const LayoutPuckOverride = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getPuck = useGetPuck();
  const document = useDocument();
  const documentRef = React.useRef(document);
  if (!isDeepEqual(documentRef.current, document))
    documentRef.current = document;
  const streamDocument = documentRef.current;

  React.useEffect(() => {
    let active = true;
    const resolveData = async () => {
      devLogger.logFunc("reloadDataOnDocumentChange");
      const { appState, config, dispatch } = getPuck();
      const resolvedData = await resolveAllData(
        clonePuckResolveData(appState.data),
        config,
        { streamDocument }
      );
      if (!active || getPuck().appState.data !== appState.data) return;
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
      <LocalEditorChatBridge streamDocument={streamDocument} />
      {children}
    </>
  );
};
