import { setDeep } from "@puckeditor/core";

// Common slot child components declare one primary parent-data field, and
// bindSlots uses that convention to support the shorthand raw-value API.
const slotChildTypeToParentDataKey: Record<string, string> = {
  BodyTextSlot: "richText",
  CTASlot: "cta",
  HeadingTextSlot: "text",
  HeroImageSlot: "image",
  ImageSlot: "image",
  TextSlot: "text",
  Timestamp: "date",
};

/**
 * Binds parent data into the first child of each named slot.
 *
 * Pass a full parent-data object when a slot needs custom shape like
 * `{ field, text }`. For common slot child types, raw values can be passed and
 * this helper will wrap them automatically.
 */
export const bindSlots = <
  TData extends {
    props: {
      slots?: Record<
        string,
        Array<{ props?: Record<string, unknown>; type?: string }>
      >;
    };
  },
>(
  data: TData,
  slotBindings: Record<string, unknown>
) => {
  let updatedData = data;

  Object.entries(slotBindings).forEach(([slotKey, parentData]) => {
    const slotChild = data.props.slots?.[slotKey]?.[0];

    if (!slotChild) {
      return;
    }

    const parentDataKey = slotChild.type
      ? slotChildTypeToParentDataKey[slotChild.type]
      : undefined;
    const isPlainParentDataObject =
      typeof parentData === "object" &&
      parentData !== null &&
      !Array.isArray(parentData);
    const resolvedParentData =
      parentData &&
      parentDataKey &&
      (!isPlainParentDataObject ||
        (!(parentDataKey in parentData) && !("field" in parentData)))
        ? { [parentDataKey]: parentData }
        : parentData;

    updatedData = setDeep(
      updatedData,
      `props.slots.${slotKey}[0].props.parentData`,
      resolvedParentData
    );
  });

  return updatedData;
};
