import React from "react";
import { resolveAllData, useGetPuck, type Data } from "@puckeditor/core";
import { clonePuckResolveData } from "../../internal/utils/clonePuckResolveData.ts";
import { buildPuckHistoryState } from "../../internal/utils/buildPuckHistoryState.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import type { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";
import { LocalEditorChatContext } from "./LocalEditorChatContext.tsx";

/** This component is mounted inside the existing editor's Puck provider. */
export const LocalEditorChatBridge = () => {
  const canvas = React.useContext(LocalEditorChatContext);
  return canvas ? <LocalEditorChatCanvasBridge canvas={canvas} /> : null;
};

const LocalEditorChatCanvasBridge = ({
  canvas,
}: {
  canvas: LocalEditorChatCanvas;
}) => {
  const getPuck = useGetPuck();
  const streamDocument = useDocument();
  React.useEffect(
    () =>
      canvas.attach({
        read: () => clonePuckResolveData(getPuck().appState.data),
        resolve: (data) =>
          resolveAllData(clonePuckResolveData(data), getPuck().config, {
            streamDocument,
          }),
        replace: (data) => {
          const { dispatch } = getPuck();
          dispatch({
            type: "setUi",
            ui: { itemSelector: null },
            recordHistory: false,
          });
          dispatch({
            type: "setData",
            data: { ...data, zones: data.zones ?? {} },
            recordHistory: false,
          });
        },
        commit: (data: Data, baseline: Data) => {
          const { history, appState } = getPuck();
          const histories = history.histories.slice(0, history.index + 1);
          // Preserve the exact starting data even if the last manual edit was still debouncing.
          histories[history.index] = {
            ...histories[history.index],
            state: buildPuckHistoryState(baseline, appState.ui),
          };
          history.setHistories([
            ...histories,
            {
              id: `history-${crypto.randomUUID()}`,
              state: buildPuckHistoryState(
                { ...data, zones: data.zones ?? {} },
                { ...appState.ui, itemSelector: null }
              ),
            },
          ]);
        },
      }),
    [canvas, getPuck, streamDocument]
  );
  return null;
};
