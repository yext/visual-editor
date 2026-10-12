import { describe, expect, it, vi } from "vitest";
import type { Data } from "@puckeditor/core";
import {
  LocalEditorChatCanvas,
  serializeChatLayout,
  type ChatCanvasAdapter,
} from "./LocalEditorChatCanvas.ts";

const data = (title: string): Data => ({
  root: { props: { title } },
  content: [{ type: "Heading", props: { id: "heading", text: title } }],
  zones: {},
});
const adapter = (title: string): ChatCanvasAdapter => ({
  read: () => data(title),
  resolve: vi.fn(async (value) => value),
  replace: vi.fn(),
  commit: vi.fn(),
});
const deferred = () => {
  let resolve!: (data: Data) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Data>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

describe("provisional canvas transactions", () => {
  it("ignores old preview resolutions and resolutions after rollback", async () => {
    const canvas = new LocalEditorChatCanvas();
    const target = adapter("Original");
    const old = deferred();
    vi.mocked(target.resolve).mockImplementationOnce(() => old.promise);
    canvas.attach(target);
    canvas.begin();
    const pending = canvas.preview({ content: data("Old").content });
    await canvas.preview({ content: data("New").content });
    old.resolve(data("Old"));
    await pending;
    expect(target.replace).toHaveBeenCalledExactlyOnceWith({
      ...data("New"),
      root: data("Original").root,
    });
    const later = deferred();
    vi.mocked(target.resolve).mockImplementationOnce(() => later.promise);
    const cancelled = canvas.preview({ content: data("Cancelled").content });
    canvas.finish();
    later.resolve(data("Cancelled"));
    await cancelled;
    expect(target.replace).toHaveBeenLastCalledWith(data("Original"));
  });

  it("waits for a remounted editor and commits against its baseline", async () => {
    const canvas = new LocalEditorChatCanvas();
    const first = adapter("English");
    const detach = canvas.attach(first);
    canvas.begin();
    await canvas.preview({ content: data("Partial").content });
    detach();
    const commit = canvas.commit({ content: data("Final").content });
    const second = adapter("French");
    canvas.attach(second);
    await commit;
    expect(first.commit).not.toHaveBeenCalled();
    expect(second.commit).toHaveBeenCalledExactlyOnceWith(
      { ...data("Final"), root: data("French").root },
      data("French")
    );
    canvas.finish();
    expect(second.replace).not.toHaveBeenCalled();
  });

  it("does not let a cancelled commit affect a subsequent turn", async () => {
    const canvas = new LocalEditorChatCanvas();
    const target = adapter("Original");
    const detach = canvas.attach(target);
    canvas.begin();
    detach();
    const commit = canvas.commit({ content: data("Old").content });
    const rejected = expect(commit).rejects.toThrow("cancelled");
    canvas.finish();
    const next = adapter("Next");
    canvas.attach(next);
    canvas.begin();
    await rejected;
    expect(next.commit).not.toHaveBeenCalled();
  });

  it("retries final resolution for the active document and ignores stale failures", async () => {
    const canvas = new LocalEditorChatCanvas();
    const first = adapter("English");
    const pending = deferred();
    vi.mocked(first.resolve).mockImplementation(() => pending.promise);
    const detach = canvas.attach(first);
    canvas.begin();
    const commit = canvas.commit({ content: data("Final").content });
    detach();
    const second = adapter("French");
    canvas.attach(second);
    pending.reject(new Error("Old document"));
    await commit;
    expect(second.commit).toHaveBeenCalledWith(
      { ...data("Final"), root: data("French").root },
      data("French")
    );
  });

  it("rolls back resolution failures without committing", async () => {
    const canvas = new LocalEditorChatCanvas();
    const target = adapter("Original");
    canvas.attach(target);
    canvas.begin();
    vi.mocked(target.resolve).mockRejectedValue(new Error("Resolution failed"));
    await expect(
      canvas.commit({ content: data("Final").content })
    ).rejects.toThrow("Resolution failed");
    canvas.finish();
    expect(target.commit).not.toHaveBeenCalled();
    expect(target.replace).toHaveBeenLastCalledWith(data("Original"));
  });

  it("preserves the existing root and clears zones on preview and acceptance", async () => {
    const canvas = new LocalEditorChatCanvas();
    const original = {
      ...data("Original"),
      root: {
        props: { title: "Keep", description: "Keep too", version: 99 },
        readOnly: { title: true },
      },
      zones: { "heading:legacy": [] },
    };
    const target = adapter("Original");
    target.read = () => original;
    // Even a resolver that changes root must not overwrite editor-owned data.
    target.resolve = vi.fn(async (value) => ({
      ...value,
      root: { props: { title: "Changed" } },
      zones: { "new:zone": [] },
    }));
    canvas.attach(target);
    expect(canvas.begin()).toEqual({ content: original.content });
    await canvas.preview({ content: data("Partial").content });
    expect(target.replace).toHaveBeenLastCalledWith({
      root: original.root,
      content: data("Partial").content,
      zones: {},
    });
    canvas.reset();
    expect(target.replace).toHaveBeenLastCalledWith(original);
    await canvas.commit({ content: [] });
    expect(target.commit).toHaveBeenLastCalledWith(
      { root: original.root, content: [], zones: {} },
      original
    );
  });

  it("serializes saved data without runtime context and callbacks", () => {
    const original = {
      ...data("Original"),
      content: [
        {
          type: "Heading",
          props: {
            id: "heading",
            text: "Keep",
            puck: { render: () => {} },
            parentData: { runtime: true },
            callback: () => {},
          },
        },
      ],
    };
    const saved = serializeChatLayout(original);
    expect(Object.keys(saved)).toEqual(["content"]);
    expect(saved.content[0].props).toEqual({ id: "heading", text: "Keep" });
    expect(original.content[0].props.puck).toBeDefined();
  });
});
