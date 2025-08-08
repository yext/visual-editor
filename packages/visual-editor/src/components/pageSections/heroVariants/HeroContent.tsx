import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  EntityField,
  Heading,
  pt,
  resolveComponentData,
  getAggregateRating,
  ReviewStars,
  CTA,
  HoursStatusAtom,
  useDocument,
  themeManagerCn,
} from "@yext/visual-editor";
import { HeroVariantProps } from "../HeroSection";

// Shared styling for the various parent containers of HeroContent
export const heroContentParentCn = (styles: HeroVariantProps["styles"]) => {
  const desktopContainerPosition =
    styles.variant === "spotlight" || styles.variant === "immersive"
      ? styles.desktopContainerPosition
      : "left";
  return `flex flex-col gap-y-6 md:gap-y-8 w-full break-words ${desktopContainerPosition === "left" ? "items-start sm:text-start" : "items-center sm:text-center"} ${styles.mobileContentAlignment === "left" ? "text-start" : "text-center"}`;
};

export const HeroContent: React.FC<HeroVariantProps> = ({ data, styles }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument() as any;
  const resolvedBusinessName = resolveComponentData(
    data?.businessName,
    locale,
    streamDocument
  );
  const resolvedLocalGeoModifier = resolveComponentData(
    data?.localGeoModifier,
    locale,
    streamDocument
  );
  const resolvedHours = resolveComponentData(
    data?.hours,
    locale,
    streamDocument
  );
  const resolvedHero = resolveComponentData(data?.hero, locale, streamDocument);
  const { timezone } = streamDocument as {
    timezone: string;
  };
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);

  const desktopContainerPosition =
    styles.variant === "spotlight" || styles.variant === "immersive"
      ? styles.desktopContainerPosition
      : "left";

  return (
    <>
      <header
        className="flex flex-col gap-y-4 w-full sm:w-initial"
        aria-label={t("heroHeader", "Hero Header")}
      >
        <section
          className="flex flex-col gap-y-0"
          aria-label={t("businessInformation", "Business Information")}
        >
          {resolvedBusinessName && (
            <EntityField
              displayName={pt("fields.businessName", "Business Name")}
              fieldId={data?.businessName.field}
              constantValueEnabled={data?.businessName.constantValueEnabled}
            >
              <Heading level={styles?.businessNameLevel}>
                {resolvedBusinessName}
              </Heading>
            </EntityField>
          )}
          {resolvedLocalGeoModifier && (
            <EntityField
              displayName={pt("fields.localGeomodifier", "Local GeoModifier")}
              fieldId={data?.localGeoModifier.field}
              constantValueEnabled={data?.localGeoModifier.constantValueEnabled}
            >
              <Heading level={styles?.localGeoModifierLevel}>
                {resolvedLocalGeoModifier}
              </Heading>
            </EntityField>
          )}
        </section>
        {resolvedHours && (
          <EntityField
            displayName={pt("fields.hours", "Hours")}
            fieldId={data?.hours.field}
            constantValueEnabled={data?.hours.constantValueEnabled}
          >
            <HoursStatusAtom hours={resolvedHours} timezone={timezone} />
          </EntityField>
        )}
        {reviewCount > 0 && data.showAverageReview && (
          <ReviewStars
            averageRating={averageRating}
            reviewCount={reviewCount}
            className={themeManagerCn(
              styles.mobileContentAlignment === "left"
                ? "justify-start"
                : "justify-center",
              desktopContainerPosition === "left"
                ? "sm:justify-start"
                : "sm:justify-center"
            )}
          />
        )}
      </header>
      {(resolvedHero?.primaryCta?.label ||
        resolvedHero?.secondaryCta?.label) && (
        <div
          className={themeManagerCn(
            "flex flex-col gap-y-4 md:gap-x-4 md:flex-row w-full flex-wrap ",
            styles.mobileContentAlignment === "center"
              ? "sm:items-center"
              : "sm:items-start",
            desktopContainerPosition === "center"
              ? "justify-center"
              : "justify-start"
          )}
          aria-label={t("callToActions", "Call to Actions")}
        >
          {resolvedHero?.primaryCta?.label && (
            <EntityField
              displayName={pt("fields.primaryCta", "Primary CTA")}
              fieldId={data.hero.field}
              constantValueEnabled={data.hero.constantValueOverride.primaryCta}
            >
              <CTA
                eventName="primaryCta"
                variant={styles?.primaryCTA}
                label={resolveComponentData(
                  resolvedHero.primaryCta.label,
                  i18n.language
                )}
                link={resolveComponentData(
                  resolvedHero.primaryCta.link,
                  i18n.language
                )}
                linkType={resolvedHero.primaryCta.linkType}
                className={
                  styles?.primaryCTA === "link"
                    ? "py-3 border-2 border-transparent sm:w-fit w-full" // match other CTA variant sizing
                    : ""
                }
              />
            </EntityField>
          )}
          {resolvedHero?.secondaryCta?.label && (
            <EntityField
              displayName={pt("fields.secondaryCta", "Secondary CTA")}
              fieldId={data.hero.field}
              constantValueEnabled={
                data.hero.constantValueOverride.secondaryCta
              }
            >
              <CTA
                eventName="secondaryCta"
                variant={styles?.secondaryCTA}
                label={resolveComponentData(
                  resolvedHero.secondaryCta.label,
                  i18n.language
                )}
                link={resolveComponentData(
                  resolvedHero.secondaryCta.link,
                  i18n.language
                )}
                linkType={resolvedHero.secondaryCta.linkType}
                className={
                  styles?.secondaryCTA === "link"
                    ? "py-3 border-2 border-transparent sm:w-fit w-full" // match other CTA variant sizing
                    : ""
                }
              />
            </EntityField>
          )}
        </div>
      )}
    </>
  );
};
