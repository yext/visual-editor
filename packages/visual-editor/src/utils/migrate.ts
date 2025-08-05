import {
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootProps,
  migrate as migratePuck,
  walkTree,
} from "@measured/puck";
import { migrationRegistry as commonMigrationRegistry } from "../components/migrations/migrationRegistry.ts";

export type MigrationAction =
  | {
      action: "removed";
    }
  | {
      action: "renamed";
      newName: string;
    }
  | {
      action: "updated";
      propTransformation: (
        oldProps: { id: string } & Record<string, any>
      ) => { id: string } & Record<string, any>;
    };
export type Migration = Record<string, MigrationAction>;
export type MigrationRegistry = Migration[];

interface RootProps extends DefaultRootProps {
  props?: {
    version?: number;
  };
}

export const migrate = (
  data: Data<DefaultComponentProps, RootProps>,
  migrationRegistry: MigrationRegistry = commonMigrationRegistry,
  config: Config
): Data => {
  const version = data.root?.props?.version ?? 0;

  // Apply puck migrations
  data = migratePuck(data);

  const migrationsToApply = migrationRegistry.slice(version);
  if (migrationsToApply.length === 0) {
    return data;
  }

  migrationsToApply.forEach((migration) => {
    Object.entries(migration).forEach(([componentName, migrationAction]) => {
      data = walkTree(data, config, (content) => {
        switch (migrationAction.action) {
          case "removed":
            return content.filter((c) => c.type !== componentName);
          case "renamed":
            return content.map((c) => {
              return {
                ...c,
                type:
                  c.type === componentName ? migrationAction.newName : c.type,
              };
            });
          case "updated":
            return content.map((c) => {
              if (c.type !== componentName) {
                return c;
              }
              return {
                ...c,
                props: migrationAction.propTransformation(c.props),
              };
            });
        }
      });
    });
  });

  if (!data.root.props) {
    data.root.props = {};
  }
  data.root.props.version = migrationRegistry.length;
  return data;
};
