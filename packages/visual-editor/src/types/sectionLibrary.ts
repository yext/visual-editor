export const supportedPageSetTypes = [
  "ENTITY",
  "DIRECTORY",
  "LOCATOR",
] as const;

export type PageSetType = (typeof supportedPageSetTypes)[number];

/** A hidden internal Puck component that can appear in saved slot layout data. */
export type SharedHiddenPuckComponent = {
  /** Stable Puck component ID stored in the layout data. */
  id: string;

  /** Page-set types that can render this hidden internal component. */
  pageSetTypes: PageSetType[];
};

/**
 * Static metadata from a Section Library shared registry.
 *
 * The generator uses this metadata to validate saved component IDs, register
 * their Puck configs, and omit them from editor add-component menus.
 */
export type SharedHiddenPuckComponentRegistry = {
  /** Hidden internal components that can appear in saved layout data. */
  components: SharedHiddenPuckComponent[];

  /** Page-set types that need the shared root config, even without components. */
  rootPageSetTypes: PageSetType[];
};

/**
 * Metadata describing a Section.
 * A section is a horizontal slice of a page that is
 * available for configuration in the Visual Layout Editor.
 */
export type SectionConfig = {
  /** The internal id of the section. */
  id: string;
  /** The user-facing display name of the section. */
  displayName: string;
  /** The description of the section's purpose. */
  description: string;
  /** The page set types in which the section can be used. */
  pageSetTypes: PageSetType[];
  /** The category in the left sidebar in which the section will be listed. */
  category?: string;
};

/**
 * Metadata describing a Library.
 * A library is a collection of Sections and Layouts.
 */
export type LibraryMetadata = {
  /** The version of the library.json metadata schema used in this repo. */
  schemaVersion: 1;
  /** The internal id of the library. */
  id: string;
  /** The user-facing display name of the library. */
  displayName: string;
  /** The user-facing description of the library. */
  description: string;
};

export const verticals = [
  "HEALTHCARE",
  "FINANCIAL_SERVICES",
  "FOOD_AND_DINING",
  "RETAIL",
  "HOSPITALITY",
  "PROFESSIONAL_SERVICES",
] as const;

export type Vertical = (typeof verticals)[number];

export const purposes = ["LOCATION", "CITATION"] as const;

export type Purpose = (typeof purposes)[number];

/** A layout for use with entity page sets. */
export type EntityLayoutMetadata = {
  /** The internal id of the entity layout. */
  id: string;
  /** The user-facing display name of the layout. */
  displayName: string;
  /** The URL of an image to display in the Section Library Gallery. */
  previewImageUrl: string;
  /** The entity categories/industries recommended for use with this layout. */
  vertical?: Vertical[];
  /** Whether this layout is intended as the primary location landing page, as an alternate citation page, or both.  */
  purpose?: Purpose[];
  pageSetType: "ENTITY";
};

/** A layout for use with directory page sets. */
export type DirectoryLayoutMetadata = {
  /** The internal id of the directory layout. */
  id: string;
  /** The user-facing display name of the layout. */
  displayName: string;
  pageSetType: "DIRECTORY";
};

/** A layout for use with locator page sets. */
export type LocatorLayoutMetadata = {
  /** The internal id of the locator layout. */
  id: string;
  /** The user-facing display name of the layout. */
  displayName: string;
  pageSetType: "LOCATOR";
};

export type LayoutMetadata =
  | EntityLayoutMetadata
  | DirectoryLayoutMetadata
  | LocatorLayoutMetadata;

/**
 * A Section Library Layout is a starting point for a page set.
 * It appears in the Section Library Gallery and sets the page set's initial layout configuration.
 */
export type SectionLibraryLayout = {
  metadata: LayoutMetadata;
  /** Puck Layout JSON */
  defaultLayout: Record<string, any>;
};
