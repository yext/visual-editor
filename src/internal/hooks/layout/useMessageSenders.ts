import { TARGET_ORIGINS, useSendMessageToParent } from "../useMessage.ts";

export const useLayoutMessageSenders = () => {
  const { sendToParent: saveLayoutSaveState } = useSendMessageToParent(
    "saveLayoutSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: deleteLayoutSaveState } = useSendMessageToParent(
    "deleteLayoutSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: publishLayoutConfiguration } = useSendMessageToParent(
    "publishLayoutConfiguration",
    TARGET_ORIGINS
  );

  return {
    saveLayoutSaveState,
    deleteLayoutSaveState,
    publishLayoutConfiguration,
  };
};
