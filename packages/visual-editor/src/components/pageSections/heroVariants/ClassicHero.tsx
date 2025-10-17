import {
  PageSection,
  themeManagerCn,
  visualEditorMediaQuery,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { HeroVariantProps, HeroImageProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";
import { PuckComponent } from "@measured/puck";

const ClassicHeroImage: PuckComponent<HeroImageProps> = (props) => {
  const { className, styles, slots, puck } = props;
  const { t } = useTranslation();

  return styles.showImage ? (
    <div
      className={themeManagerCn("w-full my-auto", className)}
      role="region"
      aria-label={t("heroImage", "Hero Image")}
    >
      <slots.ImageSlot allow={[]} />
    </div>
  ) : puck.isEditing ? (
    <div className="h-20" />
  ) : (
    <></>
  );
};

export const ClassicHero: PuckComponent<HeroVariantProps> = (props) => {
  const { styles, slots, puck, id } = props;
  const { t } = useTranslation();
  const { sm: isMobile } = visualEditorMediaQuery();
  const showLeftImage = isMobile
    ? styles.mobileImagePosition === "top"
    : styles.desktopImagePosition === "left";

  return (
    <PageSection
      background={styles.backgroundColor}
      aria-label={t("heroBanner", "Hero Banner")}
      className="flex flex-col sm:flex-row gap-6 md:gap-10"
    >
      {/* Desktop left image / Mobile top image */}
      {showLeftImage && (
        <ClassicHeroImage
          id={id + "-image"}
          styles={styles}
          slots={slots}
          puck={puck}
        />
      )}
      <div
        className={
          heroContentParentCn(styles) + " justify-center lg:min-w-[350px]"
        }
      >
        <HeroContent {...props} />
      </div>

      {/* Desktop right image / Mobile bottom image */}
      {!showLeftImage && (
        <ClassicHeroImage
          id={id + "-image"}
          styles={styles}
          slots={slots}
          puck={puck}
        />
      )}
    </PageSection>
  );
};
