import {
  CustomCodeSectionProps,
  CustomCodeSection,
} from "../CustomCodeSection";
import { ExpandedFooterProps, ExpandedFooter } from "../footer";
import { ExpandedHeaderProps, ExpandedHeader } from "../header";
import {
  LocatorCardSection,
  LocatorCardSectionProps,
} from "../pageSections/LocatorCardSection.tsx";

export interface OtherCategoryProps {
  ExpandedHeader: ExpandedHeaderProps;
  ExpandedFooter: ExpandedFooterProps;
  CustomCodeSection: CustomCodeSectionProps;
  LocatorCardSection: LocatorCardSectionProps;
}

export const OtherCategoryComponents = {
  ExpandedHeader,
  ExpandedFooter,
  CustomCodeSection,
  LocatorCardSection,
};

export const OtherCategory = Object.keys(
  OtherCategoryComponents
) as (keyof OtherCategoryProps)[];
