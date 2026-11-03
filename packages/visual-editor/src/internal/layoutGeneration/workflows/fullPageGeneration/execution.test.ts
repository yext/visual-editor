import {
  testPrompts,
  testGenerationSettings,
} from "../../testing/promptFixtures.ts";
import { expect, it, vi } from "vitest";
import type { Content } from "../../shared/authoredValues.ts";
import type { GenerationEnvironment } from "../../shared/contracts.ts";
import {
  creation,
  creationCatalog,
  heading,
} from "../../testing/creationFixtures.ts";
import { executeGeneration } from "../../transport/executeGeneration.ts";

const event = (value: object) =>
  new TextEncoder().encode(`data: ${JSON.stringify(value)}\n\n`);
const setup = () => {
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stream = controller;
    },
  });
  const environment: GenerationEnvironment = {
    model: "test",
    prompts: testPrompts,
    generationSettings: testGenerationSettings,
    catalog: creationCatalog(),
    locales: ["en"],
    transport: async () => ({ contentType: "text/event-stream", body }),
    diagnostics: { log: vi.fn(), report: vi.fn() },
  };
  const accepted: Content[] = [];
  const controller = new AbortController();
  const run = (
    onContent = async (content: Content) => {
      accepted.push(content);
    }
  ) =>
    executeGeneration(
      {
        mode: "create",
        layoutId: "layout",
        messages: [{ role: "user", content: "Create a page" }],
        currentData: { content: [] },
      },
      environment,
      controller.signal,
      "test",
      onContent
    );
  return { stream, accepted, run, environment, controller };
};

it("reveals sections before completion, applies backpressure, and validates final identities", async () => {
  const { run, stream, accepted } = setup();
  const pending = run();
  const wire = JSON.stringify(creation());
  const boundary = wire.indexOf(',{"type":"Heading"');
  stream.enqueue(
    event({
      type: "response.output_text.delta",
      delta: wire.slice(0, boundary),
    })
  );
  await vi.waitFor(() => expect(accepted).toHaveLength(1));
  let done = false;
  void pending.then(() => {
    done = true;
  });
  expect(done).toBe(false);
  stream.enqueue(
    event({ type: "response.output_text.delta", delta: wire.slice(boundary) })
  );
  stream.enqueue(
    event({
      type: "response.completed",
      response: { status: "completed", output_text: wire },
    })
  );
  stream.close();
  const result = await pending;
  expect(result.type).toBe("accepted");
  if (result.type === "accepted") {
    expect(result.spec).toEqual(accepted[1]);
  }
});

it("rejects a truncated stream without losing completed section notifications", async () => {
  const { run, stream, accepted } = setup();
  const pending = run();
  const failure = expect(pending).rejects.toMatchObject({
    transport: true,
    retryable: false,
  });
  const wire = JSON.stringify(creation());
  stream.enqueue(
    event({
      type: "response.output_text.delta",
      delta: wire.slice(0, wire.indexOf(',{"type":"Heading"')),
    })
  );
  stream.close();
  await failure;
  expect(accepted).toHaveLength(1);
});

it("rejects complete invalid sections as repairable validation failures", async () => {
  const { run, stream, accepted } = setup();
  const pending = run();
  const failure = expect(pending).rejects.toMatchObject({
    transport: false,
    retryable: true,
  });
  stream.enqueue(
    event({
      type: "response.output_text.delta",
      delta: JSON.stringify(creation([heading("")])),
    })
  );
  await failure;
  expect(accepted).toHaveLength(0);
});

it("waits for canvas acceptance before consuming the next section", async () => {
  const { run, stream } = setup();
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  const onContent = vi.fn(async () => {
    await ready;
  });
  const pending = run(onContent);
  const wire = JSON.stringify(creation());
  stream.enqueue(event({ type: "response.output_text.delta", delta: wire }));
  stream.enqueue(
    event({
      type: "response.completed",
      response: { status: "completed", output_text: wire },
    })
  );
  stream.close();
  await vi.waitFor(() => expect(onContent).toHaveBeenCalledOnce());
  release();
  await pending;
  expect(onContent).toHaveBeenCalledTimes(2);
});

it("preserves buffered JSON fallback without emitting intermediate callbacks", async () => {
  const { run, environment, accepted } = setup();
  const wire = JSON.stringify(creation());
  environment.transport = async () => ({
    contentType: "application/json",
    body: new Response(
      JSON.stringify({ status: "completed", output_text: wire })
    ).body!,
  });
  expect((await run()).type).toBe("accepted");
  expect(accepted).toHaveLength(0);
});
