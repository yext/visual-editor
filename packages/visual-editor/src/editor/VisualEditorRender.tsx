import { Config, Data, Metadata, Render } from "@puckeditor/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDocument } from "../hooks/useDocument.tsx";
import { createYextFieldTransforms } from "../fields/fieldTransforms/index.ts";
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
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const fieldTransforms = React.useMemo(
    () => createYextFieldTransforms(streamDocument, i18n.language),
    [streamDocument, i18n.language]
  );
  const wrappedConfig = React.useMemo(() => {
    return wrapConfigWithComponentErrorBoundary(config);
  }, [config]);

  return (
    <Render<Config>
      config={wrappedConfig}
      data={data}
      metadata={metadata}
      fieldTransforms={fieldTransforms}
    />
  );
};
