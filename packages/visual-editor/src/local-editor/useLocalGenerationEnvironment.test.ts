import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useLocalGenerationEnvironment } from "./useLocalGenerationEnvironment.ts";
import { createPuckGenerationCatalog } from "../utils/generationCatalog.ts";
import { withGenerationCatalog } from "../utils/generationCatalogRegistry.ts";

const catalog = createPuckGenerationCatalog(
  {},
  { rootAllowedComponentIds: ["MainContent"] }
);
const config = withGenerationCatalog({ components: {} }, catalog);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("uses Vite's configured model and full locale union with the associated browser catalog", async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(
        JSON.stringify({ model: "local-model", locales: ["en", "fr", "es"] })
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
    resolve(new Response(JSON.stringify({ model: "local", locales: ["en"] })));
  });
  expect(result.current?.model).toBe("local");
  rerender({ enabled: true, layoutId: "second" });
  expect(result.current).toBeNull();
});
