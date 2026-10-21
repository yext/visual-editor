import { expect, it } from "vitest";
import {
  preservePreviewScroll,
  reusePreviewData,
} from "./preservePreviewScroll.ts";

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

it.skipIf(navigator.userAgent.includes("jsdom"))(
  "anchors late layout changes without fighting user scrolling",
  async () => {
    const viewport = document.createElement("div");
    viewport.style.cssText = "height:200px;overflow:auto;overflow-anchor:none";
    const content = document.createElement("div");
    const before = document.createElement("div");
    before.style.height = "300px";
    const anchor = document.createElement("div");
    anchor.dataset.puckComponent = "anchor";
    anchor.style.height = "100px";
    const after = document.createElement("div");
    after.style.height = "600px";
    content.append(before, anchor, after);
    viewport.append(content);
    document.body.append(viewport);
    viewport.scrollTop = 300;
    const top = anchor.getBoundingClientRect().top;
    const release = preservePreviewScroll(document);
    const settle = () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    try {
      before.style.height = "350px";
      await settle();
      expect(
        Math.abs(anchor.getBoundingClientRect().top - top)
      ).toBeLessThanOrEqual(1);
      before.style.height = "400px";
      await settle();
      expect(
        Math.abs(anchor.getBoundingClientRect().top - top)
      ).toBeLessThanOrEqual(1);
      window.dispatchEvent(new WheelEvent("wheel"));
      viewport.scrollTop = 200;
      before.style.height = "450px";
      await settle();
      expect(viewport.scrollTop).toBe(200);
    } finally {
      release();
      viewport.remove();
    }
  }
);
