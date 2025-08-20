import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  PageSection,
  useDocument,
  backgroundColors,
  resolveYextStructField,
} from "@yext/visual-editor";
import { HeroVariantProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";

export const ImmersiveHero: React.FC<HeroVariantProps> = ({ data, styles }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedHero = resolveYextStructField(
    streamDocument,
    data?.hero,
    locale
  );

  return (
    <div
      style={{
        backgroundImage: resolvedHero?.image?.url
          ? `url(${resolvedHero.image.url})`
          : undefined,
      }}
      className="bg-no-repeat bg-center bg-cover"
    >
      <PageSection
        background={
          resolvedHero?.image?.url
            ? {
                bgColor: "bg-[#00000080]",
                textColor: "text-white",
                isDarkBackground: true,
              }
            : backgroundColors.background1.value
        }
        aria-label={t("heroBanner", "Hero Banner")}
        className="z-10 flex items-center h-full w-full"
        outerClassName="h-fit flex items-center"
        outerStyle={{
          minHeight: `${styles.image.height}px`,
        }}
      >
        <div className={heroContentParentCn(styles)}>
          <HeroContent data={data} styles={styles} />
        </div>
      </PageSection>
    </div>
  );
};
