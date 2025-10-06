import { useEffect, useState } from "react";
import { AppState, Config } from "@measured/puck";
import { DevLogger } from "../../../utils/devLogger.ts";
import { LayoutSaveState } from "../../types/saveState.ts";
import { useReceiveMessage, TARGET_ORIGINS } from "../useMessage.ts";
import { useCommonMessageSenders } from "../useMessageSenders.ts";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";
import { migrate } from "../../../utils/migrate.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";

const devLogger = new DevLogger();

export const useLayoutMessageReceivers = (
  localDev: boolean,
  puckConfig: Config
) => {
  const { iFrameLoaded } = useCommonMessageSenders();
  const { streamDocument } = useDocument();

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
    setLayoutSaveState(receivedLayoutSaveState);
    setLayoutSaveStateFetched(true);
    send({
      status: "success",
      payload: { message: "layoutSaveState received" },
    });
  });

  return {
    layoutSaveState,
    layoutSaveStateFetched,
  };
};
