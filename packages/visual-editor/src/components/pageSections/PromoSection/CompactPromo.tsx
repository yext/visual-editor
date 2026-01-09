import { themeManagerCn, Background } from "@yext/visual-editor";
import { PuckComponent } from "@measured/puck";
import { PromoMedia } from "./PromoMedia";
import { PromoContent, promoContentParentCn } from "./PromoContent";
import { PromoVariantProps } from "./PromoSection";

export const CompactPromo: PuckComponent<PromoVariantProps> = (props) => {
  const { data, styles, slots } = props;

  return (
    <Background background={styles.backgroundColor}>
      <div
        className={themeManagerCn(
          "w-full max-w-[1440px] flex flex-col lg:flex-row justify-between",
          styles.desktopImagePosition === "left"
            ? "lg:pr-[max(calc((100vw-var(--maxWidth-pageSection-contentWidth))/2),1.5rem)] 2xl:pr-[max(calc((100vw-var(--maxWidth-pageSection-contentWidth))/2),1.5rem)] 2xl:ml-auto"
            : "lg:pl-[max(calc((100vw-var(--maxWidth-pageSection-contentWidth))/2),1.5rem)] 2xl:pl-[max(calc((100vw-var(--maxWidth-pageSection-contentWidth))/2),1.5rem)] 2xl:mr-auto"
        )}
      >
        {/* Desktop left image / Mobile top image */}
        <PromoMedia
          className={themeManagerCn(
            styles.mobileImagePosition === "bottom" && "hidden lg:block",
            styles.desktopImagePosition === "right" && "lg:hidden",
            "lg:w-2/4"
          )}
          data={data}
          styles={styles}
          slots={slots}
        />

        {/* Mobile container styles */}
        <div
          className={themeManagerCn(
            promoContentParentCn(styles),
            "lg:hidden py-pageSection-verticalPadding pt-6 px-4"
          )}
        >
          <PromoContent {...props} />
        </div>

        {/* Desktop container */}
        <div
          className={themeManagerCn(
            promoContentParentCn(styles),
            styles.desktopImagePosition === "left"
              ? "pl-4 lg:pl-16"
              : "pr-4 lg:pr-16",
            "py-pageSection-verticalPadding pt-6 hidden lg:flex self-center w-2/4"
          )}
        >
          <PromoContent {...props} />
        </div>

        {/* Desktop right image / Mobile bottom image */}
        <PromoMedia
          className={themeManagerCn(
            styles.mobileImagePosition === "top" && "hidden lg:block",
            styles.desktopImagePosition === "left" && "lg:hidden",
            "lg:w-2/4"
          )}
          data={data}
          styles={styles}
          slots={slots}
        />
      </div>
    </Background>
  );
};
