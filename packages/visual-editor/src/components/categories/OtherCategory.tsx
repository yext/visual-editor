import {
  CustomCodeSectionProps,
  CustomCodeSection,
} from "../CustomCodeSection.tsx";
import {
  ExpandedFooterProps,
  ExpandedFooter,
} from "../footer/ExpandedFooter.tsx";
import {
  ExpandedHeaderProps,
  ExpandedHeader,
} from "../header/ExpandedHeader.tsx";

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
