import { useCallback, useEffect, useState } from "react";
import { getThemeValue } from "../utils/getThemeValue.ts";
import { PUCK_PREVIEW_IFRAME_ID } from "../utils/applyTheme.ts";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";

/** Concrete theme values for APIs such as map providers. Prefer CSS variables for styles. */
export const useThemeValue = (
  variableName: string,
  streamDocument?: StreamDocument | Record<string, any>
): string | undefined => {
  return useThemeValueReader(
    useCallback(
      () => getThemeValue(variableName, streamDocument),
      [variableName, streamDocument]
    )
  );
};

/** Internal concrete-value reader; the caller memoizes read to define its dependencies. */
export const useThemeValueReader = <T>(read: () => T): T => {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const update = () => setValue(read());
    update();
    const observers: MutationObserver[] = [];
    const observe = (target: Document) => {
      const observer = new MutationObserver(update);
      observer.observe(target.head, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      observer.observe(target.documentElement, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
      observers.push(observer);
    };
    observe(document);
    const frame = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement | null;
    const observeFrame = () => {
      if (frame?.contentDocument) observe(frame.contentDocument);
      update();
    };
    observeFrame();
    frame?.addEventListener("load", observeFrame);
    return () => {
      observers.forEach((observer) => observer.disconnect());
      frame?.removeEventListener("load", observeFrame);
    };
  }, [read]);
  return value;
};
