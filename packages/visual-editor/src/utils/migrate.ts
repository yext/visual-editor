import {
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootProps,
  migrate as migratePuck,
  walkTree,
} from "@puckeditor/core";
import { migrationRegistry as commonMigrationRegistry } from "../components/migrations/migrationRegistry.ts";
import { StreamDocument } from "./types/StreamDocument.ts";

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
        oldProps: { id: string } & Record<string, any>,
        streamDocument: StreamDocument
      ) => { id: string } & Record<string, any>;
    };
type RootMigrationAction = {
  propTransformation: (
    oldProps: Record<string, any>,
    streamDocument: StreamDocument
  ) => Record<string, any>;
};
type DataMigrationAction = {
  transformation: (
    data: Data<DefaultComponentProps, RootProps>,
    streamDocument: StreamDocument,
    config: Config
  ) => Data<DefaultComponentProps, RootProps>;
};
type ComponentMigrationMap = Record<string, MigrationAction>;
type RootMigration = { root: RootMigrationAction };
type DataMigration = { data: DataMigrationAction };

export type Migration = ComponentMigrationMap | RootMigration | DataMigration;
export type MigrationRegistry = Migration[];

interface RootProps extends DefaultRootProps {
  props?: {
    version?: number;
  };
}

const isDataMigration = (migration: Migration): migration is DataMigration => {
  return "data" in migration && Object.keys(migration).length === 1;
};

const isRootMigration = (migration: Migration): migration is RootMigration => {
  return "root" in migration && Object.keys(migration).length === 1;
};

export const migrate = (
  data: Data<DefaultComponentProps, RootProps>,
  migrationRegistry: MigrationRegistry = commonMigrationRegistry,
  config: Config,
  streamDocument: StreamDocument
): Data => {
  const version = data.root?.props?.version ?? 0;

  // Apply puck migrations
  data = migratePuck(data);

  const migrationsToApply = migrationRegistry.slice(version);
  if (migrationsToApply.length === 0) {
    return data;
  }

  migrationsToApply.forEach((migration) => {
    if (isDataMigration(migration)) {
      data = migration.data.transformation(data, streamDocument, config);
      return;
    }

    if (isRootMigration(migration)) {
      if (!data.root.props) {
        data.root.props = {};
      }
      data.root.props = migration.root.propTransformation(
        data.root.props,
        streamDocument
      );
      return;
    }

    Object.entries(migration).forEach(([componentName, migrationAction]) => {
      const appliesToAllComponents = componentName === "*";
      data = walkTree(data, config, (content) => {
        switch (migrationAction.action) {
          case "removed":
            if (appliesToAllComponents) {
              throw new Error(
                "Cannot apply remove migration to all components."
              );
            }
            return content.filter((c) => c.type !== componentName);
          case "renamed":
            if (appliesToAllComponents) {
              throw new Error(
                "Cannot apply rename migration to all components."
              );
            }
            return content.map((c) => {
              return {
                ...c,
                type:
                  c.type === componentName ? migrationAction.newName : c.type,
              };
            });
          case "updated":
            return content.map((c) => {
              if (!appliesToAllComponents && c.type !== componentName) {
                return c;
              }
              return {
                ...c,
                props: migrationAction.propTransformation(
                  c.props,
                  streamDocument
                ),
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
