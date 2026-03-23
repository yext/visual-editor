import { backgroundColors } from "../../../utils/themeConfigOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { PromoVariantProps } from "./PromoSection.tsx";
import { PromoContent, promoContentParentCn } from "./PromoContent.tsx";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@yext/pages-components";
import { PuckComponent } from "@puckeditor/core";
import {
  isLocalizedAssetImage,
  resolveLocalizedAssetImage,
} from "../../../types/images.ts";

export const ImmersivePromo: PuckComponent<PromoVariantProps> = (props) => {
  const { data, styles } = props;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedBackgroundImage = resolveYextEntityField(
    streamDocument,
    data.backgroundImage,
    locale
  );

  const localizedImage =
    resolvedBackgroundImage && isLocalizedAssetImage(resolvedBackgroundImage)
      ? resolveLocalizedAssetImage(resolvedBackgroundImage, locale)
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
                selectedColor: "[#00000099]", // keep in sync VisualEditorThemeClassSafelist
                contrastingColor: "white",
                isDarkColor: true,
              }
            : backgroundColors.background1.value
        }
        aria-label={t("promoBanner", "Promo Banner")}
        className="z-10 flex items-center h-full w-full"
        outerClassName="h-fit flex items-center"
        outerStyle={{
          minHeight: `${styles.imageHeight}px`,
        }}
      >
        <div className={promoContentParentCn(styles)}>
          <PromoContent {...props} />
        </div>
      </PageSection>
    </div>
  );
};
