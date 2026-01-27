import { PuckComponent } from "@puckeditor/core";
import { PromoVariantProps } from "./PromoSection";

/** Shared styling for the various parent containers of PromoContent  */
export const promoContentParentCn = (styles: PromoVariantProps["styles"]) => {
  return `flex flex-col gap-y-8 sm:gap-y-10 w-full break-words ${styles.containerAlignment === "left" ? "items-start" : styles.containerAlignment === "center" ? "items-center" : "items-end"}`;
};

export const PromoContent: PuckComponent<PromoVariantProps> = (props) => {
  const { slots, styles } = props;

  return (
    <div
      className={`flex flex-col justify-center w-full break-words ${styles.containerAlignment === "left" ? "items-start" : styles.containerAlignment === "center" ? "items-center" : "items-end"}`}
    >
      <slots.HeadingSlot
        className={`mb-4 ${styles.variant === "classic" ? "sm:mb-8" : ""}`}
        style={{ height: "auto" }}
        allow={[]}
      />
      <slots.DescriptionSlot
        className="mb-6 sm:mb-8"
        style={{ height: "auto" }}
        allow={[]}
      />
      <slots.CTASlot
        style={{ height: "auto", width: "100%" }}
        className="sm:!w-fit"
        allow={[]}
      />
    </div>
  );
};
