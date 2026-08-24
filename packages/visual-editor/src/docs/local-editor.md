---
title: Section Library Local Editor
outline: deep
---

# Section Library Local Editor

Local Editor lets you edit Section Library layouts in development. Entity
layouts use local Pages snapshots. Directory layouts use snapshots when a
Directory stream is configured, otherwise built-in fixture data. Locator
layouts use built-in fixture data by default, or real Search data when
configured. It requires `sectionLibrary: true`.

## Enable Local Editor

```ts
yextVisualEditorPlugin({
  sectionLibrary: true,
  localEditor: { enabled: true },
});
```

Start Pages development, then open `/local-editor`. The selector uses real
Section Library layout IDs. It does not use the temporary Platform aliases
`main`, `directory`, or `locator`.

## Configure streams

Create `stream.config.ts` at the starter root.

```ts
import type { LocalEditorConfig } from "@yext/visual-editor/plugin";

const config = {
  defaults: {
    locale: "en",
  },
  env: {
    YEXT_CLOUD_REGION: "US",
    YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
    YEXT_ENVIRONMENT: "PROD",
    YEXT_SEARCH_API_KEY: "",
    YEXT_SEARCH_EXPERIENCE_KEY: "",
  },
  pageSetTypes: {
    ENTITY: {
      stream: {
        $id: "local-editor-entity-stream",
        filter: { entityTypes: ["location"] },
        fields: ["id", "name", "slug"],
        localization: { locales: ["en"] },
      },
    },
    DIRECTORY: {
      stream: {
        $id: "local-editor-directory-stream",
        fields: ["id", "name", "slug", "dm_directoryChildren"],
        localization: { locales: ["en"] },
      },
    },
  },
  layouts: {
    "special-location-layout": {
      stream: {
        $id: "local-editor-special-location-stream",
        filter: { entityTypes: ["location"] },
        fields: ["id", "name", "description"],
        localization: { locales: ["en"] },
      },
    },
  },
} satisfies LocalEditorConfig;

export default config;
```

`pageSetTypes.ENTITY` and `pageSetTypes.DIRECTORY` supply a stream for every
matching layout. A layout in `layouts` can override its type's stream and
defaults. This lets a new layout work without a new config entry in the common
case.

For each layout, Local Editor starts with `defaults`, then applies the matching
`pageSetTypes` value, then applies `layouts[layoutId]`. A later value replaces
an earlier value.

Generate snapshot data after you change an Entity or Directory stream
configuration.

```sh
yext pages generate-test-data
```

The plug-in creates a temporary `local-editor-data-<layout-id>.tsx` template
for each Entity and Directory layout. Pages uses these templates to create
local snapshots. The plug-in removes them when development stops and before
production builds.

Directory layouts without a configured stream use built-in root, country,
region, and city documents; only these fixture-backed layouts show the control
for setting the directory child count.
Fixture-mode Locator layouts use a built-in document and local mock Search
results, filters, pagination, analytics, and geolocation. Map tiles can need a
Mapbox key. Fixtures and mock data exist only in Local Editor. They are not in
production artifacts.

Set both `YEXT_SEARCH_API_KEY` and `YEXT_SEARCH_EXPERIENCE_KEY` to use real
Locator Search data. If either value is blank, Local Editor uses the fixture
data above instead. Use the Local Editor controls to supply the Mapbox and Yext
analytics keys; the Mapbox value is used for both normal and editor-iframe map
rendering.
