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
  console.log("getPageMetadata rootProps", JSON.stringify(rootProps));
  Object.keys(rootProps).forEach((key: string) => {
    metaData[key] = escapeHtml(
      resolveComponentData(rootProps[key], document.locale, document) ?? ""
    );
  });

  // For title, fallback to en value if localized value is empty
  if (metaData.title === "") {
    metaData.title = escapeHtml(
      resolveComponentData(rootProps.title, "en", document) ?? ""
    );
  }

  console.log("getPageMetadata metaData", JSON.stringify(metaData));
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
