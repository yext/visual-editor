import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  EntityField,
  pt,
  themeManagerCn,
  useDocument,
  Image,
  Background,
  resolveYextStructField,
  imgSizesHelper,
} from "@yext/visual-editor";
import { HeroVariantProps, HeroImageProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";

const CompactHeroImage = ({
  className,
  resolvedHero,
  styles,
  data,
}: HeroImageProps) => {
  const { t } = useTranslation();

  return resolvedHero?.image && styles.showImage ? (
    <div
      className={themeManagerCn("w-full", className)}
      role="region"
      aria-label={t("heroImage", "Hero Image")}
    >
      <EntityField
        displayName={pt("fields.image", "Image")}
        fieldId={data.hero.field}
        constantValueEnabled={data.hero.constantValueOverride.image}
        fullHeight
      >
        <Image
          image={resolvedHero.image}
          aspectRatio={styles.image.aspectRatio}
          className={themeManagerCn(
            "w-full sm:w-fit h-full",
            styles.desktopImagePosition === "left" ? "mr-auto" : "ml-auto"
          )}
          sizes={imgSizesHelper({
            base: "100vw",
            md: "calc(maxWidth / 2)",
          })}
        />
      </EntityField>
    </div>
  ) : (
    <div className="w-full"></div>
  );
};

export const CompactHero: React.FC<HeroVariantProps> = ({ data, styles }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedHero = resolveYextStructField(
    streamDocument,
    data?.hero,
    locale
  );

  return (
    <Background
      background={styles.backgroundColor}
      className="components w-full flex flex-col sm:flex-row justify-between"
    >
      {/* Desktop left image / Mobile top image */}
      <CompactHeroImage
        className={themeManagerCn(
          styles.mobileImagePosition === "bottom" && "hidden sm:block",
          styles.desktopImagePosition === "right" && "sm:hidden"
        )}
        resolvedHero={resolvedHero}
        styles={styles}
        data={data}
      />

      {/* Mobile container styles */}
      <div
        className={themeManagerCn(
          heroContentParentCn(styles),
          "sm:hidden max-w-[700px] py-pageSection-verticalPadding pt-6 px-4"
        )}
      >
        <HeroContent data={data} styles={styles} />
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
        <HeroContent data={data} styles={styles} />
      </div>

      {/* Desktop right image / Mobile bottom image */}
      <CompactHeroImage
        className={themeManagerCn(
          styles.mobileImagePosition === "top" && "hidden sm:block",
          styles.desktopImagePosition === "left" && "sm:hidden"
        )}
        resolvedHero={resolvedHero}
        styles={styles}
        data={data}
      />
    </Background>
  );
};
