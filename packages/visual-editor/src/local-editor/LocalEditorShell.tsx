import type { Config } from "@puckeditor/core";
import React from "react";
import { Editor } from "../editor/Editor.tsx";
import type { LocalDevOptions } from "../editor/types.ts";
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
import type {
  LocalEditorDocumentResponse,
  LocalEditorShellProps,
} from "./types.ts";
import { LocalEditorPreview } from "./LocalEditorPreview.tsx";
import { useLocalEditorDocument } from "./useLocalEditorDocument.ts";
import { useLocalEditorManifest } from "./useLocalEditorManifest.ts";
import { StreamDocument } from "../utils/types/StreamDocument.ts";

const LOCAL_EDITOR_MAPBOX_KEY_STORAGE_KEY =
  "visual-editor.local-editor.mapbox-key";
const LOCAL_EDITOR_NEARBY_LOCATIONS_KEY_STORAGE_KEY =
  "visual-editor.local-editor.nearby-locations-key";
const LOCAL_EDITOR_PUCK_AI_KEY_STORAGE_KEY =
  "visual-editor.local-editor.puck-api-key";
const LOCAL_EDITOR_PREVIEW_OPEN_STORAGE_KEY =
  "visual-editor.local-editor.preview-open";

const TEST_REVIEWS_AGG = [
  {
    publisher: "FIRSTPARTY",
    averageRating: 4.1,
    reviewCount: 4,
    topReviews: [
      {
        authorName: "Jordan Lee",
        rating: 5,
        reviewDate: "2026-06-12",
        content:
          "Fast service, friendly staff, and the food was fresh. This is my go-to lunch spot.",
      },
      {
        authorName: "Maya Patel",
        rating: 3.5,
        reviewDate: "2026-05-28",
        content:
          "Ordering was easy and everything was ready right on time. The team was great.",
      },
      {
        authorName: "Chris Morgan",
        rating: 4,
        reviewDate: "2026-05-03",
        content:
          "We stumbled upon this place by accident, and it turned out to be a fantastic find. The atmosphere was incredibly warm and welcoming, making us feel right at home. We ordered a mix of dishes, and everything was fresh, flavorful, and beautifully presented. Service was prompt, and the staff was genuinely attentive without being intrusive. Highly recommend checking it out!",
      },
      {
        authorName: "Alex Geoffrey",
        rating: 4,
        reviewDate: "2025-11-11",
        content:
          "Great food, fast service, and a cozy atmosphere. Will definitely come back!",
      },
    ],
  },
];

