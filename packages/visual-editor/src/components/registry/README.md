---
title: Shadcn Component Registry
outline: deep
---

# Shadcn Component Registry

## Generate registry locally

`pnpm run generate-registry`

## Add a new component

Add a new object to `ui` in `components.ts`.

| Field                | Description                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| name                 | must be unique                                                                                                             |
| type                 | "registry:ui" if it should be directly pulled by a user. "registry:component" if it's a sub-component of multiple ui files |
| files                | array of files relative to `src/components/puck`                                                                           |
| registryDependencies | array of component dependencies using the names defined in this file                                                       |

## Requirements for components

- Do not use .ts or .tsx imports because of the starter's tsconfig
- Default package imports should be avoided because of the starter's tsconfig
- Imports from the @yext/visual-editor package must have a local path that is captured by the
  `IMPORT_PATTERN` in `build-registry.ts`

## Running shadcn locally

Useful for debugging our registry with the shadcn CLI.

1. `git clone https://github.com/shadcn-ui/ui.git`
2. `pnpm i`
3. `cd packages/shadcn` (`packages/cli` is the old cli)
4. `pnpm run dev`
5. `REGISTRY_URL=https://reliably-numerous-kit.pgsdemo.com/components node ui/packages/shadcn/dist/index.js add`
