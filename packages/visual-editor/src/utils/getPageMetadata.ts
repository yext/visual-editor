import { resolveComponentData } from "./resolveComponentData.tsx";

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
  const rootProps = layout?.root?.props ?? layout?.root;
  if (!rootProps) {
    return {};
  }
  const metaData: RootConfig = {};
  Object.keys(rootProps).forEach((key: string) => {
    metaData[key] = escapeHtml(
      resolveComponentData(rootProps[key], document.locale, document) ?? ""
    );
  });
  return metaData;
}

const escapeHtml = (str: string) => {
  if (typeof str !== "string") {
    return "";
  }

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
