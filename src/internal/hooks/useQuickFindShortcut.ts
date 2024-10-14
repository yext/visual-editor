import { useEffect } from "react";
import { useMessageSenders } from "./useMessage.ts";

export const useQuickFindShortcut = () => {
  const { openQuickFind } = useMessageSenders();
  const keyboardHandler = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      openQuickFind();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyboardHandler);
    return () => {
      window.removeEventListener("keydown", keyboardHandler);
    };
  }, []);
};
