import { useTranslation } from "react-i18next";
import {
  PageSection,
  useDocument,
  Background,
  resolveYextEntityField,
} from "@yext/visual-editor";
import { getImageUrl } from "@yext/pages-components";
import { HeroVariantProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";
import { PuckComponent } from "@measured/puck";

export const SpotlightHero: PuckComponent<HeroVariantProps> = (props) => {
  const { data, styles } = props;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();

  const resolvedBackgroundImage = resolveYextEntityField(
    streamDocument,
    data?.backgroundImage,
    locale
  );

  return (
    <div
      className="bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: resolvedBackgroundImage?.url
          ? `url(${getImageUrl(resolvedBackgroundImage.url, resolvedBackgroundImage.width, resolvedBackgroundImage.height)})`
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
          minHeight: `${styles.imageHeight}px`,
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
          <HeroContent {...props} />
        </Background>
      </PageSection>
    </div>
  );
};
