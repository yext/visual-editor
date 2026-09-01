import { type TranslatableCTA } from "../types/types.ts";
import { resolveComponentData } from "./resolveComponentData.tsx";

/**
 * A {@link TranslatableCTA} whose label and link have been localized by
 * {@link resolveLocalizedCtas}.
 */
export type ResolvedCTA = Omit<TranslatableCTA, "label" | "link"> & {
  label: string;
  link: string;
};

export const resolveLocalizedCtas = (
  ctas: TranslatableCTA[] | undefined,
  locale: string,
  streamDocument?: Record<string, any>
): ResolvedCTA[] => {
  return (ctas ?? [])
    .map((cta) => ({
      ...cta,
      label: resolveComponentData(cta.label, locale, streamDocument),
      link: resolveComponentData(cta.link, locale, streamDocument),
    }))
    .filter((cta) => cta.label.trim() !== "" && cta.link.trim() !== "");
};
