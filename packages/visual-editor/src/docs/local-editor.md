---
title: Section Library Local Editor
outline: deep
---

# Section Library Local Editor

Local Editor lets you edit Section Library layouts in development. Entity
layouts use local Pages snapshots. Directory layouts use snapshots when a
Directory stream is configured, otherwise built-in fixture data. Locator
layouts use built-in fixture data by default, or real Search data when
configured.

## Enable Local Editor

```ts
yextVisualEditorPlugin({
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

## json-render mode

Use **Switch to json-render** at the top of Local Editor to generate and render
specs in a conversation. Follow up to revise a previous generation; use
**New conversation** to clear the history. Use **Switch to Visual Editor** to return to layout/theme
editing. The json-render view uses the selected document and translation context.

The section library generator creates `src/library/.generated/catalog.js` and
`registry.js` during builds and development, and cleans them up with the other
generated files. Both use section metadata IDs as component keys. The catalog
uses each section's description and optional `formalProps` Zod object:

```ts
import { z } from "zod";
import type { SectionConfig } from "@yext/visual-editor";

export const config: SectionConfig = {
  id: "hero",
  displayName: "Hero",
  description: "A hero with a title and optional description.",
  pageSetTypes: ["ENTITY"],
  formalProps: z.object({
    title: z.string(),
    description: z.string().nullable(),
  }),
};
```

Schemas can reference other declarations/imports. Only sections with `formalProps`
are registered in the AI catalog and registry. Sections without schemas remain
available in the regular Visual Editor. For multiple sections, generation uses
the built-in `MainContent` container and puts each section in its
children in display order. The registry adapts these children into the existing
MainContent component's `content` slot. Section components are leaves rather than
containers. The registry adapts section functions or component config
`render` functions to json-render's props and children. It validates resolved props
before rendering and injects the host's Puck context (`isEditing`, `dragRef`,
`metadata`, and `renderDropZone`). Generation includes exactly `puck: { isEditing: false }` for the current
preview mode. Local Editor supplies the runtime context and callbacks when rendering.

Field guidance stays with `formalProps`: `.describe()` text, regex patterns,
enums, nested schemas, optional fields, and unions are serialized from the
original Zod schemas into the outgoing instructions. Imported shared color or
entity-field schemas retain their guidance automatically. For example:

```ts
const customColor = z
  .string()
  .regex(/^\[#[0-9a-fA-F]{6}\]$/)
  .describe("Use bracketed hex, for example [#D63384].");
const entityField = z.string().describe("Use an entity field path.");
// Reuse these schemas inside any section's formalProps.
```

Keep application-wide conventions in `customRules`. Descriptions guide the model;
use schema constraints/refinements for requirements that must be enforced (such
as requiring an emoji).

The development-only POST endpoint at
`/__yext_visual_editor/local-editor/generate` accepts a `messages` array of
`{ role: "user" | "assistant", content: string }` entries ending in a user turn
(up to 1 MiB per request), and requests a structured JSON response from
the company AI gateway at
`http://modelgateway.service.us3dev.consul:8008/openai/responses`.
The development server must have network access to that service. No
`OPENAI_API_KEY` is required. Requests include `Yext-Business-Id: 1000152098`,
`Yext-Source: blife-vle-ai-poc`, and a fresh UUID in `Correlation-Id`.
Generation sends the full conversation, including previous generated spec fences,
as Responses `input` and the catalog descriptions/
prop schemas as `instructions` using json-render inline (chat) mode. Each revision
emits a complete spec so earlier previews remain available. It requests Responses
streaming with structured JSON output. The server decodes explanation text
incrementally and previews each complete, schema-valid section as it arrives;
partial nested props are never rendered. Initial state bindings wait for the complete
state object. Missing sections appear as placeholders. Omitted `children` arrays
on catalog-declared leaves are normalized to `[]` before validation, while malformed
arrays and missing container children still fail validation. Buffering is disabled;
a regular Responses JSON result is also supported when the gateway does not stream.
The endpoint uses a versioned NDJSON protocol with `preview-text`, `preview-spec`, legacy `preview`, `reset`, `accepted`,
`usage`, and `error` events. Completed specs undergo structural validation,
`catalog.validate()`, and direct component schema checks (needed because
json-render 0.21's multi-component catalog validation omits prop constraints).
Validation failures are sent back to the model for up to two repair attempts.
Only accepted output enters conversation history; failed repairs restore the
previous conversation. The client rejects responses without this protocol or an
acceptance event.

Dynamic expressions remain in accepted specs. Validation resolves props against
the spec's initial state, including repeat items, before checking field schemas.
Empty repeat scopes have no concrete instances to validate; the registry checks
resolved props on every render, including subsequent state updates, and withholds
invalid section output.
The client renders structured text deltas and complete section previews progressively,
using json-render's mixed-stream parser for accepted content and legacy previews.
Unchanged serialized Puck slots retain their in-flight data resolution as other
sections arrive. Accepted spec fences are retained for follow-up requests. Failed turns
are excluded from revision history. Conversation history lasts while this view
is mounted. Snapshot documents and section source code are not sent.

Gateway requests and responses are logged as JSONL in
`src/library/.generated/logs`. Each development-server session creates a `.log`
file named with the timestamp of its first entry. Logs include request bodies,
stream events, HTTP status, correlation ID, generated text, and token usage.

The conversation displays cumulative cached input, uncached input, and output
tokens, including validation repair attempts and reported usage from failed turns.
Uncached input is total input minus cached input; cache writes count as uncached
input. Usage lasts while the view is mounted and resets with **New conversation**.

The default model is `gpt-6-luna`. Override it when needed:

```ts
yextVisualEditorPlugin({
  localEditor: { enabled: true, generationModel: "gpt-6-luna" },
});
```

Model availability depends on the gateway. Errors appear in the renderer
view. This mode previews generated specs; it does not save them as Puck layouts.

## Test Data

### ENTITY Page Sets

By default, a basic location entity stream is used to pull data for ENTITY page set types.
This can be configured in the `stream.config.ts` to use other entity types and to include other fields (including custom fields ).

#### Alternative layouts

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
        filter: {
          entityTypes: ["dm_city"],
          savedFilterIds: ["dm_x-y_address_city"],
        },
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
