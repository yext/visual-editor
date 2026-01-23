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
import { type StreamDocument } from "../../../utils/types/StreamDocument.ts";
import {
  resolveUrlTemplate,
  resolveUrlTemplateOfChild,
} from "../../../utils/urls/resolveUrlTemplate.ts";

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
        data: migrate(
          history.data,
          migrationRegistry,
          puckConfig,
          streamDocument
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

    // Resolve the url path
    let path = "";
    if (
      streamDocument?.meta?.entityType?.id === "locator" ||
      streamDocument?.meta?.entityType?.id?.startsWith("dm_")
    ) {
      path = resolveUrlTemplateOfChild({}, streamDocument, "");
    } else {
      path = resolveUrlTemplate(streamDocument, "");
    }

    // Find the relativePrefixToRoot for the page being rendered in the editor
    const pathComponents = path.split("/");
    pathComponents.pop();
    const relativePrefixToRoot = pathComponents
      .map(() => "../")
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        ""
      );

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

  return {
    layoutSaveState,
    layoutSaveStateFetched,
    setLayoutSaveState,
  };
};
