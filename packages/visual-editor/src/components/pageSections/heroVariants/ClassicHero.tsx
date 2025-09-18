import {
  EntityField,
  PageSection,
  pt,
  Image,
  useDocument,
  themeManagerCn,
  resolveYextStructField,
  imgSizesHelper,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { HeroVariantProps, HeroImageProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";

const ClassicHeroImage = ({
  className,
  resolvedHero,
  styles,
  data,
}: HeroImageProps) => {
  const { t } = useTranslation();

  return (
    resolvedHero?.image &&
    styles.showImage && (
      <div
        className={themeManagerCn("w-full my-auto", className)}
        role="region"
        aria-label={t("heroImage", "Hero Image")}
      >
        <EntityField
          displayName={pt("fields.image", "Image")}
          fieldId={data.hero.field}
          constantValueEnabled={data.hero.constantValueOverride.image}
        >
          <Image
            image={resolvedHero?.image}
            aspectRatio={styles.image.aspectRatio}
            width={styles.image.width}
            className="max-w-full sm:max-w-initial md:max-w-[350px] lg:max-w-none rounded-image-borderRadius"
            sizes={imgSizesHelper({
              base: "100vw",
              md: "350px",
              lg: styles.image.width
                ? `${styles.image.width}px`
                : "calc(maxWidth / 2)",
            })}
          />
        </EntityField>
      </div>
    )
  );
};

export const ClassicHero: React.FC<HeroVariantProps> = ({ data, styles }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedHero = resolveYextStructField(
    streamDocument,
    data?.hero,
    locale
  );

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
        resolvedHero={resolvedHero}
        styles={styles}
        data={data}
      />

      <div
        className={
          heroContentParentCn(styles) + " justify-center lg:min-w-[350px]"
        }
      >
        <HeroContent data={data} styles={styles} />
      </div>

      {/* Desktop right image / Mobile bottom image */}
      <ClassicHeroImage
        className={themeManagerCn(
          styles.mobileImagePosition === "top" && "hidden sm:block",
          styles.desktopImagePosition === "left" && "sm:hidden"
        )}
        resolvedHero={resolvedHero}
        styles={styles}
        data={data}
      />
    </PageSection>
  );
};
