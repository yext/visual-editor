import { expect, it, vi } from "vitest";
import type { Content } from "../../shared/authoredValues.ts";
import type {
  GenerationEnvironment,
  GenerationRequestExecutor,
} from "../../shared/contracts.ts";
import { GenerationError } from "../../shared/generationErrors.ts";
import { heading } from "../../testing/creationFixtures.ts";
import { executeGeneration } from "../../transport/executeGeneration.ts";
import { runRegeneration } from "./runRegeneration.ts";
import {
  regenerationLayout,
  regenerationResponse,
  regenerationSessionFixture,
  bodySections,
} from "../../testing/regenerationFixtures.ts";

const event = (value: unknown) =>
  new TextEncoder().encode(`data: ${JSON.stringify(value)}\n\n`);

it("streams removal before request completion, includes full model context and does not replay steps", async () => {
  const current = regenerationSessionFixture();
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stream = controller;
    },
  });
  const transport = vi.fn<GenerationEnvironment["transport"]>(async () => ({
    contentType: "text/event-stream",
    body,
  }));
  const environment: GenerationEnvironment = {
    model: "test",
    catalog: current.catalog,
    locales: ["en"],
    transport,
    diagnostics: { log: vi.fn(), report: vi.fn() },
  };
  const controller = new AbortController();
  const prepareSection = vi.fn(
    async (_sectionId: string, _signal: AbortSignal) => {}
  );
  const request: GenerationRequestExecutor = (
    payload,
    signal = controller.signal,
    onContent,
    onStep,
    onSection
  ) =>
    executeGeneration(
      payload,
      environment,
      signal,
      "test",
      onContent,
      onStep,
      onSection
    );
  const pending = runRegeneration({
    layoutId: "layout",
    currentData: regenerationLayout() as Content,
    messages: [{ role: "user", content: "Focus on the product" }],
    signal: controller.signal,
    active: () => !controller.signal.aborted,
    request,
    canvas: {
      prepareRegenerationSection: prepareSection,
      beginRegeneration: () => {},
      applyRegeneration: (...args) => current.session.apply(...args),
      finishRegeneration: () => current.session.finish(),
    },
    onProgress: vi.fn(),
  });
  const wire = JSON.stringify(
    regenerationResponse([
      { kind: "remove", sectionId: "services" },
      {
        kind: "replace",
        sectionId: "testimonials",
        sections: [heading("Updated testimonials")],
      },
    ])
  );
  const boundary = wire.indexOf(',{"kind":"replace"');
  const contentBoundary = wire.indexOf(',"sections":', boundary);
  stream.enqueue(
    event({
      type: "response.output_text.delta",
      delta: wire.slice(0, boundary),
    })
  );
  await vi.waitFor(() => expect(current.preview).toHaveBeenCalledOnce());
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
  stream.enqueue(
    event({
      type: "response.output_text.delta",
      delta: wire.slice(boundary, contentBoundary),
    })
  );
  await vi.waitFor(() =>
    expect(prepareSection).toHaveBeenCalledExactlyOnceWith(
      "testimonials",
      controller.signal
    )
  );
  expect(current.preview).toHaveBeenCalledOnce();
  stream.enqueue(
    event({
      type: "response.output_text.delta",
      delta: wire.slice(contentBoundary),
    })
  );
  stream.enqueue(
    event({
      type: "response.completed",
      response: { status: "completed", output_text: wire },
    })
  );
  stream.close();
  expect(await pending).toEqual({
    text: "Page regenerated.",
    clarification: false,
  });
  expect(current.preview).toHaveBeenCalledTimes(2);
  expect(current.commit).toHaveBeenCalledOnce();
  const sent = transport.mock.calls[0][0];
  const context = JSON.parse(sent.input.at(-1)!.content);
  expect(context.request).toBe("Focus on the product");
  expect(
    bodySections(context.context.layout).map((item) => item.props.id)
  ).toEqual(["hero", "services", "testimonials"]);
  expect(context.context.layout.content[0]).not.toHaveProperty("readOnly");
  expect(context.context.inventory.collections).toHaveLength(2);
  expect(sent.text.format.schema).toHaveProperty("properties");
});

it("repairs before application but never retries after streamed steps", async () => {
  const run = async (streamed: boolean) => {
    const controller = new AbortController();
    const request = vi
      .fn<GenerationRequestExecutor>()
      .mockImplementationOnce(async (_payload, _signal, _content, onStep) => {
        if (streamed)
          await onStep!({ kind: "remove", sectionId: "services" }, 0);
        throw new GenerationError("Invalid output", true);
      })
      .mockResolvedValueOnce({
        type: "regenerated",
        text: "Fixed",
        result: { action: "regenerate", steps: [] },
      });
    const finishRegeneration = vi.fn();
    const pending = runRegeneration({
      layoutId: "layout",
      currentData: regenerationLayout() as Content,
      messages: [{ role: "user", content: "Product page" }],
      signal: controller.signal,
      active: () => true,
      request,
      canvas: {
        beginRegeneration: vi.fn(),
        applyRegeneration: vi.fn(),
        finishRegeneration,
      },
      onProgress: vi.fn(),
    });
    if (streamed)
      await expect(pending).rejects.toMatchObject({ retryable: false });
    else expect(await pending).toEqual({ text: "Fixed", clarification: false });
    expect(request).toHaveBeenCalledTimes(streamed ? 1 : 2);
    expect(finishRegeneration).toHaveBeenCalledOnce();
  };
  await run(false);
  await run(true);
});
