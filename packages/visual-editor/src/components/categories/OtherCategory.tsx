import {
  CustomCodeSectionProps,
  CustomCodeSection,
} from "../CustomCodeSection";
import { ExpandedFooterProps, ExpandedFooter } from "../footer";
import { ExpandedHeaderProps, ExpandedHeader } from "../header";
import {
  TestLocatorCardSection,
  TestLocatorCardSectionProps,
} from "../pageSections/TestLocatorCardSection.tsx";

export interface OtherCategoryProps {
  ExpandedHeader: ExpandedHeaderProps;
  ExpandedFooter: ExpandedFooterProps;
  CustomCodeSection: CustomCodeSectionProps;
  TestLocatorCardSection: TestLocatorCardSectionProps;
}

export const OtherCategoryComponents = {
  ExpandedHeader,
  ExpandedFooter,
  CustomCodeSection,
  TestLocatorCardSection,
};

export const OtherCategory = Object.keys(
  OtherCategoryComponents
) as (keyof OtherCategoryProps)[];
