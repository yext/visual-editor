import * as React from "react";
import { PUCK_PREVIEW_IFRAME_ID } from "../utils/applyTheme.ts";

/** Internal override for renders in a separate preview frame. */
export const PreviewWindowContext = React.createContext<Window | null>(null);

/**
 * Returns the preview iframe's window when available, otherwise the main window.
 * Safe to use on live pages without the preview iframe.
 */
export const usePreviewWindow = (): Window | null => {
  const scopedWindow = React.useContext(PreviewWindowContext);
  const [previewWindow, setPreviewWindow] = React.useState<Window | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }

      return window;
    }
  );

  React.useEffect(() => {
    if (scopedWindow) return;
    if (typeof window === "undefined") {
      return;
    }

    const iframe = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement | null;
    const resolvedWindow = iframe?.contentWindow ?? window;
    setPreviewWindow(resolvedWindow);

    if (!iframe) {
      return;
    }

    // Keep in sync if the iframe loads after initial render.
    const handleLoad = () => {
      setPreviewWindow(iframe.contentWindow ?? window);
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [scopedWindow]);

  return scopedWindow ?? previewWindow;
};
