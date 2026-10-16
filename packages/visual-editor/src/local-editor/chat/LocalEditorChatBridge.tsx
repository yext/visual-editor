import { changedChatPaths } from "./chatDiagnostics.ts";
import {
  isLinkedSource,
  manualBackup,
} from "../../internal/generation/slottedItemSource.ts";
import React from "react";
import {
  resolveAllData,
  useGetPuck,
  createUsePuck,
  type Data,
} from "@puckeditor/core";
import { clonePuckResolveData } from "../../internal/utils/clonePuckResolveData.ts";
import { buildPuckHistoryState } from "../../internal/utils/buildPuckHistoryState.ts";
import { createPuckGenerationCatalog } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";
import {
  assertAuthoredPreserved,
  buildEditInventory,
  validateAuthored,
  walkAuthored,
  extractAuthored,
} from "../../internal/generation/authored.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../../internal/generation/editMaterializer.ts";
import type { StreamDocument } from "../../utils/types/StreamDocument.ts";
import type { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";
import { LocalEditorChatContext } from "./LocalEditorChatContext.tsx";

/** This component is mounted inside the existing editor's Puck provider. */
export const LocalEditorChatBridge = ({
  streamDocument,
}: {
  streamDocument: StreamDocument;
}) => {
  const canvas = React.useContext(LocalEditorChatContext);
  return canvas ? (
    <LocalEditorChatCanvasBridge
      canvas={canvas}
      streamDocument={streamDocument}
    />
  ) : null;
};

const useDiagnosticPuck = createUsePuck();

const LocalEditorChatCanvasBridge = ({
  canvas,
  streamDocument,
}: {
  canvas: LocalEditorChatCanvas;
  streamDocument: StreamDocument;
}) => {
  const getPuck = useGetPuck();
  const observedData = useDiagnosticPuck((puck) => puck.appState.data);
  React.useEffect(() => canvas.observe(observedData), [canvas, observedData]);
  React.useEffect(
    () =>
      canvas.attach({
        inspect: (data) => {
          const catalog = createPuckGenerationCatalog(
            getPuck().config.components
          );
          const manualSlotDifferences: {
            componentId: string;
            type: string;
            paths: string[];
          }[] = [];
          try {
            walkAuthored(catalog, data as any, ({ component }) => {
              if (
                !catalog.data.components[component.type]?.generation
                  ?.slottedItemSource ||
                isLinkedSource(component.props)
              ) {
                return;
              }
              const paths = changedChatPaths(
                extractAuthored(catalog, { content: manualBackup(component) }),
                extractAuthored(catalog, {
                  content: component.props.slots.CardSlot,
                })
              );
              if (paths.length) {
                manualSlotDifferences.push({
                  componentId: component.props.id,
                  type: component.type,
                  paths,
                });
              }
            });
            validateAuthored(catalog, data as any);
            return { validationError: null, manualSlotDifferences };
          } catch (error) {
            return {
              validationError:
                error instanceof Error ? error.message : String(error),
              manualSlotDifferences,
            };
          }
        },
        read: () => clonePuckResolveData(getPuck().appState.data),
        readSelection: () => getPuck().selectedItem?.props.id ?? null,
        readSectionLabels: () => {
          const puck = getPuck();
          const inventory = buildEditInventory(
            createPuckGenerationCatalog(puck.config.components),
            puck.appState.data as any
          );
          return Object.fromEntries(
            inventory.components
              .filter((item) => item.componentId === item.sectionId)
              .map((item, index) => [
                item.componentId,
                `Section ${index + 1} · ${puck.config.components[item.type]?.label ?? item.type}`,
              ])
          );
        },
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
                        if (cause instanceof Error) {
                          error.stack += `\nCaused by: ${cause.stack}`;
                        }
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
        materializeSection: (baseline, task, result) => {
          const puck = getPuck();
          const catalog = createPuckGenerationCatalog(puck.config.components);
          return materializeSectionEdit(catalog, baseline, task, result, {
            can: (permission, component) =>
              puck.getPermissions(
                component ? { item: component as any } : { root: true }
              )[permission] !== false,
          });
        },
        preserveSectionResolution: (resolved, candidate) =>
          preserveSectionEditResolution(
            createPuckGenerationCatalog(getPuck().config.components),
            resolved,
            candidate
          ),
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
