import { TARGET_ORIGINS, useSendMessageToParent } from "../useMessage.ts";

export const useLayoutMessageSenders = () => {
  const { sendToParent: saveLayoutSaveState } = useSendMessageToParent(
    "saveSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: deleteLayoutSaveState } = useSendMessageToParent(
    "deleteSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: publishVisualConfiguration } = useSendMessageToParent(
    "saveVisualConfigData",
    TARGET_ORIGINS
  );

  return {
    saveLayoutSaveState,
    deleteLayoutSaveState,
    publishVisualConfiguration,
  };
};
