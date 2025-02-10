import { useEffect, useState } from "react";
import { DevLogger } from "../../../utils/devLogger.ts";
import { ThemeSaveState } from "../../types/themeData.ts";
import { useReceiveMessage, TARGET_ORIGINS } from "../useMessage.ts";
import { useCommonMessageSenders } from "../useMessageSenders.ts";
import { jsonFromEscapedJsonString } from "../../utils/jsonFromEscapedJsonString.ts";

const devLogger = new DevLogger();

export const useThemeMessageReceivers = (localDev: boolean) => {
  const { iFrameLoaded } = useCommonMessageSenders();

  // Trigger additional data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "Theme Editor is loaded" } });
  }, []);

  // Theme from DB
  const [themeSaveState, setThemeSaveState] = useState<
    ThemeSaveState | undefined
  >();
  const [themeSaveStateFetched, setThemeSaveStateFetched] =
    useState<boolean>(localDev); // needed because themeSaveState can be empty

  useReceiveMessage("getThemeSaveState", TARGET_ORIGINS, (send, payload) => {
    let receivedThemeSaveState;
    if (payload?.history) {
      receivedThemeSaveState = {
        hash: payload.hash,
        history: { data: jsonFromEscapedJsonString(payload.history) },
      } as ThemeSaveState;
    }
    devLogger.logData("THEME_SAVE_STATE", receivedThemeSaveState);
    setThemeSaveState(receivedThemeSaveState);
    setThemeSaveStateFetched(true);
    send({
      status: "success",
      payload: { message: "themeSaveState received" },
    });
  });

  return {
    themeSaveState,
    themeSaveStateFetched,
  };
};
