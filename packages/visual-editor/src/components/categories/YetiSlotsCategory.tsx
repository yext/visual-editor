import {
  YetiBodyCopySlot,
  YetiBodyCopySlotProps,
} from "../custom/yeti/components/YetiBodyCopySlot.tsx";
import {
  YetiBrandSlot,
  YetiBrandSlotProps,
} from "../custom/yeti/components/YetiBrandSlot.tsx";
import {
  YetiExploreCardsSlot,
  YetiExploreCardsSlotProps,
} from "../custom/yeti/components/YetiExploreCardsSlot.tsx";
import {
  YetiFaqListSlot,
  YetiFaqListSlotProps,
} from "../custom/yeti/components/YetiFaqListSlot.tsx";
import {
  YetiFooterLayoutSlot,
  YetiFooterLayoutSlotProps,
} from "../custom/yeti/components/YetiFooterLayoutSlot.tsx";
import {
  YetiFooterLegalSlot,
  YetiFooterLegalSlotProps,
} from "../custom/yeti/components/YetiFooterLegalSlot.tsx";
import {
  YetiFooterLinksColumnSlot,
  YetiFooterLinksColumnSlotProps,
} from "../custom/yeti/components/YetiFooterLinksColumnSlot.tsx";
import {
  YetiFooterSignupSlot,
  YetiFooterSignupSlotProps,
} from "../custom/yeti/components/YetiFooterSignupSlot.tsx";
import {
  YetiFooterSocialLinksSlot,
  YetiFooterSocialLinksSlotProps,
} from "../custom/yeti/components/YetiFooterSocialLinksSlot.tsx";
import {
  YetiHeaderLayoutSlot,
  YetiHeaderLayoutSlotProps,
} from "../custom/yeti/components/YetiHeaderLayoutSlot.tsx";
import {
  YetiHeroHeadingSlot,
  YetiHeroHeadingSlotProps,
} from "../custom/yeti/components/YetiHeroHeadingSlot.tsx";
import {
  YetiHeroImageSlot,
  YetiHeroImageSlotProps,
} from "../custom/yeti/components/YetiHeroImageSlot.tsx";
import {
  YetiHoursSlot,
  YetiHoursSlotProps,
} from "../custom/yeti/components/YetiHoursSlot.tsx";
import {
  YetiLocationDetailsSlot,
  YetiLocationDetailsSlotProps,
} from "../custom/yeti/components/YetiLocationDetailsSlot.tsx";
import {
  YetiMapSurfaceSlot,
  YetiMapSurfaceSlotProps,
} from "../custom/yeti/components/YetiMapSurfaceSlot.tsx";
import {
  YetiNavLinksSlot,
  YetiNavLinksSlotProps,
} from "../custom/yeti/components/YetiNavLinksSlot.tsx";
import {
  YetiParkingSlot,
  YetiParkingSlotProps,
} from "../custom/yeti/components/YetiParkingSlot.tsx";
import {
  YetiPrimaryActionSlot,
  YetiPrimaryActionSlotProps,
} from "../custom/yeti/components/YetiPrimaryActionSlot.tsx";
import {
  YetiSectionHeadingSlot,
  YetiSectionHeadingSlotProps,
} from "../custom/yeti/components/YetiSectionHeadingSlot.tsx";

export interface YetiSlotsCategoryProps {
  YetiHeaderLayoutSlot: YetiHeaderLayoutSlotProps;
  YetiBrandSlot: YetiBrandSlotProps;
  YetiNavLinksSlot: YetiNavLinksSlotProps;
  YetiPrimaryActionSlot: YetiPrimaryActionSlotProps;
  YetiHeroHeadingSlot: YetiHeroHeadingSlotProps;
  YetiSectionHeadingSlot: YetiSectionHeadingSlotProps;
  YetiHeroImageSlot: YetiHeroImageSlotProps;
  YetiBodyCopySlot: YetiBodyCopySlotProps;
  YetiHoursSlot: YetiHoursSlotProps;
  YetiLocationDetailsSlot: YetiLocationDetailsSlotProps;
  YetiParkingSlot: YetiParkingSlotProps;
  YetiMapSurfaceSlot: YetiMapSurfaceSlotProps;
  YetiExploreCardsSlot: YetiExploreCardsSlotProps;
  YetiFaqListSlot: YetiFaqListSlotProps;
  YetiFooterLayoutSlot: YetiFooterLayoutSlotProps;
  YetiFooterSignupSlot: YetiFooterSignupSlotProps;
  YetiFooterLinksColumnSlot: YetiFooterLinksColumnSlotProps;
  YetiFooterSocialLinksSlot: YetiFooterSocialLinksSlotProps;
  YetiFooterLegalSlot: YetiFooterLegalSlotProps;
}

export const YetiSlotsCategoryComponents = {
  YetiHeaderLayoutSlot,
  YetiBrandSlot,
  YetiNavLinksSlot,
  YetiPrimaryActionSlot,
  YetiHeroHeadingSlot,
  YetiSectionHeadingSlot,
  YetiHeroImageSlot,
  YetiBodyCopySlot,
  YetiHoursSlot,
  YetiLocationDetailsSlot,
  YetiParkingSlot,
  YetiMapSurfaceSlot,
  YetiExploreCardsSlot,
  YetiFaqListSlot,
  YetiFooterLayoutSlot,
  YetiFooterSignupSlot,
  YetiFooterLinksColumnSlot,
  YetiFooterSocialLinksSlot,
  YetiFooterLegalSlot,
};

export const YetiSlotsCategory = Object.keys(
  YetiSlotsCategoryComponents
) as (keyof YetiSlotsCategoryProps)[];
