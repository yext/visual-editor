import React from "react";
import type { LocalEditorDocumentResponse } from "./types.ts";

export const useLocalEditorDocument = (documentRequestPath: string | null) => {
  const [documentResponse, setDocumentResponse] =
    React.useState<LocalEditorDocumentResponse | null>(null);
  const [documentError, setDocumentError] = React.useState<string | null>(null);
  const [isDocumentLoading, setIsDocumentLoading] = React.useState(false);

  React.useEffect(() => {
    let isCurrent = true;

    const loadDocument = async () => {
      if (!documentRequestPath) {
        setDocumentResponse(null);
        setDocumentError(null);
        setIsDocumentLoading(false);
        return;
      }

      setIsDocumentLoading(true);
      setDocumentError(null);

      try {
        const response = await fetch(documentRequestPath);
        if (!response.ok) {
          throw new Error(`Failed to load document (${response.status})`);
        }

        const payload = (await response.json()) as LocalEditorDocumentResponse;
        if (isCurrent) {
          setDocumentResponse(payload);
        }
      } catch (error) {
        if (isCurrent) {
          setDocumentError(
            error instanceof Error ? error.message : String(error)
          );
        }
      } finally {
        if (isCurrent) {
          setIsDocumentLoading(false);
        }
      }
    };

    void loadDocument();

    return () => {
      isCurrent = false;
    };
  }, [documentRequestPath]);

  return {
    documentError,
    documentResponse,
    isDocumentLoading,
  };
};
