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

/** Follow page sections, rather than their nested slot components or MainContent. */
export const changedPreviewSection = (
  previous: Data,
  next: Data
): string | undefined => {
  const sections = (data: Data) =>
    data.content.flatMap((item) =>
      item.type === "MainContent" ? (item.props.content ?? []) : [item]
    ) as Data["content"];
  const before = sections(previous);
  const after = sections(next);
  const originals = new Map(before.map((item) => [item.props.id, item]));
  const changed = after.find(
    (item) => !isDeepEqual(originals.get(item.props.id), item)
  );
  if (changed) return changed.props.id;
  const remaining = new Set(after.map((item) => item.props.id));
  const retained = before.filter((item) => remaining.has(item.props.id));
  const moved = after.find(
    (item, index) => item.props.id !== retained[index]?.props.id
  );
  if (moved) return moved.props.id;
  const removedIndex = before.findIndex(
    (item) => !remaining.has(item.props.id)
  );
  return removedIndex < 0
    ? undefined
    : after[Math.min(removedIndex, after.length - 1)]?.props.id;
};

/** Wait for the accepted section to mount, then scroll only its preview viewport.
 * Cancel on the next update, editor teardown, user interaction, or timeout. */
export const followPreviewSection = (
  doc: Document,
  previous: Data,
  next: Data
): (() => void) => {
  const sectionId = changedPreviewSection(previous, next);
  if (!sectionId) return () => {};
  const view = doc.defaultView;
  if (!view) return () => {};
  let active = true;
  let frame = 0;
  const observers: MutationObserver[] = [];
  const documents = [doc];
  doc.querySelectorAll("iframe").forEach((iframe) => {
    try {
      if (iframe.contentDocument) documents.push(iframe.contentDocument);
    } catch {
      /* External embed. */
    }
  });
  const stop = () => {
    active = false;
    view.cancelAnimationFrame(frame);
    view.clearTimeout(timeout);
    observers.forEach((observer) => observer.disconnect());
    documents.forEach((document) => {
      ["wheel", "touchstart", "pointerdown", "keydown"].forEach((type) =>
        document.removeEventListener(type, stop, true)
      );
    });
  };
  const scroll = () => {
    if (!active) return;
    for (const document of documents) {
      const element = Array.from(
        document.querySelectorAll<HTMLElement>("[data-puck-component]")
      ).find((item) => item.getAttribute("data-puck-component") === sectionId);
      if (!element) continue;
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
        const top = element.getBoundingClientRect().top - viewportTop;
        viewport.scrollTo?.({
          top: Math.max(0, viewport.scrollTop + top),
          behavior: "smooth",
        });
      }
      stop();
      return;
    }
  };
  const schedule = () => {
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(scroll);
  };
  const timeout = view.setTimeout(stop, 2000);
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
      document.addEventListener(type, stop, true)
    );
  });
  schedule();
  return stop;
};
