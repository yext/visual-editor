import {
  backgroundColors,
  PageSection,
  resolveYextEntityField,
  useDocument,
} from "@yext/visual-editor";
import { HeroVariantProps } from "../HeroSection";
import { HeroContent, heroContentParentCn } from "./HeroContent";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@yext/pages-components";
import { PuckComponent } from "@measured/puck";

export const ImmersiveHero: PuckComponent<HeroVariantProps> = (props) => {
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
      style={{
        backgroundImage: resolvedBackgroundImage?.url
          ? `url(${getImageUrl(resolvedBackgroundImage.url, resolvedBackgroundImage.width, resolvedBackgroundImage.height)})`
          : undefined,
      }}
      className="bg-no-repeat bg-center bg-cover"
    >
      <PageSection
        background={
          resolvedBackgroundImage?.url
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
          minHeight: `${styles.imageHeight}px`,
        }}
      >
        <div className={heroContentParentCn(styles)}>
          <HeroContent {...props} />
        </div>
      </PageSection>
    </div>
  );
};
