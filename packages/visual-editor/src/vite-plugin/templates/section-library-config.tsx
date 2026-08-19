/* SECTION_LIBRARY_GENERATED_FILE */
import { DropZone, type Config } from "@puckeditor/core";
import { MainContent, type SectionConfig } from "@yext/visual-editor";
/* SECTION_LIBRARY_IMPORTS */
/* SECTION_LIBRARY_SHARED_REGISTRY */

const pageSetType = __SECTION_LIBRARY_PAGE_SET_TYPE__;
const hasSharedRegistry = __SECTION_LIBRARY_HAS_SHARED_REGISTRY__;

const sections: {
  id: string;
  component:
    | Config["components"][string]["render"]
    | Config["components"][string];
  config: SectionConfig;
}[] = [
  /* SECTION_LIBRARY_ENTRIES */
];

const sectionsByCategory = sections.reduce<Record<string, typeof sections>>(
  (categories, section) => {
    const title = section.config.category ?? "Sections";
    (categories[title] ??= []).push(section);
    return categories;
  },
  {}
);

const sharedSectionsForPageSetType = hasSharedRegistry
  ? sharedSections.filter((section) =>
      section.pageSetTypes.includes(pageSetType)
    )
  : [];

const components = {
  MainContent,
  ...Object.fromEntries(
    sections.map((section) => [
      section.id,
      {
        ...(typeof section.component === "function" ? {} : section.component),
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
    sharedSectionsForPageSetType.map((section) => [
      section.id,
      sharedComponents[section.id],
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

const sharedRootConfig = hasSharedRegistry
  ? sharedRootConfigs[pageSetType]
  : undefined;
const rootAllowedComponentIds = hasSharedRegistry
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
    other: { title: "Other", visible: false, components: [] },
    ...Object.fromEntries(
      Object.entries(sectionsByCategory).map(([title, grouped]) => [
        `section:${title}`,
        { title, components: grouped.map((section) => section.id) },
      ])
    ),
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
