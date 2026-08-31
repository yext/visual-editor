import { type YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import {
  type TranslatableCTA,
  type TranslatableString,
} from "../types/types.ts";
import { resolveComponentData } from "./resolveComponentData.tsx";
import {
  type ResolvedCTA,
  resolveLocalizedCtas,
} from "./resolveLocalizedCtas.ts";

type FooterSection = {
  label: TranslatableString | YextEntityField<TranslatableString>;
  links: TranslatableCTA[];
};

export type ResolvedFooterSection<T extends FooterSection = FooterSection> =
  Omit<T, "label" | "links"> & {
    label: string;
    links: ResolvedCTA[];
  };

export const resolveLocalizedFooterSection = <T extends FooterSection>(
  section: T,
  locale: string,
  streamDocument?: Record<string, any>
): ResolvedFooterSection<T> => {
  return {
    ...section,
    label: resolveComponentData(section.label, locale, streamDocument),
    links: resolveLocalizedCtas(section.links, locale, streamDocument),
  };
};
