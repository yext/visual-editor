import { PuckComponent } from "@puckeditor/core";
import { PageSection } from "../../atoms/pageSection.tsx";
import { themeManagerCn } from "../../../utils/cn.ts";
import { PromoVariantProps } from "./PromoSection.tsx";
import { PromoMedia } from "./PromoMedia.tsx";
import { PromoContent } from "./PromoContent.tsx";

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
