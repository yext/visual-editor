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
  };
};

export type PathInfoShape = {
  primaryLocale?: string;
  includeLocalePrefixForPrimaryLocale?: boolean;
  template?: string;
  breadcrumbTemplates?: string[];
  sourceEntityPageSetTemplate?: string;
  [key: string]: any; // allow any other fields
};
