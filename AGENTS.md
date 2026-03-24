# Agent Instructions & Overrides

## Naming Conventions

- Use `Id` instead of `ID` for all variable and property names.
- This applies to code identifiers such as variables, properties, parameters, functions, and types.

## Local Workflow

- For local verification, prefer commands scoped to `packages/visual-editor` instead of root recursive scripts.
- If a package or workspace is not specified, assume `packages/visual-editor`.
- After TypeScript changes, run `pnpm --dir packages/visual-editor exec tsc --noEmit`.
- For routine local tests, run `pnpm --dir packages/visual-editor run test:editor`.
- Do not use root `pnpm run test` for normal local verification. It expands into the package `test` script, which includes component tests.
- Do not use `pnpm run test:components` as a normal local step. It is part of the Playwright screenshot workflow and is not expected to work directly on a normal local machine.
- Only use `pnpm --dir packages/visual-editor run test:components:local` when intentionally running screenshot/component tests with Docker.

## Mutating Commands

- Treat `lint`, `prettier`, `autofix`, `i18n:update`, and docs-generation commands as mutating commands. Run them only when the task calls for those changes.
- If locale strings change, run `pnpm --dir packages/visual-editor run i18n:update`.

## Package Structure

- `packages/visual-editor` is the primary package and the default place for library code changes.
- `starter` is primarily a local consumer app for development and integration testing; only work there when the task specifically involves the starter or local validation.
- Public exports should go through the package entrypoints such as `packages/visual-editor/src/index.ts` and related package `index.ts` files.
- Do not export everything by default. Only add or keep public exports that are actually needed by consumers.
- Do not publicly export modules from `packages/visual-editor/src/internal`. Keep the public API surface small and intentional.
- Within `packages/visual-editor`, prefer relative imports for internal code.

## Migrations

- For component schema, prop, or registered-component changes, check whether a migration is required.
- If a migration is needed, add a new migration file and append it to `packages/visual-editor/src/components/migrations/migrationRegistry.ts`.
- Existing migrations are append-only and immutable. Do not rewrite or repurpose old migration files; add a new migration instead.
