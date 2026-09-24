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

  const renderFieldTransforms = React.useMemo(() => {
    if (fieldTransforms) {
      return fieldTransforms;
    }

    const streamDocument = metadata?.streamDocument as
      StreamDocument | undefined;
    const locale = streamDocument?.locale;

    if (!streamDocument || !locale) {
      return undefined;
    }

    return createPuckFieldTransforms(
      locale,
      streamDocument
    ) as FieldTransforms<T>;
  }, [fieldTransforms, metadata?.streamDocument]);
  const wrappedConfig = React.useMemo(() => {
    const configWithDynamicComponents = withDynamicConfig
      ? withDynamicConfig(config, data)
      : config;
    const configWithAnalytics = withDynamicConfigAnalytics(
      configWithDynamicComponents,
      data
    );

    if (!renderFieldTransforms) {
      return wrapConfigWithComponentErrorBoundary(configWithAnalytics);
    }

    const transforms = renderFieldTransforms as unknown as Record<
      string,
      (params: {
        value: unknown;
        field: { type: string };
        propName: string;
        propPath: string;
        componentId: string;
        isReadOnly: boolean;
      }) => unknown
    >;
    const components = Object.fromEntries(
      Object.entries(configWithAnalytics.components).map(
        ([componentName, component]) => [
          componentName,
          {
            ...component,
            render: (props: Record<string, any>) => {
              const transformedProps = { ...props };
              for (const [fieldName, field] of Object.entries(
                component.fields ?? {}
              )) {
                const transform = transforms[(field as { type: string }).type];
                if (transform && fieldName in props) {
                  transformedProps[fieldName] = transform({
                    value: props[fieldName],
                    field: field as { type: string },
                    propName: fieldName,
                    propPath: fieldName,
                    componentId: props.id ?? componentName,
                    isReadOnly: true,
                  });
                }
              }
              return React.createElement(
                component.render as React.ComponentType<any>,
                transformedProps
              );
            },
          },
        ]
      )
    );

    return wrapConfigWithComponentErrorBoundary({
      ...configWithAnalytics,
      components,
    } as T);
  }, [config, data, renderFieldTransforms, withDynamicConfig]);

  if (hasDynamicConfig && !withDynamicConfig) {
    return null;
  }

  return <Render config={wrappedConfig} data={data} metadata={metadata} />;
};
