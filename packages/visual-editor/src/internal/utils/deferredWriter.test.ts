import * as lzstring from "lz-string";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDeferredWriter } from "./deferredWriter.ts";

const originalRequestIdleCallback = window.requestIdleCallback;
const originalCancelIdleCallback = window.cancelIdleCallback;

describe("createDeferredWriter", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.requestIdleCallback = originalRequestIdleCallback;
    window.cancelIdleCallback = originalCancelIdleCallback;
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

  it("cancel prevents a pending write and does not block later schedules", () => {
    vi.useFakeTimers();

    const writeValue = vi.fn();
    const writer = createDeferredWriter(writeValue, (task) => {
      const timeoutId = setTimeout(task, 25);
      return () => clearTimeout(timeoutId);
    });

    writer.schedule("first");
    writer.cancel();
    vi.advanceTimersByTime(25);

    expect(writeValue).not.toHaveBeenCalled();

    writer.schedule("second");
    vi.advanceTimersByTime(25);

    expect(writeValue).toHaveBeenCalledTimes(1);
    expect(writeValue).toHaveBeenCalledWith("second");
  });

  it("treats flush with no pending value as a safe no-op", () => {
    const writeValue = vi.fn();
    const writer = createDeferredWriter(writeValue);

    writer.flush();

    expect(writeValue).not.toHaveBeenCalled();
  });

  it("preserves a reentrant schedule triggered during writeValue", () => {
    vi.useFakeTimers();

    const writtenValues: string[] = [];
    let writer!: ReturnType<typeof createDeferredWriter<string>>;

    writer = createDeferredWriter(
      (value) => {
        writtenValues.push(value);
        if (value === "first") {
          writer.schedule("second");
        }
      },
      (task) => {
        const timeoutId = setTimeout(task, 25);
        return () => clearTimeout(timeoutId);
      }
    );

    writer.schedule("first");
    vi.advanceTimersByTime(25);
    vi.advanceTimersByTime(25);

    expect(writtenValues).toEqual(["first", "second"]);
  });

  it("uses requestIdleCallback in the default scheduler when available", () => {
    const requestIdleCallbackMock = vi.fn<typeof window.requestIdleCallback>(
      (callback) => {
        callback({ didTimeout: false, timeRemaining: () => 50 });
        return 123;
      }
    );
    const cancelIdleCallbackMock = vi.fn<typeof window.cancelIdleCallback>();

    window.requestIdleCallback = requestIdleCallbackMock;
    window.cancelIdleCallback = cancelIdleCallbackMock;

    const writeValue = vi.fn();
    const writer = createDeferredWriter(writeValue);

    writer.schedule("idle");

    expect(requestIdleCallbackMock).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 150,
    });
    expect(writeValue).toHaveBeenCalledWith("idle");
  });

  it("falls back to setTimeout in the default scheduler when requestIdleCallback is unavailable", () => {
    vi.useFakeTimers();

    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    const writeValue = vi.fn();
    const writer = createDeferredWriter(writeValue);

    writer.schedule("timeout");

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 150);

    vi.advanceTimersByTime(150);

    expect(writeValue).toHaveBeenCalledWith("timeout");
  });
});
