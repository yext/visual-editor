import { TARGET_ORIGINS, useSendMessageToParent } from "../useMessage.ts";

export const useThemeMessageSenders = () => {
  const { sendToParent: saveThemeSaveState } = useSendMessageToParent(
    "saveThemeSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: deleteThemeSaveState } = useSendMessageToParent(
    "deleteThemeSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: publishThemeConfiguration } = useSendMessageToParent(
    "saveThemeData",
    TARGET_ORIGINS
  );

  const { sendToParent: sendDevThemeSaveStateData } = useSendMessageToParent(
    "sendDevThemeSaveStateData",
    TARGET_ORIGINS
  );

  return {
    saveThemeSaveState,
    deleteThemeSaveState,
    publishThemeConfiguration,
    sendDevThemeSaveStateData,
  };
};
