---
title: Section Library Local Editor
outline: deep
---

# Section Library Local Editor

Local Editor lets you edit Section Library layouts in development. Entity
layouts use local Pages snapshots. Directory and Locator layouts use built-in
fixture data. It requires `sectionLibrary: true`.

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
  pageSetTypes: {
    ENTITY: {
      stream: {
        $id: "local-editor-entity-stream",
        filter: { entityTypes: ["location"] },
        fields: ["id", "name", "slug"],
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

`pageSetTypes.ENTITY` supplies a stream for every Entity layout. A layout in
`layouts` can override its type's stream and defaults. This lets a new Entity
layout work without a new config entry in the common case.

For each layout, Local Editor starts with `defaults`, then applies the matching
`pageSetTypes` value, then applies `layouts[layoutId]`. A later value replaces
an earlier value.

Generate Entity snapshot data after you change the stream configuration.

```sh
yext pages generate-test-data
```

The plug-in creates a temporary `local-editor-data-<layout-id>.tsx` template
for each Entity layout. Pages uses these templates to create local snapshots.
The plug-in removes them when development stops and before production builds.

Directory layouts use built-in root, country, region, and city documents.
Locator layouts use a built-in document and local mock Search results, filters,
pagination, analytics, and geolocation. Map tiles can need a Mapbox key.
Fixtures and mock data exist only in Local Editor. They are not in production
artifacts.
