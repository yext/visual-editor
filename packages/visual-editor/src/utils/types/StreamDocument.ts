export type StreamDocument = {
  [key: string]: any; // allow any other fields
  locale?: string;
  meta?: {
    locale?: string;
    entityType?: {
      id?: string;
    };
  };
  __certified_facts?: any;
  __?: {
    pathInfo?: PathInfoShape;
    layout?: string;
    theme?: string;
    codeTemplate?: string;
    name?: string;
    visualEditorConfig?: string;
    isPrimaryLocale?: boolean; // deprecated, use pathInfo.primaryLocale instead
    entityPageSetUrlTemplates?: string;
    locatorSourcePageSets?: string;
  };
};

export type PathInfoShape = {
  primaryLocale?: string;
  includeLocalePrefixForPrimaryLocale?: boolean;
  template?: string;
  breadcrumbPrefix?: string;
  sourceEntityPageSetTemplate?: string;
  [key: string]: any; // allow any other fields
};

export type LocatorConfig = {
  source?: string;
  experienceKey?: string;
  entityType?: string; // deprecated
  savedFilter?: string; // deprecated
  entityTypeScopes?: EntityTypeScope[];
  [key: string]: any; // allow any other fields
};

export type EntityTypeScope = {
  entityType?: string;
  savedFilter?: string;
};

export type LocatorSourcePageSetInfo = {
  pathInfo?: PathInfoShape;
  entityType?: string;
  savedFilter?: number;
  internalSavedFilterId?: number;
  [key: string]: any;
};
