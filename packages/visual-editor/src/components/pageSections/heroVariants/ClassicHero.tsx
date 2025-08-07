import {
  EntityField,
  PageSection,
  pt,
  resolveComponentData,
  Image,
  useDocument,
  themeManagerCn,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { HeroVariantProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";

export const ClassicHero: React.FC<HeroVariantProps> = ({ data, styles }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument() as any;
  const resolvedHero = resolveComponentData(data?.hero, locale, streamDocument);

  const ClassicHeroImage = ({ className }: { className: string }) => {
    return (
      resolvedHero?.image &&
      styles.showImage && (
        <EntityField
          displayName={pt("fields.image", "Image")}
          fieldId={data.hero.field}
          constantValueEnabled={data.hero.constantValueOverride.image}
        >
          <div
            className={themeManagerCn("w-full", className)}
            role="region"
            aria-label={t("heroImage", "Hero Image")}
          >
            <Image
              image={resolvedHero?.image}
              aspectRatio={styles.image.aspectRatio}
              width={styles.image.width || 640}
              className="max-w-full sm:max-w-initial md:max-w-[350px] lg:max-w-none rounded-image-borderRadius"
            />
          </div>
        </EntityField>
      )
    );
  };

  return (
    <PageSection
      background={styles.backgroundColor}
      aria-label={t("heroBanner", "Hero Banner")}
      className="flex flex-col sm:flex-row gap-6 md:gap-10"
    >
      {/* Desktop left image / Mobile top image */}
      <ClassicHeroImage
        className={themeManagerCn(
          styles.mobileImagePosition === "bottom" && "hidden sm:block",
          styles.desktopImagePosition === "right" && "sm:hidden"
        )}
      />

      <div className={heroContentParentCn(styles) + " justify-center"}>
        <HeroContent data={data} styles={styles} />
      </div>

      {/* Desktop right image / Mobile bottom image */}
      <ClassicHeroImage
        className={themeManagerCn(
          styles.mobileImagePosition === "top" && "hidden sm:block",
          styles.desktopImagePosition === "left" && "sm:hidden"
        )}
      />
    </PageSection>
  );
};
