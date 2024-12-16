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
    "publishThemeConfiguration",
    TARGET_ORIGINS
  );

  return {
    saveThemeSaveState,
    deleteThemeSaveState,
    publishThemeConfiguration,
  };
};
