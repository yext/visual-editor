import {
  CustomCodeSectionProps,
  CustomCodeSection,
} from "../CustomCodeSection";
import { ExpandedFooterProps, ExpandedFooter } from "../footer";
import { ExpandedHeaderProps, ExpandedHeader } from "../header";

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
