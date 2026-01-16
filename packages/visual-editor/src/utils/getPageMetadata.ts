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

  if (document.meta?.entityType?.id?.startsWith("dm_")) {
    rootProps = resolveDirectoryRootProps(rootProps, document);
  }

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

const DIRECTORY_META_DEFAULTS: Record<
  string,
  { title: string; description: string }
> = {
  dm_root: {
    title: "Locations",
    description: "Browse all locations",
  },
  dm_country: {
    title: "Locations in [[dm_addressCountryDisplayName]]",
    description: "Browse locations in [[dm_addressCountryDisplayName]]",
  },
  dm_region: {
    title: "Locations in [[dm_addressRegionDisplayName]]",
    description: "Browse locations in [[dm_addressRegionDisplayName]]",
  },
  dm_city: {
    title: "Locations in [[name]]",
    description: "Browse locations in [[name]]",
  },
};

/**
 * resolveDirectoryRootProps scans the meta title and description fields
 * and replaces PLACEHOLDER with an appropriate value based on the entityType
 */
export const resolveDirectoryRootProps = (
  props: Record<string, any>,
  streamDocument: StreamDocument
) => {
  let updatedProps = { ...props };

  const entityType = streamDocument?.meta?.entityType?.id;
  if (!entityType || !entityType.startsWith("dm_")) {
    return updatedProps;
  }

  const defaultValues = DIRECTORY_META_DEFAULTS[entityType];

  if (!defaultValues) {
    return updatedProps;
  }

  // Update Title
  if (props?.title?.constantValue?.en === "PLACEHOLDER") {
    updatedProps = setDeep(
      updatedProps,
      "title.constantValue.en",
      defaultValues.title
    );
  }

  // Update Description
  if (props?.description?.constantValue?.en === "PLACEHOLDER") {
    updatedProps = setDeep(
      updatedProps,
      "description.constantValue.en",
      defaultValues.description
    );
  }

  return updatedProps;
};
