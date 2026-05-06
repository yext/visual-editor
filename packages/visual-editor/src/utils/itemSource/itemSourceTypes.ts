import { type DefaultComponentProps, type Fields } from "@puckeditor/core";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { type ItemSourceValue } from "../../fields/ItemSourceField.tsx";
import { type YextFieldMap } from "../../fields/fields.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";

/**
 * Public item-source types.
 *
 * 1. Define the authored configuration accepted by `createItemSource(...)`.
 * 2. Define the resolved item shape returned by `resolveItems(...)`.
 * 3. Define the public instance contract shared with callers.
 */
export type CreateItemSourceOptions<TItem extends Record<string, unknown>> = {
  sourcePath: string;
  mappingsPath: string;
  sourceLabel?: string;
  mappingsLabel?: string;
  mappingFields: YextFieldMap<TItem>;
};

/**
 * Resolves authored item fields into the render-ready value shape returned
 * from `ItemSourceInstance.resolveItems(...)`.
 */
export type ResolvedItemField<TValue> =
  TValue extends YextEntityField<infer TResolved>
    ? TResolved | undefined
    : TValue extends Array<infer TItem>
      ? ResolvedItemField<TItem>[]
      : TValue extends Record<string, unknown>
        ? { [TKey in keyof TValue]: ResolvedItemField<TValue[TKey]> }
        : TValue;

/**
 * Public contract returned by `createItemSource(...)`.
 */
export type ItemSourceInstance<
  TProps extends DefaultComponentProps,
  TItem extends Record<string, unknown>,
> = {
  fields: Fields<TProps>;
  defaultProps: Partial<TProps>;
  resolveFields: (data: { props: Record<string, unknown> }) => Fields<TProps>;
  resolveItems: (
    itemSource: ItemSourceValue<TItem> | undefined,
    itemMappings: TItem | undefined,
    streamDocument: StreamDocument
  ) => ResolvedItemField<TItem>[];
};
