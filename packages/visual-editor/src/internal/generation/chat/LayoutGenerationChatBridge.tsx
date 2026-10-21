import {
  createUsePuck,
  resolveAllData,
  useGetPuck,
  type Data,
} from "@puckeditor/core";
import React from "react";
import type { StreamDocument } from "../../../utils/types/StreamDocument.ts";
import { buildPuckHistoryState } from "../../utils/buildPuckHistoryState.ts";
import { clonePuckResolveData } from "../../utils/clonePuckResolveData.ts";
import { buildEditInventory } from "../edits/buildEditInventory.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../edits/applyEditsToLayout.ts";
import {
  assertAuthoredPreserved,
  extractAuthored,
  validateAuthored,
  walkAuthored,
} from "../shared/authoredValues.ts";
import { getGenerationCatalog } from "../shared/catalogRegistry.ts";
import { isLinkedSource, manualBackup } from "../shared/slottedItemSource.ts";
import type { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { changedChatPaths } from "./chatDiagnostics.ts";
import { LayoutGenerationChatContext } from "./contexts.tsx";
import { validateInitialChatLayout } from "./initialChatValidation.ts";
import {
  preservePreviewScroll,
  reusePreviewData,
} from "./preservePreviewScroll.ts";

/** This component is mounted inside the existing editor's Puck provider. */
export const LayoutGenerationChatBridge = ({
  streamDocument,
}: {
  streamDocument: StreamDocument;
}) => {
  const canvas = React.useContext(LayoutGenerationChatContext);
  return canvas ? (
    <LayoutGenerationChatCanvasBridge
      canvas={canvas}
      streamDocument={streamDocument}
    />
  ) : null;
};

const useDiagnosticPuck = createUsePuck();

const LayoutGenerationChatCanvasBridge = ({
  canvas,
  streamDocument,
}: {
  canvas: LayoutGenerationChatCanvas;
  streamDocument: StreamDocument;
}) => {
  const getPuck = useGetPuck();
  const releaseScroll = React.useRef<(() => void) | undefined>(undefined);
  React.useEffect(() => () => releaseScroll.current?.(), []);
  const observedData = useDiagnosticPuck((puck) => puck.appState.data);
  React.useEffect(() => canvas.observe(observedData), [canvas, observedData]);
  React.useEffect(
    () =>
      canvas.attach({
        inspect: (data) => {
          const catalog =
            canvas.catalog ?? getGenerationCatalog(getPuck().config);
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
        validateInitial: (data) => {
          const { config } = getPuck();
          validateInitialChatLayout(
            canvas.catalog ?? getGenerationCatalog(config),
            data as any,
            (type) => config.components[type]?.label ?? type
          );
        },
        readSelection: () => getPuck().selectedItem?.props.id ?? null,
        readSectionLabels: () => {
          const puck = getPuck();
          const inventory = buildEditInventory(
            canvas.catalog ?? getGenerationCatalog(puck.config),
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
          const catalog =
            canvas.catalog ?? getGenerationCatalog(getPuck().config);
          assertAuthoredPreserved(catalog, data as any, candidate as any);
        },
        materializeSection: (baseline, task, result) => {
          const puck = getPuck();
          const catalog = canvas.catalog ?? getGenerationCatalog(puck.config);
          return materializeSectionEdit(catalog, baseline, task, result, {
            can: (permission, component) =>
              puck.getPermissions(
                component ? { item: component as any } : { root: true }
              )[permission] !== false,
          });
        },
        preserveSectionResolution: (resolved, candidate) =>
          preserveSectionEditResolution(
            canvas.catalog ?? getGenerationCatalog(getPuck().config),
            resolved,
            candidate
          ),
        preview: (data) => {
          releaseScroll.current?.();
          releaseScroll.current = preservePreviewScroll(window.document);
          getPuck().dispatch({
            type: "setData",
            data: (previous) => reusePreviewData(previous, data),
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
