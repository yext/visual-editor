import {
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootProps,
  migrate as migratePuck,
  walkTree,
} from "@puckeditor/core";
import { layoutMigrationRegistry as commonLayoutMigrationRegistry } from "../components/migrations/migrationRegistry.ts";
import { StreamDocument } from "./types/StreamDocument.ts";

export type LayoutMigrationAction =
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

export type LayoutMigration =
  | Record<string, LayoutMigrationAction>
  | {
      content: ContentMigrationAction;
    }
  | {
      root: RootMigrationAction;
    };
export type LayoutMigrationRegistry = LayoutMigration[];

const isContentLayoutMigration = (
  layoutMigrationAction: unknown
): layoutMigrationAction is ContentMigrationAction => {
  return (
    typeof layoutMigrationAction === "object" &&
    layoutMigrationAction !== null &&
    "transformation" in layoutMigrationAction
  );
};

const isRootLayoutMigration = (
  layoutMigrationAction: unknown
): layoutMigrationAction is RootMigrationAction => {
  return (
    typeof layoutMigrationAction === "object" &&
    layoutMigrationAction !== null &&
    "propTransformation" in layoutMigrationAction
  );
};

interface RootProps extends DefaultRootProps {
  props?: {
    version?: number;
  };
}

export const migrateLayout = (
  data: Data<DefaultComponentProps, RootProps>,
  layoutMigrationRegistry: LayoutMigrationRegistry = commonLayoutMigrationRegistry,
  config: Config,
  streamDocument: StreamDocument
): Data => {
  const version = data.root?.props?.version ?? 0;

  // Apply puck migrations
  data = migratePuck(data);

  const layoutMigrationsToApply = layoutMigrationRegistry.slice(version);
  if (layoutMigrationsToApply.length === 0) {
    return data;
  }

  layoutMigrationsToApply.forEach((layoutMigration) => {
    Object.entries(layoutMigration).forEach(
      ([componentName, layoutMigrationAction]) => {
        if (
          componentName === "content" &&
          isContentLayoutMigration(layoutMigrationAction)
        ) {
          data.content = layoutMigrationAction.transformation(data.content);
          return;
        }

        if (
          componentName === "root" &&
          isRootLayoutMigration(layoutMigrationAction)
        ) {
          if (!data.root.props) {
            data.root.props = {};
          }
          data.root.props = layoutMigrationAction.propTransformation(
            data.root.props,
            streamDocument
          );
          return;
        }

        const appliesToAllComponents = componentName === "*";
        data = walkTree(data, config, (content) => {
          switch (layoutMigrationAction.action) {
            case "removed":
              if (appliesToAllComponents) {
                throw new Error(
                  "Cannot apply remove layout migration to all components."
                );
              }
              return content.filter((c) => c.type !== componentName);
            case "renamed":
              if (appliesToAllComponents) {
                throw new Error(
                  "Cannot apply rename layout migration to all components."
                );
              }
              return content.map((c) => {
                return {
                  ...c,
                  type:
                    c.type === componentName
                      ? layoutMigrationAction.newName
                      : c.type,
                };
              });
            case "updated":
              return content.map((c) => {
                if (!appliesToAllComponents && c.type !== componentName) {
                  return c;
                }
                return {
                  ...c,
                  props: layoutMigrationAction.propTransformation(
                    c.props,
                    streamDocument
                  ),
                };
              });
          }
        });
      }
    );
  });

  if (!data.root.props) {
    data.root.props = {};
  }
  data.root.props.version = layoutMigrationRegistry.length;
  return data;
};
