import React from "react";
import { type Config } from "@puckeditor/core";
import { Editor } from "../editor/Editor.tsx";
import { TailwindConfig, ThemeConfig } from "../utils/themeResolver.ts";
import { StreamFields } from "../types/entityFields.ts";
import { VisualEditorProvider } from "../utils/VisualEditorProvider.tsx";

type LocalEditorEntity = {
  entityId: string;
  displayName: string;
  locales: string[];
};

type LocalEditorTemplateDefaults = {
  entityId?: string;
  locale?: string;
  defaultLayoutData?: unknown;
};

type LocalEditorManifestResponse = {
  templates: string[];
  entitiesByTemplate: Record<string, LocalEditorEntity[]>;
  templateDefaults: Record<string, LocalEditorTemplateDefaults>;
  defaults: {
    templateId?: string;
    entityId?: string;
    locale?: string;
  };
  diagnostics: string[];
  streamConfigPath: string;
  localDataPath: string;
};

type LocalEditorDocumentResponse = {
  document: Record<string, unknown> | null;
  entityFields: StreamFields;
  diagnostics: string[];
};

type LocalEditorSelection = {
  supportedTemplateIds: string[];
  activeEntities: LocalEditorEntity[];
  selectedTemplateId: string;
  selectedTemplateDefaults?: LocalEditorTemplateDefaults;
  selectedEntity?: LocalEditorEntity;
  selectedLocale: string;
};

