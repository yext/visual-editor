import { resolveYextEntityField } from "./resolveYextEntityField.ts";

export type RootConfig = {
  title: string;
  description: string;
  [key: string]: any;
};

export function getPageMetadata(document: any): RootConfig {
  const emptyMetaData = {
    title: "",
    description: "",
  };
  const layoutString = document?.__?.layout;
  if (!layoutString) {
    return emptyMetaData;
  }
  const layout = JSON.parse(layoutString);
  const root = layout?.root;
  if (!root) {
    return emptyMetaData;
  }
  const metaData: RootConfig = {
    title: resolveYextEntityField(document, root.title) ?? "",
    description: resolveYextEntityField(document, root.description) ?? "",
  };
  Object.keys(root).forEach((key: string) => {
    metaData[key] = resolveYextEntityField(document, root[key]) ?? "";
  });
  return metaData;
}
