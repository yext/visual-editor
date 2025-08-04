import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  EntityField,
  Heading,
  PageSection,
  pt,
  resolveComponentData,
  getAggregateRating,
  ReviewStars,
  CTA,
  HoursStatusAtom,
  useDocument,
} from "@yext/visual-editor";
import { HeroSectionProps } from "../HeroSection";

export const SpotlightHero: React.FC<HeroSectionProps> = ({ data, styles }) => {
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

  // Get container position from styles (left or center)
  const containerPosition = styles?.containerPosition || "left";
  const contentAlignment = styles?.contentAlignment || "left";
  const textAlignment = styles?.textAlignment || "left";

  return (
    <div
      className="relative w-full"
      style={{
        backgroundImage: resolvedHero?.image?.url
          ? `url(${resolvedHero.image.url})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <PageSection
        aria-label={t("heroBanner", "Hero Banner")}
        className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
      >
        {/* Content container with positioning */}
        <div
          className={`relative z-10 flex items-center h-full ${
            containerPosition === "center" ? "justify-center" : "justify-start"
          }`}
        >
          {/* White container with max width */}
          <div
            className={`bg-white rounded-lg shadow-lg p-6 md:p-10 max-w-[600px] w-full ${
              contentAlignment === "center" ? "text-center" : "text-left"
            }`}
          >
            <div className="flex flex-col gap-y-6 md:gap-y-8">
              <header
                className="flex flex-col gap-y-4"
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
                      constantValueEnabled={
                        data?.businessName.constantValueEnabled
                      }
                    >
                      <Heading
                        level={styles?.businessNameLevel}
                        className={`text-gray-900 ${
                          textAlignment === "center"
                            ? "text-center"
                            : "text-left"
                        }`}
                      >
                        {resolvedBusinessName}
                      </Heading>
                    </EntityField>
                  )}
                  {resolvedLocalGeoModifier && (
                    <EntityField
                      displayName={pt(
                        "fields.localGeomodifier",
                        "Local GeoModifier"
                      )}
                      fieldId={data?.localGeoModifier.field}
                      constantValueEnabled={
                        data?.localGeoModifier.constantValueEnabled
                      }
                    >
                      <Heading
                        level={styles?.localGeoModifierLevel}
                        className={`text-gray-900 ${
                          textAlignment === "center"
                            ? "text-center"
                            : "text-left"
                        }`}
                      >
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
                    <div className="text-gray-700">
                      <HoursStatusAtom
                        hours={resolvedHours}
                        timezone={timezone}
                      />
                    </div>
                  </EntityField>
                )}
                {reviewCount > 0 && data.showAverageReview && (
                  <div className="text-gray-700">
                    <ReviewStars
                      averageRating={averageRating}
                      reviewCount={reviewCount}
                    />
                  </div>
                )}
              </header>
              {(resolvedHero?.primaryCta?.label ||
                resolvedHero?.secondaryCta?.label) && (
                <div
                  className={`flex gap-y-4 md:gap-x-4 ${
                    contentAlignment === "center"
                      ? "justify-center"
                      : "justify-start"
                  } ${
                    resolvedHero?.primaryCta?.label &&
                    resolvedHero?.secondaryCta?.label
                      ? "flex-col md:flex-row"
                      : "flex-col"
                  }`}
                  aria-label={t("callToActions", "Call to Actions")}
                >
                  {resolvedHero?.primaryCta?.label && (
                    <EntityField
                      displayName={pt("fields.primaryCta", "Primary CTA")}
                      fieldId={data.hero.field}
                      constantValueEnabled={
                        data.hero.constantValueOverride.primaryCta
                      }
                    >
                      <CTA
                        eventName={`primaryCta`}
                        variant={styles?.primaryCTA}
                        label={resolveComponentData(
                          resolvedHero.primaryCta.label,
                          i18n.language
                        )}
                        link={resolvedHero.primaryCta.link}
                        linkType={resolvedHero.primaryCta.linkType}
                        className={"py-3"}
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
                        eventName={`secondaryCta`}
                        variant={styles?.secondaryCTA}
                        label={resolveComponentData(
                          resolvedHero.secondaryCta.label,
                          i18n.language
                        )}
                        link={resolvedHero.secondaryCta.link}
                        linkType={resolvedHero.secondaryCta.linkType}
                        className={"py-3"}
                      />
                    </EntityField>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  );
};
