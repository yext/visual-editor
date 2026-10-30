# Layout Generation

Layout generation is loosely based on [json-render.dev](https://json-render.dev/). However, we use Puck to render and have a custom spec defined in order to natively generate Puck data and support slots.

At a high level, the section library defines Zod types for all supported sections. We render a chat interface as a Puck plugin that has workflows for blank-page generation, follow-up section edits, and intent-driven full-page updates. We take the user prompt and combine it with the schema to form an OpenAI API request. We forward this request to ModelGateway with strict generation
mode enabled, ensuring we get valid JSON back from the model. We then validate that the data is able to be rendered and push the update into Puck history.

Layout generation is enabled when `templateMetadata.aiPageGeneration.layoutGenerationEnabled` is true and a compatible `aiPageGeneration.prompts` bundle is supplied.

## System prompts

System prompts are owned by ALPHA and passed via `aiPageGeneration.prompts`. This allows us to change the prompts without a section library update.
Prompts can be tested using the local editor's `generationPromptsPath` configuration option.

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

Defines editor mechanics and diagnostic limits. Model-attempt deadlines and output-token allowances come from ALPHA through `aiPageGeneration.generationSettings`; only the local harness supplies defaults in `vite-plugin/layout-generation/settings.ts`.

## src/internal/layoutGeneration/shared

Utilities used across layout generation.

## src/internal/layoutGeneration/testing

Testing harnesses and fixtures for layout generation. `promptFixtures.ts` supplies dummy workflow markers and runtime placeholders, without importing ALPHA prompt wording.

## Intent-driven generation

`workflows/intentPageGeneration/IntentPageGenerationWorkflow` owns intent lifecycle and draft-save recovery. The chat hook `useIntentPageGeneration` connects that workflow to editor readiness and metadata.

An iframe owns only attempts it starts locally. Unowned `RUNNING` metadata shows an interruption warning and an explicit Restart generation action, explaining that restarting replaces the previous attempt. Restart creates a fresh attempt Id and persists `start` with `explicitRetry: true` before generating with the retained prompt through the existing generation and save flow. Failed persistence allows another explicit restart without generating. Repeated metadata never takes ownership or restarts an attempt, and superseded callbacks are ignored.

The platform supplies optional `templateMetadata.aiPageGeneration.intentPageGeneration` metadata (`prompt`, `status`, and optional `attemptId`). Only `PENDING` automatically starts once after the editor canvas is ready, with generation enabled and a configured model, outside theme and development modes for assignment `ALL`. The iframe persists `start` over `updateIntentPageGeneration` before updating the existing location layout copied by ALPHA. It tags the generated history save with the attempt/layout identity; the parent saves the draft and completes the attempt. Questions pause the current attempt and let the user answer in chat; the reply resumes full-page generation with the same attempt identity and conversation. Model failures and cancellation persist `fail`. Generation failures, including lost start/failure acknowledgements, end the local attempt, show a plain failure message, and release the editor without a generation-retry button or automatic restart. Uncertain draft saves retain explicit save recovery using the same attempt and saved hash. Reopened `RUNNING`, `FAILED`, and `COMPLETED` metadata does not automatically generate again. Intent status and save recovery appear within the chat conversation; cancellation uses the chat's Stop control. The retained prompt remains available. The local editor continues to use the chat interface.

`workflows/fullPageUpdate` compiles the full supported section schema and sends the intent, current content tree, section inventory, and locales through the existing model transport using mode `fullPageUpdate`. Headers, footers, useful content, and bindings are preserved by prompt guidance unless the intent requests changes. Clarification makes no changes; the next chat reply continues the full-page update with the original intent in conversation history.

The model streams ordered `keep`, `replace`, `insert`, `remove`, and `reorder` steps. Replacements contain complete generated sections, with new application-assigned Ids. Keeps and reorders preserve existing data and Ids. After replacement, the original section Id can reorder the entire replacement block or anchor an insertion/reorder before or after it; removed sections cannot be targeted. Steps target root sections or direct MainContent children; MainContent scaffolding, root settings, and theme are preserved, and reorder stays within a collection. Omitted sections remain unchanged. Each complete step is checked against the latest layout, resolved, validated, and previewed; incomplete JSON never applies. Untouched sections stay visible and explicit removal happens immediately.

Success, cancellation, and failure retain completed steps as one undoable change. Repair is allowed before any step has applied, and stops after streaming application begins. Late results cannot modify a different editor context. Once the full-page update completes or is cancelled, ordinary chat returns to the usual blank-page generation or section-edit routing. These contracts are runtime-only and require no saved-layout migration.

Full-page updates require explicit copy in generated text fields and content-bearing containers, including nested slots. Style defaults remain available. This prevents selecting entire default slots or localized fallback defaults in place of intent-specific headings, descriptions and CTAs. Ordinary creation retains its existing content defaults. Manual section copy belongs in the slots that render it, following each component's schema guidance; writing only a parent source object does not populate those slots. Targeting inventory contains section structure and permissions without duplicating descendant authored values; the complete authored component tree remains available separately.

Intent generation separates the user conversation, Yext intent-page guidance, mechanical instructions and reference context. `buildGenerationPrompt` fills literal placeholders in the supplied creation or `fullPageUpdate` template. ALPHA owns the purpose, business, mechanical and reference prose; field descriptions remain with their schemas. The validated prompt bundle is retained for the loaded editor scope, including clarification, retries, and section tasks; metadata refreshes do not replace it. Missing or incompatible bundles disable AI without blocking ordinary editing. Creation and full-page updates use separate mechanical blocks, and available component names, descriptions, defaults and locales appear in the reference section. The user request and conversation remain in API input messages rather than being interpolated into application instructions. Intent requests always use `fullPageUpdate`, including repairs and clarification continuations; ordinary fresh creation uses `create`. Only full-page updates receive the intent business guidance. The guidance prioritizes the visitor's answer, adapts section selection to the audience and intent, and treats commercial, local, FAQ, visual and CTA patterns as conditional recommendations. Template recommendations are secondary to visitor needs. Existing-page adaptation preserves relevant content, removes irrelevant or repetitive sections, and adds useful missing coverage without a minimum section count.

Useful sections may remain when a marketer must supply missing content. The model is instructed to put specific `[Content needed: ...]` labels in editable text slots and identify the section and outstanding content in its response. These are visible draft editorial requests saved as ordinary layout text, not private editor annotations or publish checks. Missing URLs, image sources, bindings and alt text must not contain these labels or invented values: supported empty/unset values are preferred; required draft/default values must be explicitly identified for replacement in editable text and the response. Business facts and evidence must not be fabricated. These instructions preserve the existing explicit-content schema and need no saved-layout migration.

Creation and full-page updates use the same configured `maxOutputTokens.page` allowance. An output-token rejection or exhaustion is reported without retrying at a different allowance. Each model attempt uses `attemptTimeoutMs`; its error message follows the configured deadline rather than assuming five minutes. Preparation, edit planning and section execution use their own configured output-token limits.

Full-page updates reduce request size without limiting the available component catalog. The model receives the full authored layout (including bindings and component Ids), excluding resolved/editor-only mirrors. Component guidance includes style defaults rather than repeating complete default slot trees and placeholder copy. An additional definition-graph compaction pass merges structurally identical schema definitions after canonicalizing their dependencies, retaining constraints, descriptions, component boundaries and recursive references. This pass is specific to full-page updates.

As validated sections stream into the preview, it scrolls to the added, changed, or moved section. Removal follows the nearest surviving section. Pending scrolling stops on editor teardown or user interaction. Chat progress uses Puck component display labels, falling back to component types when no label is configured.

The layout metadata's `defaultGenerationSectionIds` is advisory for both fresh creation and intent-driven full-page updates. Available recommendations appear in the model instructions and explicitly in request context as `recommendedSectionIds`. They are neither mandatory nor exhaustive: generation should choose relevant sections and can insert supported types absent from the current page to cover the requested intent.
