import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  PageSection,
  resolveComponentData,
  useDocument,
  Background,
} from "@yext/visual-editor";
import { HeroVariantProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";

export const SpotlightHero: React.FC<HeroVariantProps> = ({ data, styles }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedHero = resolveComponentData(data?.hero, locale, streamDocument);

  return (
    <div
      className="bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: resolvedHero?.image?.url
          ? `url(${resolvedHero.image.url})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <PageSection
        aria-label={t("heroBanner", "Hero Banner")}
        className={`relative z-10 flex items-center h-full ${
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
