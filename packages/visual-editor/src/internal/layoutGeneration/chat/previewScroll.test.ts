import type { Data } from "@puckeditor/core";
import { afterEach, expect, it, vi } from "vitest";
import {
  changedPreviewSection,
  followPreviewSection,
  reusePreviewData,
} from "./previewScroll.ts";

it("reuses unchanged sections while appending new content", () => {
  const original = { content: [{ props: { id: "first", text: "First" } }] };
  const updated = reusePreviewData(original, {
    content: [
      { props: { id: "first", text: "First" } },
      { props: { id: "second", text: "Second" } },
    ],
  });
  expect(updated).not.toBe(original);
  expect(updated.content[0]).toBe(original.content[0]);
});

const section = (id: string, text = id) => ({
  type: "Heading",
  props: { id, text },
});
const page = (...content: Data["content"]): Data => ({
  root: { props: {} },
  content: [{ type: "MainContent", props: { id: "main", content } }],
});

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("follows added, changed, moved and removed sections without targeting their scaffold", () => {
  const before = page(section("first"), section("second"), section("third"));
  expect(
    changedPreviewSection(
      before,
      page(
        section("first"),
        section("new"),
        section("second"),
        section("third")
      )
    )
  ).toBe("new");
  expect(
    changedPreviewSection(
      before,
      page(section("first"), section("second", "Updated"), section("third"))
    )
  ).toBe("second");
  expect(
    changedPreviewSection(
      before,
      page(section("third"), section("first"), section("second"))
    )
  ).toBe("third");
  expect(
    changedPreviewSection(before, page(section("first"), section("third")))
  ).toBe("third");
  expect(changedPreviewSection(before, before)).toBeUndefined();
  expect(changedPreviewSection(before, page())).toBeUndefined();
});

const scrollingPreview = (doc = document) => {
  const viewport = doc.createElement("div");
  viewport.style.overflowY = "auto";
  Object.defineProperties(viewport, {
    scrollHeight: { value: 1000 },
    clientHeight: { value: 200 },
  });
  viewport.scrollTop = 80;
  viewport.getBoundingClientRect = () => ({ top: 50 }) as DOMRect;
  const scrollTo = vi.fn();
  viewport.scrollTo = scrollTo;
  doc.body.append(viewport);
  const addSection = () => {
    const element = doc.createElement("div");
    element.dataset.puckComponent = "new";
    element.getBoundingClientRect = () => ({ top: 350 }) as DOMRect;
    viewport.append(element);
    return element;
  };
  return { scrollTo, addSection };
};

it("waits for streamed content to mount and scrolls its viewport once", async () => {
  vi.useFakeTimers();
  const { scrollTo, addSection } = scrollingPreview();
  const release = followPreviewSection(document, page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(32);
  expect(scrollTo).not.toHaveBeenCalled();
  addSection();
  await vi.advanceTimersByTimeAsync(32);
  expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
    top: 380,
    behavior: "smooth",
  });
  await vi.advanceTimersByTimeAsync(100);
  expect(scrollTo).toHaveBeenCalledOnce();
  release();
});

it("finds sections inside the Puck preview iframe", async () => {
  vi.useFakeTimers();
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  const { scrollTo, addSection } = scrollingPreview(iframe.contentDocument!);
  addSection();
  const release = followPreviewSection(document, page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(32);
  expect(scrollTo).toHaveBeenCalledOnce();
  release();
});

it.each(["cleanup", "interaction", "timeout"])(
  "cancels pending scrolling on %s",
  async (reason) => {
    vi.useFakeTimers();
    const { scrollTo, addSection } = scrollingPreview();
    const release = followPreviewSection(
      document,
      page(),
      page(section("new"))
    );
    if (reason === "cleanup") release();
    if (reason === "interaction") document.dispatchEvent(new Event("wheel"));
    if (reason === "timeout") await vi.advanceTimersByTimeAsync(2100);
    addSection();
    await vi.advanceTimersByTimeAsync(32);
    expect(scrollTo).not.toHaveBeenCalled();
    release();
  }
);

it("uses viewport coordinates for the iframe document scroll root", async () => {
  vi.useFakeTimers();
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  const doc = iframe.contentDocument!;
  const root = doc.documentElement;
  Object.defineProperty(doc, "scrollingElement", {
    value: root,
    configurable: true,
  });
  root.scrollTop = 200;
  root.getBoundingClientRect = () => ({ top: -200 }) as DOMRect;
  root.scrollTo = vi.fn();
  const element = doc.createElement("div");
  element.dataset.puckComponent = "new";
  element.getBoundingClientRect = () => ({ top: 350 }) as DOMRect;
  doc.body.append(element);
  const release = followPreviewSection(document, page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(32);
  expect(root.scrollTo).toHaveBeenCalledExactlyOnceWith({
    top: 550,
    behavior: "smooth",
  });
  release();
});
