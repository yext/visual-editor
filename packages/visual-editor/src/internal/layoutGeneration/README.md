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

Defines the plain text prompts we use in one central place.

## src/internal/layoutGeneration/shared

Utilities used across layout generation.

## src/internal/layoutGeneration/testing

Testing harnesses and fixtures for layout generation.

## Intent-driven generation

`workflows/intentPageGeneration/IntentPageGenerationWorkflow` owns intent lifecycle and draft-save recovery. The chat hook `useIntentPageGeneration` connects that workflow to editor readiness and metadata.

An iframe owns only attempts it starts locally. Unowned `RUNNING` metadata shows an interruption warning and an explicit Restart generation action, explaining that another editor tab may still be running the previous attempt. Restart creates a fresh attempt Id and persists `start` with `explicitRetry: true` before generating with the retained prompt through the existing generation and save flow. Failed persistence allows another explicit restart without generating. Repeated metadata never takes ownership or restarts an attempt, and superseded callbacks are ignored.

The platform supplies optional `templateMetadata.aiPageGeneration.intentPageGeneration` metadata (`prompt`, `status`, and optional `attemptId`). Only `PENDING` automatically starts once after the editor canvas is ready, with generation enabled and a configured model, outside theme and development modes for assignment `ALL`. The iframe persists `start` over `updateIntentPageGeneration` before generating a blank page or regenerating an existing page. It tags the generated history save with the attempt/layout identity; the parent saves the draft and completes the attempt. Questions pause the current attempt and let the user answer in chat; the reply resumes full-page generation with the same attempt identity and conversation. Model failures and cancellation persist `fail`. Generation failures, including lost start/failure acknowledgements, end the local attempt, show a plain failure message, and release the editor without a generation-retry button or automatic restart. Uncertain draft saves retain explicit save recovery using the same attempt and saved hash. Reopened `RUNNING`, `FAILED`, and `COMPLETED` metadata does not automatically generate again. Intent status and save recovery appear within the chat conversation; cancellation uses the chat's Stop control. The retained prompt remains available. The local editor continues to use the chat interface.

`workflows/fullPageRegeneration` compiles the full supported section schema and sends the intent, current content tree, section inventory, and locales through the existing model transport using mode `regenerate`. Headers, footers, useful content, and bindings are preserved by prompt guidance unless the intent requests changes. Clarification makes no changes; the next chat reply continues regeneration with the original intent in conversation history.

The model streams ordered `keep`, `replace`, `insert`, `remove`, and `reorder` steps. Replacements contain complete generated sections, with new application-assigned Ids. Keeps and reorders preserve existing data and Ids. Steps target root sections or direct MainContent children; MainContent scaffolding, root settings, and theme are preserved, and reorder stays within a collection. Omitted sections remain unchanged. Each complete step is checked against the latest layout, resolved, validated, and previewed; incomplete JSON never applies. Untouched sections stay visible and explicit removal happens immediately.

Success, cancellation, and failure retain completed steps as one undoable change. Repair is allowed before any step has applied, and stops after streaming application begins. Late results cannot modify a different editor context. Once regeneration completes or is cancelled, ordinary chat returns to the usual blank-page generation or section-edit routing. These contracts are runtime-only and require no saved-layout migration.

Regeneration requires explicit copy in generated text fields and content-bearing containers, including nested slots. Style defaults remain available. This prevents selecting entire default slots or localized fallback defaults in place of intent-specific headings, descriptions and CTAs. Manual section copy belongs in the slots that render it, following each component's schema guidance; writing only a parent source object does not populate those slots. The prompt asks for a complete topic-focused page, adapting existing sections and adding missing content rather than pruning as a substitute for writing. Targeting inventory contains section structure and permissions without duplicating descendant authored values; the complete authored component tree remains available separately.

If the gateway reports an output-token limit before regeneration starts, with explicit zero input/output usage and no generated or streamed text, the executor retries once with a 64,000-token output allowance instead of 128,000. The schema, prompt, layout and shared deadline stay the same. Missing/nonzero usage, actual truncation and failures after streaming are not retried through this path. Diagnostics record the reduced budget, and the error message distinguishes a failure before generation from exhausting a generation's output budget.

Regeneration reduces request size without limiting the available component catalog. The model receives the full authored layout (including bindings and component Ids), excluding resolved/editor-only mirrors. Component guidance includes style defaults rather than repeating complete default slot trees and placeholder copy. An additional definition-graph compaction pass merges structurally identical schema definitions after canonicalizing their dependencies, retaining constraints, descriptions, component boundaries and recursive references. This pass is specific to regeneration.

As validated sections stream into the preview, it scrolls to the added, changed, or moved section. Removal follows the nearest surviving section. Pending scrolling stops on editor teardown or user interaction. Chat progress uses Puck component display labels, falling back to component types when no label is configured.

The layout metadata's `defaultGenerationSectionIds` is advisory for both fresh creation and intent regeneration. Available recommendations appear in the model instructions and explicitly in request context as `recommendedSectionIds`. They are neither mandatory nor exhaustive: generation should choose relevant sections and can insert supported types absent from the current page to cover the requested intent.
