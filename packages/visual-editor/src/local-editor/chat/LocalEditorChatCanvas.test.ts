import { describe, expect, it, vi } from "vitest";
import type { Data } from "@puckeditor/core";
import {
  LocalEditorChatCanvas,
  serializeChatLayout,
  type ChatCanvasAdapter,
} from "./LocalEditorChatCanvas.ts";

const data = (text: string): Data => ({
  root: { props: { title: "Keep" } },
  content: [{ type: "Heading", props: { id: "heading", text } }],
  zones: {},
});
const adapter = (): ChatCanvasAdapter => ({
  read: () => data("Original"),
  resolve: vi.fn(async (value) => value),
  validate: vi.fn(),
  commit: vi.fn(),
});
const deferred = () => {
  let resolve!: (data: Data) => void;
  const promise = new Promise<Data>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
};

describe("atomic chat canvas", () => {
  it("resolves in isolation, preserves root, and commits once", async () => {
    const canvas = new LocalEditorChatCanvas();
    const target = adapter();
    const pending = deferred();
    target.resolve = vi.fn(() => pending.promise);
    canvas.attach(target);
    canvas.begin();
    const commit = canvas.commit({ content: data("Final").content });
    expect(target.commit).not.toHaveBeenCalled();
    pending.resolve({
      ...data("Final"),
      root: { props: { title: "Resolver" } },
    });
    await commit;
    expect(target.commit).toHaveBeenCalledExactlyOnceWith(
      data("Final"),
      data("Original")
    );
    expect(target.validate).toHaveBeenCalledTimes(2);
  });
  it.each(["cancel", "context", "layout"])(
    "rejects stale resolution after %s changes",
    async (change) => {
      const canvas = new LocalEditorChatCanvas();
      const target = adapter();
      const pending = deferred();
      target.resolve = vi.fn(() => pending.promise);
      canvas.attach(target);
      canvas.begin();
      const commit = canvas.commit({ content: data("Late").content });
      const rejection = expect(commit).rejects.toThrow(/changed|cancelled/);
      if (change === "cancel") canvas.finish();
      if (change === "context") canvas.attach(adapter());
      if (change === "layout") target.read = () => data("Manual");
      pending.resolve(data("Late"));
      await rejection;
      expect(target.commit).not.toHaveBeenCalled();
    }
  );
  it.each(["resolution", "validation"])(
    "leaves the starting layout unchanged on %s failure",
    async (failure) => {
      const canvas = new LocalEditorChatCanvas();
      const target = adapter();
      if (failure === "resolution")
        target.resolve = vi.fn(async () => {
          throw new Error("Failed");
        });
      else
        target.validate = vi.fn(() => {
          throw new Error("Failed");
        });
      canvas.attach(target);
      canvas.begin();
      await expect(
        canvas.commit({ content: data("Invalid").content })
      ).rejects.toThrow("Failed");
      canvas.finish();
      expect(target.commit).not.toHaveBeenCalled();
      expect(target.read()).toEqual(data("Original"));
    }
  );
  it("clarifies without resolving or committing", async () => {
    const canvas = new LocalEditorChatCanvas();
    const target = adapter();
    canvas.attach(target);
    canvas.begin();
    await canvas.commit(null);
    expect(target.resolve).not.toHaveBeenCalled();
    expect(target.commit).not.toHaveBeenCalled();
  });
  it("rejects populated zones and preserves unexposed serializable configuration", () => {
    expect(() =>
      serializeChatLayout({
        ...data("Original"),
        zones: { legacy: data("Legacy").content },
      })
    ).toThrow("legacy zones");
    const value = data("Original");
    value.content[0].props.parentData = { authored: true };
    value.content[0].props.callback = () => {};
    expect(serializeChatLayout(value).content[0].props.parentData).toEqual({
      authored: true,
    });
    expect(
      serializeChatLayout(value).content[0].props.callback
    ).toBeUndefined();
  });
});
