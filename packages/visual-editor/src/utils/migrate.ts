import {
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootProps,
  migrate as migratePuck,
  walkTree,
} from "@puckeditor/core";
import { migrationRegistry as commonMigrationRegistry } from "../components/migrations/migrationRegistry.ts";
import { clonePuckResolveData } from "../internal/utils/clonePuckResolveData.ts";
import { StreamDocument } from "./types/StreamDocument.ts";

export type MigrationAction =
  | {
      action: "removed";
    }
  | {
      action: "renamed";
      newType: string;
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
    sectionLibraryMigrationVersion?: number;
  };
}

type PuckData = Data<DefaultComponentProps, RootProps>;

export const migrate = (
  config: Config,
  data: PuckData,
  streamDocument: StreamDocument,
  migrationRegistry: MigrationRegistry = commonMigrationRegistry,
  sectionLibraryMigrationRegistry: MigrationRegistry = []
): Data => {
  // Work on a clone so a thrown migration cannot partially mutate persisted
  // layout data owned by the caller.
  data = migratePuck(clonePuckResolveData(data)) as PuckData;
  if (!data.root.props) {
    data.root.props = {};
  }

  const migrationConfig = withMigrationComponentConfigs(config, [
    migrationRegistry,
    sectionLibraryMigrationRegistry,
  ]);

  data = applyRegistry(
    data,
    migrationRegistry,
    "version",
    migrationConfig,
    streamDocument
  );

  data = applyRegistry(
    data,
    sectionLibraryMigrationRegistry,
    "sectionLibraryMigrationVersion",
    migrationConfig,
    streamDocument
  );

  return data;
};

/** Supply historical component schemas during migration so `walkTree` can traverse removed or renamed slot children. */
const withMigrationComponentConfigs = (
  config: Config,
  registries: MigrationRegistry[]
): Config => {
  const components = { ...config.components };
  // Work backwards so a chain of renames can use the final component's schema.
  registries
    .flat()
    .reverse()
    .forEach((migration) => {
      Object.entries(migration)
        .reverse()
        .forEach(([componentName, migrationAction]) => {
          if (
            componentName === "*" ||
            !("action" in migrationAction) ||
            components[componentName]
          ) {
            return;
          }
          if (migrationAction.action === "removed") {
            // walkTree requires every slot child to have a config before its callback
            // can remove the child. This placeholder is used only during migration.
            components[componentName] = {} as Config["components"][string];
          } else if (
            migrationAction.action === "renamed" &&
            components[migrationAction.newType]
          ) {
            // The old name is available only to migrations, never to the renderer.
            components[componentName] = components[migrationAction.newType];
          }
        });
    });
  return { ...config, components };
};

const applyRegistry = (
  data: PuckData,
  registry: MigrationRegistry,
  versionKey: "version" | "sectionLibraryMigrationVersion",
  config: Config,
  streamDocument: StreamDocument
): PuckData => {
  if (registry.length === 0) {
    return data;
  }

  const version = data.root.props?.[versionKey] ?? 0;
  if (!Number.isSafeInteger(version) || version < 0) {
    console.warn(
      `Invalid ${versionKey} value ${JSON.stringify(version)}; skipping migrations.`
    );
    return data;
  }
  if (version > registry.length) {
    console.warn(
      `${versionKey} value ${version} is newer than the current migration registry; skipping migrations.`
    );
    return data;
  }

  registry.slice(version).forEach((migration) => {
    Object.entries(migration).forEach(([componentName, migrationAction]) => {
      if (componentName === "content" && isContentMigration(migrationAction)) {
        data.content = migrationAction.transformation(data.content);
        return;
      }

      if (componentName === "root" && isRootMigration(migrationAction)) {
        if (!data.root.props) {
          data.root.props = {};
        }
        const previousRootProps = data.root.props;
        const transformedRootProps = migrationAction.propTransformation(
          previousRootProps,
          streamDocument
        );
        data.root.props = {
          ...transformedRootProps,
          ...(previousRootProps.version === undefined
            ? {}
            : { version: previousRootProps.version }),
          ...(previousRootProps.sectionLibraryMigrationVersion === undefined
            ? {}
            : {
                sectionLibraryMigrationVersion:
                  previousRootProps.sectionLibraryMigrationVersion,
              }),
        };
        return;
      }

      const appliesToAllComponents = componentName === "*";
      const transformContent = (content: Data["content"]): Data["content"] => {
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
              if (c.type !== componentName) {
                return c;
              }
              if (!config.components[migrationAction.newType]) {
                throw new Error(
                  `Cannot rename ${componentName} to unregistered component ${migrationAction.newType}.`
                );
              }
              return { ...c, type: migrationAction.newType };
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
          default:
            throw new Error("Unsupported component migration action.");
        }
      };
      data = walkTree(data, config, transformContent);
      // Puck visits children inside legacy zones, but does not transform the zone's own content list.
      if (data.zones) {
        data.zones = Object.fromEntries(
          Object.entries(data.zones).map(([zone, content]) => [
            zone,
            transformContent(content),
          ])
        );
      }
    });
  });

  data.root.props![versionKey] = registry.length;
  return data;
};
