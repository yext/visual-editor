import { Migration } from "../../utils/migrate.ts";

export const renameSearchWithSlots: Migration = {
  searchWithSlots: {
    action: "renamed",
    newName: "searchSection",
  },
};
