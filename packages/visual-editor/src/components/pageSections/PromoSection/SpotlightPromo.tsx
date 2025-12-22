import { useTranslation } from "react-i18next";
import {
  PageSection,
  useDocument,
  Background,
  resolveYextEntityField,
} from "@yext/visual-editor";
import { getImageUrl } from "@yext/pages-components";
import { PromoContent, promoContentParentCn } from "./PromoContent";
import { PuckComponent } from "@measured/puck";
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
