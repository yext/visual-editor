import {
  Config,
  Data,
  type FieldTransforms,
  Metadata,
  Render,
} from "@puckeditor/core";
import React from "react";
import { wrapConfigWithComponentErrorBoundary } from "../internal/utils/wrapConfigWithComponentErrorBoundary.tsx";
import { createPuckFieldTransforms } from "../fields/fieldTransforms.ts";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";

export type VisualEditorRenderProps<T extends Config = Config> = {
  config: T;
  data: Data;
  metadata?: Metadata;
};

export const VisualEditorRender = <T extends Config>({
  config,
  data,
  metadata,
}: VisualEditorRenderProps<T>) => {
  const wrappedConfig = React.useMemo(() => {
    const streamDocument: StreamDocument = metadata?.streamDocument ?? {};
    const transforms = createPuckFieldTransforms(
      streamDocument.locale ?? "en",
      streamDocument
    );
    return wrapConfigWithComponentErrorBoundary({
      ...config,
      components: Object.fromEntries(
        Object.entries(config.components).map(([name, component]) => [
          name,
          {
            ...component,
            render: (props: Record<string, any>): React.ReactElement => {
              /** Traverse structural fields without replacing Puck's slot rendering. */
              const transformValue = (
                value: any,
                field: any,
                propPath: string
              ): any => {
                const transform = transforms[
                  field.type as keyof typeof transforms
                ] as FieldTransforms["custom"];
                if (transform) {
                  return transform({
                    value,
                    field,
                    componentId: props.id,
                    propName: propPath.split(".").at(-1) ?? propPath,
                    propPath,
                    isReadOnly: true,
                  });
                }
                if (field.type === "object" && value) {
                  return Object.fromEntries(
                    Object.entries(value).map(
                      ([key, item]): [string, unknown] => [
                        key,
                        field.objectFields?.[key]
                          ? transformValue(
                              item,
                              field.objectFields[key],
                              `${propPath}.${key}`
                            )
                          : item,
                      ]
                    )
                  );
                }
                if (field.type === "array" && Array.isArray(value)) {
                  return value.map((item: any, index: number): any =>
                    transformValue(
                      item,
                      { type: "object", objectFields: field.arrayFields },
                      `${propPath}[${index}]`
                    )
                  );
                }
                return value;
              };
              return React.createElement(
                component.render as React.ComponentType<Record<string, any>>,
                Object.fromEntries(
                  Object.entries({ ...component.defaultProps, ...props }).map(
                    ([key, value]): [string, unknown] => [
                      key,
                      component.fields?.[key]
                        ? transformValue(value, component.fields[key], key)
                        : value,
                    ]
                  )
                )
              );
            },
          },
        ])
      ) as T["components"],
    });
  }, [config, metadata?.streamDocument]);

  return <Render config={wrappedConfig} data={data} metadata={metadata} />;
};
