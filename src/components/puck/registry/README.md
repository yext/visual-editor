# Component Shadcn Registry

## Generate registry locally

`cd src/components/puck/registry && npm i && npm run generate`

## Add a new component

Add a new object to `ui` in `components.ts`.

| Field                | Description                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| name                 | must be unique                                                                                                             |
| type                 | "registry:ui" if it should be directly pulled by a user. "registry:component" if it's a sub-component of multiple ui files |
| files                | array of files relative to `src/components/puck`                                                                           |
| registryDependencies | array of component dependencies using the names defined in this file                                                       |

## Requirements for components

- Do not use .ts or .tsx imports
- Imports from the @yext/visual-editor package must have a local path that is captured by the
  `IMPORT_PATTERN` in `build-registry.ts`
