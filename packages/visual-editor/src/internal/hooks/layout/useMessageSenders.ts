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

  const { sendToParent: sendLayoutForApproval } = useSendMessageToParent(
    "sendLayoutForApproval",
    TARGET_ORIGINS
  );

  const { sendToParent: publishLayout } = useSendMessageToParent(
    "publishLayout",
    TARGET_ORIGINS
  );

  return {
    saveLayoutSaveState,
    deleteLayoutSaveState,
    sendLayoutForApproval,
    publishLayout,
  };
};
