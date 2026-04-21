import * as lzstring from "lz-string";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDeferredWriter } from "./deferredWriter.ts";

describe("createDeferredWriter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes only the latest scheduled value", () => {
    vi.useFakeTimers();

    const writtenValues: string[] = [];
    const writer = createDeferredWriter(
      (value: string) => {
        writtenValues.push(value);
      },
      (task) => {
        const timeoutId = setTimeout(task, 25);
        return () => clearTimeout(timeoutId);
      }
    );

    writer.schedule("first");
    writer.schedule("second");

    vi.advanceTimersByTime(25);

    expect(writtenValues).toEqual(["second"]);
  });

  it("flushes the latest history in a format reload logic can read", () => {
    vi.useFakeTimers();

    const setItem = vi.fn();
    const writer = createDeferredWriter(
      (
        histories: Array<{ id: string; state: { data: { title: string } } }>
      ) => {
        setItem("ve-history", lzstring.compress(JSON.stringify(histories)));
      },
      (task) => {
        const timeoutId = setTimeout(task, 25);
        return () => clearTimeout(timeoutId);
      }
    );

    writer.schedule([{ id: "old", state: { data: { title: "Old" } } }]);
    writer.schedule([{ id: "new", state: { data: { title: "New" } } }]);

    writer.flush();

    const compressedHistory = setItem.mock.calls[0]?.[1];
    expect(JSON.parse(lzstring.decompress(compressedHistory) ?? "[]")).toEqual([
      { id: "new", state: { data: { title: "New" } } },
    ]);
  });
});
