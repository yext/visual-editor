import { MigrationRegistry } from "../../utils/migrate.ts";
import { adjustPropObjectsMigration } from "./1_adjust_prop_objects.ts";

// To add a migration:
// Create a new file in this directory that exports a Migration
// Import it in this file and add it to this array.
// The migrations are run in the order of this array
// and the data's version number indicates the last applied index.
export const migrationRegistry: MigrationRegistry = [
  adjustPropObjectsMigration,
];
