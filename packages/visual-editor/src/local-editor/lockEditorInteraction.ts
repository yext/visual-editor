const scrollKeys = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);
const blockedEvents = [
  "pointerdown",
  "pointerup",
  "mousedown",
  "mouseup",
  "click",
  "dblclick",
  "dragstart",
  "dragenter",
  "dragover",
  "drop",
  "compositionstart",
  "compositionupdate",
  "compositionend",
  "beforeinput",
  "input",
  "change",
  "paste",
  "cut",
  "submit",
  "contextmenu",
  "wheel",
  "touchstart",
  "touchend",
  "keypress",
  "keyup",
];

/** Block editor mutations in the page and Puck's iframe while allowing scrolling. */
export const lockEditorInteraction = (frame: HTMLElement) => {
  const cleanups: (() => void)[] = [];
  const documents = new Set<Document>();
  const install = (doc: Document, embedded: boolean) => {
    if (documents.has(doc) || !doc.defaultView) {
      return;
    }
    documents.add(doc);
    const view = doc.defaultView;
    const inside = (event: Event) =>
      embedded ||
      (!!event.target &&
        "nodeType" in event.target &&
        frame.contains(event.target as Node));
    const stop = (event: Event) => {
      if (!inside(event)) {
        return;
      }
      // Preserve native panning while blocking editor gesture handlers.
      const nativePan =
        event.type === "wheel" ||
        event.type.startsWith("touch") ||
        (event.type.startsWith("pointer") &&
          (event as PointerEvent).pointerType === "touch");
      const target = event.target as HTMLElement;
      const pointer = event as MouseEvent;
      const rect = target.getBoundingClientRect?.();
      // Scrollbar gutters use the browser's default pointer behavior.
      const pointerEvent =
        event.type.startsWith("mouse") || event.type.startsWith("pointer");
      const style =
        rect && pointerEvent ? view.getComputedStyle(target) : undefined;
      const scrollbar =
        style &&
        rect &&
        ((/auto|scroll/.test(style.overflowY) &&
          target.offsetWidth > target.clientWidth &&
          pointer.clientX >=
            rect.left + target.clientLeft + target.clientWidth) ||
          (/auto|scroll/.test(style.overflowX) &&
            target.offsetHeight > target.clientHeight &&
            pointer.clientY >=
              rect.top + target.clientTop + target.clientHeight));
      if (event.type === "wheel") {
        const focused = doc.activeElement as HTMLElement | null;
        if (focused?.matches("input, textarea, select, [contenteditable]")) {
          focused.blur();
        }
      }
      if (!nativePan && !scrollbar) {
        event.preventDefault();
      }
      event.stopImmediatePropagation();
    };
    const keydown = (event: KeyboardEvent) => {
      const history =
        (event.ctrlKey || event.metaKey) &&
        ["z", "y"].includes(event.key.toLowerCase());
      if (history) {
        event.preventDefault();
        event.stopImmediatePropagation();
      } else if (inside(event)) {
        const target = event.target as HTMLElement;
        const editable = target.closest?.(
          "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='spinbutton'], [role='slider']"
        );
        const scroll =
          scrollKeys.has(event.key) &&
          !editable &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey;
        if (event.key !== "Tab" && !scroll) {
          event.preventDefault();
        }
        // Keep editor shortcuts from seeing even navigation keys.
        event.stopImmediatePropagation();
      }
    };
    blockedEvents.forEach((type) =>
      view.addEventListener(type, stop, { capture: true, passive: false })
    );
    view.addEventListener("keydown", keydown, true);
    cleanups.push(() => {
      blockedEvents.forEach((type) =>
        view.removeEventListener(type, stop, true)
      );
      view.removeEventListener("keydown", keydown, true);
    });
  };
  const scan = () => {
    frame.querySelectorAll("iframe").forEach((iframe) => {
      try {
        if (iframe.contentDocument) {
          install(iframe.contentDocument, true);
        }
      } catch {
        // Cross-origin embeds cannot dispatch editor mutations in this page.
      }
    });
  };
  install(frame.ownerDocument, false);
  scan();
  frame.addEventListener("load", scan, true);
  const observer = new MutationObserver(scan);
  observer.observe(frame, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    frame.removeEventListener("load", scan, true);
    cleanups.forEach((cleanup) => cleanup());
  };
};
