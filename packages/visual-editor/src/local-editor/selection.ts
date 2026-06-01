import * as lzstring from "lz-string";
import type { Config } from "@puckeditor/core";
import type { LocalDevOptions } from "../editor/types.ts";
import type {
  LocalEditorMode,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  BuildEditorLocalDevOptionsArgs,
} from "./types.ts";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";

type SelectionResult = {
  supportedTemplateIds: string[];
  activeEntities: LocalEditorEntityOption[];
  selectedTemplateId: string;
  selectedTemplateDefaults?: BuildEditorLocalDevOptionsArgs["selectedTemplateDefaults"];
  selectedEntity?: LocalEditorEntityOption;
  selectedLocale: string;
  selectedMode: LocalEditorMode;
};

export const LOCAL_EDITOR_API_BASE_PATH = "/__yext_visual_editor/local-editor";

export const updateSearchParam = (key: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${searchParams.toString()}${window.location.hash}`
  );
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const buildLocalEditorSelection = (
  manifest: LocalEditorManifestResponse | null,
  componentRegistry: Record<string, Config<any>>,
  searchParams: URLSearchParams
): SelectionResult => {
  // Query params win when valid; otherwise fall back to manifest defaults and
  // finally the first available option so the shell always lands on one stable
  // selection.
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
  const selectedMode =
    searchParams.get("mode") === "theme" ? "theme" : "layout";

  return {
    supportedTemplateIds,
    activeEntities,
    selectedTemplateId,
    selectedTemplateDefaults,
    selectedEntity,
    selectedLocale,
    selectedMode,
  };
};

export const syncSelectionToUrl = (
  selectedTemplateId: string,
  selectedEntity: LocalEditorEntityOption | undefined,
  selectedLocale: string,
  selectedMode: LocalEditorMode
) => {
  if (typeof window === "undefined" || !selectedTemplateId) {
    return;
  }

  const nextSearchParams = new URLSearchParams(window.location.search);
  nextSearchParams.set("templateId", selectedTemplateId);
  nextSearchParams.set("mode", selectedMode);

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
      ? `${window.location.pathname}?${nextSearchParams.toString()}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
  const currentRelativePath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextRelativePath !== currentRelativePath) {
    window.history.replaceState({}, "", nextRelativePath);
  }
};

export const buildLocalEditorDocumentRequestPath = ({
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

export const buildLocalEditorPreviewUrl = ({
  origin,
  templateId,
  entityId,
  locale,
}: {
  origin: string;
  templateId: string;
  entityId?: string;
  locale: string;
}): string => {
  const previewStorageKey = buildLocalEditorLayoutStorageKey(
    templateId,
    locale
  );
  const previewUrl = new URL(`/edit/${encodeURIComponent(templateId)}`, origin);

  previewUrl.searchParams.set("preview", "1");
  previewUrl.searchParams.set("templateId", templateId);
  previewUrl.searchParams.set("locale", locale);
  previewUrl.searchParams.set("previewStorageKey", previewStorageKey);

  if (entityId) {
    previewUrl.searchParams.set("entityId", entityId);
  }

  return previewUrl.toString();
};

export const readLocalEditorPreviewLayoutData = ({
  previewStorageKey,
  document,
}: {
  previewStorageKey: string | null;
  document: Record<string, unknown>;
}): Record<string, unknown> => {
  const publishedLayoutData = readDocumentLayoutData(document);
  if (typeof window === "undefined" || !previewStorageKey) {
    return publishedLayoutData;
  }

  const compressedHistories = window.localStorage.getItem(previewStorageKey);
  if (!compressedHistories) {
    return publishedLayoutData;
  }

  const decompressedHistories = lzstring.decompress(compressedHistories);
  if (!decompressedHistories) {
    return publishedLayoutData;
  }

  try {
    const histories = JSON.parse(decompressedHistories) as Array<{
      state?: { data?: Record<string, unknown> };
    }>;
    const latestHistory = histories
      .slice()
      .reverse()
      .find((history) => {
        return !!history?.state?.data;
      });

    return latestHistory?.state?.data ?? publishedLayoutData;
  } catch {
    return publishedLayoutData;
  }
};

export const buildEditorLocalDevOptions = ({
  selectedTemplateId,
  selectedEntity,
  selectedLocale,
  selectedTemplateDefaults,
}: BuildEditorLocalDevOptionsArgs): LocalDevOptions | undefined => {
  if (!selectedTemplateId) {
    return undefined;
  }

  // Keep draft state scoped by template + locale so entity switches reuse the
  // same local draft but changing template or locale starts a new one.
  return {
    templateId: selectedTemplateId,
    entityId: selectedEntity?.entityId,
    locale: selectedLocale,
    locales: selectedEntity?.locales ?? [],
    layoutScopeKey: `${selectedTemplateId}:${selectedLocale}`,
    themeScopeKey: "local-editor",
    initialLayoutData: selectedTemplateDefaults?.defaultLayoutData as
      | Record<string, unknown>
      | undefined,
    showOverrideButtons: false,
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
  entities: LocalEditorEntityOption[],
  ...entityIds: Array<string | null | undefined>
): LocalEditorEntityOption | undefined => {
  for (const entityId of entityIds) {
    const matchingEntity = entities.find((entity) => {
      return entity.entityId === entityId;
    });
    if (matchingEntity) {
      return matchingEntity;
    }
  }

  return entities[0];
};

const buildLocalEditorLayoutStorageKey = (
  templateId: string,
  locale: string
): string => {
  const layoutScopeKey = `${templateId}:${locale}`;
  return `devTEMPLATE_${templateId}LAYOUT_${hashCode(layoutScopeKey)}`;
};

export const readDocumentLayoutData = (
  streamDocument: StreamDocument
): Record<string, unknown> => {
  const layoutJson = streamDocument?.__?.layout;
  if (typeof layoutJson !== "string" || !layoutJson.length) {
    return {
      root: {},
      content: [],
      zones: {},
    };
  }

  try {
    return JSON.parse(layoutJson) as Record<string, unknown>;
  } catch {
    return {
      root: {},
      content: [],
      zones: {},
    };
  }
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
