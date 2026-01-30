import {
  CustomCodeSectionProps,
  CustomCodeSection,
} from "../CustomCodeSection";
import { ExpandedFooterProps, ExpandedFooter } from "../footer";
import { ExpandedHeaderProps, ExpandedHeader } from "../header";
import { OtherCategory } from "./OtherCategoryList";

export interface OtherCategoryProps {
  ExpandedHeader: ExpandedHeaderProps;
  ExpandedFooter: ExpandedFooterProps;
  CustomCodeSection: CustomCodeSectionProps;
}

export const OtherCategoryComponents = {
  get ExpandedHeader() {
    return ExpandedHeader;
  },
  get ExpandedFooter() {
    return ExpandedFooter;
  },
  get CustomCodeSection() {
    return CustomCodeSection;
  },
};

export { OtherCategory };
