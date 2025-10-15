import React from "react";
import { createUsePuck, Slot, useGetPuck } from "@measured/puck";

const usePuck = createUsePuck();

/**
 * useGetSlotProps hooks into the puck state to retrieve the unprocessed slot props.
 * Only works in-editor, otherwise returns undefined.
 * @returns slotStyles: a mapping of slot prop names to their shared values. Includes all props in the styles section.
 * @returns getPuck a function to retrieve the puck state
 * @returns slotProps the raw slot data from puck
 */
export const useGetCardSlots = <T extends { slots: Record<string, Slot> }>(
  id: string
) => {
  // In editor, use puck hooks to get the slot props
  let slotProps: T["slots"] | undefined = undefined;
  let getPuck: ReturnType<typeof useGetPuck>;
  try {
    slotProps = usePuck((s) => s.getItemById(id)?.props.slots);
    getPuck = useGetPuck();
  } catch {
    return { slotStyles: {}, getPuck: undefined, slotProps: undefined };
    // live page, do nothing
  }

  // Process the slot props into just the shared styles
  const slotStyles = React.useMemo(() => {
    const slotNameToStyles = {} as Record<string, any>;
    Object.entries(slotProps || {}).forEach(([key, value]) => {
      slotNameToStyles[key] = value[0].props.styles || {};
    });
    return slotNameToStyles;
  }, [slotProps]);

  return { slotStyles, getPuck, slotProps };
};
