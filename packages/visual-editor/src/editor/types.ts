export type LocalDevOptions = {
  templateId?: string;
  entityId?: string | number;
  locale?: string;
  locales?: string[];
  layoutScopeKey?: string;
  initialLayoutData?: Record<string, unknown>;
  showOverrideButtons?: boolean;
};
