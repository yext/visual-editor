import { useTranslation } from "react-i18next";
import {
  PageSection,
  useDocument,
  Background,
  resolveYextEntityField,
} from "@yext/visual-editor";
import { getImageUrl } from "@yext/pages-components";
import { PromoContent, promoContentParentCn } from "./PromoContent";
import { PuckComponent } from "@puckeditor/core";
import { PromoVariantProps } from "./PromoSection";

export const SpotlightPromo: PuckComponent<PromoVariantProps> = (props) => {
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <PageSection
        aria-label={t("promoBanner", "Promo Banner")}
        outerClassName="h-fit flex items-center"
        outerStyle={{
          minHeight: `${styles.imageHeight}px`,
        }}
        className={`relative z-10 flex items-center w-full h-full ${
          styles.containerAlignment === "center"
            ? "justify-center"
            : styles.containerAlignment === "left"
              ? "justify-start"
              : "justify-end"
        }`}
      >
        <Background
          background={styles.backgroundColor}
          className={`${promoContentParentCn(styles)} rounded shadow-lg p-6 md:p-10 max-w-[600px]`}
        >
          <PromoContent {...props} />
        </Background>
      </PageSection>
    </div>
  );
};
