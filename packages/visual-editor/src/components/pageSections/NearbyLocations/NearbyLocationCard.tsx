import React from "react";
import { PuckContext } from "@puckeditor/core";
import { Address } from "@yext/pages-components";
import { Background } from "../../atoms/background.tsx";
import { Heading } from "../../atoms/heading.tsx";
import { HeadingLevel } from "../../../utils/themeConfigOptions.ts";
import { HoursStatusAtom } from "../../atoms/hoursStatus.tsx";
import { MaybeLink } from "../../atoms/maybeLink.tsx";
import { PhoneAtom } from "../../atoms/phone.tsx";
import { useTemplateProps } from "../../../hooks/useDocument.tsx";
import { NearbyLocationCardsWrapperProps } from "./NearbyLocationsCardsWrapper.tsx";
import {
  mergeMeta,
  resolveUrlTemplate,
} from "../../../utils/urls/resolveUrlTemplate.ts";
import { NearbyLocationDoc } from "./useNearbyLocations.ts";
import { getTextColorClass, getTextColorStyle } from "../../../utils/colors.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { useTranslation } from "react-i18next";

/** A single card for the Nearby Locations Section */
type NearbyLocationCardProps = {
  /** The location data to display in the card */
  locationData?: NearbyLocationDoc;
  /** The title binding shared by cards in the section. */
  title?: NearbyLocationCardsWrapperProps["data"]["title"];

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
  const { locationData, title, styles, cardNumber, sectionHeadingLevel } =
    props;
  const { i18n } = useTranslation();

  if (!locationData) {
    return <></>;
  }

  const { name, hours, comingSoon, address, timezone, mainPhone } =
    locationData;
  const resolvedTitle = resolveComponentData(
    title ?? { field: "name", constantValue: { defaultValue: "" } },
    i18n.language,
    locationData,
    { output: "plainText" }
  );
  const cardTitle = resolvedTitle.trim() ? resolvedTitle : name;

  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  const resolvedUrl = resolveUrlTemplate(
    mergeMeta(locationData, streamDocument),
    relativePrefixToRoot ?? ""
  );

  const showPhone = styles.showPhone && mainPhone;
  const showAddress = styles.showAddress && address;

  return (
    <Background
      background={styles.backgroundColor}
      className={`flex flex-col flew-grow h-full rounded-lg overflow-hidden border p-6 sm:p-8 ${getTextColorClass(styles.textColor) ?? ""}`}
      style={getTextColorStyle(styles.textColor)}
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
          {cardTitle}
        </Heading>
      </MaybeLink>
      {styles.showHours && (hours || comingSoon) && (
        <div
          className={`font-semibold font-body-fontFamily text-body-fontSize ${showPhone || showAddress ? "mb-2" : ""}`}
        >
          <HoursStatusAtom
            hours={hours ?? {}}
            comingSoon={comingSoon}
            className="h-full"
            timezone={timezone}
            showCurrentStatus={styles?.hours?.showCurrentStatus}
            dayOfWeekFormat={styles?.hours?.dayOfWeekFormat}
            showDayNames={styles?.hours?.showDayNames}
            timeFormat={styles?.hours?.timeFormat}
          />
        </div>
      )}
      {showPhone && (
        <PhoneAtom
          eventName={`phone${cardNumber}`}
          phoneNumber={mainPhone}
          format={styles?.phone?.phoneNumberFormat}
          includeHyperlink={styles?.phone?.phoneNumberLink}
          includeIcon={false}
          linkColor={styles?.phone?.color}
        />
      )}
      {showAddress && (
        <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
          <Address
            address={address}
            showRegion={styles.address?.showRegion ?? true}
            showCountry={styles.address?.showCountry ?? false}
          />
        </div>
      )}
    </Background>
  );
};
