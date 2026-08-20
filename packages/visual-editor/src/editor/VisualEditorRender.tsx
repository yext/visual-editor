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
import { withDynamicConfigAnalytics } from "../internal/utils/withDynamicConfigAndAnalytics.tsx";

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
  const hasDynamicConfig = Boolean(
    (data.root?.props as { _dynamicConfig?: unknown } | undefined)
      ?._dynamicConfig
  );
  const [withDynamicConfig, setWithDynamicConfig] = React.useState<
    ((config: T, data: Partial<Data>) => T) | undefined
  >();

  React.useEffect(() => {
    if (!hasDynamicConfig) {
      setWithDynamicConfig(undefined);
      return;
    }

    let isMounted = true;

    import("@puckeditor/plugin-ai").then(({ withDynamicConfig }) => {
      if (isMounted) {
        setWithDynamicConfig(
          () => withDynamicConfig as (config: T, data: Partial<Data>) => T
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [data, hasDynamicConfig]);

  const wrappedConfig = React.useMemo(() => {
    const configWithDynamicComponents = withDynamicConfig
      ? withDynamicConfig(config, data)
      : config;

    return wrapConfigWithComponentErrorBoundary(
      withDynamicConfigAnalytics(configWithDynamicComponents, data)
    );
  }, [config, data, withDynamicConfig]);
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

  if (hasDynamicConfig && !withDynamicConfig) {
    return null;
  }

  return (
    <Render
      config={wrappedConfig}
      data={data}
      metadata={metadata}
      fieldTransforms={renderFieldTransforms}
    />
  );
};
