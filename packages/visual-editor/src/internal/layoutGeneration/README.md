# Layout Generation

Layout generation is loosely based on [json-render.dev](https://json-render.dev/). However, we use Puck to render and have a custom spec defined in order to natively generate Puck data and support slots.

At a high level, the section library defines Zod types for all supported sections. We render a chat interface as a Puck plugin that has workflows for blank-page generation, follow-up section edits, and intent-driven full-page regeneration. We take the user prompt and combine it with the schema to form an OpenAI API request. We forward this request to ModelGateway with strict generation
mode enabled, ensuring we get valid JSON back from the model. We then validate that the data is able to be rendered and push the update into Puck history.

Layout generation is enabled when `templateMetadata.aiPageGeneration.layoutGenerationEnabled` is true. We currently support gpt-6-luna.

## src/internal/layoutGeneration/schema

The section library defines `layoutGenerationMetadata` in each supported `YextComponentConfig`. This metadata is formal Zod prop type, which can include plain text descriptions for the LLM. These are compiled into the generation’s “schema”. The code does some compression on the schema so it’s small enough to send to the model.

## src/internal/layoutGeneration/transport

Handles back and forth between the model. Both the local-editor and real editor using the same iframe message protocol.
In the platform, our YSS iframe message handler receives these messages and forwards them to ModelGateway.
`src/vite-plugin/local-editor` adds message handlers that forwards the requests directly to the dev ModelGateway.
We want to support response streaming, so these handlers are more complex than typical.

## src/internal/layoutGeneration/chat

`LayoutGenerationChatPlugin` Defines the actual chat UI that is rendered as a Puck Plugin.
`LayoutGenerationChatCanvas` This is how we apply edits to the Puck data, handling things like Puck history and mismatched context.
`LayoutGenerationChatBridge` Bridges between the canvas and the Puck internals.

## src/internal/layoutGeneration/workflows

These are the full page, follow-up edit, and intent page generation flows. They define the order of events, handle the preliminary prompts, and do the relevant schema compilation.

## src/internal/layoutGeneration/limits.ts

Defines the various token budgets and timeouts in one central place.

## src/internal/layoutGeneration/prompts.ts

Assembles the Markdown-structured application prompts. Shared business guidance lives in `intentPageGuidance.ts`; workflow mechanics remain in `prompts.ts`.

## src/internal/layoutGeneration/shared

Utilities used across layout generation.

## src/internal/layoutGeneration/testing

Testing harnesses and fixtures for layout generation.

## Intent-driven generation

`workflows/intentPageGeneration/IntentPageGenerationWorkflow` owns intent lifecycle and draft-save recovery. The chat hook `useIntentPageGeneration` connects that workflow to editor readiness and metadata.

An iframe owns only attempts it starts locally. Unowned `RUNNING` metadata shows an interruption warning and an explicit Restart generation action, explaining that restarting replaces the previous attempt. Restart creates a fresh attempt Id and persists `start` with `explicitRetry: true` before generating with the retained prompt through the existing generation and save flow. Failed persistence allows another explicit restart without generating. Repeated metadata never takes ownership or restarts an attempt, and superseded callbacks are ignored.

The platform supplies optional `templateMetadata.aiPageGeneration.intentPageGeneration` metadata (`prompt`, `status`, and optional `attemptId`). Only `PENDING` automatically starts once after the editor canvas is ready, with generation enabled and a configured model, outside theme and development modes for assignment `ALL`. The iframe persists `start` over `updateIntentPageGeneration` before generating a blank page or regenerating an existing page. It tags the generated history save with the attempt/layout identity; the parent saves the draft and completes the attempt. Questions pause the current attempt and let the user answer in chat; the reply resumes full-page generation with the same attempt identity and conversation. Model failures and cancellation persist `fail`. Generation failures, including lost start/failure acknowledgements, end the local attempt, show a plain failure message, and release the editor without a generation-retry button or automatic restart. Uncertain draft saves retain explicit save recovery using the same attempt and saved hash. Reopened `RUNNING`, `FAILED`, and `COMPLETED` metadata does not automatically generate again. Intent status and save recovery appear within the chat conversation; cancellation uses the chat's Stop control. The retained prompt remains available. The local editor continues to use the chat interface.

`workflows/fullPageRegeneration` compiles the full supported section schema and sends the intent, current content tree, section inventory, and locales through the existing model transport using mode `regenerate`. Headers, footers, useful content, and bindings are preserved by prompt guidance unless the intent requests changes. Clarification makes no changes; the next chat reply continues regeneration with the original intent in conversation history.

The model streams ordered `keep`, `replace`, `insert`, `remove`, and `reorder` steps. Replacements contain complete generated sections, with new application-assigned Ids. Keeps and reorders preserve existing data and Ids. Steps target root sections or direct MainContent children; MainContent scaffolding, root settings, and theme are preserved, and reorder stays within a collection. Omitted sections remain unchanged. Each complete step is checked against the latest layout, resolved, validated, and previewed; incomplete JSON never applies. Untouched sections stay visible and explicit removal happens immediately.

Success, cancellation, and failure retain completed steps as one undoable change. Repair is allowed before any step has applied, and stops after streaming application begins. Late results cannot modify a different editor context. Once regeneration completes or is cancelled, ordinary chat returns to the usual blank-page generation or section-edit routing. These contracts are runtime-only and require no saved-layout migration.

Fresh intent creation and regeneration require explicit copy in generated text fields and content-bearing containers, including nested slots. Style defaults remain available. This prevents selecting entire default slots or localized fallback defaults in place of intent-specific headings, descriptions and CTAs. Ordinary creation retains its existing content defaults. Manual section copy belongs in the slots that render it, following each component's schema guidance; writing only a parent source object does not populate those slots. Targeting inventory contains section structure and permissions without duplicating descendant authored values; the complete authored component tree remains available separately.

Intent generation separates the user conversation, Yext intent-page guidance, mechanical instructions and reference context. `buildGenerationPrompt` assembles named purpose, business, mechanical and reference sections with Markdown headings. Business guidance lives in `intentPageGuidance.ts` as independently reviewable prose; field formats and missing-content label syntax belong to mechanics. Creation and regeneration use separate mechanical blocks, and available component names, descriptions, defaults and locales appear in the reference section. The user request and conversation remain in API input messages rather than being interpolated into application instructions. Fresh intent requests carry runtime-only `purpose: "intent"`, including preparation, repairs and clarification continuations; ordinary fresh creation does not receive intent business guidance. Regeneration always receives it. The guidance prioritizes the visitor's answer, adapts section selection to the audience and intent, and treats commercial, local, FAQ, visual and CTA patterns as conditional recommendations. Template recommendations are secondary to visitor needs. Existing-page adaptation preserves relevant content, removes irrelevant or repetitive sections, and adds useful missing coverage without a minimum section count.

Useful sections may remain when a marketer must supply missing content. The model is instructed to put specific `[Content needed: ...]` labels in editable text slots and identify the section and outstanding content in its response. These are visible draft editorial requests saved as ordinary layout text, not private editor annotations or publish checks. Missing URLs, image sources, bindings and alt text must not contain these labels or invented values: supported empty/unset values are preferred; required draft/default values must be explicitly identified for replacement in editable text and the response. Business facts and evidence must not be fabricated. These instructions preserve the existing explicit-content schema and need no saved-layout migration.

If the gateway reports an output-token limit before regeneration starts, with explicit zero input/output usage and no generated or streamed text, the executor retries once with a 64,000-token output allowance instead of 128,000. The schema, prompt, layout and shared deadline stay the same. Missing/nonzero usage, actual truncation and failures after streaming are not retried through this path. Diagnostics record the reduced budget, and the error message distinguishes a failure before generation from exhausting a generation's output budget.

Regeneration reduces request size without limiting the available component catalog. The model receives the full authored layout (including bindings and component Ids), excluding resolved/editor-only mirrors. Component guidance includes style defaults rather than repeating complete default slot trees and placeholder copy. An additional definition-graph compaction pass merges structurally identical schema definitions after canonicalizing their dependencies, retaining constraints, descriptions, component boundaries and recursive references. This pass is specific to regeneration.

As validated sections stream into the preview, it scrolls to the added, changed, or moved section. Removal follows the nearest surviving section. Pending scrolling stops on editor teardown or user interaction. Chat progress uses Puck component display labels, falling back to component types when no label is configured.

The layout metadata's `defaultGenerationSectionIds` is advisory for both fresh creation and intent regeneration. Available recommendations appear in the model instructions and explicitly in request context as `recommendedSectionIds`. They are neither mandatory nor exhaustive: generation should choose relevant sections and can insert supported types absent from the current page to cover the requested intent.

## Verification

### Automated mechanics

Run `pnpm --dir packages/visual-editor run test:editor` and, after TypeScript changes, `pnpm --dir packages/visual-editor exec tsc --noEmit` from the repository root. These tests use synthetic model responses; they verify application behavior, not the model's ability to follow the business guidance.

- `transport/executeGeneration.test.ts` checks the actual model request: Markdown section boundaries, shared business guidance, distinct creation/regeneration mechanics, intent-only scope, separate user messages, and explicit draft-content materialization.
- `chat/intentClarification.integration.test.tsx` checks preparation and generation clarifications on blank and existing pages, preserving purpose, conversation and attempt identity through the draft save. Content-request labels must appear on the canvas and in saved layout data.
- Existing creation, regeneration and section-edit tests check schema validation, permissions, bindings, localization, streaming, cancellation, undo and save recovery.

### Manual page quality

Use the configured model in the local or platform editor. For before/after comparisons, hold the model version/settings, section library, initial layout, locales and supplied facts constant. Save the request, clarification answers, rendered page and layout data for each result. Compare more than one generation when results disagree; do not select only the strongest output. Do not infer page quality from a passing schema or mocked-response test.

| Scenario | Example request | Expected quality |
| --- | --- | --- |
| Question/answer | What type of doctor treats knee pain? | Direct answer early; relevant explanation rather than promotion first. |
| Educational audience | Explain mortgage pre-approval for first-time buyers. | Accessible explanations and useful steps appropriate to the audience. |
| Comparison with missing facts | Compare our catering options for office events. No menus or prices have been supplied. | Useful comparison structure with specific requests for missing details; no invented options or prices. |
| Local intent | Create a page about hotels near Madison Square Garden. | Geography influences relevant sections; no invented properties, distances or availability. |
| General intent | Create a general catering planning guide. | No location sections without a reason; practical guidance remains central. |
| Existing-page adaptation | Adapt a location page to explain our custom fit shoe service. | Relevant content and brand assets retained; unrelated copy/imagery addressed; useful missing coverage added. |
| Missing evidence | Include expert insights, but no verified quotes are available. | Useful section retained with a specific editorial request rather than a fabricated expert quote. |
| Explicit preference | Explain catering planning without FAQs or a promotional CTA. | Requested omissions honored; recommendations do not become a checklist. |

For each page, score each criterion 0 (missed), 1 (partly met) or 2 (met), and record a concrete observation: primary intent answered early; audience-appropriate depth; distinct and relevant sections; logical ordering; business/geographic relevance; meaningful draft copy and clearly identified gaps. Prefer the page with better intent satisfaction, not more sections or longer copy. Unsupported factual claims or fabricated evidence are failures regardless of the total score.

Also check that editorial requests remain visible after saving and reopening, are absent from URLs/image sources/bindings/alt text, and identify every required default retained for replacement. For multilingual pages, answer a translation clarification and verify that the original topic and audience still govern the result. Business review should confirm the rubric and assess the actual generated copy; automated checks cover the separate editor mechanics.

## Prompt and schema guidance audit (2026-10-29)

Scope: the model-facing descriptions, generation contracts, catalog guidance and defaults owned by this repository, including fresh creation, regeneration, preparation, edit planning and section execution. Downstream Section Library components supply their own `description`, `layoutGenerationMetadata.props` annotations, fields and defaults; those external definitions are not present here and were not individually audited.

| Surface | Decision | Finding |
| --- | --- | --- |
| Fresh intent content defaults | Replace | Creation previously permitted default markers for text and entire slots, allowing sample copy to bypass explicit draft authoring. Intent creation now uses the same explicit-content compiler option as regeneration. Ordinary creation retains its defaults. |
| Component reference defaults | Replace | Fresh intent guidance previously exposed complete sample copy and nested default content. Both intent paths now expose style defaults only, retaining component descriptions and supported types. |
| Component/field description priority | Clarify | Descriptions explain component purpose and field-authoring constraints; they do not require selecting a section. Authored values and sample defaults are context, while inventory and schema define capabilities. |
| Missing non-text content | Clarify | Default values may be forbidden by a specific schema. Prefer permitted empty/unset values or supplied valid draft values; otherwise retain the useful content in an alternative supported section or explain the limitation. Never invent a required URL or image source. |
| MainContent, slots, bindings and manual/linked lists | Keep | These define scaffolding and where visible content is authored. They impose no mandatory business section checklist. |
| Translation and preparation descriptions | Keep | Translation approval and explicit card counts are mechanical decisions. A general card-count rule does not require every collection type to appear. |
| Regeneration and edit schema descriptions | Keep | Insertion supports missing relevant coverage, not a minimum section count. Clarification, operation targeting and dependency rules remain consistent with the business guidance. |
| Description export/compaction | Keep | Field descriptions remain present through strict schema compilation and compaction; intent restrictions do not remove authoring guidance. |

The audit changes runtime generation contracts only; it does not change saved component props or editor field options, so no layout migration is required. Regression checks cover explicit copy/content requests, rejection of whole-content defaults, retention of style defaults, description propagation and unchanged ordinary creation.
