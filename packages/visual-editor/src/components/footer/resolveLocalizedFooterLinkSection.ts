import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import {
  type TranslatableCTA,
  type TranslatableString,
} from "../../types/types.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import {
  type ResolvedCTA,
  resolveLocalizedCtas,
} from "../../utils/resolveLocalizedCtas.ts";

type FooterLinkSection = {
  label: TranslatableString | YextEntityField<TranslatableString>;
  links: TranslatableCTA[];
};

export type ResolvedFooterLinkSection<
  T extends FooterLinkSection = FooterLinkSection,
> = Omit<T, "label" | "links"> & {
  label: string;
  links: ResolvedCTA[];
};

export const resolveLocalizedFooterLinkSection = <T extends FooterLinkSection>(
  section: T,
  locale: string,
  streamDocument?: Record<string, any>
): ResolvedFooterLinkSection<T> => {
  return {
    ...section,
    label: resolveComponentData(section.label, locale, streamDocument),
    links: resolveLocalizedCtas(section.links, locale, streamDocument),
  };
};