export const LocalEditorShell = ({
  apiBasePath,
  routePath,
  componentRegistry,
  tailwindConfig,
  themeConfig,
}: LocalEditorShellProps) => {
  const [previewContext, setPreviewContext] = React.useState<{
    config: Config;
    defaultLayoutData?: unknown;
    streamDocument: StreamDocument;
    entityFields: LocalEditorDocumentResponse["entityFields"];
    localDevOptions: LocalDevOptions;
  } | null>(null);
  const [shouldOpenPreview, setShouldOpenPreview] = React.useState(false);
  const [locationSearch, setLocationSearch] = React.useState(() => {
    return typeof window === "undefined" ? "" : window.location.search;
  });
  const [mapboxKey, setMapboxKey] = React.useState<string | undefined>();
  const [nearbyLocationsKey, setNearbyLocationsKey] = React.useState<
    string | undefined
  >();
  const [puckAiKey, setPuckAiKey] = React.useState<string | undefined>();
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

  React.useEffect(() => {
    setShouldOpenPreview(readPreviewOpenState());
    setMapboxKey(readLocalStorageValue(LOCAL_EDITOR_MAPBOX_KEY_STORAGE_KEY));
    setNearbyLocationsKey(
      readLocalStorageValue(LOCAL_EDITOR_NEARBY_LOCATIONS_KEY_STORAGE_KEY)
    );
    setPuckAiKey(readLocalStorageValue(LOCAL_EDITOR_PUCK_AI_KEY_STORAGE_KEY));
  }, []);

  const searchParams = React.useMemo(() => {
    return new URLSearchParams(locationSearch);
  }, [locationSearch]);
  const showReviewsData = searchParams.get("reviews") !== "0";

  const {
    supportedTemplateIds,
    activeEntities,
    selectedTemplateId,
    selectedTemplateDefaults,
    selectedEntity,
    selectedLocale,
    selectedMode,
  } = React.useMemo(() => {
    return buildLocalEditorSelection(manifest, componentRegistry, searchParams);
  }, [componentRegistry, manifest, searchParams]);

  React.useEffect(() => {
    syncSelectionToUrl(
      selectedTemplateId,
      selectedEntity,
      selectedLocale,
      selectedMode
    );
  }, [
    selectedEntity?.entityId,
    selectedLocale,
    selectedMode,
    selectedTemplateId,
  ]);

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
  const editorKey = `${selectedTemplateId}:${selectedLocale}:${selectedMode}`;
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
  const activeConfig = componentRegistry[selectedTemplateId];

  // Inject reviews, mapbox, and/or nearby locations testing data into the streamDocument, if enabled
  const streamDocument = React.useMemo(() => {
    const baseDocument = documentResponse?.document;
    if (!baseDocument) {
      return baseDocument;
    }

    let nextDocument = baseDocument;

    // If reviews are enabled and reviews are on the document, show those reviews
    // If reviews are enabled and reviews are not on the document, show fake reviews for testing
    // If reviews are disabled, remove all reviews from the document
    if (showReviewsData) {
      if (!("ref_reviewsAgg" in nextDocument)) {
        nextDocument = {
          ...nextDocument,
          ref_reviewsAgg: TEST_REVIEWS_AGG,
        };
      }
    } else if ("ref_reviewsAgg" in nextDocument) {
      const { ref_reviewsAgg: _refReviewsAgg, ...documentWithoutReviews } =
        nextDocument;
      nextDocument = documentWithoutReviews;
    }

    // If a mapbox key is provided, add it to the document
    if (typeof mapboxKey === "string") {
      const currentEnv =
        "_env" in nextDocument &&
        nextDocument._env &&
        typeof nextDocument._env === "object"
          ? (nextDocument._env as Record<string, unknown>)
          : undefined;

      if (currentEnv?.YEXT_MAPBOX_API_KEY !== mapboxKey) {
        nextDocument = {
          ...nextDocument,
          _env: {
            ...currentEnv,
            YEXT_MAPBOX_API_KEY: mapboxKey,
          },
        };
      }
    }

    // If a nearby locations key is provided, set up the corresponding configuration
    // Uses nearby locations from https://www.yext.com/s/4174974/yextsites/155048/editor#pageSetId=locations
    // The key must be for the content endpoint from that site
    if (typeof nearbyLocationsKey === "string") {
      const currentEnv =
        "_env" in nextDocument &&
        nextDocument._env &&
        typeof nextDocument._env === "object"
          ? (nextDocument._env as Record<string, unknown>)
          : undefined;

      nextDocument = {
        ...nextDocument,
        businessId: "4174974",
        __: {
          isPrimaryLocale: true,
        },
        _env: {
          ...currentEnv,
          YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: nearbyLocationsKey,
        },
        _pageset: JSON.stringify({
          config: {
            contentEndpointId: "locationsContent",
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
        yextDisplayCoordinate: {
          latitude: 38.895546,
          longitude: -77.069915,
        },
        _yext: { contentDeliveryAPIDomain: "https://cdn.yextapis.com" },
      };
    }

    return nextDocument;
  }, [
    documentResponse?.document,
    mapboxKey,
    nearbyLocationsKey,
    showReviewsData,
  ]);

  const handleApiKeyUpdate = React.useCallback(
    (
      promptText: string,
      currentValue: string | undefined,
      storageKey: string,
      setApiKey: React.Dispatch<string | undefined>
    ) => {
      const nextValue = window.prompt(promptText, currentValue);

      if (nextValue === null) {
        return;
      }

      const trimmedValue = nextValue.trim();
      if (!trimmedValue) {
        window.localStorage.removeItem(storageKey);
        setApiKey(undefined);
        return;
      }

      window.localStorage.setItem(storageKey, trimmedValue);
      setApiKey(trimmedValue);
    },
    [mapboxKey, nearbyLocationsKey]
  );
  const canOpenPreview =
    !isDocumentLoading &&
    !!activeConfig &&
    !!streamDocument &&
    !!documentResponse &&
    !!editorLocalDevOptions;

  const openPreview = React.useCallback(() => {
    if (
      !canOpenPreview ||
      !activeConfig ||
      !streamDocument ||
      !documentResponse ||
      !editorLocalDevOptions
    ) {
      return;
    }

    writePreviewOpenState(true);
    setShouldOpenPreview(true);
    setPreviewContext({
      config: activeConfig,
      defaultLayoutData: selectedTemplateDefaults?.defaultLayoutData,
      streamDocument,
      entityFields: documentResponse.entityFields,
      localDevOptions: editorLocalDevOptions,
    });
  }, [
    activeConfig,
    canOpenPreview,
    documentResponse,
    editorLocalDevOptions,
    selectedTemplateDefaults?.defaultLayoutData,
    streamDocument,
  ]);

  React.useEffect(() => {
    if (shouldOpenPreview && !previewContext) {
      openPreview();
    }
  }, [openPreview, previewContext, shouldOpenPreview]);

  const closePreview = React.useCallback(() => {
    writePreviewOpenState(false);
    setShouldOpenPreview(false);
    setPreviewContext(null);
  }, []);

  return (
    <>
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
              Switch templates, entities, and locales against local snapshot
              data.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <EditorShellButton
              onClick={() => {
                handleApiKeyUpdate(
                  "Enter Mapbox key",
                  mapboxKey,
                  LOCAL_EDITOR_MAPBOX_KEY_STORAGE_KEY,
                  setMapboxKey
                );
              }}
            >
              {mapboxKey ? "Update Mapbox Key" : "Add Mapbox Key"}
            </EditorShellButton>
            <EditorShellButton
              onClick={() => {
                handleApiKeyUpdate(
                  "Yext API Key",
                  nearbyLocationsKey,
                  LOCAL_EDITOR_NEARBY_LOCATIONS_KEY_STORAGE_KEY,
                  setNearbyLocationsKey
                );
              }}
            >
              {nearbyLocationsKey
                ? "Update Nearby Locations Key"
                : "Add Nearby Locations Key"}
            </EditorShellButton>
            <EditorShellButton
              onClick={() => {
                handleApiKeyUpdate(
                  "Enter Puck API Key",
                  puckAiKey,
                  LOCAL_EDITOR_PUCK_AI_KEY_STORAGE_KEY,
                  setPuckAiKey
                );
              }}
            >
              Add Puck API Key
            </EditorShellButton>
            <EditorShellButton
              onClick={() => {
                updateSearchParam("reviews", showReviewsData ? "0" : "1");
              }}
            >
              {showReviewsData ? "Hide Reviews Data" : "Show Reviews Data"}
            </EditorShellButton>
            <button
              type="button"
              disabled={!canOpenPreview}
              onClick={openPreview}
              style={{
                appearance: "none",
                background: "#111",
                border: "1px solid #111",
                borderRadius: "999px",
                color: "#fff",
                cursor: canOpenPreview ? "pointer" : "not-allowed",
                font: "inherit",
                fontWeight: 600,
                minHeight: "34px",
                opacity: canOpenPreview ? 1 : 0.55,
                padding: "6px 12px",
              }}
              title={routePath}
            >
              Open Preview
            </button>
          </div>
        </div>

        <LocalEditorControls
          activeEntities={activeEntities}
          activeTemplateOptions={activeTemplateOptions}
          controlsDisabled={controlsDisabled}
          selectedEntityId={selectedEntity?.entityId}
          selectedLocale={selectedLocale}
          selectedMode={selectedMode}
          selectedTemplateId={selectedTemplateId}
          onEntityChange={(entityId) => {
            updateSearchParam("entityId", entityId);
          }}
          onLocaleChange={(locale) => {
            updateSearchParam("locale", locale);
          }}
          onModeChange={(mode) => {
            updateSearchParam("mode", mode);
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
            {streamDocument && documentResponse && selectedTemplateId && (
              <VisualEditorProvider
                templateProps={{ document: streamDocument }}
                entityFields={documentResponse.entityFields}
                tailwindConfig={tailwindConfig}
              >
                <Editor
                  key={editorKey}
                  document={streamDocument}
                  componentRegistry={componentRegistry}
                  themeConfig={themeConfig}
                  localDev={true}
                  localDevOptions={editorLocalDevOptions}
                  forceThemeMode={selectedMode === "theme"}
                />
              </VisualEditorProvider>
            )}
          </div>
        )}
      </div>
      {previewContext && (
        <LocalEditorPreview
          config={previewContext.config}
          defaultLayoutData={previewContext.defaultLayoutData}
          streamDocument={previewContext.streamDocument}
          entityFields={previewContext.entityFields}
          localDevOptions={previewContext.localDevOptions}
          onClose={closePreview}
          tailwindConfig={tailwindConfig}
          themeConfig={themeConfig}
        />
      )}
    </>
  );
};

const readLocalStorageValue = (storageKey: string): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedValue = window.localStorage.getItem(storageKey);
  return storedValue?.trim() ? storedValue : undefined;
};

const readPreviewOpenState = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.sessionStorage.getItem(LOCAL_EDITOR_PREVIEW_OPEN_STORAGE_KEY) ===
      "1"
    );
  } catch {
    return false;
  }
};

const writePreviewOpenState = (isOpen: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (isOpen) {
      window.sessionStorage.setItem(LOCAL_EDITOR_PREVIEW_OPEN_STORAGE_KEY, "1");
    } else {
      window.sessionStorage.removeItem(LOCAL_EDITOR_PREVIEW_OPEN_STORAGE_KEY);
    }
  } catch {
    // Preview state persistence is best-effort in restricted browser contexts.
  }
};

const EditorShellButton = (props: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  const { children, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        background: "#f4ede0",
        color: "#4f4637",
        border: "1px solid #d8ccb8",
        borderRadius: "999px",
        cursor: "pointer",
        font: "inherit",
        fontWeight: 600,
        minHeight: "34px",
        padding: "6px 12px",
        boxShadow: "0 1px 2px rgba(29, 29, 31, 0.08)",
        transition:
          "background 160ms ease, color 160ms ease, border-color 160ms ease",
      }}
    >
      {children}
    </button>
  );
};
