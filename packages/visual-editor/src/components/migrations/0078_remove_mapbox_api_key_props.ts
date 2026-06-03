import { Migration } from "../../utils/migrate.ts";

type MigrationProps = { id: string } & Record<string, any>;

/**
 * Removes legacy Mapbox API key props that are now sourced from environment config.
 *
 * 1. Drops the old `apiKey` prop from `MapboxStaticMap`.
 * 2. Drops the old `data` wrapper from `StaticMapSection`.
 */
const removeLegacyProp =
  (propName: "apiKey" | "data") =>
  (props: MigrationProps): MigrationProps => {
    if (!(propName in props)) {
      return props;
    }

    const { [propName]: _removedProp, ...updatedProps } = props;
    return updatedProps;
  };

export const removeMapboxApiKeyPropsMigration: Migration = {
  MapboxStaticMap: {
    action: "updated",
    propTransformation: removeLegacyProp("apiKey"),
  },
  StaticMapSection: {
    action: "updated",
    propTransformation: removeLegacyProp("data"),
  },
};
