// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { YetiSectionShell } from "../atoms/YetiSectionShell.tsx";
import { defaultYetiHoursSlotProps } from "./YetiHoursSlot.tsx";
import { defaultYetiLocationDetailsSlotProps } from "./YetiLocationDetailsSlot.tsx";
import { defaultYetiParkingSlotProps } from "./YetiParkingSlot.tsx";
import { defaultYetiMapSurfaceSlotProps } from "./YetiMapSurfaceSlot.tsx";

export interface YetiStoreInfoSectionProps {
  styles: {
    backgroundClassName: "bg-white" | "bg-neutral-50" | "bg-[#F7F4EE]";
    showHours: boolean;
    showLocationInfo: boolean;
    showMap: boolean;
    showParking: boolean;
  };
  slots: {
    HoursSlot: Slot;
    LocationInfoSlot: Slot;
    ParkingSlot: Slot;
    MapSlot: Slot;
  };
  liveVisibility: boolean;
}

const fields: Fields<YetiStoreInfoSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundClassName: YextField("Background", {
        type: "select",
        options: [
          { label: "White", value: "bg-white" },
          { label: "Soft Gray", value: "bg-neutral-50" },
          { label: "Warm Neutral", value: "bg-[#F7F4EE]" },
        ],
      }),
      showHours: YextField("Show Hours", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showLocationInfo: YextField("Show Location", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showMap: YextField("Show Map", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showParking: YextField("Show Parking", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HoursSlot: { type: "slot" },
      LocationInfoSlot: { type: "slot" },
      ParkingSlot: { type: "slot" },
      MapSlot: { type: "slot" },
    },
    visible: false,
  },
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const YetiStoreInfoSectionComponent: PuckComponent<
  YetiStoreInfoSectionProps
> = ({ styles, slots }) => {
  return (
    <YetiSectionShell
      backgroundClassName={styles.backgroundClassName}
      className="py-10 md:py-14"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 overflow-hidden">
        {styles.showHours ? (
          <div className="min-w-0 border-b border-black/15 pb-6">
            <slots.HoursSlot style={{ height: "auto" }} allow={[]} />
          </div>
        ) : null}
        {styles.showLocationInfo ? (
          <div className="min-w-0 border-b border-black/15 pb-6">
            <slots.LocationInfoSlot style={{ height: "auto" }} allow={[]} />
          </div>
        ) : null}
        {styles.showMap ? (
          <div className="min-w-0 border-b border-black/15 pb-6">
            <slots.MapSlot style={{ height: "auto" }} allow={[]} />
          </div>
        ) : null}
        {styles.showParking ? (
          <div className="min-w-0">
            <slots.ParkingSlot style={{ height: "auto" }} allow={[]} />
          </div>
        ) : null}
      </div>
    </YetiSectionShell>
  );
};

export const YetiStoreInfoSection: ComponentConfig<{
  props: YetiStoreInfoSectionProps;
}> = {
  label: "Yeti Store Info Section",
  fields,
  defaultProps: {
    styles: {
      backgroundClassName: "bg-white",
      showHours: true,
      showLocationInfo: true,
      showMap: true,
      showParking: true,
    },
    slots: {
      HoursSlot: [
        {
          type: "YetiHoursSlot",
          props: defaultYetiHoursSlotProps,
        },
      ],
      LocationInfoSlot: [
        {
          type: "YetiLocationDetailsSlot",
          props: defaultYetiLocationDetailsSlotProps,
        },
      ],
      ParkingSlot: [
        {
          type: "YetiParkingSlot",
          props: defaultYetiParkingSlotProps,
        },
      ],
      MapSlot: [
        {
          type: "YetiMapSurfaceSlot",
          props: defaultYetiMapSurfaceSlotProps,
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => {
    if (!props.liveVisibility && !props.puck.isEditing) {
      return null;
    }
    return <YetiStoreInfoSectionComponent {...props} />;
  },
};
