import { PuckContext } from "@measured/puck";
import { Address, AddressType, HoursType } from "@yext/pages-components";
import {
  Background,
  Heading,
  HeadingLevel,
  HoursStatusAtom,
  MaybeLink,
  PhoneAtom,
  useTemplateProps,
} from "@yext/visual-editor";
import React from "react";
import { NearbyLocationCardsWrapperProps } from "./NearbyLocationsCardsWrapper";
import {
  mergeMeta,
  resolveUrlTemplate,
} from "../../../utils/urls/resolveUrlTemplate";

/** A single card for the Nearby Locations Section */
type NearbyLocationCardProps = {
  /** The location data to display in the card */
  locationData?: {
    /** The name of the location */
    name: string;
    /** The hours of the location */
    hours: HoursType;
    /** The address of the location */
    address: AddressType;
    /** The timezone of the location */
    timezone: string;
    /** The phone number of the location */
    mainPhone: string;
  };

  /** @internal Shared styles for the card (controlled by the parent) */
  styles: NearbyLocationCardsWrapperProps["styles"];
  /** @internal The index of the card in the section */
  cardNumber?: number;

  /** @internal The puck context of the parent */
  puck: PuckContext;

  /** @internal The heading level of the parent section (used to meet accessibility guidelines) */
  sectionHeadingLevel?: HeadingLevel;
};

export const NearbyLocationCard: React.FC<NearbyLocationCardProps> = (
  props
) => {
  const { locationData, styles, cardNumber, sectionHeadingLevel } = props;

  if (!locationData) {
    return <></>;
  }

  const { name, hours, address, timezone, mainPhone } = locationData;

  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  const resolvedUrl = resolveUrlTemplate(
    mergeMeta(locationData, streamDocument),
    relativePrefixToRoot ?? ""
  );

  return (
    <Background
      background={styles.backgroundColor}
      className="flex flex-col flew-grow h-full rounded-lg overflow-hidden border p-6 sm:p-8"
      as="section"
    >
      <MaybeLink
        eventName={`link${cardNumber}`}
        alwaysHideCaret={true}
        className="mb-2 line-clamp-2 text-wrap break-words w-full"
        href={resolvedUrl}
      >
        <Heading
          color={styles?.color}
          level={styles.headingLevel ?? 4}
          semanticLevelOverride={
            sectionHeadingLevel
              ? sectionHeadingLevel < 6
                ? ((sectionHeadingLevel + 1) as HeadingLevel)
                : "span"
              : undefined
          }
        >
          {name}
        </Heading>
      </MaybeLink>
      {hours && (
        <div className="mb-2 font-semibold font-body-fontFamily text-body-fontSize">
          <HoursStatusAtom
            hours={hours}
            className="h-full"
            timezone={timezone}
            showCurrentStatus={styles?.hours?.showCurrentStatus}
            dayOfWeekFormat={styles?.hours?.dayOfWeekFormat}
            showDayNames={styles?.hours?.showDayNames}
            timeFormat={styles?.hours?.timeFormat}
          />
        </div>
      )}
      {mainPhone && (
        <PhoneAtom
          eventName={`phone${cardNumber}`}
          phoneNumber={mainPhone}
          format={styles?.phone?.phoneNumberFormat}
          includeHyperlink={styles?.phone?.phoneNumberLink}
          includeIcon={false}
        />
      )}
      {address && (
        <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
          <Address
            address={address}
            lines={[
              ["line1"],
              ["line2"],
              ["city", ",", "region", "postalCode"],
            ]}
          />
        </div>
      )}
    </Background>
  );
};
