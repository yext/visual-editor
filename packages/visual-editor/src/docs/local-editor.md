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
Commentary and progress stream into chat. Complete layouts appear on the canvas
only after validation and resolution. Manual editing and undo/redo pause during
generation. Successful turns become one undoable edit and persist through the
editor's existing local storage. Failed turns and clarifications leave the
starting layout unchanged.

Each prompt includes the current editor content, including manual edits. Hiding
chat keeps the conversation and active request. **New conversation** cancels the
turn and clears messages and token usage, preserving committed layout data.
Layout changes abort generation and clear chat. Entity and locale changes abort
the active turn while preserving the previous conversation.
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

The editor preserves its existing `root`, page settings, migration metadata,
and unexposed serializable configuration. Populated legacy `zones` are rejected
before generation; they are never silently converted or discarded.

The generator creates `src/library/.generated/catalog.js`, exporting `catalogs`
keyed by layout Id. Contracts belong to the registered Puck component, including
hidden shared slot children. Sections without a contract remain available in
the editor and can be preserved in existing layouts.

```ts
import { z } from "zod";
import type { YextComponentConfig } from "@yext/visual-editor";

export const Hero: YextComponentConfig = {
  generation: {
    props: z.object({
      title: z.string().describe("Use a concise welcoming title."),
      description: z.string().nullable().optional(),
      heading: z.array(z.unknown()).length(1),
    }),
  },
  fields: { heading: { type: "slot", allow: ["Heading"] } },
  defaultProps: { title: "Welcome", heading: [] },
  render: ({ title }) => <h1>{title}</h1>,
};
```

`generation.props` describes complete authored configuration. Omit inherited
and computed values, callbacks, identities, and editor metadata. Parent contracts
describe slots as arrays of `z.unknown()` with cardinality constraints; native
`allow`/`disallow` restrictions select registered child contracts. Do not duplicate
child schemas inline. Undeclared copied slots remain system-owned and are excluded
from authored traversal, model context, and targeting.

### Slotted item sources

Opt slot-backed repeated sections into the helper's generation contract:

```ts
generation: {
  props: sectionSchema,
  slottedItemSource: cardsSource.generation,
},
```

Declare `data.field`, `data.constantValueEnabled`, mappings, and
`slots.CardSlot: z.array(z.unknown())` in `sectionSchema`. Omit
`data.constantValue`, `manualSlots`, and `conditionalRender`; these are managed
by the helper. Register a generation contract for the helper's card type.
Generation restricts CardSlot to that type without changing editor fields.

In manual mode, explicit CardSlot arrays determine content and order, including
an empty list. Selecting `$default` retains default cards or creates cards from
the default reference count and helper card defaults. Generation assigns fresh
component Ids, normalizes direct child-slot Ids, and derives matching references
before the editor runs resolvers. Authored card content, styling, translations,
and identities must survive resolution; the manual backup must mirror them.

In linked mode, generate bindings and mappings and leave CardSlot empty or select
its default. Visible cards are derived from entity data using library defaults.
Any inactive manual backup remains protected authored content. References and
linked output are checked structurally without comparing entity-driven content
against the empty candidate slot. Shared linked-card templates are not supported.
These rules apply to any section using `createSlottedItemSource`, including FAQ,
Events, and Team sections. Saved layout shapes do not change.

`createPuckGenerationCatalog` uses json-render's custom schema/catalog approach
with native nested Puck data. Only the metadata type and catalog entrypoint are
public; compilation, traversal, and materialization remain implementation details.
Zod's JSON Schema export supplies the strict gateway response schema. Unsupported
constructs, including transformations, custom refinements, unrestricted maps,
and unrepresentable gateway keywords, fail before any model call.

Each declared wire property is required and uses `{ mode: "keep" }` or
`{ mode: "set", value: ... }`. `{ mode: "unset" }` is available only when the
authored schema allows absence. Null is an explicit set value. Objects apply these
rules recursively; ordinary arrays replace their complete values. Optional members
inside complete array values use set/unset envelopes to express absence without
nullable placeholders. Localized catchalls expand to the selected layout's locales;
keep preserves existing translations and entity bindings.

Existing instances use their native authored subtree as the baseline; new instances
clone component defaults. A new fixed-slot child uses the enclosing default slot
template when exactly one template matches its type. New authored subtrees receive
fresh Ids. Explicit invalid values are never repaired by defaults, and missing
required values produce a path-specific validation error.

The strict model envelope is `{ text, result }`. The result is a clarification,
initial page creation, explicitly authorized full-page redesign, or bounded edit
operations. Update/remove/move targets and destination collections are enumerated
from the starting inventory. Conflicting ancestor/descendant operations, cycles,
illegal destinations, and targets created during the same response are rejected.
The complete candidate is materialized and validated against an isolated baseline.
At most one schema or validation repair uses that unchanged baseline. Refusals,
transport failures, deadlines, and output exhaustion terminate the turn. A page
containing only an empty MainContent scaffold counts as blank. Blank-page creation
uses a minimum output budget of 65,536 tokens; small edits retain the 16,384-token
minimum, with larger existing layouts receiving a scaled allowance. The gateway
request log records the selected budget and blank-page classification.

No `OPENAI_API_KEY` is required; the development server needs gateway access.
Requests use strict JSON Schema output with `strict: true`, retaining the gateway's
existing business/source headers and a fresh correlation Id. Component source code
and snapshot documents are not sent. Authored context, defaults, and descriptions
are used for generation. Image requests can use model-supplied image URLs.

The NDJSON transport identifies itself with
`X-Visual-Editor-Generation: strict-puck-overrides-v2`. It emits `commentary`,
`progress`, `accepted`, `usage`, and `error` events. Only the accepted event contains
a complete materialized `spec` (or null for clarification). Commentary and progress
never mutate the canvas. There are no provisional layouts or compatibility events.

After transport completes, the client validates and resolves the isolated candidate
through `resolveAllData` in the active editor with its `streamDocument`. It validates
again and checks that resolution preserved canonical authored state before adding
one history entry. Failed, cancelled, stale, or invalid turns leave the starting
layout unchanged. Changes to layout, entity, or locale abort the turn.

Generation outcomes, correlation Ids, and errors are logged locally in
`src/library/.generated/logs`. Server initialization writes and flushes a startup
entry immediately; subsequent request entries are buffered for up to ten seconds
and flushed on shutdown. Requests cancelled in the browser before reaching the
server produce no request entry. The conversation displays cumulative cached input,
uncached input, and output tokens, including repairs. Usage resets with
**New conversation** or a layout change.

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
