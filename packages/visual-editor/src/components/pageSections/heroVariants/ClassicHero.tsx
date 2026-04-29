import { PageSection } from "../../atoms/pageSection.tsx";
import { themeManagerCn } from "../../../utils/cn.ts";
import { useTranslation } from "react-i18next";
import { HeroVariantProps, HeroImageProps } from "../HeroSection.tsx";
import { HeroContent, heroContentParentCn } from "./HeroContent.tsx";
import { PuckComponent } from "@puckeditor/core";

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

  return (
    <PageSection
      background={styles.backgroundColor}
      aria-label={t("heroBanner", "Hero Banner")}
      className="flex flex-col sm:flex-row gap-6 md:gap-10"
    >
      <ClassicHeroImage
        id={id + "-image"}
        className={themeManagerCn(
          styles.mobileImagePosition === "top" ? "order-first" : "order-last",
          styles.desktopImagePosition === "left"
            ? "sm:order-first"
            : "sm:order-last"
        )}
        styles={styles}
        slots={slots}
        puck={puck}
      />
      <div
        className={
          heroContentParentCn(styles) + " justify-center lg:min-w-[350px]"
        }
      >
        <HeroContent {...props} />
      </div>
    </PageSection>
  );
};
