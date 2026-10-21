import React from "react";
import type { Config } from "@puckeditor/core";
import { getGenerationCatalog } from "../internal/generation/catalogRegistry.ts";
import type { GenerationEnvironment } from "../internal/generation/environment.ts";
import {
  createLocalGenerationDiagnostics,
  createLocalModelTransport,
} from "./generationTransport.ts";

/** Local model/locale settings come from Vite, not the selected preview entity. */
export const useLocalGenerationEnvironment = (
  api: string,
  layoutId: string,
  config: Config | undefined,
  enabled: boolean
) => {
  const [settings, setSettings] = React.useState<{
    layoutId: string;
    api: string;
    model: string;
    locales: string[];
  } | null>(null);
  React.useEffect(() => {
    if (!enabled || !layoutId) return;
    const controller = new AbortController();
    void fetch(`${api}/context?layoutId=${encodeURIComponent(layoutId)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Generation settings HTTP ${response.status}`);
        const context = await response.json();
        if (
          typeof context.model !== "string" ||
          !Array.isArray(context.locales) ||
          !context.locales.every((value: unknown) => typeof value === "string")
        )
          throw new Error("Invalid generation settings");
        if (!controller.signal.aborted)
          setSettings({ ...context, layoutId, api });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          console.error("Unable to load generation settings", error);
      });
    return () => controller.abort();
  }, [api, layoutId, enabled]);
  return React.useMemo<GenerationEnvironment | null>(
    () =>
      enabled &&
      config &&
      settings?.layoutId === layoutId &&
      settings.api === api
        ? {
            model: settings.model,
            locales: settings.locales,
            catalog: getGenerationCatalog(config),
            transport: createLocalModelTransport(api),
            diagnostics: createLocalGenerationDiagnostics(api, layoutId),
          }
        : null,
    [api, layoutId, config, settings, enabled]
  );
};
