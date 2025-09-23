import {
  AddressLocked,
  AddressProps,
  BodyTextLocked,
  BodyTextProps,
  CTAGroupLocked,
  CTAGroupProps,
  CTAWrapperLocked,
  CTAWrapperProps,
  EmailsLocked,
  EmailsProps,
  GetDirectionsLocked,
  GetDirectionsProps,
  HeadingTextLocked,
  HeadingTextProps,
  HoursStatusLocked,
  HoursStatusProps,
  HoursTableLocked,
  HoursTableProps,
  ImageWrapperLocked,
  ImageWrapperProps,
  MapboxStaticMapLocked,
  MapboxStaticProps,
  PhoneLocked,
  PhoneProps,
  TextListLocked,
  TextListProps,
} from "../contentBlocks";

export interface LockedCategoryProps {
  AddressLocked: AddressProps;
  BodyTextLocked: BodyTextProps;
  CTAGroupLocked: CTAGroupProps;
  CTAWrapperLocked: CTAWrapperProps;
  EmailsLocked: EmailsProps;
  GetDirectionsLocked: GetDirectionsProps;
  HeadingTextLocked: HeadingTextProps;
  HoursStatusLocked: HoursStatusProps;
  HoursTableLocked: HoursTableProps;
  ImageWrapperLocked: ImageWrapperProps;
  MapboxStaticMapLocked: MapboxStaticProps;
  PhoneLocked: PhoneProps;
  TextListLocked: TextListProps;
}

export const LockedCategoryComponents = {
  AddressLocked,
  BodyTextLocked,
  CTAGroupLocked,
  CTAWrapperLocked,
  EmailsLocked,
  GetDirectionsLocked,
  HeadingTextLocked,
  HoursStatusLocked,
  HoursTableLocked,
  ImageWrapperLocked,
  MapboxStaticMapLocked,
  PhoneLocked,
  TextListLocked,
};

export const LockedCategory = Object.keys(
  LockedCategoryComponents
) as (keyof LockedCategoryProps)[];
