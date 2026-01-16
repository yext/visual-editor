import { setDeep } from "@measured/puck";
import { StreamDocument } from "./applyTheme.ts";
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
  let rootProps = layout?.root?.props ?? layout?.root;
  if (!rootProps) {
    return {};
  }
  const metaData: RootConfig = {};
  console.log("getPageMetadata rootProps 1", JSON.stringify(rootProps));

  if (document.meta?.entityType?.id?.startsWith("dm_")) {
    rootProps = resolveDirectoryRootProps(rootProps, document);
  }

  console.log("getPageMetadata rootProps 2", JSON.stringify(rootProps));

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

/**
 * resolveDirectoryRootProps scans the meta title and description fields
 * and replaced PLACEHOLDER with an appropriate value based on the entityType
 */
export const resolveDirectoryRootProps = (
  props: Record<string, any>,
  streamDocument: StreamDocument
) => {
  const updatedProps = { ...props };

  if (
    props?.title?.constantValue?.en &&
    props.title.constantValue?.en === "PLACEHOLDER"
  ) {
    let titleValue = "Locations";
    switch (streamDocument?.meta?.entityType?.id) {
      case "dm_root": {
        titleValue = "Locations";
        break;
      }
      case "dm_country": {
        titleValue = "Locations in [[dm_addressCountryDisplayName]]";
        break;
      }
      case "dm_region": {
        titleValue = "Locations in [[dm_addressRegionDisplayName]]";
        break;
      }
      case "dm_city": {
        titleValue = "Locations in [[name]]";
        break;
      }
    }

    setDeep(updatedProps, "props.title.constantValue.en", titleValue);
  }
  if (
    props?.description?.constantValue?.en &&
    props.description.constantValue?.en === "PLACEHOLDER"
  ) {
    let descriptionValue = "Locations";
    switch (streamDocument?.meta?.entityType?.id) {
      case "dm_root": {
        descriptionValue = "Browse all locations";
        break;
      }
      case "dm_country": {
        descriptionValue =
          "Browse locations in [[dm_addressCountryDisplayName]]";
        break;
      }
      case "dm_region": {
        descriptionValue =
          "Browse locations in [[dm_addressRegionDisplayName]]";
        break;
      }
      case "dm_city": {
        descriptionValue = "Browse locations in [[name]]";
        break;
      }
    }

    setDeep(
      updatedProps,
      "props.description.constantValue.en",
      descriptionValue
    );
  }

  return updatedProps;
};
