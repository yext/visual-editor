import { PUCK_PREVIEW_IFRAME_ID } from "../../utils/applyTheme.ts";

/**
 * Installs link-navigation blocking in a specific preview document while
 * preserving hover and focus behavior.
 *
 * @param previewDocument - The iframe document that renders theme preview content.
 * @returns A cleanup function that restores original link attributes and removes listeners/observers.
 */
export const createPreviewDocumentLinkBlocker = (previewDocument: Document) => {
  const previewWindow = previewDocument.defaultView;

  /**
   * Returns true when the event target is an anchor/area element or lives within
   * an element that semantically acts like a link.
   */
  const isLinkLikeTarget = (event: Event) => {
    const targetElement = event.target;
    if (!(targetElement instanceof Element)) {
      return false;
    }

    return !!targetElement.closest("a, area, [role='link']");
  };

  /**
   * Cancels navigation-triggering events for link-like targets.
   * Keyboard events are only blocked for activation keys.
   */
  const preventLinkNavigation = (event: Event) => {
    if (!isLinkLikeTarget(event)) {
      return;
    }

    if (event instanceof KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  /**
   * Removes href/target from links so the browser cannot navigate by default.
   * Original values are stored in data attributes for later restoration.
   */
  const disableAnchorNavigationAttributes = () => {
    previewDocument.querySelectorAll("a[href], area[href]").forEach((el) => {
      if (!el.hasAttribute("data-ve-original-href")) {
        el.setAttribute("data-ve-original-href", el.getAttribute("href") ?? "");
      }

      el.removeAttribute("href");

      if (el.hasAttribute("target")) {
        el.setAttribute(
          "data-ve-original-target",
          el.getAttribute("target") ?? ""
        );
        el.removeAttribute("target");
      }
    });
  };

  disableAnchorNavigationAttributes();
  const anchorObserver = new MutationObserver(() => {
    disableAnchorNavigationAttributes();
  });
  anchorObserver.observe(previewDocument.documentElement, {
    childList: true,
    subtree: true,
  });

  const eventTypes = [
    "click",
    "auxclick",
    "mousedown",
    "mouseup",
    "pointerdown",
    "pointerup",
    "touchstart",
    "keydown",
  ] as const;

  eventTypes.forEach((eventType) => {
    previewDocument.addEventListener(eventType, preventLinkNavigation, true);
    previewWindow?.addEventListener(eventType, preventLinkNavigation, true);
  });

  return () => {
    anchorObserver.disconnect();

    previewDocument
      .querySelectorAll("a[data-ve-original-href], area[data-ve-original-href]")
      .forEach((el) => {
        const originalHref = el.getAttribute("data-ve-original-href");
        if (originalHref !== null) {
          el.setAttribute("href", originalHref);
        }
        el.removeAttribute("data-ve-original-href");

        if (el.hasAttribute("data-ve-original-target")) {
          const originalTarget = el.getAttribute("data-ve-original-target");
          if (originalTarget !== null) {
            el.setAttribute("target", originalTarget);
          }
          el.removeAttribute("data-ve-original-target");
        }
      });

    eventTypes.forEach((eventType) => {
      previewDocument.removeEventListener(
        eventType,
        preventLinkNavigation,
        true
      );
      previewWindow?.removeEventListener(
        eventType,
        preventLinkNavigation,
        true
      );
    });
  };
};

/**
 * Watches the preview iframe lifecycle and applies link-navigation blocking
 * to whichever preview document is currently active.
 *
 * @returns A cleanup function that detaches iframe observers and listeners.
 */
export const createPreviewFrameLinkBlocker = () => {
  let detachLinkNavigationBlock: (() => void) | undefined;
  let activeFrame: HTMLIFrameElement | null = null;

  /**
   * Rebinds document-level blockers when the iframe loads a new document.
   */
  const onPreviewFrameLoad = () => {
    detachLinkNavigationBlock?.();
    if (activeFrame?.contentDocument) {
      detachLinkNavigationBlock = createPreviewDocumentLinkBlocker(
        activeFrame.contentDocument
      );
    }
  };

  /**
   * Attaches blocker behavior to a new iframe element and detaches from any
   * previously tracked iframe.
   */
  const attachToPreviewFrame = (frame: HTMLIFrameElement) => {
    if (activeFrame === frame) {
      return;
    }

    activeFrame?.removeEventListener("load", onPreviewFrameLoad);
    detachLinkNavigationBlock?.();

    activeFrame = frame;
    activeFrame.addEventListener("load", onPreviewFrameLoad);
    if (activeFrame.contentDocument) {
      detachLinkNavigationBlock = createPreviewDocumentLinkBlocker(
        activeFrame.contentDocument
      );
    }
  };

  /**
   * Locates the preview iframe and ensures blocker behavior is attached.
   */
  const syncPreviewFrame = () => {
    const previewFrame = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement | null;
    if (!previewFrame) {
      return;
    }

    attachToPreviewFrame(previewFrame);
  };

  const iframeObserver = new MutationObserver(syncPreviewFrame);
  iframeObserver.observe(document, {
    childList: true,
    subtree: true,
  });

  syncPreviewFrame();

  return () => {
    iframeObserver.disconnect();
    activeFrame?.removeEventListener("load", onPreviewFrameLoad);
    detachLinkNavigationBlock?.();
    activeFrame = null;
  };
};
