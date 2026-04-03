import React from "react";
import type { LocalEditorManifestResponse } from "./types.ts";
import { toErrorMessage } from "./utils.ts";

export const useLocalEditorManifest = (apiBasePath: string) => {
  const [manifest, setManifest] =
    React.useState<LocalEditorManifestResponse | null>(null);
  const [manifestError, setManifestError] = React.useState<string | null>(null);
  const [isManifestLoading, setIsManifestLoading] = React.useState(true);

  React.useEffect(() => {
    let isCurrent = true;

    const loadManifest = async () => {
      setIsManifestLoading(true);
      setManifestError(null);
      try {
        const response = await fetch(`${apiBasePath}/manifest`);
        if (!response.ok) {
          throw new Error(`Failed to load manifest (${response.status})`);
        }

        const payload = (await response.json()) as LocalEditorManifestResponse;
        if (isCurrent) {
          setManifest(payload);
        }
      } catch (error) {
        if (isCurrent) {
          setManifestError(toErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsManifestLoading(false);
        }
      }
    };

    void loadManifest();

    return () => {
      isCurrent = false;
    };
  }, [apiBasePath]);

  return {
    isManifestLoading,
    manifest,
    manifestError,
  };
};
