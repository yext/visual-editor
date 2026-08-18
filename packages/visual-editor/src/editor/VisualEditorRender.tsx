import {
  Config,
  Data,
  type FieldTransforms,
  Metadata,
  Render,
} from "@puckeditor/core";
import React from "react";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";
import { createPuckFieldTransforms } from "../internal/utils/puckFieldTransforms.ts";
import { wrapConfigWithComponentErrorBoundary } from "../internal/utils/wrapConfigWithComponentErrorBoundary.tsx";

export type VisualEditorRenderProps<T extends Config = Config> = {
  config: T;
  data: Data;
  metadata?: Metadata;
  fieldTransforms?: FieldTransforms<T>;
};

export const VisualEditorRender = <T extends Config>({
  config,
  data,
  metadata,
  fieldTransforms,
}: VisualEditorRenderProps<T>) => {
  const wrappedConfig = React.useMemo(() => {
    return wrapConfigWithComponentErrorBoundary(config);
  }, [config]);
  const renderFieldTransforms = React.useMemo(() => {
    if (fieldTransforms) {
      return fieldTransforms;
    }

    const streamDocument = metadata?.streamDocument as
      | StreamDocument
      | undefined;
    const locale = streamDocument?.locale;

    if (!streamDocument || !locale) {
      return undefined;
    }

    return createPuckFieldTransforms(
      locale,
      streamDocument
    ) as FieldTransforms<T>;
  }, [fieldTransforms, metadata?.streamDocument]);

  return (
    <Render
      config={wrappedConfig}
      data={data}
      metadata={metadata}
      fieldTransforms={renderFieldTransforms}
    />
  );
};
