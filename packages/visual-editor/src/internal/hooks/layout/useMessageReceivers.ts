import { useEffect, useState } from "react";
import { AppState, Config } from "@measured/puck";
import { DevLogger } from "../../../utils/devLogger.ts";
import { LayoutSaveState } from "../../types/saveState.ts";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
  useSendMessageToParent,
} from "../useMessage.ts";
import { useCommonMessageSenders } from "../useMessageSenders.ts";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";
import { migrate } from "../../../utils/migrate.ts";
import { resolveSchemaJson } from "../../../utils/schema/resolveSchema.ts";
import {
  resolvePageSetUrlTemplate,
  resolveUrlTemplateOfChild,
} from "../../../utils/resolveUrlTemplate.ts";
import { type StreamDocument } from "../../../utils/applyTheme.ts";

const devLogger = new DevLogger();

export const useLayoutMessageReceivers = (
  localDev: boolean,
  puckConfig: Config,
  streamDocument: StreamDocument
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
        data: migrate(history.data, migrationRegistry, puckConfig),
      };

      receivedLayoutSaveState = {
        hash: payload.hash,
        history: migratedHistory,
      } as LayoutSaveState;
    }
    devLogger.logData("LAYOUT_SAVE_STATE", receivedLayoutSaveState);
    setLayoutSaveState(receivedLayoutSaveState);
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

    // Resolve the url path
    let path = "";
    if (
      streamDocument?.meta?.entityType?.id === "locator" ||
      streamDocument?.meta?.entityType?.id?.startsWith("dm_")
    ) {
      path = resolveUrlTemplateOfChild(streamDocument, "");
    } else {
      path = resolvePageSetUrlTemplate(streamDocument, "");
    }

    const resolvedSchema = resolveSchemaJson(
      {
        ...streamDocument,
        path,
        // siteDomain only includes the production domain, so add a fallback for placeholder domains
        siteDomain: streamDocument.siteDomain || "<siteDomain>",
      },
      schema
    );

    sendResolvedSchemaToParent({ payload: { schema: resolvedSchema } });
  });

  return {
    layoutSaveState,
    layoutSaveStateFetched,
  };
};
