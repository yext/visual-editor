import {
  CustomCodeSectionProps,
  CustomCodeSection,
} from "../CustomCodeSection.tsx";
import { ExpandedFooterProps, ExpandedFooter } from "../footer/index.ts";
import { ExpandedHeaderProps, ExpandedHeader } from "../header/index.ts";

export interface OtherCategoryProps {
  ExpandedHeader: ExpandedHeaderProps;
  ExpandedFooter: ExpandedFooterProps;
  CustomCodeSection: CustomCodeSectionProps;
}

export const OtherCategoryComponents = {
  ExpandedHeader,
  ExpandedFooter,
  CustomCodeSection,
};

export const OtherCategory = Object.keys(
  OtherCategoryComponents
) as (keyof OtherCategoryProps)[];
