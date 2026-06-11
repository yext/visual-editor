import { Config, Data, Render as PuckRender } from "@puckeditor/core";
import React from "react";
import { wrapConfigWithComponentErrorBoundary } from "../internal/utils/wrapConfigWithComponentErrorBoundary.tsx";

export type VisualEditorRenderProps = {
  config: Config<any>;
  data: Data;
  metadata?: Record<string, unknown>;
};

export const VisualEditorRender = ({
  config,
  data,
  metadata,
}: VisualEditorRenderProps) => {
  const wrappedConfig = React.useMemo(() => {
    return wrapConfigWithComponentErrorBoundary(config);
  }, [config]);

  return <PuckRender config={wrappedConfig} data={data} metadata={metadata} />;
};
