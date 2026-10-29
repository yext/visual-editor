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
import { applyRegenerationStep } from "../workflows/fullPageRegeneration/applyRegenerationStep.ts";
import { buildEditInventory } from "../workflows/edits/buildEditInventory.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../workflows/edits/applyEditsToLayout.ts";
import {
  assertAuthoredPreserved,
  extractAuthored,
  validateAuthored,
  walkAuthored,
} from "../shared/authoredValues.ts";
import { getGenerationCatalog } from "../shared/catalogRegistry.ts";
import { isLinkedSource, manualBackup } from "../shared/slottedItemSource.ts";
import type { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { GenerationSectionOverlays } from "./GenerationSectionOverlay.tsx";
import { changedChatPaths } from "./chatDiagnostics.ts";
import {
  IntentPageGenerationContext,
  IntentPageGenerationChatContext,
} from "./useIntentPageGeneration.ts";
import { layoutGenerationChatPluginName } from "./LayoutGenerationChatPlugin.tsx";
import { LayoutGenerationChatContext } from "./contexts.tsx";
import { validateInitialChatLayout } from "./initialChatValidation.ts";
import {
  createPreviewSectionFollower,
  reusePreviewData,
} from "./previewScroll.ts";

/** This component is mounted inside the existing editor's Puck provider, giving us access to Puck's internal state. */
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
  const intent = React.useContext(IntentPageGenerationContext);
  const intentChat = React.useContext(IntentPageGenerationChatContext);

  React.useEffect(() => {
    if (!intentChat?.eligible || intentChat.status !== "PENDING") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || !intentChat.workflow.openAssistantOnce()) return;
      getPuck().dispatch({
        type: "setUi",
        ui: {
          plugin: { current: layoutGenerationChatPluginName },
          leftSideBarVisible: true,
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [getPuck, intentChat]);

  const follower = React.useMemo(
    () => createPreviewSectionFollower(window.document),
    [canvas, getPuck, streamDocument, intent]
  );

  const observedData = useDiagnosticPuck((puck) => puck.appState.data);
  React.useEffect(() => canvas.observe(observedData), [canvas, observedData]);

  React.useEffect(
    () =>
      canvas.attach({
        beginPresentation: () => follower.stop(),
        prepareSection: async (sectionId, signal) => {
          canvas.buildingSection(sectionId);
          await follower.followSection(sectionId, signal);
        },
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
        readComponentLabel: (type) =>
          getPuck().config.components[type]?.label ?? type,
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
          canvas.buildingSections(getPuck().appState.data, data);
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
        materializeRegeneration: (baseline, step) => {
          const puck = getPuck();
          return applyRegenerationStep(
            canvas.catalog ?? getGenerationCatalog(puck.config),
            baseline,
            step,
            (permission, component) =>
              puck.getPermissions(
                component ? { item: component as any } : { root: true }
              )[permission] !== false
          );
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
        preview: (data, options) => {
          const before = getPuck().appState.data;
          if (options?.follow !== false) follower.follow(before, data);
          getPuck().dispatch({
            type: "setData",
            data: (previous) => reusePreviewData(previous, data),
            recordHistory: false,
          });
          canvas.readySections(before, data);
        },
        commit: (data: Data, baseline: Data) => {
          const { history, appState } = getPuck();
          follower.follow(appState.data, data);
          const histories = history.histories.slice(0, history.index + 1);
          // Preserve the exact starting data even if the last manual edit was still debouncing.
          histories[history.index] = {
            ...histories[history.index],
            state: buildPuckHistoryState(baseline, appState.ui),
          };
          const entry = {
            id: `history-${crypto.randomUUID()}`,
            state: buildPuckHistoryState(
              { ...data, zones: data.zones ?? {} },
              { ...appState.ui, itemSelector: null }
            ),
          };
          intent?.captureDraft({
            hash: entry.id,
            history: JSON.stringify({
              data: entry.state.data,
              ui: entry.state.ui,
            }),
          });
          history.setHistories([...histories, entry]);
          canvas.readySections(appState.data, data);
        },
      }),
    [canvas, getPuck, streamDocument, intent, follower]
  );
  // Detaching the canvas can finalize a preview; cancel its pending scroll too.
  React.useEffect(() => () => follower.stop(), [follower]);
  return <GenerationSectionOverlays canvas={canvas} />;
};
