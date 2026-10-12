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

## Layout chat

Use **Show chat** to open the floating conversation over the layout editor.
Complete sections appear directly on the canvas as generation streams. Manual
editing and undo/redo pause during generation. Successful turns become one
undoable edit and persist through the editor's existing local storage. Failed
turns and repair resets restore the starting layout. Prose-only replies leave
that layout unchanged.

Each prompt includes the current editor content, including manual edits. Hiding
chat keeps the conversation and active request. **New conversation** cancels
provisional changes and clears messages and token usage, preserving committed
layout data. Layout changes abort generation and clear chat. Entity and locale
changes keep the conversation and active request; output follows the active
editor, with that selection's starting layout used for rollback and undo.
**Enter** sends a prompt; **Shift+Enter** inserts a new line. Token counts are
available under **Token usage** in the panel footer.

Entering theme mode or opening full-page preview cancels the active turn and
preserves completed messages. Chat is hidden in theme mode.

### Native Puck content

Generation authors only the `content` array in Puck's saved-data format:

```json
{
  "content": [
    {
      "type": "MainContent",
      "props": {
        "id": "main-content",
        "content": [
          { "type": "hero", "props": { "id": "hero-1", "title": "Welcome" } }
        ]
      }
    }
  ]
}
```

The editor preserves its existing `root`, including page settings and migration
metadata, and sets `zones` to `{}` when applying generated content. Neither root
nor zones are requested from the model or included in revision context. Failed
turns restore the full starting layout, including any prior zones.

`content` is ordered component data. Nested slot fields contain component arrays
inside props, including slots within object/array fields. Every component needs
a unique nonempty `props.id`. Runtime `puck` context and callbacks are never saved.

The generator creates `src/library/.generated/catalog.js`, exporting `catalogs`
keyed by layout ID. Each catalog includes compatible sections with `formalProps`,
MainContent, and compatible hidden shared components for nested slots. Generation
uses the editor's regular Puck config.

```ts
import { z } from "zod";
import type { SectionConfig } from "@yext/visual-editor";

export const config: SectionConfig = {
  id: "hero",
  displayName: "Hero",
  description: "A hero with a title and optional description.",
  pageSetTypes: ["ENTITY"],
  formalProps: z.object({
    title: z.string().describe("Use a concise welcoming title."),
    description: z.string().nullable(),
  }),
};
```

Sections without formal schemas remain available in the regular Visual Editor.
Descriptions, regex constraints, enums, nested schemas, and optional fields guide
AI generation. Formal schemas describe serializable component props without
runtime Puck context. The catalog adds the common saved component ID and
preserves schema refinements for validation.

`createPuckGenerationCatalog` from the section-library-support entrypoint uses
json-render's `defineSchema` and `defineCatalog` with a custom prompt template.
The schema defines only Puck content rather than an elements graph. The
custom template avoids default flat-tree instructions. An internal compiler
derives the gateway's complete response schema from component Zod schemas,
pairing each component type with its own props and constraining nested slots.
Generation requires `strict: true`; it never falls back to an unrestricted
schema. Zod's native JSON Schema export retains descriptions, enums, patterns,
and other supported constraints. The prompt supplies concise component and
default-value guidance rather than duplicating property schemas or Puck fields.

Formal schemas must describe constrained, serializable props. Every reachable
component needs `formalProps` or a complete inline schema in its parent slot.
Declared Puck slots can use generic component arrays: the compiler replaces
them with allowed component alternatives. Other `any`, `unknown`, open-ended
records, transformations, and unsupported schema keywords fail explicitly.
For example, `Heading.props.options` with an unrestricted record produces a
schema error naming that path before any gateway request.

The nesting limit applies independently to inline schema objects in the root
and each `$defs` entry. `$ref` boundaries preserve fully constrained, deeply
nested Puck layouts without flattening their saved-data shape. References are
validated without expanding them into a single output-depth count.
Contextual descriptions on reused schemas are retained in an `anyOf` wrapper,
because the gateway requires `$ref` nodes to have no sibling keywords.

Localized-string objects retain their native shape. String-valued catchalls on
objects with `defaultValue` and optional `hasLocalizedValue` become fixed locale
properties for generation. The selected layout's stream locale list, snapshot
locales, and effective default locale determine those properties; global UI
translation locales are not used. Existing content with unconfigured locale
keys fails preflight rather than losing translations. Other dynamic maps must
declare fixed keys.

Strict output represents optional properties with nullable placeholders. The
server removes those placeholders when the original schema allows omission
but not null, preserving genuinely nullable values. Completed streaming
components use the same normalization as accepted responses. Original Zod
refinements and semantic checks, including unique component IDs, still run
before acceptance.

