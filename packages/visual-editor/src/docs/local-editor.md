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

The plug-in creates a temporary `local-editor-data-<layout-id>.tsx` template
for each Entity and Directory layout. Pages uses these templates to create
local snapshots. The plug-in removes them when development stops and before
production builds.

## Test Data

### ENTITY Page Sets

By default, a basic location entity stream is used to pull data for ENTITY page set types.
This can be configured in the `stream.config.ts` to use other entity types and to include other fields (including custom fields ).

##### Alternative layouts

A layout in `layouts` can override its type's stream and defaults. This allows testing a section library with multiple
layouts and page sets configurations.

For each layout, Local Editor starts with `defaults`, then applies the matching
`pageSetTypes` value, then applies `layouts[layoutId]`. A later value replaces
an earlier value.

### DIRECTORY Page Sets

By default, fake data is used for directory page sets. The number of directory children can be configured in the local-editor UI.
To use real data, add a `DIRECTORY` entry `stream.config.ts` and configure the filter and fields to match the directory (see example below).

### LOCATOR Page Sets

By default, fake data is used for locator page sets. A mapbox api key can be provided in the local-editor UI for the locator map.
To use real data, fill out the env variables in the `stream.config.ts` based on the real locator. Additionally, provide
the nearby locations key and mapbox key in the local-editor UI.

## Configure Streams

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
        $id: "local-editor-restaurant-stream",
        filter: { entityTypes: ["restaurant"] },
        fields: ["id", "name", "slug", "c_order_now"],
        localization: { locales: ["en"] },
      },
    },
    DIRECTORY: {
      stream: {
        $id: "local-editor-directory-stream",
        // select the correct directory entities:
        // set the correct directory level by entity type id in entityTypes
        // set the correct directory scope by using savedFilterIds (in platform, go to KG -> Configuration -> Saved Filters)
        filter: { entityTypes: ["dm_city"], savedFilterIds: ["dm_x-y_address_city"] }
        // select the fields to include in the stream (will vary by directory level)
        fields: [
          "id",
          "name",
          "slug",
          "dm_directoryChildren.address",
          "dm_directoryChildren.geomodifier",
          "dm_directoryChildren.hours",
          "dm_directoryChildren.id",
          "dm_directoryChildren.mainPhone",
          "dm_directoryChildren.name",
          "dm_directoryChildren.slug",
          "dm_directoryChildren.timezone",
          "dm_addressCountryDisplayName",
          "dm_addressRegionDisplayName",
          // The directory parents field name varies based on site/branch/page group
          "dm_directoryParents_x_y_z.dm_addressCountryDisplayName",
          "dm_directoryParents_x_y_z.dm_addressRegionDisplayName",
          "dm_directoryParents_x_y_z.id",
          "dm_directoryParents_x_y_z.name",
          "dm_directoryParents_x_y_z.slug",
          "dm_directoryParents_x_y_z.meta.entityType.id",

        ],
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

You must run `yext pages generate-test-data` or restart your development server after
updating `stream.config.ts`.
