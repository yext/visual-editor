import { useEffect, useState } from "react";
import { DevLogger } from "../../../utils/devLogger.ts";
import { LayoutSaveState } from "../../types/saveState.ts";
import { useReceiveMessage, TARGET_ORIGINS } from "../useMessage.ts";
import { useCommonMessageSenders } from "../useMessageSenders.ts";

const devLogger = new DevLogger();

export const useLayoutMessageReceivers = (localDev: boolean) => {
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
      receivedLayoutSaveState = {
        hash: payload.hash,
        history: JSON.parse(payload.history),
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
