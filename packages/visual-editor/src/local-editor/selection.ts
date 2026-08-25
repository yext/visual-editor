import type { Config } from "@puckeditor/core";
import type { LocalDevOptions } from "../editor/types.ts";
import type {
  BuildEditorLocalDevOptionsArgs,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  LocalEditorMode,
} from "./types.ts";

type SelectionResult = {
  supportedLayoutIds: string[];
  activeEntities: LocalEditorEntityOption[];
  selectedLayoutId: string;
  selectedLayoutDefaults?: BuildEditorLocalDevOptionsArgs["selectedLayoutDefaults"];
  selectedEntity?: LocalEditorEntityOption;
  selectedLocale: string;
  selectedMode: LocalEditorMode;
};

export const updateSearchParam = (key: string, value: string): void => {
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
  const supportedLayoutIds = (manifest?.layouts ?? []).filter((layoutId) => {
    return layoutId in componentRegistry;
  });
  const selectedLayoutId =
    pickPreferredValue(
      supportedLayoutIds,
      searchParams.get("layoutId"),
      manifest?.defaults.layoutId
    ) ?? "";
  const selectedLayoutDefaults = selectedLayoutId
    ? manifest?.layoutDefaults[selectedLayoutId]
    : undefined;
  const activeEntities = selectedLayoutId
    ? (manifest?.entitiesByLayout[selectedLayoutId] ?? [])
    : [];
  const selectedEntity =
    pickPreferredEntity(
      activeEntities,
      searchParams.get("entityId"),
      selectedLayoutDefaults?.entityId,
      manifest?.defaults.entityId
    ) ?? activeEntities[0];
  const selectedLocale =
    pickPreferredValue(
      selectedEntity?.locales ?? [],
      searchParams.get("locale"),
      selectedLayoutDefaults?.locale,
      manifest?.defaults.locale
    ) ?? "";
  return {
    supportedLayoutIds,
    activeEntities,
    selectedLayoutId,
    selectedLayoutDefaults,
    selectedEntity,
    selectedLocale,
    selectedMode: searchParams.get("mode") === "theme" ? "theme" : "layout",
  };
};

export const syncSelectionToUrl = (
  selectedLayoutId: string,
  selectedEntity: LocalEditorEntityOption | undefined,
  selectedLocale: string,
  selectedMode: LocalEditorMode
): void => {
  if (typeof window === "undefined" || !selectedLayoutId) {
    return;
  }
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("layoutId", selectedLayoutId);
  searchParams.set("mode", selectedMode);
  if (selectedEntity?.entityId) {
    searchParams.set("entityId", selectedEntity.entityId);
  } else {
    searchParams.delete("entityId");
  }
  if (selectedLocale) {
    searchParams.set("locale", selectedLocale);
  } else {
    searchParams.delete("locale");
  }
  const nextPath = `${window.location.pathname}?${searchParams.toString()}${window.location.hash}`;
  if (
    nextPath !==
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  ) {
    window.history.replaceState({}, "", nextPath);
  }
};

export const buildLocalEditorDocumentRequestPath = ({
  apiBasePath,
  layoutId,
  entityId,
  locale,
  directoryChildCount,
}: {
  apiBasePath: string;
  layoutId: string;
  entityId?: string;
  locale: string;
  directoryChildCount?: number;
}): string | null => {
  if (!layoutId || !entityId || !locale) {
    return null;
  }
  const params = new URLSearchParams({ layoutId, entityId, locale });
  if (directoryChildCount !== undefined) {
    params.set("directoryChildCount", String(directoryChildCount));
  }
  return `${apiBasePath}/document?${params.toString()}`;
};

export const buildEditorLocalDevOptions = ({
  selectedLayoutId,
  selectedEntity,
  selectedLocale,
  selectedLayoutDefaults,
}: BuildEditorLocalDevOptionsArgs): LocalDevOptions | undefined => {
  if (!selectedLayoutId) {
    return undefined;
  }
  return {
    templateId: selectedLayoutId,
    entityId: selectedEntity?.entityId,
    locale: selectedLocale,
    locales: selectedEntity?.locales ?? [],
    layoutScopeKey: `${selectedLayoutId}:${selectedLocale}`,
    themeScopeKey: "local-editor",
    initialLayoutData: selectedLayoutDefaults?.defaultLayoutData as
      | Record<string, unknown>
      | undefined,
  };
};

const pickPreferredValue = (
  values: string[],
  ...candidates: Array<string | null | undefined>
): string | undefined => {
  for (const candidate of candidates) {
    const value = values.find((item) => item === candidate);
    if (value) {
      return value;
    }
  }
  return values[0];
};

const pickPreferredEntity = (
  entities: LocalEditorEntityOption[],
  ...entityIds: Array<string | null | undefined>
): LocalEditorEntityOption | undefined => {
  for (const entityId of entityIds) {
    const entity = entities.find((item) => item.entityId === entityId);
    if (entity) {
      return entity;
    }
  }
  return entities[0];
};
