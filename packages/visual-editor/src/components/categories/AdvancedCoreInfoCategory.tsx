import { Grid, GridProps } from "../layoutBlocks/Grid.tsx";
import { Address, AddressProps } from "../contentBlocks/Address.tsx";
import { BodyText, BodyTextProps } from "../contentBlocks/BodyText.tsx";
import { CTAWrapper, CTAWrapperProps } from "../contentBlocks/CtaWrapper.tsx";
import { Emails, EmailsProps } from "../contentBlocks/Emails.tsx";
import {
  GetDirections,
  GetDirectionsProps,
} from "../contentBlocks/GetDirections.tsx";
import {
  HeadingText,
  HeadingTextProps,
} from "../contentBlocks/HeadingText.tsx";
import { HoursTable, HoursTableProps } from "../contentBlocks/HoursTable.tsx";
import {
  HoursStatus,
  HoursStatusProps,
} from "../contentBlocks/HoursStatus.tsx";
import {
  ImageWrapper,
  ImageWrapperProps,
} from "../contentBlocks/image/Image.tsx";
import {
  MapboxStaticMap,
  MapboxStaticProps,
} from "../contentBlocks/MapboxStaticMap.tsx";
import { Phone, PhoneProps } from "../contentBlocks/Phone.tsx";
import { TextList, TextListProps } from "../contentBlocks/TextList.tsx";
import { CTAGroup, CTAGroupProps } from "../contentBlocks/CTAGroup";
import { SlotFlexProps, SlotFlex } from "../layoutBlocks/SlotFlex";

export interface AdvancedCoreInfoCategoryProps {
  Grid: GridProps;
  Address: AddressProps;
  BodyText: BodyTextProps;
  CTAGroup: CTAGroupProps;
  CTAWrapper: CTAWrapperProps;
  Emails: EmailsProps;
  GetDirections: GetDirectionsProps;
  HeadingText: HeadingTextProps;
  HoursTable: HoursTableProps;
  HoursStatus: HoursStatusProps;
  ImageWrapper: ImageWrapperProps;
  MapboxStaticMap: MapboxStaticProps;
  Phone: PhoneProps;
  TextList: TextListProps;
  SlotFlex: SlotFlexProps;
}

export const AdvancedCoreInfoCategoryComponents = {
  Grid,
  Address,
  BodyText,
  CTAGroup,
  CTAWrapper,
  Emails,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  ImageWrapper,
  MapboxStaticMap,
  Phone,
  TextList,
  SlotFlex,
};

export const AdvancedCoreInfoCategory = Object.keys(
  AdvancedCoreInfoCategoryComponents
) as (keyof AdvancedCoreInfoCategoryProps)[];
