import {
  HeadingTextProps,
  HeadingText,
} from "../contentBlocks/HeadingText.tsx";
import { BodyTextProps, BodyText } from "../contentBlocks/BodyText.tsx";
import { CTAWrapper, CTAWrapperProps } from "../contentBlocks/CtaWrapper.tsx";
import {
  ImageWrapper,
  ImageWrapperProps,
} from "../contentBlocks/image/Image.tsx";
import {
  ProductCardsWrapper,
  ProductCardsWrapperProps,
  ProductCard,
  ProductCardProps,
} from "../pageSections/ProductSection.tsx";

export interface SlotsCategoryProps {
  HeadingTextSlot: HeadingTextProps;
  ProductCardsWrapper: ProductCardsWrapperProps;
  ProductCard: ProductCardProps;
  BodyTextSlot: BodyTextProps;
  CTAWrapperSlot: CTAWrapperProps;
  ImageWrapperSlot: ImageWrapperProps;
}

const lockedPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
};

export const SlotsCategoryComponents = {
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
  ProductCardsWrapper: {
    ...ProductCardsWrapper,
    permissions: lockedPermissions,
  },
  ProductCard: { ...ProductCard, permissions: lockedPermissions },
  BodyTextSlot: { ...BodyText, permissions: lockedPermissions },
  CTAWrapperSlot: { ...CTAWrapper, permissions: lockedPermissions },
  ImageWrapperSlot: { ...ImageWrapper, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
