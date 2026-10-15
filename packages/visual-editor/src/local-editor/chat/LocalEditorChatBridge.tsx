import { isDeepEqual } from "../../utils/deepEqual.ts";
import React from "react";
import { resolveAllData, useGetPuck, type Data } from "@puckeditor/core";
import { clonePuckResolveData } from "../../internal/utils/clonePuckResolveData.ts";
import { buildPuckHistoryState } from "../../internal/utils/buildPuckHistoryState.ts";
import { createPuckGenerationCatalog } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";
import { assertAuthoredPreserved } from "../../internal/generation/authored.ts";
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
  const document = useDocument();
  const documentRef = React.useRef(document);
  if (!isDeepEqual(documentRef.current, document))
    documentRef.current = document;
  const streamDocument = documentRef.current;
  React.useEffect(
    () =>
      canvas.attach({
        read: () => clonePuckResolveData(getPuck().appState.data),
        resolve: (data) => {
          const config = getPuck().config;
          const components = Object.fromEntries(
            Object.entries(config.components).map(([type, component]) => [
              type,
              {
                ...component,
                resolveData: component.resolveData
                  ? async (
                      ...args: Parameters<
                        NonNullable<typeof component.resolveData>
                      >
                    ) => {
                      try {
                        return await component.resolveData!(...args);
                      } catch (cause) {
                        const error = new Error(
                          `${type} (${args[0].props.id}) resolveData failed: ${
                            cause instanceof Error
                              ? cause.message
                              : String(cause)
                          }`
                        );
                        if (cause instanceof Error)
                          error.stack += `\nCaused by: ${cause.stack}`;
                        throw error;
                      }
                    }
                  : undefined,
              },
            ])
          );
          return resolveAllData(
            clonePuckResolveData(data),
            { ...config, components },
            {
              streamDocument,
            }
          );
        },
        validate: (data, candidate) => {
          const catalog = createPuckGenerationCatalog(
            getPuck().config.components
          );
          assertAuthoredPreserved(catalog, data as any, candidate as any);
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
