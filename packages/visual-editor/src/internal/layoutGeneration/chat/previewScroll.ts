import type { Data } from "@puckeditor/core";
import { isDeepEqual } from "../../../utils/deepEqual.ts";
import { isPlainObject } from "../../utils/isPlainObject.ts";

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

export const previewSections = (data: Data): Data["content"] =>
  data.content.flatMap((item) =>
    item.type === "MainContent" ? (item.props.content ?? []) : [item]
  );

/** Follow page sections, rather than their nested slot components or MainContent. */
export const changedPreviewSection = (
  previous: Data,
  next: Data
): string | undefined => {
  const before = previewSections(previous);
  const after = previewSections(next);
  const originals = new Map(before.map((item) => [item.props.id, item]));
  const changed = after.find(
    (item) => !isDeepEqual(originals.get(item.props.id), item)
  );
  return changed?.props.id;
};

export const previewDocuments = (doc: Document): Document[] => {
  const documents = [doc];
  doc.querySelectorAll("iframe").forEach((iframe) => {
    try {
      if (iframe.contentDocument) documents.push(iframe.contentDocument);
    } catch {
      /* External embed. */
    }
  });
  return documents;
};

/** Wait for the accepted section to mount, then scroll only its preview viewport.
 * Use a fixed, gentle duration rather than restarting native smooth scrolling. */
const scrollToPreviewSection = (
  doc: Document,
  sectionId: string,
  onSettled: (interrupted: boolean) => void
): (() => void) => {
  const view = doc.defaultView;
  if (!view) {
    onSettled(false);
    return () => {};
  }
  let active = true;
  let frame = 0;
  const observers: MutationObserver[] = [];
  const documents = previewDocuments(doc);
  const stop = (interrupted = false) => {
    if (!active) return;
    active = false;
    view.cancelAnimationFrame(frame);
    view.clearTimeout(timeout);
    observers.forEach((observer) => observer.disconnect());
    documents.forEach((document) => {
      ["wheel", "touchstart", "pointerdown", "keydown"].forEach((type) =>
        document.removeEventListener(type, interrupt, true)
      );
    });
    onSettled(interrupted);
  };
  const interrupt = () => stop(true);
  const scroll = () => {
    if (!active) return;
    for (const document of documents) {
      const element = Array.from(
        document.querySelectorAll<HTMLElement>("[data-puck-component]")
      ).find((item) => item.getAttribute("data-puck-component") === sectionId);
      if (!element) continue;
      view.clearTimeout(timeout);
      // Use the nearest scroll container so the chat and outer editor stay put.
      let viewport = element.parentElement;
      while (viewport) {
        const overflow =
          document.defaultView?.getComputedStyle(viewport).overflowY;
        if (
          /(auto|scroll|overlay)/.test(overflow ?? "") &&
          viewport.scrollHeight > viewport.clientHeight
        )
          break;
        viewport = viewport.parentElement;
      }
      viewport ??= document.scrollingElement as HTMLElement | null;
      if (viewport) {
        const viewportTop =
          viewport === document.scrollingElement
            ? 0
            : viewport.getBoundingClientRect().top + viewport.clientTop;
        const bounds = element.getBoundingClientRect();
        const top = bounds.top - viewportTop;
        const visibleHeight = Math.min(
          bounds.height,
          viewport.clientHeight - top
        );
        // Keep the viewport steady only when the section has meaningful room:
        // half the viewport for tall sections, or the entire section if shorter.
        const minimumVisibleHeight = Math.min(
          bounds.height,
          viewport.clientHeight / 2
        );
        if (
          top >= 0 &&
          top < viewport.clientHeight &&
          visibleHeight >= minimumVisibleHeight
        ) {
          stop();
          return;
        }
        observers.forEach((observer) => observer.disconnect());
        const start = viewport.scrollTop;
        const destination = Math.max(0, start + top - 24);
        const reducedMotion = view.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        const startedAt = view.performance.now();
        const animate = (now: number) => {
          if (!active) return;
          const progress = reducedMotion
            ? 1
            : Math.min(1, (now - startedAt) / 1000);
          const eased =
            progress < 0.5
              ? 4 * progress ** 3
              : 1 - (-2 * progress + 2) ** 3 / 2;
          viewport.scrollTo?.({
            top: start + (destination - start) * eased,
            behavior: "instant",
          });
          if (progress < 1) frame = view.requestAnimationFrame(animate);
          else stop();
        };
        frame = view.requestAnimationFrame(animate);
        return;
      }
      stop();
      return;
    }
  };
  const schedule = () => {
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(scroll);
  };
  const timeout = view.setTimeout(() => stop(), 2000);
  documents.forEach((document) => {
    const Observer = document.defaultView?.MutationObserver;
    if (Observer) {
      const observer = new Observer(schedule);
      observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-puck-component"],
      });
      observers.push(observer);
    }
    ["wheel", "touchstart", "pointerdown", "keydown"].forEach((type) =>
      document.addEventListener(type, interrupt, true)
    );
  });
  schedule();
  return interrupt;
};

/** Coalesce arrivals; resolving a replacement can await its section's scroll. */
export const createPreviewSectionFollower = (doc: Document) => {
  type Scroll = { sectionId: string; done: Promise<void>; finish: () => void };
  let lastSectionId: string | undefined;
  let pending: Scroll | undefined;
  let current: Scroll | undefined;
  let cancel: (() => void) | undefined;
  const clearPending = () => {
    pending?.finish();
    pending = undefined;
  };
  const flush = () => {
    if (current || !pending) return;
    const scroll = pending;
    pending = undefined;
    current = scroll;
    cancel = scrollToPreviewSection(doc, scroll.sectionId, (interrupted) => {
      current = undefined;
      scroll.finish();
      if (interrupted) clearPending();
      flush();
    });
  };
  const enqueue = (sectionId: string) => {
    if (sectionId === lastSectionId) {
      return (
        (pending?.sectionId === sectionId ? pending : current)?.done ??
        Promise.resolve()
      );
    }
    lastSectionId = sectionId;
    clearPending();
    let finish!: () => void;
    const done = new Promise<void>((resolve) => {
      finish = resolve;
    });
    pending = { sectionId, finish, done };
    flush();
    return done;
  };
  const stop = () => {
    clearPending();
    cancel?.();
    lastSectionId = undefined;
  };
  return {
    follow(previous: Data, next: Data) {
      const sectionId = changedPreviewSection(previous, next);
      if (sectionId) void enqueue(sectionId);
    },
    async followSection(sectionId: string, signal: AbortSignal) {
      signal.throwIfAborted();
      signal.addEventListener("abort", stop, { once: true });
      try {
        await enqueue(sectionId);
        signal.throwIfAborted();
      } finally {
        signal.removeEventListener("abort", stop);
      }
    },
    stop,
  };
};
