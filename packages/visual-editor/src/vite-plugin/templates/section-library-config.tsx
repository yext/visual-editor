/* SECTION_LIBRARY_GENERATED_FILE */
import { DropZone, type Config } from "@puckeditor/core";
import {
  toPuckFields,
  CustomCodeSection,
  MainContent,
  type SectionConfig,
} from "@yext/visual-editor";
/* SECTION_LIBRARY_IMPORTS */
/* SECTION_LIBRARY_SHARED_COMPONENT_REGISTRY */

const pageSetType = __SECTION_LIBRARY_PAGE_SET_TYPE__;
const hasSharedComponentRegistry =
  __SECTION_LIBRARY_HAS_SHARED_COMPONENT_REGISTRY__;

const sections: {
  id: string;
  component:
    | Config["components"][string]["render"]
    | Config["components"][string];
  config: SectionConfig;
}[] = [
  /* SECTION_LIBRARY_ENTRIES */
];

const sharedComponentsForPageSetType = hasSharedComponentRegistry
  ? sharedComponentMetadata.filter((component) =>
      component.pageSetTypes.includes(pageSetType)
    )
  : [];

const components = {
  CustomCodeSection,
  MainContent,
  ...Object.fromEntries(
    sections.map((section) => [
      section.id,
      {
        ...(typeof section.component === "function" ? {} : section.component),
        ...(typeof section.component === "function" || !section.component.fields
          ? {}
          : { fields: toPuckFields(section.component.fields) }),
        ...section.config,
        render:
          typeof section.component === "function"
            ? section.component
            : section.component.render,
        label: section.config.displayName,
      },
    ])
  ),
  ...Object.fromEntries(
    sharedComponentsForPageSetType.map((component) => [
      component.id,
      {
        ...sharedComponentConfigs[component.id],
        ...(sharedComponentConfigs[component.id]?.fields
          ? {
              fields: toPuckFields(sharedComponentConfigs[component.id].fields),
            }
          : {}),
      },
    ])
  ),
};

const defaultRoot: NonNullable<Config["root"]> = {
  render: () => (
    <DropZone
      zone="default-zone"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    />
  ),
};

const sharedRootConfig = hasSharedComponentRegistry
  ? sharedRootConfigs[pageSetType]
  : undefined;
const rootAllowedComponentIds = hasSharedComponentRegistry
  ? sharedRootAllowedComponentIds[pageSetType]
  : undefined;

export const sectionLibraryConfig: Config = {
  components,
  categories: {
    structure: {
      title: "Structure",
      visible: false,
      components: ["MainContent"],
    },
    /* SECTION_LIBRARY_CATEGORIES */
  },
  root: sharedRootConfig
    ? {
        ...sharedRootConfig,
        render: () => (
          <DropZone
            zone="default-zone"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
            disallow={Object.keys(components).filter(
              (componentId) => !rootAllowedComponentIds?.includes(componentId)
            )}
          />
        ),
      }
    : defaultRoot,
};
