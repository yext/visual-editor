import { PuckComponent } from "@measured/puck";
import { PromoVariantProps } from "./PromoSection";

/** Shared styling for the various parent containers of PromoContent  */
export const promoContentParentCn = (styles: PromoVariantProps["styles"]) => {
  return `flex flex-col gap-y-8 sm:gap-y-10 w-full break-words ${styles.containerAlignment === "left" ? "items-start" : styles.containerAlignment === "center" ? "items-center" : "items-end"} `;
};

export const PromoContent: PuckComponent<PromoVariantProps> = (props) => {
  const { slots, styles } = props;

  return (
    <div
      className={`flex flex-col justify-center gap-y-6 sm:gap-y-8 w-full break-words ${styles.containerAlignment === "left" ? "items-start" : styles.containerAlignment === "center" ? "items-center" : "items-end"}`}
    >
      <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
      <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
      <slots.CTASlot
        style={{ height: "auto", width: "100%" }}
        className="lg:!w-fit"
        allow={[]}
      />
    </div>
  );
};
