import { isPlainObject } from "../../utils/isPlainObject.ts";

/** Anchor the visible preview content across a section reveal and late media
 * layout. Stop correcting as soon as the user pans, navigates, or scrolls. */
export const preservePreviewScroll = (doc: Document): (() => void) => {
  const documents = [doc];
  doc.querySelectorAll("iframe").forEach((frame) => {
    try {
      if (frame.contentDocument) documents.push(frame.contentDocument);
    } catch {
      /* External embed. */
    }
  });
  const cleanups: (() => void)[] = [];
  for (const document of documents) {
    const view = document.defaultView;
    if (!view) continue;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-puck-component]")
    );
    const anchor = elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.height > 0 && rect.bottom > 0 && rect.top < view.innerHeight
        );
      })
      .sort(
        (a, b) =>
          Math.abs(a.getBoundingClientRect().top) -
          Math.abs(b.getBoundingClientRect().top)
      )[0];
    if (!anchor) continue;
    let scroll = anchor.parentElement;
    while (scroll && scroll.scrollHeight <= scroll.clientHeight)
      scroll = scroll.parentElement;
    scroll ??= document.scrollingElement as HTMLElement | null;
    if (!scroll) continue;
    const top = anchor.getBoundingClientRect().top;
    let expectedScroll = scroll.scrollTop;
    let active = true;
    let frame = 0;
    const stop = () => {
      active = false;
    };
    const correct = () => {
      if (!active || !anchor.isConnected) return;
      // Browser anchoring or a programmatic/user scroll already moved the viewport.
      if (scroll.scrollTop !== expectedScroll) {
        stop();
        return;
      }
      const displacement = anchor.getBoundingClientRect().top - top;
      if (Math.abs(displacement) > 1) {
        scroll.scrollTop += displacement;
        expectedScroll = scroll.scrollTop;
      }
    };
    const schedule = () => {
      view.cancelAnimationFrame(frame);
      frame = view.requestAnimationFrame(correct);
    };
    const observer = view.ResizeObserver
      ? new view.ResizeObserver(schedule)
      : undefined;
    if (document.body) observer?.observe(document.body);
    for (
      let parent = anchor.parentElement;
      parent;
      parent = parent.parentElement
    )
      observer?.observe(parent);
    ["wheel", "touchstart", "pointerdown", "keydown"].forEach((type) =>
      view.addEventListener(type, stop, true)
    );
    schedule();
    cleanups.push(() => {
      stop();
      observer?.disconnect();
      view.cancelAnimationFrame(frame);
      ["wheel", "touchstart", "pointerdown", "keydown"].forEach((type) =>
        view.removeEventListener(type, stop, true)
      );
    });
  }
  return () => cleanups.forEach((cleanup) => cleanup());
};

/** Retain references for unchanged subtrees instead of replacing earlier sections. */
export const reusePreviewData = <T>(previous: T, next: T): T => {
  if (Object.is(previous, next)) return previous;
  if (
    (!Array.isArray(previous) && !isPlainObject(previous)) ||
    (!Array.isArray(next) && !isPlainObject(next)) ||
    Array.isArray(previous) !== Array.isArray(next)
  )
    return next;
  const before = previous as Record<string, unknown>;
  const after = next as Record<string, unknown>;
  const keys = Object.keys(after);
  let unchanged = keys.length === Object.keys(before).length;
  const result: any = Array.isArray(next) ? [] : {};
  for (const key of keys) {
    result[key] = reusePreviewData(before[key], after[key]);
    unchanged &&= Object.hasOwn(before, key) && result[key] === before[key];
  }
  return unchanged ? previous : result;
};
