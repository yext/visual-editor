import { walkTree, type Config, type Data } from "@puckeditor/core";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import { getGenerationCatalog } from "../generation/shared/catalogRegistry.ts";
import { isLinkedSource } from "../generation/shared/slottedItemSource.ts";
import { clonePuckResolveData } from "./clonePuckResolveData.ts";

/** Native slots receive Puck updates; manual backups are hidden from its tree. */
export const synchronizeManualCardSlots = (
  data: Data,
  config: Config
): Data => {
  const catalog = getGenerationCatalog(config);
  let changed = false;
  const synchronized = walkTree(data, config, (items) =>
    items.map((item) => {
      const props = item.props;
      if (
        !catalog.data.components[item.type]?.generation?.slottedItemSource ||
        isLinkedSource(props) ||
        !Array.isArray(props.slots?.CardSlot) ||
        !Array.isArray(props.manualSlots?.CardSlot) ||
        isDeepEqual(props.slots.CardSlot, props.manualSlots.CardSlot)
      ) {
        return item;
      }
      changed = true;
      return {
        ...item,
        props: {
          ...props,
          manualSlots: {
            ...props.manualSlots,
            CardSlot: clonePuckResolveData(props.slots.CardSlot),
          },
        },
      };
    })
  );
  return changed ? synchronized : data;
};
