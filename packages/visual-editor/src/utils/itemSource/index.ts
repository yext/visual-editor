/**
 * Public barrel for item-source infrastructure.
 *
 * 1. Expose the `createItemSource(...)` entrypoint.
 * 2. Re-export the public item-source types used by callers.
 */
export { createItemSource } from "./createItemSource.ts";
export type {
  CreateItemSourceOptions,
  ItemSourceInstance,
} from "./itemSourceTypes.ts";
