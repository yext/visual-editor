import { useEffect, useState } from "react";
import { DevLogger } from "../../../utils/devLogger.ts";
import { ThemeSaveState } from "../../types/themeData.ts";
import { jsonFromEscapedJsonString } from "../../utils/jsonFromEscapedJsonString.ts";
import { useReceiveMessage, TARGET_ORIGINS } from "../useMessage.ts";
import { useCommonMessageSenders } from "../useMessageSenders.ts";

const devLogger = new DevLogger();

export const useThemeMessageReceivers = () => {
  const { iFrameLoaded } = useCommonMessageSenders();

  // Trigger additional data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "Theme Editor is loaded" } });
  }, []);

  // Theme from Content
  const [themeData, setThemeData] = useState<any>(); // json data
  const [themeDataFetched, setThemeDataFetched] = useState<boolean>(false); // needed because themeData can be empty

  // Theme from DB
  const [themeSaveState, setThemeSaveState] = useState<
    ThemeSaveState | undefined
  >(undefined);
  const [themeSaveStateFetched, setThemeSaveStateFetched] =
    useState<boolean>(false); // needed because themeSaveState can be empty

  useReceiveMessage("getThemeSaveState", TARGET_ORIGINS, (send, payload) => {
    devLogger.logData("THEME_SAVE_STATE", payload);
    setThemeSaveState(payload as ThemeSaveState);
    setThemeSaveStateFetched(true);
    send({
      status: "success",
      payload: { message: "themeSaveState received" },
    });
  });

  useReceiveMessage("getThemeData", TARGET_ORIGINS, (send, payload) => {
    const themeData = jsonFromEscapedJsonString(payload as unknown as string);
    devLogger.logData("THEME_DATA", themeData);
    setThemeData(themeData);
    setThemeDataFetched(true);
    send({
      status: "success",
      payload: { message: "getThemeData received" },
    });
  });

  return {
    themeData,
    themeDataFetched,
    themeSaveState,
    themeSaveStateFetched,
  };
};
