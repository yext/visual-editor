# Layout Generation

Layout generation is loosely based on [json-render.dev](https://json-render.dev/). However, we use Puck to render and have a custom spec defined in order to natively generate Puck data and support slots.

At a high level, the section library defines Zod types for all supported sections. We render a chat interface as a Puck plugin that has one workflow for full page generation and one
workflow for follow up edits. We take the user prompt and combine it with the schema to form an OpenAI API requests. We forward this request to ModelGateway with strict generation
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

These are the full page and follow up edit flows. They define the order of events, handle the preliminary prompts, and do the relevant schema compilation.

## src/internal/layoutGeneration/limits.ts

Defines the various token budgets and timeouts in one central place.

## src/internal/layoutGeneration/prompts.ts

Defines the plain text prompts we use in one central place.

## src/internal/layoutGeneration/shared

Utilities used across layout generation.

## src/internal/layoutGeneration/testing

Testing harnesses and fixtures for layout generation.
