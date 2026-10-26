import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useIntentPageRegeneration } from "./useIntentPageRegeneration.ts";

afterEach(cleanup);
const setup = (
  initial: {
    prompt?: string;
    ready?: boolean;
    enabled?: boolean;
    scope?: string;
    busy?: boolean;
  } = {}
) => {
  const regenerate = vi.fn(async () => {});
  const hook = renderHook(
    ({ prompt, ready = true, enabled = true, scope = "one", busy = false }) =>
      useIntentPageRegeneration(
        { regenerate, ready, isStreaming: busy },
        prompt,
        scope,
        enabled
      ),
    { initialProps: initial, wrapper: React.StrictMode }
  );
  return { ...hook, regenerate };
};

it.each([undefined, "", "  \n"])(
  "does nothing without a non-empty prompt (%s)",
  async (prompt) => {
    const current = setup({ prompt });
    await act(async () => {});
    expect(current.regenerate).not.toHaveBeenCalled();
  }
);

it("waits for readiness, survives effect replay and rerenders, and starts once per scope", async () => {
  const current = setup({ prompt: " Product page ", ready: false });
  await act(async () => {});
  expect(current.regenerate).not.toHaveBeenCalled();
  current.rerender({ prompt: " Product page ", ready: true });
  await waitFor(() => expect(current.regenerate).toHaveBeenCalledOnce());
  expect(current.regenerate).toHaveBeenCalledWith("Product page");
  current.rerender({ prompt: "Updated prompt", ready: false });
  current.rerender({ prompt: "Updated prompt", ready: true });
  await act(async () => {});
  expect(current.regenerate).toHaveBeenCalledOnce();
  current.rerender({ prompt: "Updated prompt", ready: true, scope: "two" });
  await waitFor(() => expect(current.regenerate).toHaveBeenCalledTimes(2));
});

it("requires feature enablement, waits for idle, and runs again on a new editor load", async () => {
  const current = setup({ prompt: "Product", enabled: false });
  await act(async () => {});
  expect(current.regenerate).not.toHaveBeenCalled();
  current.rerender({ prompt: "Product", enabled: true, busy: true });
  await act(async () => {});
  expect(current.regenerate).not.toHaveBeenCalled();
  current.rerender({ prompt: "Product", enabled: true, busy: false });
  await waitFor(() => expect(current.regenerate).toHaveBeenCalledOnce());
  current.unmount();
  const reopened = setup({ prompt: "Product" });
  await waitFor(() => expect(reopened.regenerate).toHaveBeenCalledOnce());
});

it("does not launch after unmounting before its scheduled start", async () => {
  const current = setup({ prompt: "Product" });
  current.unmount();
  await act(async () => {});
  expect(current.regenerate).not.toHaveBeenCalled();
});
