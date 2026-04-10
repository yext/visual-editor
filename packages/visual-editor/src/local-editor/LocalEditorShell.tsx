import React from "react";
import { Editor } from "../editor/Editor.tsx";
import { VisualEditorProvider } from "../utils/VisualEditorProvider.tsx";
import { LocalEditorControls } from "./LocalEditorControls.tsx";
import { LocalEditorNotice } from "./LocalEditorNotice.tsx";
import {
  buildEditorLocalDevOptions,
  buildLocalEditorDocumentRequestPath,
  buildLocalEditorSelection,
  syncSelectionToUrl,
  updateSearchParam,
} from "./selection.ts";
import type { LocalEditorShellProps } from "./types.ts";
import { useLocalEditorDocument } from "./useLocalEditorDocument.ts";
import { useLocalEditorManifest } from "./useLocalEditorManifest.ts";

export const LocalEditorShell = ({
  apiBasePath,
  routePath,
  componentRegistry,
  tailwindConfig,
  themeConfig,
}: LocalEditorShellProps) => {
  const [locationSearch, setLocationSearch] = React.useState(() => {
    return typeof window === "undefined" ? "" : window.location.search;
  });
  const { isManifestLoading, manifest, manifestError } =
    useLocalEditorManifest(apiBasePath);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      setLocationSearch(window.location.search);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const searchParams = React.useMemo(() => {
    return new URLSearchParams(locationSearch);
  }, [locationSearch]);

  const {
    supportedTemplateIds,
    activeEntities,
    selectedTemplateId,
    selectedTemplateDefaults,
    selectedEntity,
    selectedLocale,
  } = React.useMemo(() => {
    return buildLocalEditorSelection(manifest, componentRegistry, searchParams);
  }, [componentRegistry, manifest, searchParams]);

  React.useEffect(() => {
    syncSelectionToUrl(selectedTemplateId, selectedEntity, selectedLocale);
  }, [selectedEntity?.entityId, selectedLocale, selectedTemplateId]);

  const documentRequestPath = React.useMemo(() => {
    return buildLocalEditorDocumentRequestPath({
      apiBasePath,
      templateId: selectedTemplateId,
      entityId: selectedEntity?.entityId,
      locale: selectedLocale,
    });
  }, [
    apiBasePath,
    selectedEntity?.entityId,
    selectedLocale,
    selectedTemplateId,
  ]);
  const { documentError, documentResponse, isDocumentLoading } =
    useLocalEditorDocument(documentRequestPath);

  const diagnostics = React.useMemo(() => {
    return [
      ...(manifest?.diagnostics ?? []),
      ...(documentResponse?.diagnostics ?? []),
    ];
  }, [documentResponse?.diagnostics, manifest?.diagnostics]);

  const activeTemplateOptions = supportedTemplateIds;
  const hasAnyEntities = React.useMemo(() => {
    return Object.values(manifest?.entitiesByTemplate ?? {}).some(
      (entities) => {
        return entities.length > 0;
      }
    );
  }, [manifest?.entitiesByTemplate]);
  const controlsDisabled = isManifestLoading || !activeTemplateOptions.length;
  const editorKey = `${selectedTemplateId}:${selectedLocale}`;
  const shouldRenderEditorFrame =
    isDocumentLoading || (!!documentResponse?.document && !!selectedTemplateId);
  const editorLocalDevOptions = React.useMemo(() => {
    return buildEditorLocalDevOptions({
      selectedTemplateId,
      selectedEntity,
      selectedLocale,
      selectedTemplateDefaults,
    });
  }, [
    selectedEntity,
    selectedLocale,
    selectedTemplateDefaults,
    selectedTemplateId,
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7f4ec 0%, #ffffff 100%)",
        color: "#1d1d1f",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>Local Editor</h1>
          <p style={{ margin: "8px 0 0", color: "#555" }}>
            Switch templates, entities, and locales against local snapshot data.
          </p>
        </div>
        <code
          style={{
            background: "#111",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "999px",
          }}
        >
          {routePath}
        </code>
      </div>

      <LocalEditorControls
        activeEntities={activeEntities}
        activeTemplateOptions={activeTemplateOptions}
        controlsDisabled={controlsDisabled}
        selectedEntityId={selectedEntity?.entityId}
        selectedLocale={selectedLocale}
        selectedTemplateId={selectedTemplateId}
        onEntityChange={(entityId) => {
          updateSearchParam("entityId", entityId);
        }}
        onLocaleChange={(locale) => {
          updateSearchParam("locale", locale);
        }}
        onTemplateChange={(templateId) => {
          updateSearchParam("templateId", templateId);
        }}
      />

      {manifestError && (
        <LocalEditorNotice
          title="Manifest Error"
          body={manifestError}
          tone="error"
        />
      )}

      {diagnostics.map((diagnostic) => (
        <LocalEditorNotice
          key={diagnostic}
          title="Setup Required"
          body={diagnostic}
          tone="warning"
        />
      ))}

      {!isManifestLoading &&
        !manifestError &&
        activeTemplateOptions.length === 0 && (
          <LocalEditorNotice
            title="No Supported Templates"
            body="The local editor could not find any generated Visual Editor templates that match the available component registry."
            tone="warning"
          />
        )}

      {!isManifestLoading && !manifestError && !hasAnyEntities && (
        <LocalEditorNotice
          title="No Snapshot Data"
          body={`No snapshot entities were found. Generate local data in ${manifest?.localDataPath ?? "localData"} and configure ${manifest?.streamConfigPath ?? "stream.config.ts"}.`}
          tone="warning"
        />
      )}

      {documentError && (
        <LocalEditorNotice
          title="Document Error"
          body={documentError}
          tone="error"
        />
      )}

      {shouldRenderEditorFrame && (
        <div
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #e7dfd1",
            overflow: "hidden",
            minHeight: "720px",
          }}
        >
          {isDocumentLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(2px)",
                zIndex: 1,
                fontWeight: 600,
                color: "#5f5b52",
              }}
            >
              Loading document…
            </div>
          )}
          {documentResponse?.document && selectedTemplateId && (
            <VisualEditorProvider
              templateProps={{ document: documentResponse.document }}
              entityFields={documentResponse.entityFields}
              tailwindConfig={tailwindConfig}
            >
              <Editor
                key={editorKey}
                document={documentResponse.document}
                componentRegistry={componentRegistry}
                themeConfig={themeConfig}
                localDev={true}
                localDevOptions={editorLocalDevOptions}
              />
            </VisualEditorProvider>
          )}
        </div>
      )}
    </div>
  );
};
