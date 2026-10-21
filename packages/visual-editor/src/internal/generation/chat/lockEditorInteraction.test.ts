import { afterEach, expect, it, vi } from "vitest";
import { lockEditorInteraction } from "./lockEditorInteraction.ts";

let unlock = () => {};
afterEach(() => {
  unlock();
  document.body.innerHTML = "";
});
const setup = () => {
  document.body.innerHTML =
    '<div id="frame" tabindex="0"><button>Edit</button><input type="number" /><div id="scroll">Page</div><iframe></iframe></div><button id="stop">Stop</button>';
  const frame = document.getElementById("frame")!;
  unlock = lockEditorInteraction(frame);
  return frame;
};
const event = (type: string) =>
  new Event(type, { bubbles: true, cancelable: true });
it.each([
  "click",
  "pointerdown",
  "mousedown",
  "dragstart",
  "drop",
  "beforeinput",
  "input",
  "change",
  "paste",
  "cut",
  "submit",
])("blocks editor %s and restores it on cleanup", (type) => {
  const frame = setup();
  const handler = vi.fn();
  frame.addEventListener(type, handler);
  const blocked = event(type);
  frame.querySelector("button")!.dispatchEvent(blocked);
  expect(blocked.defaultPrevented).toBe(true);
  expect(handler).not.toHaveBeenCalled();
  unlock();
  frame.querySelector("button")!.dispatchEvent(event(type));
  expect(handler).toHaveBeenCalledOnce();
});
it("preserves wheel, touch panning, scroll keys and controls outside the editor", () => {
  const frame = setup();
  for (const type of ["wheel", "touchstart", "touchend"]) {
    const scrolling = event(type);
    frame.dispatchEvent(scrolling);
    expect(scrolling.defaultPrevented).toBe(false);
  }
  for (const key of ["ArrowDown", "PageDown", "Home", "End", " ", "Tab"]) {
    const scrolling = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    });
    frame.dispatchEvent(scrolling);
    expect(scrolling.defaultPrevented).toBe(false);
  }
  const stop = document.getElementById("stop")!;
  const clicked = vi.fn();
  stop.addEventListener("click", clicked);
  stop.click();
  expect(clicked).toHaveBeenCalledOnce();
  expect(frame.hasAttribute("inert")).toBe(false);
});
it("blocks scroll keys that would edit a focused field and history shortcuts outside the frame", () => {
  const frame = setup();
  const arrow = new KeyboardEvent("keydown", {
    key: "ArrowUp",
    bubbles: true,
    cancelable: true,
  });
  frame.querySelector("input")!.dispatchEvent(arrow);
  expect(arrow.defaultPrevented).toBe(true);
  const undo = new KeyboardEvent("keydown", {
    key: "z",
    metaKey: true,
    cancelable: true,
  });
  window.dispatchEvent(undo);
  expect(undo.defaultPrevented).toBe(true);
  unlock();
  const restored = new KeyboardEvent("keydown", {
    key: "z",
    ctrlKey: true,
    cancelable: true,
  });
  window.dispatchEvent(restored);
  expect(restored.defaultPrevented).toBe(false);
});
it("preserves native scrollbar dragging while blocking editor handlers", () => {
  const frame = setup();
  frame.style.overflowY = "auto";
  Object.defineProperties(frame, {
    offsetWidth: { value: 120 },
    clientWidth: { value: 100 },
  });
  const handler = vi.fn();
  frame.addEventListener("mousedown", handler);
  const pointer = new MouseEvent("mousedown", {
    clientX: 110,
    bubbles: true,
    cancelable: true,
  });
  frame.dispatchEvent(pointer);
  expect(pointer.defaultPrevented).toBe(false);
  expect(handler).not.toHaveBeenCalled();
});
it("locks the current iframe and newly mounted iframe documents", async () => {
  const frame = setup();
  const check = (iframe: HTMLIFrameElement) => {
    const doc = iframe.contentDocument!;
    const mutation = event("click");
    doc.body.dispatchEvent(mutation);
    expect(mutation.defaultPrevented).toBe(true);
    const wheel = event("wheel");
    doc.body.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(false);
  };
  check(frame.querySelector("iframe")!);
  const next = document.createElement("iframe");
  frame.append(next);
  await vi.waitFor(() => check(next));
  unlock();
  const click = event("click");
  next.contentDocument!.body.dispatchEvent(click);
  expect(click.defaultPrevented).toBe(false);
});

it("does not mistake control borders for scrollbars", () => {
  const frame = setup();
  const input = frame.querySelector("input")!;
  Object.defineProperties(input, {
    offsetWidth: { value: 120 },
    clientWidth: { value: 100 },
  });
  const pointer = new MouseEvent("mousedown", {
    clientX: 110,
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(pointer);
  expect(pointer.defaultPrevented).toBe(true);
});

it("allows wheel scrolling without changing a focused number field", () => {
  const frame = setup();
  const input = frame.querySelector("input")!;
  input.focus();
  const wheel = event("wheel");
  input.dispatchEvent(wheel);
  expect(wheel.defaultPrevented).toBe(false);
  expect(document.activeElement).not.toBe(input);
});

it("permits marked chat controls and its rail, but keeps fields, history and iframe content locked", () => {
  const frame = setup();
  frame.insertAdjacentHTML(
    "beforeend",
    `
    <aside data-local-editor-chat><button id="cancel">Stop</button><details><summary>Usage</summary></details></aside>
    <nav><span data-local-editor-chat-rail></span><button id="outline">Outline</button></nav>
    <nav><button id="other-nav">Canvas navigation</button></nav>
  `
  );
  for (const selector of ["#cancel", "summary", "#outline"]) {
    const target = frame.querySelector(selector)!;
    const clicked = vi.fn();
    target.addEventListener("click", clicked);
    const click = event("click");
    target.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(clicked).toHaveBeenCalledOnce();
    const enter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
    const undo = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(undo);
    expect(undo.defaultPrevented).toBe(true);
  }
  const blocked = event("click");
  frame.querySelector("#other-nav")!.dispatchEvent(blocked);
  expect(blocked.defaultPrevented).toBe(true);
  const doc = frame.querySelector("iframe")!.contentDocument!;
  doc.body.innerHTML =
    "<aside data-local-editor-chat><button>Not the assistant</button></aside>";
  const embedded = event("click");
  doc.querySelector("button")!.dispatchEvent(embedded);
  expect(embedded.defaultPrevented).toBe(true);
});
