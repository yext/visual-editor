import { ComponentData } from "@puckeditor/core";
import { type RenderEntityFieldFilter } from "../../internal/utils/getFilteredEntityFields.ts";
import {
  buildLinkedEntityStreamFields,
  type LinkedEntitySchemas,
} from "../linkedEntityFieldUtils.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { resolveField } from "../resolveYextEntityField.ts";

type LinkedEntityListSourceMode = "section" | "linkedEntityList" | "unknown";

/**
 * Returns true when a field is a top-level linked entity reference root exposed
 * by the linked entity schema payload.
 */
export const isTopLevelLinkedEntitySourceField = (
  fieldPath: string | undefined,
  linkedEntitySchemas?: LinkedEntitySchemas
): boolean => {
  if (!fieldPath || fieldPath.includes(".") || !linkedEntitySchemas) {
    return false;
  }

  return Object.hasOwn(linkedEntitySchemas, fieldPath);
};

/**
 * Returns linked entity reference roots so wrappers can include them alongside
 * their normal section-shaped source fields.
 */
export const getLinkedEntitySourceRootFields = (
  linkedEntitySchemas?: LinkedEntitySchemas
) => buildLinkedEntityStreamFields(linkedEntitySchemas)?.fields ?? [];

/**
 * Detects whether the selected wrapper source resolves as a normal section
 * object or as a linked entity list/single linked entity source.
 */
export const getLinkedEntityListSourceMode = (
  streamDocument: StreamDocument,
  fieldPath: string,
  listFieldName: string
): LinkedEntityListSourceMode => {
  const resolvedSource = resolveField<unknown>(streamDocument, fieldPath).value;

  if (Array.isArray(resolvedSource)) {
    return "linkedEntityList";
  }

  if (!resolvedSource || typeof resolvedSource !== "object") {
    return "unknown";
  }

  if (
    Array.isArray((resolvedSource as Record<string, unknown>)[listFieldName])
  ) {
    return "section";
  }

  return "linkedEntityList";
};

/**
 * Resolves the selected linked entity source into a list so wrappers can render
 * one card per linked entity.
 */
export const resolveLinkedEntitySourceItems = <T>(
  streamDocument: StreamDocument,
  fieldPath: string
): T[] => {
  const resolvedSource = resolveField<unknown>(streamDocument, fieldPath).value;

  if (Array.isArray(resolvedSource)) {
    return resolvedSource as T[];
  }

  if (resolvedSource && typeof resolvedSource === "object") {
    return [resolvedSource as T];
  }

  return [];
};

/**
 * Resolves a wrapper-level field mapping against a linked entity item. Stored
 * field ids are absolute editor paths like `c_linkedLocation.name`, so this
 * strips the selected linked source root before resolving against the linked
 * entity document itself.
 */
export const resolveLinkedEntityMappedField = <T>(
  linkedEntity: StreamDocument,
  sourceFieldPath: string,
  mappedFieldPath: string | undefined
): T | undefined => {
  if (!mappedFieldPath) {
    return undefined;
  }

  const relativeFieldPath = mappedFieldPath.startsWith(`${sourceFieldPath}.`)
    ? mappedFieldPath.slice(sourceFieldPath.length + 1)
    : mappedFieldPath;

  return resolveField<T>(linkedEntity, relativeFieldPath).value;
};

/**
 * Appends placeholder cards when needed and trims the slot array to the number
 * of resolved linked entities or section items.
 */
export const syncCardSlotLength = <T extends Record<string, any>>(
  existingCards: ComponentData<T>[],
  requiredLength: number,
  createCard: () => ComponentData<T>
): ComponentData<T>[] => {
  const cardsToAdd =
    existingCards.length < requiredLength
      ? Array(requiredLength - existingCards.length)
          .fill(null)
          .map(createCard)
      : [];

  return [...existingCards, ...cardsToAdd].slice(0, requiredLength);
};

export type LinkedEntitySourceFieldFilter<T extends Record<string, any>> =
  RenderEntityFieldFilter<T> & {
    includeLinkedEntityRoots?: boolean;
  };
