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

export const ImmersiveHero: React.FC<HeroSectionProps> = ({ data, styles }) => {
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
      {/* Dark overlay for better text readability - only show if there's a background image */}
      {resolvedHero?.image?.url && (
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      )}

      <PageSection
        aria-label={t("heroBanner", "Hero Banner")}
        className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
      >
        {/* Content container */}
        <div className="relative z-10 flex items-center justify-start h-full">
          <div className="flex flex-col justify-center gap-y-6 w-full break-words md:gap-y-8">
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
                      className={`${
                        resolvedHero?.image?.url
                          ? "text-white"
                          : "text-gray-900"
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
                      className={`${
                        resolvedHero?.image?.url
                          ? "text-white"
                          : "text-gray-900"
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
                  <div
                    className={
                      resolvedHero?.image?.url ? "text-white" : "text-gray-700"
                    }
                  >
                    <HoursStatusAtom
                      hours={resolvedHours}
                      timezone={timezone}
                    />
                  </div>
                </EntityField>
              )}
              {reviewCount > 0 && data.showAverageReview && (
                <div
                  className={
                    resolvedHero?.image?.url ? "text-white" : "text-gray-700"
                  }
                >
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
                className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
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
      </PageSection>
    </div>
  );
};
