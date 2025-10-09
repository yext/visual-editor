import {
  CustomCodeSectionProps,
  CustomCodeSection,
} from "../CustomCodeSection";
import { ExpandedFooterProps, ExpandedFooter } from "../footer";
import { ExpandedHeaderProps, ExpandedHeader } from "../header";
import {
  LocatorSection,
  LocatorSectionProps,
} from "../pageSections/LocatorSection.tsx";

export interface OtherCategoryProps {
  ExpandedHeader: ExpandedHeaderProps;
  ExpandedFooter: ExpandedFooterProps;
  CustomCodeSection: CustomCodeSectionProps;
  LocatorSection: LocatorSectionProps;
}

export const OtherCategoryComponents = {
  ExpandedHeader,
  ExpandedFooter,
  CustomCodeSection,
  LocatorSection,
};

export const OtherCategory = Object.keys(
  OtherCategoryComponents
) as (keyof OtherCategoryProps)[];
