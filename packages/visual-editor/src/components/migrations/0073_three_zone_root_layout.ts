import { Migration } from "../../utils/migrate.ts";
import {
  applyRootZonesToData,
  supportsThreeZoneRootMigration,
} from "../../utils/rootZones.ts";

export const threeZoneRootLayoutMigration: Migration = {
  data: {
    transformation: (data, _streamDocument, config) => {
      if (!supportsThreeZoneRootMigration(config) || !data.content?.length) {
        return data;
      }

      return applyRootZonesToData(data);
    },
  },
};