Component `readOnly` flags are editor-owned: they are excluded from gateway
output, current-content context, and structured conversation history. The
server restores existing flags for matching component IDs and types, including
nested slots. New components and replacements do not inherit flags.

Schema and current-content incompatibilities return HTTP 422 with an actionable
path. Unsupported strict output, refusals, and incomplete gateway responses
fail the turn without a non-strict retry. Other starter schema corrections are
separate from this pipeline change.

Each gateway attempt has a 16,384-token minimum output budget (including
reasoning), increased to twice the estimated current-layout token count plus
4,096 when needed. The estimate uses UTF-8 byte length divided by three.
Attempts have a two-minute deadline, including time spent actively streaming.
A guard stops thousands of characters of consecutive repeated text within a
single JSON string. Budget exhaustion, deadlines, and repetition errors fail
the turn without automatic repair and roll back provisional previews.
Generation logs are buffered and written asynchronously every ten seconds,
with an early flush at 4 MiB and a final flush on graceful server shutdown.

A manual gateway smoke check uses only a synthetic catalog and prompt:

```sh
pnpm --dir packages/visual-editor exec node --import tsx scripts/strictGenerationSmoke.ts gpt-6-luna
```

This check is separate from the normal tests and requires company gateway
access. Pass the configured generation model as the final argument.

Generation supports serializable Puck props and the existing entity reference
conventions. json-render state bindings, repeat instructions, and action
expressions are currently unsupported. Schema construction, validation,
transport, and preview resolution are separate so future expression support can
be added explicitly without changing the editor integration.

See [json-render custom schemas](https://json-render.dev/docs/custom-schema),
[Puck Data](https://puckeditor.com/docs/api-reference/data-model/data), and
[Puck slot fields](https://puckeditor.com/docs/api-reference/fields/slot).

### Generation protocol

The development-only POST endpoint at
`/__yext_visual_editor/local-editor/generate` accepts:

```ts
{
  layoutId: "location",
  currentData: { content: [] },
  messages: [{ role: "user", content: "Create a welcoming page" }]
}
```

Messages use user/assistant roles, must end with a nonempty user turn, and are
limited to 1 MiB per request. Unknown layouts are rejected. The endpoint sends
conversation history and catalog descriptions/prop schemas to the company
Responses gateway at `http://modelgateway.service.us3dev.consul:8008/openai/responses`.
No `OPENAI_API_KEY` is required; the development server needs gateway access.
Requests retain `Yext-Business-Id: 1000152098`, `Yext-Source: blife-vle-ai-poc`, and
a fresh UUID in `Correlation-Id`. Snapshot documents and section source code are
not sent.

Each response is `{ text, spec }`, where `spec` contains the complete Puck content array or
`null` for prose-only answers. The NDJSON protocol identifies itself with
`X-Visual-Editor-Generation: validated-puck-content-v1` and emits `preview-text`,
`preview-spec`, `reset`, `accepted`, `usage`, and `error` events. Accepted events
carry `text` and `spec` directly. The previous flat-spec/mixed-patch protocol is
not supported.

The server previews complete, validated sections as they arrive, including
completed sections inside a still-open MainContent slot. Preview scaffolding
never enters committed editor history. Completed content undergoes
structure, ID, component membership, slot, and prop validation. Failures
trigger up to two repair attempts. Failed turns restore the previous conversation;
only accepted structured responses become revision history.

The client resolves cloned generation data with `resolveAllData` inside the
existing Puck editor. Resolution failures roll back the turn and appear in chat.
Stale resolution results are ignored. Requests add optional `currentData` containing
serializable Puck content; root, zones, runtime callbacks, and Puck context are excluded. The
server places this current layout after earlier conversation context so it is
the authoritative starting point for revisions.

Gateway requests/responses are logged as JSONL in `src/library/.generated/logs`.
Logs retain request bodies, stream events, HTTP status, correlation IDs, generated
text, and usage. The conversation displays cumulative cached input, uncached
input, and output tokens, including repairs and reported usage from failed turns.
Usage resets with **New conversation** or a layout change.

The default model remains `gpt-6-luna`:

```ts
yextVisualEditorPlugin({
  localEditor: { enabled: true, generationModel: "gpt-6-luna" },
});
```

The generated local-editor template enables chat with the optional `chatEnabled`
prop. The shell supplies a chat canvas through `LocalEditorChatContext`, and the
layout editor mounts the bridge inside its Puck provider when that local-editor
context is present. Chat files live in `src/local-editor/chat`; layout generation
files live in `src/vite-plugin/layout-generation`.

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
