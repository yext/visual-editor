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

type ContentMigrationAction = {
  transformation: (content: Data["content"]) => Data["content"];
};

type RootMigrationAction = {
  propTransformation: (
    oldProps: Record<string, any>,
    streamDocument: StreamDocument
  ) => Record<string, any>;
};

export type Migration =
  | Record<string, MigrationAction>
  | {
      content: ContentMigrationAction;
    }
  | {
      root: RootMigrationAction;
    };
export type MigrationRegistry = Migration[];

const isContentMigration = (
  migrationAction: unknown
): migrationAction is ContentMigrationAction => {
  return (
    typeof migrationAction === "object" &&
    migrationAction !== null &&
    "transformation" in migrationAction
  );
};

const isRootMigration = (
  migrationAction: unknown
): migrationAction is RootMigrationAction => {
  return (
    typeof migrationAction === "object" &&
    migrationAction !== null &&
    "propTransformation" in migrationAction
  );
};

interface RootProps extends DefaultRootProps {
  props?: {
    version?: number;
  };
}

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
    Object.entries(migration).forEach(([componentName, migrationAction]) => {
      if (componentName === "content" && isContentMigration(migrationAction)) {
        data.content = migrationAction.transformation(data.content);
        return;
      }

      if (componentName === "root" && isRootMigration(migrationAction)) {
        if (!data.root.props) {
          data.root.props = {};
        }
        data.root.props = migrationAction.propTransformation(
          data.root.props,
          streamDocument
        );
        return;
      }

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
