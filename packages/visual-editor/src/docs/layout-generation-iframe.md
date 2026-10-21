# Layout generation iframe contract

This is the contract between visual-editor and its parent platform. The platform
handler is implemented by the platform team. Visual-editor owns prompts, schemas,
response parsing, repairs, and layout changes. The parent forwards prepared
Responses API requests and raw response bytes.

## Enablement and ownership

Supply this value in the existing `getTemplateMetadata` payload:

```ts
aiPageGeneration?: {
  enabled: boolean;
  model: string;
};
```

Generation is available only in the layout editor with `enabled: true`. Missing
configuration disables it. A missing/empty model produces a configuration error
when generation is attempted, without a model request. Template metadata `locales`
is the authoritative list of supported content locales.

The platform chooses the model and must honor the requested identifier or reject
it, without silent substitution. The platform owns authentication, authorization,
business/account context, upstream routing, and attaching upstream correlation
identifiers. No correlation identifier is supplied or required by the iframe
protocol. The parent may associate its correlation identifier with `requestId` in
its own logs; it need not return it.

## Messages

Use native `window.postMessage` with these envelopes. Send objects through
structured cloning, without JSON-stringifying envelopes or base64-encoding bytes.

```ts
type ModelRequestBody = {
  model: string;
  stream: true;
  max_output_tokens: number;
  instructions: string;
  input: Array<{ role: "user" | "assistant"; content: string }>;
  text: {
    format: {
      type: "json_schema";
      name: string;
      strict: true;
      schema: Record<string, unknown>;
    };
  };
};

// Editor → parent
type GenerationRequest = {
  type: "aiPageGenerationRequest";
  payload: { requestId: string; body: ModelRequestBody };
};

// Editor → parent
type GenerationCancel = {
  type: "aiPageGenerationCancel";
  payload: { requestId: string };
};

// Parent → editor
type GenerationResponse = {
  type: "aiPageGenerationResponse";
  payload:
    | { requestId: string; event: "start"; contentType: string }
    | { requestId: string; event: "chunk"; chunk: Uint8Array }
    | { requestId: string; event: "end" }
    | {
        requestId: string;
        event: "error";
        message: string;
        transport: boolean;
        status?: number;
      };
};
```

## Lifecycle

1. Editor generates a unique `requestId` per model call, including repair calls.
2. Parent validates the originating iframe and model, attaches its upstream
   headers, and forwards the supplied body without changing its contents.
3. For a successful HTTP response, parent sends exactly one `start` containing
   the upstream content type, then ordered `chunk` messages with the raw body bytes.
4. At body EOF, parent sends exactly one `end`.
5. On configuration, HTTP, network, or read failure, parent sends a terminal
   `error` instead of `end`. HTTP errors may occur before `start`; read errors may
   occur after chunks.

Requests may interleave; ordering must be preserved within each request. Support
at least two simultaneous requests. Duplicate active identifiers must not start
duplicate upstream calls. Identifiers are scoped to their originating iframe.
There are no sequence numbers, acknowledgments, negotiation, or automatic replay.

The parent must not parse or translate provider stream events. Chunk boundaries
may split UTF-8 characters, SSE lines, or events. Visual-editor incrementally
decodes and parses them. Usage, refusals, incomplete output, and provider errors
remain in the provider response. SSE transport `end` alone is not success: the
provider completion event and generated output must validate. JSON response
fallbacks are accumulated and validated at EOF.

## Cancellation and timeout

Maintain an upstream abort controller per request. Cancel aborts that request and
releases its stream reader; repeated cancellation and unknown/completed identifiers
are ignored. No acknowledgment is required. Suppress responses after cancellation.
The editor immediately stops processing the call and ignores late events.

The editor enforces a five-minute deadline per model attempt and sends cancel on
timeout. No separate connection or idle timeout is introduced. Transport failures
are not automatically retried. Already applied sections remain after cancellation.

## Errors

| Failure                                    | `transport` |
| ------------------------------------------ | ----------- |
| Network or response-body read failure      | `true`      |
| HTTP 408, 429, or 5xx                      | `true`      |
| Other HTTP failure                         | `false`     |
| Invalid configuration or unsupported model | `false`     |

Include `status` for HTTP errors. Error messages must not contain credentials.
Malformed or prematurely terminated streams are classified as transport failures
by the editor. Provider failures and invalid generated output use the editor's
existing generation/repair handling.

## Origin and window validation

Parent accepts requests only from the intended iframe window and its expected
origin, then sends responses to that iframe with an explicit target origin.
Editor accepts responses only from `window.parent` at an allowed platform origin.
Both sides validate message shapes and ignore unrelated messages and
unknown/completed request identifiers. A malformed response for a known active
request fails that request as a transport error.

## Example exchange and fixtures

```text
Editor → Parent: aiPageGenerationRequest(requestId=A, body)
Parent: attach correlation identifier and initiate upstream call
Parent → Editor: aiPageGenerationResponse(A, start, text/event-stream)
Parent → Editor: aiPageGenerationResponse(A, chunk, Uint8Array)
Parent → Editor: aiPageGenerationResponse(A, chunk, Uint8Array)
Parent → Editor: aiPageGenerationResponse(A, end)
```

Cancellation:

```text
Editor → Parent: aiPageGenerationCancel(requestId=A)
Parent: abort upstream A and release its resources
```

Synthetic, typed request and Responses API completion fixtures live in
[`iframeFixtures.ts`](../internal/generation/testing/iframeFixtures.ts).
The executable parent-window harness is in
[`iframeTransport.test.ts`](../internal/generation/iframeTransport.test.ts).
It exercises interleaving, origin/source validation, cancellation, errors, and
one-byte chunks splitting both UTF-8 and SSE boundaries. Its engine integration
case verifies equivalent results through the iframe and local HTTP adapters.

Before enabling the metadata flag in platform, validate the handler against those
fixtures, including HTTP failure classification, cancellation, and concurrent calls.

## Streaming full-page creation

The editor reveals complete root sections and complete children of `MainContent`
from the same model request. Each candidate passes the existing generation
contracts, localization and card checks, off-canvas resolution, and authored-data
preservation checks before it is displayed. Unsupported incremental scaffold
shapes wait for their enclosing component. JSON response fallbacks remain buffered.
No unfinished component props reach the renderer.

Creation locks layout mutations while permitting scrolling and cancellation.
Reveals keep component identities and do not create history entries or save drafts.
On successful completion, cancellation, or failure, the editor records the retained
page as one undo step and saves through the normal platform path. Failure after a
reveal retains validated sections and reports an incomplete page; it does not retry
the whole generation automatically. Before any reveal, one validation repair is
still permitted. Final page acceptance requires the complete provider response and
all page-wide requirements, including prepared card collections.

Reloading or changing editor context during generation discards the unsaved
attempt. Late results cannot apply or save into another layout. The parent must
forward response chunks promptly rather than buffer them until `end`.

Run `pnpm --dir packages/visual-editor run test:creation:browser` for focused
Chromium integration checks. This suite does not use Docker or screenshot baselines.
