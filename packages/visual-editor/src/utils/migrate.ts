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
  data: PuckData,
  migrationRegistry: MigrationRegistry = commonMigrationRegistry,
  config: Config,
  streamDocument: StreamDocument,
  sectionLibraryMigrationRegistry: MigrationRegistry = []
): Data => {
  // Work on a clone so a thrown migration cannot partially mutate persisted
  // layout data owned by the caller.
  data = migratePuck(clonePuckResolveData(data)) as PuckData;
  if (!data.root.props) {
    data.root.props = {};
  }

  const migrationConfig = withRemovedComponentConfigs(config, [
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

const withRemovedComponentConfigs = (
  config: Config,
  registries: MigrationRegistry[]
): Config => {
  const removedComponentNames = new Set<string>();
  registries.forEach((registry) => {
    registry.forEach((migration) => {
      Object.entries(migration).forEach(([componentName, migrationAction]) => {
        if (
          componentName !== "*" &&
          "action" in migrationAction &&
          migrationAction.action === "removed"
        ) {
          removedComponentNames.add(componentName);
        }
      });
    });
  });

  const missingComponentNames = [...removedComponentNames].filter(
    (componentName) => !config.components[componentName]
  );
  if (missingComponentNames.length === 0) {
    return config;
  }

  const components = { ...config.components };
  missingComponentNames.forEach((componentName) => {
    // walkTree requires every slot child to have a config before its callback
    // can remove the child. This placeholder is used only during migration.
    components[componentName] = {} as Config["components"][string];
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

  data.root.props![versionKey] = registry.length;
  return data;
};
