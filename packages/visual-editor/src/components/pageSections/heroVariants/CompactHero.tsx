import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  EntityField,
  pt,
  resolveComponentData,
  themeManagerCn,
  useDocument,
  Image,
  Background,
} from "@yext/visual-editor";
import { HeroVariantProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";

export const CompactHero: React.FC<HeroVariantProps> = ({ data, styles }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedHero = resolveComponentData(data?.hero, locale, streamDocument);

  const CompactHeroImage = ({ className }: { className: string }) => {
    return resolvedHero?.image && styles.showImage ? (
      <div
        className={`w-full ${className} max-h-[400px]`}
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
            className="w-full h-full object-cover"
          />
        </EntityField>
      </div>
    ) : (
      <div className="w-full"></div>
    );
  };

  return (
    <div className="components w-full flex flex-col sm:flex-row">
      {/* Desktop left image / Mobile top image */}
      <CompactHeroImage
        className={themeManagerCn(
          styles.mobileImagePosition === "bottom" && "hidden sm:block",
          styles.desktopImagePosition === "right" && "sm:hidden"
        )}
      />

      {/* Mobile container styles */}
      <Background
        background={styles.backgroundColor}
        className={themeManagerCn(
          heroContentParentCn(styles),
          "sm:hidden max-w-[700px] py-pageSection-verticalPadding pt-6 px-4"
        )}
      >
        <HeroContent data={data} styles={styles} />
      </Background>

      {/* Desktop container */}
      <Background
        background={styles.backgroundColor}
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
      </Background>

      {/* Desktop right image / Mobile bottom image */}
      <CompactHeroImage
        className={themeManagerCn(
          styles.mobileImagePosition === "top" && "hidden sm:block",
          styles.desktopImagePosition === "left" && "sm:hidden"
        )}
      />
    </div>
  );
};
