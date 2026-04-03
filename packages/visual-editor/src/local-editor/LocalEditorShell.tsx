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
import { shellStyles } from "./styles.ts";
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
    <div style={shellStyles.page}>
      <div style={shellStyles.header}>
        <div>
          <h1 style={shellStyles.title}>Local Editor</h1>
          <p style={shellStyles.subtitle}>
            Switch templates, entities, and locales against local snapshot data.
          </p>
        </div>
        <code style={shellStyles.route}>{routePath}</code>
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
        <div style={shellStyles.editorFrame}>
          {isDocumentLoading && (
            <div style={shellStyles.loadingOverlay}>Loading document…</div>
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
