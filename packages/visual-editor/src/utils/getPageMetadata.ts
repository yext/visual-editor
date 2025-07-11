import { resolveYextEntityField } from "./resolveYextEntityField.ts";

export type RootConfig = {
  title?: string;
  description?: string;
  [key: string]: any;
};

export function getPageMetadata(document: Record<string, any>): RootConfig {
  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return {};
  }
  const layout = JSON.parse(layoutString);
  const root = layout?.root;
  if (!root) {
    return {};
  }
  const metaData: RootConfig = {};
  Object.keys(root).forEach((key: string) => {
    metaData[key] =
      resolveYextEntityField(document, undefined, root[key]) ?? "";
  });
  return metaData;
}
