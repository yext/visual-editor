import {
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootProps,
  migrate as migratePuck,
  transformProps,
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
        oldProps: Record<string, any>
      ) => Record<string, any>;
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
  // config will be used with Puck 0.19
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  config?: Config
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
      // TODO: Update to handle slot fields as part of Puck 0.19
      // Should be something like:
      // data = walkTree(data, config, (content) => {
      //   content.map((child) => ({
      //     if (child.type === componentName) {
      //       return applyMigrationAction(content, componentName, migrationAction)
      //     }
      //     return content
      //   })
      // })
      data = applyMigrationAction(data, componentName, migrationAction);
    });
  });

  if (!data.root.props) {
    data.root.props = {};
  }
  data.root.props.version = migrationRegistry.length;
  console.log(data);
  return data;
};

const applyMigrationAction = (
  data: Data<DefaultComponentProps, RootProps>,
  componentName: string,
  migrationAction: MigrationAction
) => {
  switch (migrationAction.action) {
    case "removed":
      data.content = data.content.filter(
        (component) => component.type !== componentName
      );
      break;
    case "renamed":
      data.content = data.content.map((component) => {
        if (component.type === componentName) {
          return {
            ...component,
            type: migrationAction.newName,
          };
        }
        return component;
      });
      break;
    case "updated":
      data = transformProps(data, {
        [componentName]: migrationAction.propTransformation,
      });
      break;
  }

  return data;
};
