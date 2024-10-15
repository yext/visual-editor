import { useEffect } from "react";
import { useMessageSenders } from "./useMessage.ts";

/**
 * useQuickFindShortcut listens for keydown events and sends a
 * message to open quick time when cmd/ctrl + k is pressed,
 * mimicking the behavior of storm.
 */
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
