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
import { AdvancedCoreInfoCategory } from "./AdvancedCoreInfoCategoryList";

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
}

export const AdvancedCoreInfoCategoryComponents = {
  get Grid() {
    return Grid;
  },
  get Address() {
    return Address;
  },
  get BodyText() {
    return BodyText;
  },
  get CTAGroup() {
    return CTAGroup;
  },
  get CTAWrapper() {
    return CTAWrapper;
  },
  get Emails() {
    return Emails;
  },
  get GetDirections() {
    return GetDirections;
  },
  get HeadingText() {
    return HeadingText;
  },
  get HoursStatus() {
    return HoursStatus;
  },
  get HoursTable() {
    return HoursTable;
  },
  get ImageWrapper() {
    return ImageWrapper;
  },
  get MapboxStaticMap() {
    return MapboxStaticMap;
  },
  get Phone() {
    return Phone;
  },
  get TextList() {
    return TextList;
  },
};

export { AdvancedCoreInfoCategory };
