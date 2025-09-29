import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  PageSection,
  useDocument,
  Background,
  resolveYextStructField,
} from "@yext/visual-editor";
import { getImageUrl } from "@yext/pages-components";
import { HeroVariantProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";

export const SpotlightHero: React.FC<HeroVariantProps> = ({ data, styles }) => {
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
      className="bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: resolvedHero?.image?.url
          ? `url(${getImageUrl(resolvedHero.image.url, resolvedHero.image.width, resolvedHero.image.height)})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <PageSection
        aria-label={t("heroBanner", "Hero Banner")}
        outerClassName="h-fit flex items-center"
        outerStyle={{
          minHeight: `${styles.image.height}px`,
        }}
        className={`relative z-10 flex items-center w-full h-full ${
          styles.desktopContainerPosition === "center"
            ? "justify-center"
            : "justify-start"
        }`}
      >
        <Background
          background={styles.backgroundColor}
          className={`${heroContentParentCn(styles)} rounded shadow-lg p-6 md:p-10 max-w-[600px]`}
        >
          <HeroContent data={data} styles={styles} />
        </Background>
      </PageSection>
    </div>
  );
};
