import { TARGET_ORIGINS, useSendMessageToParent } from "./useMessage.ts";

export const useCommonMessageSenders = () => {
  const { sendToParent: iFrameLoaded } = useSendMessageToParent(
    "iFrameLoaded",
    TARGET_ORIGINS
  );

  const { sendToParent: pushPageSets } = useSendMessageToParent(
    "pushPageSets",
    TARGET_ORIGINS
  );

  const { sendToParent: openQuickFind } = useSendMessageToParent(
    "openQuickFind",
    TARGET_ORIGINS
  );

  const { sendToParent: sendDevLayoutSaveStateData } = useSendMessageToParent(
    "sendDevSaveStateData",
    TARGET_ORIGINS
  );

  const { sendToParent: sendDevThemeSaveStateData } = useSendMessageToParent(
    "sendDevThemeSaveStateData",
    TARGET_ORIGINS
  );

  return {
    iFrameLoaded,
    pushPageSets,
    openQuickFind,
    sendDevLayoutSaveStateData,
    sendDevThemeSaveStateData,
  };
};
