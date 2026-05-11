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
 * 1. Looks up the first child in each named slot.
 * 2. Detects whether that child supports shorthand binding through
 *    `slotChildTypeToParentDataKey`.
 * 3. Normalizes raw values like `title` or `image` into the child component's
 *    expected `parentData` shape.
 * 4. Optionally clears missing shorthand values in linked mode so authored
 *    fallback constants do not bleed through.
 * 5. Writes the resulting `parentData` back onto the slot child.
 *
 * Pass a full parent-data object when a slot needs custom shape like
 * `{ field, text }`. For common slot child types, raw values can be passed and
 * this helper will wrap them automatically.
 *
 * When `clearMissingValues` is enabled and a linked slot receives no value, the
 * helper still writes an empty parent-data object for supported slot child
 * types so authored fallback constants do not bleed through. By default,
 * missing values are left untouched so manual/default cards keep their authored
 * slot content.
 *
 * Example:
 * ```ts
 * bindSlots(data, {
 *   TitleSlot: data.props.title,
 *   DescriptionSlot: data.props.description,
 *   ImageSlot: data.props.image,
 *   CTASlot: data.props.cta,
 * })
 * ```
 *
 * If the first child types are `HeadingTextSlot`, `BodyTextSlot`, `ImageSlot`,
 * and `CTASlot`, that example resolves to parent-data payloads like:
 * ```ts
 * {
 *   TitleSlot: { text: data.props.title },
 *   DescriptionSlot: { richText: data.props.description },
 *   ImageSlot: { image: data.props.image },
 *   CTASlot: { cta: data.props.cta },
 * }
 * ```
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
  slotBindings: Record<string, unknown>,
  options?: { clearMissingValues?: boolean }
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

    if (parentData === undefined && !options?.clearMissingValues) {
      return;
    }

    const resolvedParentData =
      options?.clearMissingValues && parentDataKey && parentData === undefined
        ? { [parentDataKey]: undefined }
        : parentData &&
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
