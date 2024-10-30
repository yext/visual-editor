import { useEffect, useState } from "react";
import { DevLogger } from "../../../utils/devLogger.ts";
import { LayoutSaveState } from "../../types/saveState.ts";
import { useReceiveMessage, TARGET_ORIGINS } from "../useMessage.ts";
import { useCommonMessageSenders } from "../useMessageSenders.ts";
import { jsonFromEscapedJsonString } from "../../utils/jsonFromEscapedJsonString.ts";

const devLogger = new DevLogger();

export const useLayoutMessageReceivers = () => {
  const { iFrameLoaded } = useCommonMessageSenders();

  // Trigger additional data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "Layout Editor is loaded" } });
  }, []);

  // Layout from DB
  const [layoutSaveState, setLayoutSaveState] = useState<LayoutSaveState>();
  const [layoutSaveStateFetched, setLayoutSaveStateFetched] =
    useState<boolean>(false); // needed because saveState can be empty

  useReceiveMessage("getSaveState", TARGET_ORIGINS, (send, payload) => {
    let layoutSaveState;
    if (payload) {
      layoutSaveState = {
        ...payload,
        history: jsonFromEscapedJsonString(payload.history),
      } as LayoutSaveState;
    }
    devLogger.logData("SAVE_STATE", layoutSaveState);
    setLayoutSaveState(layoutSaveState);
    setLayoutSaveStateFetched(true);
    send({ status: "success", payload: { message: "saveState received" } });
  });

  return {
    layoutSaveState,
    layoutSaveStateFetched,
  };
};
