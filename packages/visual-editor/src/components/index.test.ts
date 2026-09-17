import { describe, expect, it } from "vitest";
import { Address } from "./contentBlocks/Address.tsx";
import { CTAGroup } from "./contentBlocks/CTAGroup.tsx";
import { CTAWrapper } from "./contentBlocks/CtaWrapper.tsx";
import { Emails } from "./contentBlocks/Emails.tsx";
import { GetDirections } from "./contentBlocks/GetDirections.tsx";
import { HoursStatus } from "./contentBlocks/HoursStatus.tsx";
import { HoursTable } from "./contentBlocks/HoursTable.tsx";
import { Phone } from "./contentBlocks/Phone.tsx";
import { TextList } from "./contentBlocks/TextList.tsx";
import { Timestamp } from "./contentBlocks/Timestamp.tsx";
import { CopyrightMessageSlot } from "./footer/CopyrightMessageSlot.tsx";
import {
  DEFAULT_LOCATOR_RESULT_CARD_PROPS,
  LocatorResultCardFields,
} from "./locator/LocatorResultCard.tsx";
import { NearbyLocationCardsWrapper } from "./pageSections/NearbyLocations/NearbyLocationsCardsWrapper.tsx";
import { ReviewsSection } from "./pageSections/ReviewsSection/ReviewsSection.tsx";

const expectSiteColorField = (field: any): void => {
  expect(field).toMatchObject({
    type: "basicSelector",
    options: "SITE_COLOR",
  });
};

describe("OOTB color controls", () => {
  it("defines SITE_COLOR fields for business text and icons", () => {
    expectSiteColorField((Address.fields as any).styles.objectFields.textColor);
    expectSiteColorField(
      (HoursTable.fields as any).styles.objectFields.textColor
    );
    expectSiteColorField(
      (HoursStatus.fields as any).styles.objectFields.textColor
    );
    expectSiteColorField((TextList.fields as any).textColor);
    expectSiteColorField(
      (Timestamp.fields as any).styles.objectFields.textColor
    );
    expectSiteColorField((CopyrightMessageSlot.fields as any).textColor);
    expectSiteColorField((Phone.fields as any).styles.objectFields.labelColor);
    expectSiteColorField((Phone.fields as any).styles.objectFields.iconColor);
    expectSiteColorField((Emails.fields as any).styles.objectFields.iconColor);
    expectSiteColorField(
      (ReviewsSection.fields as any).styles.objectFields.textColor
    );
    expectSiteColorField(
      (NearbyLocationCardsWrapper.fields as any).styles.objectFields.textColor
    );
    expectSiteColorField(
      (LocatorResultCardFields as any).objectFields.textColor
    );
  });

  it("defines SITE_COLOR fields for primary CTA text", () => {
    expectSiteColorField(
      (CTAWrapper.fields as any).styles.objectFields.textColor
    );
    expect((CTAGroup.fields as any).buttons.arrayFields.textColor.type).toBe(
      "custom"
    );
    expectSiteColorField((GetDirections.fields as any).textColor);
    expectSiteColorField(
      (Address.fields as any).styles.objectFields.ctaTextColor
    );
    expectSiteColorField(
      (LocatorResultCardFields as any).objectFields.primaryCTA.objectFields
        .textColor
    );
    expectSiteColorField(
      (LocatorResultCardFields as any).objectFields.secondaryCTA.objectFields
        .textColor
    );
  });

  it("does not set values for the new optional defaults", () => {
    expect((Address.defaultProps as any).styles.textColor).toBeUndefined();
    expect((Address.defaultProps as any).styles.ctaTextColor).toBeUndefined();
    expect((HoursTable.defaultProps as any).styles.textColor).toBeUndefined();
    expect((HoursStatus.defaultProps as any).styles.textColor).toBeUndefined();
    expect((TextList.defaultProps as any).textColor).toBeUndefined();
    expect((Timestamp.defaultProps as any).styles.textColor).toBeUndefined();
    expect(
      (CopyrightMessageSlot.defaultProps as any).textColor
    ).toBeUndefined();
    expect((Phone.defaultProps as any).styles.labelColor).toBeUndefined();
    expect((Phone.defaultProps as any).styles.iconColor).toBeUndefined();
    expect((Emails.defaultProps as any).styles.iconColor).toBeUndefined();
    expect(
      (ReviewsSection.defaultProps as any).styles.textColor
    ).toBeUndefined();
    expect(
      (NearbyLocationCardsWrapper.defaultProps as any).styles.textColor
    ).toBeUndefined();
    expect((CTAWrapper.defaultProps as any).styles.textColor).toBeUndefined();
    expect((CTAGroup.defaultProps as any).buttons[0].textColor).toBeUndefined();
    expect((GetDirections.defaultProps as any).textColor).toBeUndefined();
    expect(DEFAULT_LOCATOR_RESULT_CARD_PROPS.textColor).toBeUndefined();
    expect(
      DEFAULT_LOCATOR_RESULT_CARD_PROPS.primaryCTA.textColor
    ).toBeUndefined();
    expect(
      DEFAULT_LOCATOR_RESULT_CARD_PROPS.secondaryCTA.textColor
    ).toBeUndefined();
  });

  it.each([
    {
      name: "CTA Wrapper",
      component: CTAWrapper,
      getProps: (variant: "primary" | "secondary") => ({
        ...(CTAWrapper.defaultProps as any),
        styles: {
          ...(CTAWrapper.defaultProps as any).styles,
          variant,
        },
      }),
      fieldPath: ["styles", "objectFields", "textColor"],
    },
    {
      name: "Get Directions",
      component: GetDirections,
      getProps: (variant: "primary" | "secondary") => ({ variant }),
      fieldPath: ["textColor"],
    },
    {
      name: "Address",
      component: Address,
      getProps: (variant: "primary" | "secondary") => ({
        ...(Address.defaultProps as any),
        styles: {
          ...(Address.defaultProps as any).styles,
          ctaVariant: variant,
        },
      }),
      fieldPath: ["styles", "objectFields", "ctaTextColor"],
    },
  ])("shows $name text color only for the primary variant", (testCase) => {
    const getVisibility = (variant: "primary" | "secondary"): boolean => {
      const fields = testCase.component.resolveFields?.(
        { props: testCase.getProps(variant) } as any,
        { metadata: {} } as any
      ) as any;
      return testCase.fieldPath.reduce((current, key) => current[key], fields)
        .visible;
    };

    expect(getVisibility("primary")).toBe(true);
    expect(getVisibility("secondary")).toBe(false);
  });
});
