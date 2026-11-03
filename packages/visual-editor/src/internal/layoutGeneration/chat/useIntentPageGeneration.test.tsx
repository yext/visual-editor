import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type {
  TemplateMetadata,
  IntentPageGeneration,
} from "../../types/templateMetadata.ts";
import { useIntentPageGeneration } from "./useIntentPageGeneration.ts";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const setup = (
  initial: {
    generation?: IntentPageGeneration;
    ready?: boolean;
    enabled?: boolean;
    scope?: string;
  } = {}
) => {
  const generateIntent = vi.fn(async () => false);
  const cancel = vi.fn();
  const send = vi
    .spyOn(window.parent, "postMessage")
    .mockImplementation(() => {});
  const hook = renderHook(
    ({ generation, ready = true, enabled = true, scope = "one" }) =>
      useIntentPageGeneration(
        { generateIntent, cancel, ready, isStreaming: false },
        {
          layoutId: "layout",
          assignment: "ALL",
          aiPageGeneration: {
            model: "model",
            layoutGenerationEnabled: enabled,
            intentPageGeneration: generation,
          },
        } as TemplateMetadata,
        scope,
        enabled
      ),
    { initialProps: initial, wrapper: React.StrictMode }
  );
  const requests = () => [
    ...new Map(
      send.mock.calls
        .map(([message]) => message)
        .filter((message) => message.type === "updateIntentPageGeneration")
        .map((message) => [message.payload.attemptId, message])
    ).values(),
  ];
  return { ...hook, generateIntent, send, requests };
};

it("waits for late metadata and canvas readiness, deduplicating repeated PENDING metadata and effect replay", async () => {
  const c = setup({ ready: false });
  await act(async () => {});
  expect(c.send).not.toHaveBeenCalled();
  const generation = { prompt: "Prompt", status: "PENDING" as const };
  c.rerender({ generation, ready: false });
  expect(c.send).not.toHaveBeenCalled();
  c.rerender({ generation, ready: true });
  await waitFor(() => expect(c.requests()).toHaveLength(1));
  c.rerender({ generation: { ...generation }, ready: true });
  await act(async () => {});
  expect(c.requests()).toHaveLength(1);
  expect(c.generateIntent).not.toHaveBeenCalled();
});

it.each([undefined, "RUNNING", "FAILED", "COMPLETED"] as const)(
  "never automatically starts status %s",
  async (status) => {
    const c = setup({
      generation: status ? { status, prompt: "Prompt" } : undefined,
    });
    await act(async () => {});
    expect(c.send).not.toHaveBeenCalled();
  }
);

it("does not start when disabled or after unmount before the scheduled start", async () => {
  const generation = { prompt: "Prompt", status: "PENDING" as const };
  const c = setup({ generation, enabled: false });
  await act(async () => {});
  expect(c.send).not.toHaveBeenCalled();
  c.unmount();
  const next = setup({ generation });
  next.unmount();
  await act(async () => {});
  expect(next.send).not.toHaveBeenCalled();
});

it("treats RUNNING as unowned after iframe reload and deduplicates repeated metadata", async () => {
  const generation = {
    prompt: "Prompt",
    status: "RUNNING" as const,
    attemptId: "old",
  };
  const c = setup({ generation });
  expect(c.result.current.state.stage).toBe("interrupted");
  c.rerender({ generation: { ...generation } });
  await act(async () => {});
  expect(c.result.current.workflow.canRestart).toBe(true);
  expect(c.send).not.toHaveBeenCalled();
  c.unmount();
  const reloaded = setup({ generation });
  expect(reloaded.result.current.state.stage).toBe("interrupted");
  expect(reloaded.result.current.workflow.canRestart).toBe(true);
  expect(reloaded.generateIntent).not.toHaveBeenCalled();
});
