import { useEffect, useState } from "react";
import { AppState, Config } from "@puckeditor/core";
import { DevLogger } from "../../../utils/devLogger.ts";
import { LayoutSaveState } from "../../types/saveState.ts";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
  useSendMessageToParent,
} from "../useMessage.ts";
import { useCommonMessageSenders } from "../useMessageSenders.ts";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";
import { migrate, type MigrationRegistry } from "../../../utils/migrate.ts";
import { resolveCustomSchema } from "../../../utils/schema/resolveCustomSchema.ts";
import { resolveSchemaJson } from "../../../utils/schema/resolveSchema.ts";
import { type StreamDocument } from "../../../utils/types/StreamDocument.ts";
import { resolveUrlTemplate } from "../../../utils/urls/resolveUrlTemplate.ts";

const devLogger = new DevLogger();

const resolveSchemaPageContext = (streamDocument: StreamDocument) => {
  // Schema describes the current page; child URL resolution requires a child profile.
  const path = resolveUrlTemplate(streamDocument, "");

  // Find the relativePrefixToRoot for the page being rendered in the editor.
  const pathComponents = path.split("/");
  pathComponents.pop();
  const relativePrefixToRoot = pathComponents
    .map(() => "../")
    .reduce((previousValue, currentValue) => previousValue + currentValue, "");

  return { path, relativePrefixToRoot };
};

export const useLayoutMessageReceivers = (
  localDev: boolean,
  puckConfig: Config,
  streamDocument: StreamDocument,
  sectionLibraryMigrationRegistry?: MigrationRegistry
) => {
  const { iFrameLoaded } = useCommonMessageSenders();

  // Trigger additional data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "Layout Editor is loaded" } });
  }, []);

  // Layout from DB
  const [layoutSaveState, setLayoutSaveState] = useState<LayoutSaveState>();
  const [layoutSaveStateFetched, setLayoutSaveStateFetched] =
    useState<boolean>(localDev); // needed because saveState can be empty

  useReceiveMessage("getLayoutSaveState", TARGET_ORIGINS, (send, payload) => {
    let receivedLayoutSaveState;
    if (payload?.history) {
      const history = JSON.parse(payload.history) as AppState;
      const migratedHistory = {
        ...history,
        data: migrate(
          puckConfig,
          history.data,
          streamDocument,
          migrationRegistry,
          sectionLibraryMigrationRegistry
        ),
      };

      receivedLayoutSaveState = {
        hash: payload.hash,
        history: migratedHistory,
      } as LayoutSaveState;
    }
    devLogger.logData("LAYOUT_SAVE_STATE", receivedLayoutSaveState);

    if (layoutSaveState?.hash !== receivedLayoutSaveState?.hash) {
      setLayoutSaveState(receivedLayoutSaveState);
    }

    setLayoutSaveStateFetched(true);
    send({
      status: "success",
      payload: { message: "layoutSaveState received" },
    });
  });

  const { sendToParent: sendResolvedSchemaToParent } = useSendMessageToParent(
    "resolveSchema",
    TARGET_ORIGINS
  );

  useReceiveMessage("resolveSchema", TARGET_ORIGINS, (_, payload) => {
    const schema = payload?.schema;

    const { path, relativePrefixToRoot } =
      resolveSchemaPageContext(streamDocument);

    const resolvedSchema = resolveSchemaJson(
      {
        document: streamDocument,
        path,
        relativePrefixToRoot,
      },
      schema
    );

    sendResolvedSchemaToParent({ payload: { schema: resolvedSchema } });
  });

  useReceiveMessage(
    "resolveCustomSchema",
    TARGET_ORIGINS,
    (respond, payload) => {
      if (
        typeof payload?.requestId !== "string" ||
        typeof payload?.template !== "string"
      ) {
        return;
      }
      const { requestId, template } = payload;
      if (template === "") {
        respond({ status: "success", payload: { requestId, output: "" } });
        return;
      }
      try {
        const { path, relativePrefixToRoot } =
          resolveSchemaPageContext(streamDocument);
        const result = resolveCustomSchema(template, {
          document: streamDocument,
          path,
          relativePrefixToRoot,
        });
        respond({
          status: result.error ? "error" : "success",
          payload: { requestId, ...result },
        });
      } catch (error) {
        respond({
          status: "error",
          payload: {
            requestId,
            output: "",
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }
  );

  return {
    layoutSaveState,
    layoutSaveStateFetched,
    setLayoutSaveState,
  };
};
