import type { ThemeData } from "../internal/types/themeData.ts";

export type LocalDevOptions = {
  templateId?: string;
  entityId?: string | number;
  locale?: string;
  locales?: string[];
  layoutScopeKey?: string;
  initialLayoutData?: Record<string, unknown>;
  initialThemeData?: ThemeData;
  showOverrideButtons?: boolean;
};
