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

export type MigrationRegistryEntry = {
  id: string;
  migration: Migration;
};

export type MigrationRegistry = MigrationRegistryEntry[];

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
    lastBuiltInMigrationId?: string;
    lastSectionLibraryMigrationId?: string;
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
  const legacyVersion = data.root?.props?.version;

  // Work on a clone so a thrown migration cannot partially mutate persisted
  // layout data owned by the caller.
  data = migratePuck(clonePuckResolveData(data)) as PuckData;
  if (!data.root.props) {
    data.root.props = {};
  }

  data = applyRegistry(
    data,
    migrationRegistry,
    "lastBuiltInMigrationId",
    config,
    streamDocument,
    legacyVersion
  );

  if (legacyVersion !== undefined) {
    delete data.root.props!.version;
  }

  data = applyRegistry(
    data,
    sectionLibraryMigrationRegistry,
    "lastSectionLibraryMigrationId",
    config,
    streamDocument
  );

  return data;
};

const applyRegistry = (
  data: PuckData,
  registry: MigrationRegistry,
  cursorKey: "lastBuiltInMigrationId" | "lastSectionLibraryMigrationId",
  config: Config,
  streamDocument: StreamDocument,
  legacyVersion?: number
): PuckData => {
  if (registry.length === 0) {
    delete data.root.props?.[cursorKey];
    return data;
  }

  const cursor = data.root.props?.[cursorKey];
  let startIndex = 0;
  if (cursor !== undefined) {
    const cursorIndex = registry.findIndex((entry) => entry.id === cursor);
    if (cursorIndex === -1) {
      console.warn(
        `Unknown ${cursorKey} value ${JSON.stringify(cursor)}; skipping migrations.`
      );
      return data;
    }
    startIndex = cursorIndex + 1;
  } else if (legacyVersion !== undefined) {
    startIndex = legacyVersion;
  }

  registry.slice(startIndex).forEach(({ migration }) => {
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

  data.root.props![cursorKey] = registry.at(-1)!.id;
  return data;
};
