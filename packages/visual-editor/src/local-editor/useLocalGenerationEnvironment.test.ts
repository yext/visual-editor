import {
  testPrompts,
  testGenerationSettings,
} from "../internal/layoutGeneration/testing/promptFixtures.ts";
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useLocalGenerationEnvironment } from "./useLocalGenerationEnvironment.ts";
import {
  createPuckGenerationCatalog,
  withGenerationCatalog,
} from "../utils/createPuckGenerationCatalog.ts";

const catalog = createPuckGenerationCatalog(
  {},
  { rootAllowedComponentIds: ["MainContent"] }
);
const config = withGenerationCatalog({ components: {} }, catalog);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("uses Vite's configured model and full locale union with the associated browser catalog", async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          prompts: testPrompts,
          generationSettings: testGenerationSettings,
          model: "local-model",
          locales: ["en", "fr", "es"],
        })
      )
  );
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderHook(() =>
    useLocalGenerationEnvironment("/generate", "layout", config, true)
  );
  await waitFor(() => expect(result.current).not.toBeNull());
  expect(result.current!.model).toBe("local-model");
  expect(result.current!.locales).toEqual(["en", "fr", "es"]);
  expect(result.current!.catalog).toBe(catalog);
  expect(result.current!.generationSettings).toEqual(testGenerationSettings);
  expect(fetchMock).toHaveBeenCalledWith(
    "/generate/context?layoutId=layout",
    expect.objectContaining({ signal: expect.any(AbortSignal) })
  );
});
it("does not load settings while disabled and invalidates them on layout changes", async () => {
  let resolve!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Promise<Response>((yes) => {
          resolve = yes;
        })
    )
  );
  const { result, rerender } = renderHook(
    ({ enabled, layoutId }) =>
      useLocalGenerationEnvironment("/generate", layoutId, config, enabled),
    { initialProps: { enabled: false, layoutId: "first" } }
  );
  expect(fetch).not.toHaveBeenCalled();
  rerender({ enabled: true, layoutId: "first" });
  await act(async () => {
    resolve(
      new Response(
        JSON.stringify({
          prompts: testPrompts,
          generationSettings: testGenerationSettings,
          model: "local",
          locales: ["en"],
        })
      )
    );
  });
  expect(result.current?.model).toBe("local");
  rerender({ enabled: true, layoutId: "second" });
  expect(result.current).toBeNull();
});

it("disposes the host on scope changes and Strict Mode remounts", async () => {
  const listeners = new Set<EventListenerOrEventListenerObject>();
  const add = window.addEventListener.bind(window);
  const remove = window.removeEventListener.bind(window);
  vi.spyOn(window, "addEventListener").mockImplementation(
    (type, listener, options) => {
      if (type === "message") listeners.add(listener);
      add(type, listener, options);
    }
  );
  vi.spyOn(window, "removeEventListener").mockImplementation(
    (type, listener, options) => {
      if (type === "message") listeners.delete(listener);
      remove(type, listener, options);
    }
  );
  const signals: AbortSignal[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: unknown, options?: RequestInit) => {
      if (options?.method === "POST") {
        signals.push(options.signal as AbortSignal);
        return new Promise<Response>((_resolve, reject) =>
          options.signal!.addEventListener(
            "abort",
            () => reject(options.signal!.reason),
            { once: true }
          )
        );
      }
      return new Response(
        JSON.stringify({
          prompts: testPrompts,
          generationSettings: testGenerationSettings,
          model: "test",
          locales: ["en"],
        })
      );
    })
  );
  const { result, rerender, unmount } = renderHook(
    ({ api, layoutId, enabled }) =>
      useLocalGenerationEnvironment(api, layoutId, config, enabled),
    {
      initialProps: { api: "/generate", layoutId: "one", enabled: true },
      wrapper: ({ children }) =>
        React.createElement(React.StrictMode, null, children),
    }
  );
  await waitFor(() => expect(result.current).not.toBeNull());
  expect(listeners.size).toBe(1);
  const { generationRequestFixture } =
    await import("../internal/layoutGeneration/testing/iframeFixtures.ts");
  const start = () =>
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window,
        origin: window.location.origin,
        data: generationRequestFixture,
      })
    );
  start();
  rerender({ api: "/generate", layoutId: "two", enabled: true });
  expect(signals[0].aborted).toBe(true);
  await waitFor(() => expect(result.current).not.toBeNull());
  start();
  rerender({ api: "/other", layoutId: "two", enabled: true });
  expect(signals[1].aborted).toBe(true);
  await waitFor(() => expect(result.current).not.toBeNull());
  start();
  rerender({ api: "/other", layoutId: "two", enabled: false });
  expect(signals[2].aborted).toBe(true);
  expect(listeners.size).toBe(0);
  expect(result.current).toBeNull();
  rerender({ api: "/other", layoutId: "two", enabled: true });
  await waitFor(() => expect(result.current).not.toBeNull());
  start();
  unmount();
  expect(signals[3].aborted).toBe(true);
  expect(listeners.size).toBe(0);
});

it.each([null, { ...testPrompts, contractVersion: 999 }])(
  "keeps generation disabled when the Vite context has no compatible prompts",
  async (prompts) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ model: "test", locales: ["en"], prompts })
          )
      )
    );
    const { result } = renderHook(() =>
      useLocalGenerationEnvironment("/generate", "layout", config, true)
    );
    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(result.current).toBeNull();
  }
);

it.each([undefined, { ...testGenerationSettings, attemptTimeoutMs: 0 }])(
  "keeps local AI disabled for missing or invalid settings in the Vite context",
  async (generationSettings) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              model: "test",
              locales: ["en"],
              prompts: testPrompts,
              generationSettings,
            })
          )
      )
    );
    const { result } = renderHook(() =>
      useLocalGenerationEnvironment("/generate", "layout", config, true)
    );
    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(result.current).toBeNull();
  }
);
