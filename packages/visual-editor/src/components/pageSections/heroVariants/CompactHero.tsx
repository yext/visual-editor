import { useTranslation } from "react-i18next";
import { themeManagerCn, Background } from "@yext/visual-editor";
import { HeroVariantProps, HeroImageProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";
import { PuckComponent } from "@measured/puck";

const CompactHeroImage: PuckComponent<HeroImageProps> = ({
  className,
  styles,
  slots,
  puck,
}) => {
  const { t } = useTranslation();

  return styles.showImage ? (
    <div
      className={themeManagerCn("w-full", className)}
      role="region"
      aria-label={t("heroImage", "Hero Image")}
    >
      <slots.ImageSlot style={{ height: "100%", display: "grid" }} allow={[]} />
    </div>
  ) : puck.isEditing ? (
    <div className="h-20" />
  ) : (
    <></>
  );
};

export const CompactHero: PuckComponent<HeroVariantProps> = (props) => {
  const { styles, slots, puck, id } = props;

  return (
    <Background
      background={styles.backgroundColor}
      className="components w-full flex flex-col sm:flex-row justify-between"
    >
      {/* Desktop left image / Mobile top image */}
      <CompactHeroImage
        id={id + "-image"}
        className={themeManagerCn(
          styles.mobileImagePosition === "bottom" && "hidden sm:block",
          styles.desktopImagePosition === "right" && "sm:hidden"
        )}
        styles={styles}
        slots={slots}
        puck={puck}
      />

      {/* Mobile container styles */}
      <div
        className={themeManagerCn(
          heroContentParentCn(styles),
          "sm:hidden max-w-[700px] py-pageSection-verticalPadding pt-6 px-4"
        )}
      >
        <HeroContent {...props} />
      </div>

      {/* Desktop container */}
      <div
        className={themeManagerCn(
          heroContentParentCn(styles),
          "sm:max-w-[400px] py-pageSection-verticalPadding pt-6 px-4 hidden sm:flex self-center lg:min-w-[350px]"
        )}
        style={
          styles.desktopImagePosition === "left"
            ? {
                paddingLeft: "4rem",
                paddingRight: 0,
                marginRight:
                  "max(calc((100vw - var(--maxWidth-pageSection-contentWidth)) / 2), 1.5rem)",
              }
            : {
                paddingRight: "4rem",
                paddingLeft: 0,
                marginLeft:
                  "max(calc((100vw - var(--maxWidth-pageSection-contentWidth)) / 2), 1.5rem)",
              }
        }
      >
        <HeroContent {...props} />
      </div>

      {/* Desktop right image / Mobile bottom image */}
      <CompactHeroImage
        id={id + "-image"}
        className={themeManagerCn(
          styles.mobileImagePosition === "top" && "hidden sm:block",
          styles.desktopImagePosition === "left" && "sm:hidden"
        )}
        styles={styles}
        slots={slots}
        puck={puck}
      />
    </Background>
  );
};
