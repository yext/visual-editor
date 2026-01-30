import { useTranslation } from "react-i18next";
import { SlotComponent } from "@puckeditor/core";
import { EntityField } from "../../../editor/EntityField";
import { pt } from "../../../utils/i18n/platform";
import { themeManagerCn } from "../../../utils/cn";
import { PromoData, PromoStyles } from "./PromoSection";

export const PromoMedia = ({
  className,
  data,
  styles,
  slots,
}: {
  className: string;
  data: PromoData;
  styles: PromoStyles;
  slots: {
    VideoSlot: SlotComponent;
    ImageSlot: SlotComponent;
  };
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={themeManagerCn("w-full", className)}
      role="region"
      aria-label={t("promoMedia", "Promo Media")}
    >
      <EntityField
        displayName={pt("fields.media", "Media")}
        fieldId={data.promo.field}
        constantValueEnabled={data.promo.constantValueEnabled}
        fullHeight
      >
        {data.media === "video" ? (
          <slots.VideoSlot
            style={{
              height: styles.variant === "compact" ? "100%" : "auto",
            }}
            allow={[]}
          />
        ) : (
          <slots.ImageSlot
            style={{
              height: styles.variant === "compact" ? "100%" : "auto",
            }}
            allow={[]}
          />
        )}
      </EntityField>
    </div>
  );
};
