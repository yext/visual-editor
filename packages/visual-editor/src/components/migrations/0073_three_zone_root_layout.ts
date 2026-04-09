import { Config, Data } from "@puckeditor/core";
import { Migration } from "../../utils/migrate.ts";
import {
  applyRootZonesToData,
  splitRootContentIntoZones,
} from "../../utils/rootZones.ts";

const ROOT_HEADER_LAYOUT_COMPONENTS = ["ExpandedHeader", "Header"] as const;
const ROOT_FOOTER_LAYOUT_COMPONENTS = ["ExpandedFooter", "Footer"] as const;

const supportsThreeZoneRootMigration = (
  config: Config,
  content: Data["content"] = []
): boolean => {
  const components = config.components ?? {};

  if (
    !ROOT_HEADER_LAYOUT_COMPONENTS.some(
      (componentName) => componentName in components
    ) ||
    !ROOT_FOOTER_LAYOUT_COMPONENTS.some(
      (componentName) => componentName in components
    )
  ) {
    return false;
  }

  const { headerContent, footerContent } = splitRootContentIntoZones(content);

  return [...headerContent, ...footerContent].every(
    ({ type }) => type in components
  );
};

export const threeZoneRootLayoutMigration: Migration = {
  data: {
    transformation: (data, _streamDocument, config) => {
      if (
        !data.content?.length ||
        !supportsThreeZoneRootMigration(config, data.content)
      ) {
        return data;
      }

      return applyRootZonesToData(data);
    },
  },
};
