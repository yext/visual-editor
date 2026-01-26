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
import { PuckComponent } from "@puckeditor/core";

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

  const localizedImage =
    resolvedBackgroundImage &&
    typeof resolvedBackgroundImage === "object" &&
    "hasLocalizedValue" in resolvedBackgroundImage
      ? resolvedBackgroundImage[locale]
      : resolvedBackgroundImage;

  return (
    <div
      style={{
        backgroundImage: localizedImage?.url
          ? `url(${getImageUrl(localizedImage.url, localizedImage.width, localizedImage.height)})`
          : undefined,
      }}
      className="bg-no-repeat bg-center bg-cover"
    >
      <PageSection
        background={
          localizedImage?.url
            ? {
                bgColor: "bg-[#00000099]",
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
