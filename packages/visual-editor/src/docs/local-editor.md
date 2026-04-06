---
title: Local Editor Testing
outline: deep
---

# Local Editor Testing

The Vite plugin can generate a fake `/local-editor` shell for local Pages testing. The shell lets you switch between templates, entities, and locales while using snapshot data generated from your own Yext account.

## Enable the Plugin

Enable the plugin in your starter Vite config:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import yextSSG from "@yext/pages/vite-plugin";
import { yextVisualEditorPlugin } from "@yext/visual-editor/plugin";

export default defineConfig({
  plugins: [
    react(),
    yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    }),
    yextSSG(),
  ],
});
```

The default fake editor route is `/local-editor`.

## Root `stream.config.ts`

When local editor support is enabled, the plugin looks for config in this order:

1. `stream.config.ts`

If no config exists, the plugin scaffolds a root `stream.config.ts`.

The preferred format is:

```ts
import type { LocalEditorConfig } from "@yext/visual-editor/plugin";

const baseLocationStream = {
  filter: { entityTypes: ["location"] },
  fields: [
    "id",
    "uid",
    "meta",
    "slug",
    "name",
    "hours",
    "dineInHours",
    "driveThroughHours",
    "address",
    "yextDisplayCoordinate",
    // "c_productSection.sectionTitle",
    // "c_productSection.linkedProducts.name",
    // "c_productSection.linkedProducts.c_productPromo",
    // "c_productSection.linkedProducts.c_description",
    // "c_productSection.linkedProducts.c_coverPhoto",
    // "c_productSection.linkedProducts.c_productCTA",
    // "c_hero",
    // "c_faqSection.linkedFAQs.question",
    // "c_faqSection.linkedFAQs.answerV2",
    // "dm_directoryParents_defaultdirectory.slug",
    // "dm_directoryParents_defaultdirectory.name",
    "additionalHoursText",
    "mainPhone",
    "emails",
    "services",
    // "c_deliveryPromo",
    "ref_listings",
  ],
  localization: {
    locales: ["en"],
  },
};

const config = {
  defaults: {
    templateId: "main",
    locale: "en",
  },
  templates: {
    main: {
      stream: {
        ...baseLocationStream,
        $id: "local-editor-main-stream",
      },
    },
    directory: {
      // stream: {
      //   filter: { entityTypes: ["ce_city", "ce_region", "ce_state", "ce_root"] },
      //   $id: "local-editor-directory-stream",
      //   fields: [
      //     "dm_directoryParents.name",
      //     "dm_directoryParents.slug",
      //     "dm_directoryChildren.name",
      //     "dm_directoryChildren.address",
      //     "dm_directoryChildren.slug",
      //   ],
      // },
    },
    locator: {
      // stream: {
      //   $id: "local-editor-locator-stream",
      //   filter: { entityTypes: ["locator"] },
      //   fields: [],
      // },
    },
  },
} satisfies LocalEditorConfig;

export default config;
```

Each template can point at its own stream.
`directory` and `locator` start as commented examples in the generated scaffold, so they stay opt-in until you uncomment their `stream` block.

## Generate Snapshot Data

Run your normal local Pages flow, then regenerate snapshot data whenever the local-editor stream config changes:

```sh
npm run dev
yext pages generate-test-data
```

The plugin generates one hidden local-editor data template per configured template:

- `src/templates/local-editor-data-main.tsx`
- `src/templates/local-editor-data-locator.tsx`
- `src/templates/local-editor-data-directory.tsx`

Those generated templates let `yext pages generate-test-data` fetch the right entity pool for each template.

## Fake Shell Behavior

The `/local-editor` shell:

- lists only templates that exist in both the generated template manifest and the component registry
- filters the Entity dropdown to the currently selected template
- derives Locale options from the selected template and entity
- reads the selected template's default layout from `.template-manifest.json`

Unsaved local layout edits are scoped to `template + locale`.

That means:

- switching entities inside the same template and locale keeps your local draft
- switching locale creates a different draft
- switching template creates a different draft

## Generated Files

When local editor support is enabled in dev mode, the plugin may generate:

- `src/templates/local-editor.tsx`
- `src/templates/local-editor-data-<template>.tsx`
- `.template-manifest.json`

Generated files are content-aware. If the generated contents do not change, the plugin skips rewriting the file to reduce unnecessary Vite reloads.
