import type { Config } from "@puckeditor/core";
import type { LocalDevOptions } from "../editor/types.ts";
import type {
  LocalEditorEntity,
  LocalEditorManifestResponse,
  LocalEditorSelection,
  BuildEditorLocalDevOptionsArgs,
} from "./types.ts";

export const updateSearchParam = (key: string, value: string) => {
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

export const buildLocalEditorSelection = (
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

export const syncSelectionToUrl = (
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

export const buildEditorLocalDevOptions = ({
  selectedTemplateId,
  selectedEntity,
  selectedLocale,
  selectedTemplateDefaults,
}: BuildEditorLocalDevOptionsArgs): LocalDevOptions | undefined => {
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
  entities: LocalEditorEntity[],
  ...entityIds: Array<string | null | undefined>
): LocalEditorEntity | undefined => {
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
