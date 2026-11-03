import type { Data } from "@puckeditor/core";
import { afterEach, expect, it, vi } from "vitest";
import {
  changedPreviewSection,
  createPreviewSectionFollower,
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
  vi.unstubAllGlobals();
});

it("follows additions and updates, ignoring removals, reordering, and scaffolding", () => {
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
  ).toBeUndefined();
  expect(
    changedPreviewSection(before, page(section("first"), section("third")))
  ).toBeUndefined();
  expect(changedPreviewSection(before, before)).toBeUndefined();
  expect(changedPreviewSection(before, page())).toBeUndefined();
});

const scrollingPreview = (doc = document) => {
  const viewport = doc.createElement("div");
  viewport.style.overflowY = "auto";
  Object.defineProperties(viewport, {
    scrollHeight: { value: 1000 },
    clientHeight: { value: 200 },
    scrollTop: { value: 80, writable: true },
  });
  viewport.getBoundingClientRect = () => ({ top: 50 }) as DOMRect;
  const scrollTo = vi.fn();
  viewport.scrollTo = scrollTo;
  doc.body.append(viewport);
  const addSection = () => {
    const element = doc.createElement("div");
    element.dataset.puckComponent = "new";
    element.getBoundingClientRect = () =>
      ({ top: 350, height: 400 }) as DOMRect;
    viewport.append(element);
    return element;
  };
  return { scrollTo, addSection };
};

it("waits for mounting, eases over a second, and then stops scrolling", async () => {
  vi.useFakeTimers();
  const { scrollTo, addSection } = scrollingPreview();
  const follower = createPreviewSectionFollower(document);
  follower.follow(page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(32);
  expect(scrollTo).not.toHaveBeenCalled();
  addSection();
  await vi.advanceTimersByTimeAsync(32);
  await vi.advanceTimersByTimeAsync(450);
  const midway = scrollTo.mock.lastCall![0].top;
  expect(midway).toBeGreaterThan(80);
  expect(midway).toBeLessThan(356);
  await vi.advanceTimersByTimeAsync(600);
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 356, behavior: "instant" });
  const calls = scrollTo.mock.calls.length;
  await vi.advanceTimersByTimeAsync(100);
  expect(scrollTo).toHaveBeenCalledTimes(calls);
  follower.stop();
});

it("finds sections inside the Puck preview iframe", async () => {
  vi.useFakeTimers();
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  const { scrollTo, addSection } = scrollingPreview(iframe.contentDocument!);
  addSection();
  const follower = createPreviewSectionFollower(document);
  follower.follow(page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(32);
  expect(scrollTo).toHaveBeenCalledOnce();
  follower.stop();
});

it.each(["cleanup", "interaction", "timeout"])(
  "cancels pending scrolling on %s",
  async (reason) => {
    vi.useFakeTimers();
    const { scrollTo, addSection } = scrollingPreview();
    const follower = createPreviewSectionFollower(document);
    follower.follow(page(), page(section("new")));
    if (reason === "cleanup") follower.stop();
    if (reason === "interaction") document.dispatchEvent(new Event("wheel"));
    if (reason === "timeout") await vi.advanceTimersByTimeAsync(2100);
    addSection();
    await vi.advanceTimersByTimeAsync(32);
    expect(scrollTo).not.toHaveBeenCalled();
    follower.stop();
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
  Object.defineProperty(root, "scrollTop", { value: 200, writable: true });
  root.getBoundingClientRect = () => ({ top: -200 }) as DOMRect;
  root.scrollTo = vi.fn();
  const element = doc.createElement("div");
  element.dataset.puckComponent = "new";
  element.getBoundingClientRect = () => ({ top: 350 }) as DOMRect;
  doc.body.append(element);
  const follower = createPreviewSectionFollower(document);
  follower.follow(page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(1100);
  expect(root.scrollTo).toHaveBeenLastCalledWith({
    top: 526,
    behavior: "instant",
  });
  follower.stop();
});

it("does not restart scrolling as the same section changes", async () => {
  vi.useFakeTimers();
  const { scrollTo, addSection } = scrollingPreview();
  addSection();
  const follower = createPreviewSectionFollower(document);
  const first = page(section("new"));
  follower.follow(page(), first);
  await vi.advanceTimersByTimeAsync(500);
  follower.follow(first, page(section("new", "Updated")));
  await vi.advanceTimersByTimeAsync(600);
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 356, behavior: "instant" });
  const calls = scrollTo.mock.calls.length;
  await vi.advanceTimersByTimeAsync(500);
  expect(scrollTo).toHaveBeenCalledTimes(calls);
  follower.stop();
});

it.each([
  { top: 100, height: 400 },
  { top: 150, height: 400 },
  { top: 200, height: 40 },
])(
  "leaves sufficiently visible sections in place: %o",
  async ({ top, height }) => {
    vi.useFakeTimers();
    const { scrollTo, addSection } = scrollingPreview();
    addSection().getBoundingClientRect = () => ({ top, height }) as DOMRect;
    const follower = createPreviewSectionFollower(document);
    follower.follow(page(), page(section("new")));
    await vi.advanceTimersByTimeAsync(1100);
    expect(scrollTo).not.toHaveBeenCalled();
  }
);

it.each([
  { top: 248, height: 400, destination: 254 },
  { top: 151, height: 400, destination: 157 },
  { top: 180, height: 100, destination: 186 },
])(
  "scrolls partially visible sections to the top: %o",
  async ({ top, height, destination }) => {
    vi.useFakeTimers();
    const { scrollTo, addSection } = scrollingPreview();
    addSection().getBoundingClientRect = () => ({ top, height }) as DOMRect;
    const follower = createPreviewSectionFollower(document);
    follower.follow(page(), page(section("new")));
    await vi.advanceTimersByTimeAsync(1100);
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: destination,
      behavior: "instant",
    });
  }
);

it("stops an in-progress animation when the user scrolls", async () => {
  vi.useFakeTimers();
  const { scrollTo, addSection } = scrollingPreview();
  addSection();
  const follower = createPreviewSectionFollower(document);
  follower.follow(page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(300);
  const calls = scrollTo.mock.calls.length;
  document.dispatchEvent(new Event("wheel"));
  await vi.advanceTimersByTimeAsync(1100);
  expect(scrollTo).toHaveBeenCalledTimes(calls);
});

it("uses an immediate scroll when reduced motion is requested", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const { scrollTo, addSection } = scrollingPreview();
  addSection();
  const follower = createPreviewSectionFollower(document);
  follower.follow(page(), page(section("new")));
  await vi.advanceTimersByTimeAsync(32);
  expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
    top: 356,
    behavior: "instant",
  });
});

it("finishes the current scroll before following a newly arrived section", async () => {
  vi.useFakeTimers();
  const { scrollTo, addSection } = scrollingPreview();
  const firstElement = addSection();
  const nextElement = addSection();
  nextElement.dataset.puckComponent = "second";
  nextElement.getBoundingClientRect = () => ({ top: 700 }) as DOMRect;
  const follower = createPreviewSectionFollower(document);
  const first = page(section("new"));
  follower.follow(page(), first);
  await vi.advanceTimersByTimeAsync(500);
  follower.follow(first, page(section("new"), section("second")));
  await vi.advanceTimersByTimeAsync(540);
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 356, behavior: "instant" });
  await vi.advanceTimersByTimeAsync(1100);
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 706, behavior: "instant" });
  expect(firstElement.isConnected).toBe(true);
  follower.stop();
});
