import { PuckComponent } from "@puckeditor/core";
import { PageSection } from "../../atoms/pageSection";
import { themeManagerCn } from "../../../utils/cn";
import { PromoVariantProps } from "./PromoSection";
import { PromoMedia } from "./PromoMedia";
import { PromoContent } from "./PromoContent";

export const ClassicPromo: PuckComponent<PromoVariantProps> = (props) => {
  const { data, styles, slots } = props;

  return (
    <PageSection
      background={styles.backgroundColor}
      className={themeManagerCn("flex flex-col lg:flex-row gap-8 md:gap-16")}
    >
      {/* Desktop left image / Mobile top image */}
      <PromoMedia
        data={data}
        styles={styles}
        slots={slots}
        className={themeManagerCn(
          styles.mobileImagePosition === "bottom" && "hidden lg:block",
          styles.desktopImagePosition === "right" && "lg:hidden"
        )}
      />
      <PromoContent {...props} />
      {/* Desktop right image / Mobile bottom image */}
      <PromoMedia
        data={data}
        styles={styles}
        slots={slots}
        className={themeManagerCn(
          styles.mobileImagePosition === "top" && "hidden lg:block",
          styles.desktopImagePosition === "left" && "lg:hidden"
        )}
      />
    </PageSection>
  );
};