type LocalEditorShellProps = {
  apiBasePath: string;
  routePath: string;
  componentRegistry: Record<string, Config<any>>;
  tailwindConfig: TailwindConfig;
  themeConfig?: ThemeConfig;
};

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
  const [manifest, setManifest] =
    React.useState<LocalEditorManifestResponse | null>(null);
  const [manifestError, setManifestError] = React.useState<string | null>(null);
  const [documentResponse, setDocumentResponse] =
    React.useState<LocalEditorDocumentResponse | null>(null);
  const [documentError, setDocumentError] = React.useState<string | null>(null);
  const [isManifestLoading, setIsManifestLoading] = React.useState(true);
  const [isDocumentLoading, setIsDocumentLoading] = React.useState(false);

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
          setDocumentError(toErrorMessage(error));
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

      <div style={shellStyles.controls}>
        <ControlGroup label="Template">
          <select
            value={selectedTemplateId}
            disabled={controlsDisabled}
            onChange={(event) => {
              updateSearchParam("templateId", event.target.value);
            }}
          >
            {activeTemplateOptions.map((templateId) => (
              <option key={templateId} value={templateId}>
                {templateId}
              </option>
            ))}
          </select>
        </ControlGroup>

        <ControlGroup label="Entity">
          <select
            value={selectedEntity?.entityId ?? ""}
            disabled={controlsDisabled}
            onChange={(event) => {
              updateSearchParam("entityId", event.target.value);
            }}
          >
            {activeEntities.map((entity) => (
              <option key={entity.entityId} value={entity.entityId}>
                {entity.displayName}
              </option>
            ))}
          </select>
        </ControlGroup>

        <ControlGroup label="Locale">
          <select
            value={selectedLocale}
            disabled={controlsDisabled || !selectedEntity?.locales.length}
            onChange={(event) => {
              updateSearchParam("locale", event.target.value);
            }}
          >
            {(selectedEntity?.locales ?? []).map((locale) => (
              <option key={locale} value={locale}>
                {locale}
              </option>
            ))}
          </select>
        </ControlGroup>
      </div>

      {manifestError && (
        <Notice title="Manifest Error" body={manifestError} tone="error" />
      )}

      {diagnostics.map((diagnostic) => (
        <Notice
          key={diagnostic}
          title="Setup Required"
          body={diagnostic}
          tone="warning"
        />
      ))}

      {!isManifestLoading &&
        !manifestError &&
        activeTemplateOptions.length === 0 && (
          <Notice
            title="No Supported Templates"
            body="The local editor could not find any generated Visual Editor templates that match the available component registry."
            tone="warning"
          />
        )}

      {!isManifestLoading && !manifestError && !hasAnyEntities && (
        <Notice
          title="No Snapshot Data"
          body={`No snapshot entities were found. Generate local data in ${manifest?.localDataPath ?? "localData"} and configure ${manifest?.streamConfigPath ?? "stream.config.ts"}.`}
          tone="warning"
        />
      )}

      {documentError && (
        <Notice title="Document Error" body={documentError} tone="error" />
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

const updateSearchParam = (key: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${searchParams.toString()}`
  );
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const buildLocalEditorSelection = (
  manifest: LocalEditorManifestResponse | null,
  componentRegistry: Record<string, Config<any>>,
  searchParams: URLSearchParams
): LocalEditorSelection => {
  const supportedTemplateIds = getSupportedTemplateIds(
    manifest,
    componentRegistry
  );
  const selectedTemplateId =
    pickPreferredValue(
      supportedTemplateIds,
      searchParams.get("templateId"),
      manifest?.defaults.templateId
    ) ?? "";
  const selectedTemplateDefaults = selectedTemplateId
    ? manifest?.templateDefaults[selectedTemplateId]
    : undefined;
  const activeEntities = selectedTemplateId
    ? (manifest?.entitiesByTemplate[selectedTemplateId] ?? [])
    : [];
  const selectedEntity =
    pickPreferredEntity(
      activeEntities,
      searchParams.get("entityId"),
      selectedTemplateDefaults?.entityId,
      manifest?.defaults.entityId
    ) ?? activeEntities[0];
  const selectedLocale =
    pickPreferredValue(
      selectedEntity?.locales ?? [],
      searchParams.get("locale"),
      selectedTemplateDefaults?.locale,
      manifest?.defaults.locale
    ) ?? "";

  return {
    supportedTemplateIds,
    activeEntities,
    selectedTemplateId,
    selectedTemplateDefaults,
    selectedEntity,
    selectedLocale,
  };
};

const getSupportedTemplateIds = (
  manifest: LocalEditorManifestResponse | null,
  componentRegistry: Record<string, Config<any>>
): string[] => {
  const availableTemplateIds = new Set(Object.keys(componentRegistry));
  return (manifest?.templates ?? []).filter((templateId) => {
    return availableTemplateIds.has(templateId);
  });
};

const syncSelectionToUrl = (
  selectedTemplateId: string,
  selectedEntity: LocalEditorEntity | undefined,
  selectedLocale: string
) => {
  if (typeof window === "undefined" || !selectedTemplateId) {
    return;
  }

  const nextSearchParams = new URLSearchParams(window.location.search);
  nextSearchParams.set("templateId", selectedTemplateId);

  if (selectedEntity?.entityId) {
    nextSearchParams.set("entityId", selectedEntity.entityId);
  } else {
    nextSearchParams.delete("entityId");
  }

  if (selectedLocale) {
    nextSearchParams.set("locale", selectedLocale);
  } else {
    nextSearchParams.delete("locale");
  }

  const nextRelativePath =
    nextSearchParams.toString().length > 0
      ? `${window.location.pathname}?${nextSearchParams.toString()}`
      : window.location.pathname;

  if (
    nextRelativePath !== `${window.location.pathname}${window.location.search}`
  ) {
    window.history.replaceState({}, "", nextRelativePath);
  }
};

const buildLocalEditorDocumentRequestPath = ({
  apiBasePath,
  templateId,
  entityId,
  locale,
}: {
  apiBasePath: string;
  templateId: string;
  entityId?: string;
  locale: string;
}): string | null => {
  if (!templateId || !entityId || !locale) {
    return null;
  }

  const documentParams = new URLSearchParams({
    templateId,
    entityId,
    locale,
  });
  return `${apiBasePath}/document?${documentParams.toString()}`;
};

const buildEditorLocalDevOptions = ({
  selectedTemplateId,
  selectedEntity,
  selectedLocale,
  selectedTemplateDefaults,
}: {
  selectedTemplateId: string;
  selectedEntity?: LocalEditorEntity;
  selectedLocale: string;
  selectedTemplateDefaults?: LocalEditorTemplateDefaults;
}) => {
  if (!selectedTemplateId) {
    return undefined;
  }

  return {
    templateId: selectedTemplateId,
    entityId: selectedEntity?.entityId,
    locale: selectedLocale,
    locales: selectedEntity?.locales ?? [],
    layoutScopeKey: `${selectedTemplateId}:${selectedLocale}`,
    initialLayoutData: selectedTemplateDefaults?.defaultLayoutData as
      | Record<string, unknown>
      | undefined,
    showOverrideButtons: false,
  };
};

const pickPreferredValue = (
  values: string[],
  ...candidates: Array<string | null | undefined>
): string | undefined => {
  for (const candidate of candidates) {
    const matchingValue = values.find((value) => value === candidate);
    if (matchingValue) {
      return matchingValue;
    }
  }

  return values[0];
};

const pickPreferredEntity = (
  entities: LocalEditorEntity[],
  ...entityIds: Array<string | null | undefined>
): LocalEditorEntity | undefined => {
  for (const entityId of entityIds) {
    const matchingEntity = entities.find(
      (entity) => entity.entityId === entityId
    );
    if (matchingEntity) {
      return matchingEntity;
    }
  }

  return entities[0];
};

const ControlGroup = ({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) => {
  return (
    <label style={shellStyles.controlGroup}>
      <span style={shellStyles.controlLabel}>{label}</span>
      {children}
    </label>
  );
};

const Notice = ({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "warning" | "error";
}) => {
  return (
    <div
      style={{
        ...shellStyles.notice,
        ...(tone === "error"
          ? shellStyles.errorNotice
          : shellStyles.warningNotice),
      }}
    >
      <strong>{title}</strong>
      <div>{body}</div>
    </div>
  );
};

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const shellStyles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f7f4ec 0%, #ffffff 100%)",
    color: "#1d1d1f",
    padding: "24px",
  } satisfies React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "16px",
  } satisfies React.CSSProperties,
  title: {
    margin: 0,
    fontSize: "28px",
  } satisfies React.CSSProperties,
  subtitle: {
    margin: "8px 0 0",
    color: "#555",
  } satisfies React.CSSProperties,
  route: {
    background: "#111",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "999px",
  } satisfies React.CSSProperties,
  controls: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    marginBottom: "16px",
  } satisfies React.CSSProperties,
  controlGroup: {
    display: "grid",
    gap: "6px",
    fontSize: "14px",
  } satisfies React.CSSProperties,
  controlLabel: {
    fontWeight: 600,
  } satisfies React.CSSProperties,
  notice: {
    borderRadius: "12px",
    padding: "12px 14px",
    marginBottom: "12px",
    border: "1px solid transparent",
  } satisfies React.CSSProperties,
  warningNotice: {
    background: "#fff8e8",
    borderColor: "#f4d58d",
  } satisfies React.CSSProperties,
  errorNotice: {
    background: "#fff1f0",
    borderColor: "#f2a8a2",
  } satisfies React.CSSProperties,
  editorFrame: {
    position: "relative",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e7dfd1",
    overflow: "hidden",
    minHeight: "720px",
  } satisfies React.CSSProperties,
  loadingOverlay: {
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
  } satisfies React.CSSProperties,
};
