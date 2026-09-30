declare const t: (...args: unknown[]) => string;
declare const pt: (...args: unknown[]) => string;
declare const msg: (...args: unknown[]) => string;
declare const i18next: { t: (...args: unknown[]) => string };
declare const translator: { t: (...args: unknown[]) => string };

export const Example = () => {
  t("page.greeting", "Hello {{name}}");
  t("page.items", "{{count}} item", { count: 2 });
  i18next.t("page.member", "Member translation");
  translator.t("page.wildcard", "Wildcard translation");
  pt("editor.label", "Editor label");
  msg("editor.description", "Editor description");
  return null;
};
