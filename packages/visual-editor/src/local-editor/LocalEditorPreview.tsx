import { type Config, type Data, resolveAllData } from "@puckeditor/core";
import * as lzstring from "lz-string";
import React from "react";
import { migrationRegistry } from "../components/migrations/migrationRegistry.ts";
import { VisualEditorRender } from "../editor/VisualEditorRender.tsx";
import type { LocalDevOptions } from "../editor/types.ts";
import type { ThemeData } from "../internal/types/themeData.ts";
import { updateThemeInEditor } from "../utils/applyTheme.ts";
import { migrate } from "../utils/migrate.ts";
import type { TailwindConfig, ThemeConfig } from "../utils/themeResolver.ts";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";
import { VisualEditorProvider } from "../utils/VisualEditorProvider.tsx";
import type { LocalEditorDocumentResponse } from "./types.ts";

type LocalEditorPreviewProps = {
  config: Config;
  defaultLayoutData?: unknown;
  document: Record<string, unknown>;
  entityFields: LocalEditorDocumentResponse["entityFields"];
  localDevOptions: LocalDevOptions;
  onClose: () => void;
  tailwindConfig: TailwindConfig;
  themeConfig?: ThemeConfig;
};

type PreviewState = {
  data: Data;
};

type PreviewData = {
  layoutData: Data;
  themeData?: ThemeData;
};

const EMPTY_LAYOUT_DATA: Data = {
  root: {},
  content: [],
  zones: {},
};

export const LocalEditorPreview = ({
  config,
  defaultLayoutData,
  document,
  entityFields,
  localDevOptions,
  onClose,
  tailwindConfig,
  themeConfig,
}: LocalEditorPreviewProps) => {
  const [previewState, setPreviewState] = React.useState<PreviewState | null>(
    null
  );
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  React.useEffect(() => {
    let isCurrent = true;

    const loadPreview = async () => {
      setPreviewState(null);
      setPreviewError(null);

      try {
        const { layoutData, themeData } = readLocalEditorPreviewData({
          defaultLayoutData,
          localDevOptions,
        });
        const streamDocument = document as StreamDocument;
        const migratedLayoutData = migrate(
          cloneLayoutData(layoutData),
          migrationRegistry,
          config,
          streamDocument
        );
        const resolvedLayoutData = await resolveAllData(
          migratedLayoutData,
          config,
          { streamDocument }
        );

        if (!isCurrent) {
          return;
        }

        if (themeConfig) {
          await updateThemeInEditor(
            themeData ?? {},
            themeConfig,
            {},
            migratedLayoutData
          );
        }

        if (isCurrent) {
          setPreviewState({
            data: resolvedLayoutData,
          });
        }
      } catch (error) {
        if (isCurrent) {
          setPreviewError(
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    };

    void loadPreview();
    return () => {
      isCurrent = false;
    };
  }, [config, defaultLayoutData, document, localDevOptions, themeConfig]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        minHeight: "100vh",
        overflow: "auto",
        background: "#fff",
        color: "#1d1d1f",
      }}
    >
      <style>{`
        .visual-editor-local-preview-close {
          transform: translateX(calc(100% - 24px));
          transition: transform 160ms ease;
        }

        .visual-editor-local-preview-close:hover,
        .visual-editor-local-preview-close:focus-visible {
          transform: translateX(0);
        }
      `}</style>
      <button
        className="visual-editor-local-preview-close"
        type="button"
        onClick={onClose}
        style={{
          position: "fixed",
          top: "16px",
          right: 0,
          zIndex: 1,
          appearance: "none",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "999px 0 0 999px",
          background: "rgba(17, 17, 17, 0.88)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
          color: "#fff",
          cursor: "pointer",
          font: "inherit",
          fontWeight: 600,
          padding: "8px 14px 8px 9px",
        }}
      >
        <span aria-hidden="true" style={{ marginRight: "8px" }}>
          ‹
        </span>
        Close Preview
      </button>

      {previewError ? (
        <PreviewStatus title="Unable to open preview" body={previewError} />
      ) : !previewState ? (
        <PreviewStatus title="Loading preview…" />
      ) : (
        <VisualEditorProvider
          templateProps={{ document }}
          entityFields={entityFields}
          tailwindConfig={tailwindConfig}
        >
          <VisualEditorRender
            config={config}
            data={previewState.data}
            metadata={{ streamDocument: document }}
          />
        </VisualEditorProvider>
      )}
    </div>
  );
};

const PreviewStatus = ({ title, body }: { title: string; body?: string }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "24px" }}>{title}</h1>
        {body && <p style={{ color: "#666", margin: "12px 0 0" }}>{body}</p>}
      </div>
    </div>
  );
};

const readLocalEditorPreviewData = ({
  defaultLayoutData,
  localDevOptions,
}: {
  defaultLayoutData?: unknown;
  localDevOptions: LocalDevOptions;
}): PreviewData => {
  const storedLayoutData = readLatestStoredData<
    { state?: { data?: Data } },
    Data
  >(buildLayoutStorageKey(localDevOptions), (history) => history.state?.data);
  const storedThemeData = readLatestStoredData<{ data?: ThemeData }, ThemeData>(
    buildThemeStorageKey(localDevOptions),
    (history) => history.data
  );

  return {
    layoutData:
      storedLayoutData ??
      readDefaultLayoutData(defaultLayoutData) ??
      EMPTY_LAYOUT_DATA,
    themeData: storedThemeData,
  };
};

const readLatestStoredData = <THistory, TData>(
  storageKey: string | undefined,
  selectData: (history: THistory) => TData | undefined
): TData | undefined => {
  if (typeof window === "undefined" || !storageKey) {
    return undefined;
  }

  try {
    const compressedHistories = window.localStorage.getItem(storageKey);
    if (!compressedHistories) {
      return undefined;
    }

    const decompressedHistories = lzstring.decompress(compressedHistories);
    if (!decompressedHistories) {
      return undefined;
    }

    const histories = JSON.parse(decompressedHistories) as THistory[];
    return histories
      .slice()
      .reverse()
      .map(selectData)
      .find((data) => data !== undefined);
  } catch (error) {
    console.warn(
      `Failed to read local editor preview data from ${storageKey}.`,
      error
    );
    return undefined;
  }
};

const readDefaultLayoutData = (
  defaultLayoutData: unknown
): Data | undefined => {
  if (
    typeof defaultLayoutData !== "object" ||
    defaultLayoutData === null ||
    Array.isArray(defaultLayoutData)
  ) {
    return undefined;
  }

  return defaultLayoutData as Data;
};

const cloneLayoutData = (layoutData: Data): Data => {
  return JSON.parse(JSON.stringify(layoutData)) as Data;
};

const buildLayoutStorageKey = (
  localDevOptions: LocalDevOptions
): string | undefined => {
  if (!localDevOptions.templateId || !localDevOptions.layoutScopeKey) {
    return undefined;
  }

  return `devTEMPLATE_${localDevOptions.templateId}LAYOUT_${hashCode(
    localDevOptions.layoutScopeKey
  )}`;
};

const buildThemeStorageKey = (
  localDevOptions: LocalDevOptions
): string | undefined => {
  if (!localDevOptions.themeScopeKey) {
    return undefined;
  }

  return `devSITE_1337THEME_${hashCode(localDevOptions.themeScopeKey)}`;
};

const hashCode = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    const characterCode = value.charCodeAt(index);
    hash = (hash << 5) - hash + characterCode;
    hash |= 0;
  }

  return Math.abs(hash);
};
