/* SECTION_LIBRARY_GENERATED_FILE */
import { DropZone, type Config } from "@puckeditor/core";
import { MainContent, type SectionConfig } from "@yext/visual-editor";
/* SECTION_LIBRARY_IMPORTS */

const sections: {
  id: string;
  component: Config["components"][string];
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

export const sectionLibraryConfig: Config = {
  components: {
    MainContent,
    ...Object.fromEntries(
      sections.map((section) => [
        section.id,
        { ...section.component, label: section.config.displayName },
      ])
    ),
  },
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
  root: {
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
  },
};
