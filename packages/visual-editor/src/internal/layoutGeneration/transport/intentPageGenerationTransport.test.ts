import { afterEach, expect, it, vi } from "vitest";
import { sendIntentRequest } from "./intentPageGenerationTransport.ts";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
const reply = (payload: object, overrides: object = {}) =>
  window.dispatchEvent(
    new MessageEvent("message", {
      source: window.parent,
      origin: "https://dev.yext.com",
      data: {
        type: "updateIntentPageGeneration",
        status: "success",
        payload,
      },
      ...overrides,
    })
  );
it("validates parent, origin, attempt and action state, ignoring duplicate earlier acknowledgements", async () => {
  vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
  const controller = new AbortController();
  const pending = sendIntentRequest(
    "updateIntentPageGeneration",
    { action: "fail" },
    "active",
    controller.signal
  );
  const done = vi.fn();
  void pending.then(done);
  const payload = {
    attemptId: "active",
    generation: { attemptId: "active", status: "FAILED" },
  };
  reply(payload, { source: window.document });
  reply(payload, { origin: "https://untrusted.example" });
  reply({ ...payload, attemptId: "other" });
  reply({ ...payload, generation: { attemptId: "active", status: "RUNNING" } });
  reply({ ...payload, generation: { attemptId: "other", status: "FAILED" } });
  await Promise.resolve();
  expect(done).not.toHaveBeenCalled();
  reply(payload);
  await pending;
  expect(done).toHaveBeenCalledTimes(1);
});

it("bounds waits and cleans up after timeouts and cancellation", async () => {
  vi.useFakeTimers();
  vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
  const pending = sendIntentRequest(
    "updateIntentPageGeneration",
    { action: "start" },
    "active",
    new AbortController().signal
  );
  const result = expect(pending).rejects.toThrow("did not acknowledge");
  await vi.advanceTimersByTimeAsync(15000);
  await result;
  const controller = new AbortController();
  const cancelled = sendIntentRequest(
    "updateIntentPageGeneration",
    { action: "start" },
    "active",
    controller.signal
  );
  controller.abort(new Error("Cancelled"));
  await expect(cancelled).rejects.toThrow("Cancelled");
  expect(vi.getTimerCount()).toBe(0);
});

it("accepts message-only invalid-default-layout save errors", async () => {
  vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
  const pending = sendIntentRequest(
    "saveLayoutSaveState",
    {},
    "active",
    new AbortController().signal
  );
  window.dispatchEvent(
    new MessageEvent("message", {
      source: window.parent,
      origin: "https://dev.yext.com",
      data: {
        type: "saveLayoutSaveState",
        status: "error",
        payload: { message: "Invalid default layout" },
      },
    })
  );
  await expect(pending).resolves.toMatchObject({
    status: "error",
    payload: { message: "Invalid default layout" },
  });
});
