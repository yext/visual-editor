import { Config, Data, Metadata, Render as PuckRender } from "@puckeditor/core";
import React from "react";
import { wrapConfigWithComponentErrorBoundary } from "../internal/utils/wrapConfigWithComponentErrorBoundary.tsx";

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
    return wrapConfigWithComponentErrorBoundary(config);
  }, [config]);

  return <PuckRender config={wrappedConfig} data={data} metadata={metadata} />;
};
