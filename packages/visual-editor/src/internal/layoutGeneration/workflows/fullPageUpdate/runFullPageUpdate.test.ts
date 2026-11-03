import {
  testPrompts,
  testGenerationSettings,
} from "../../testing/promptFixtures.ts";
import { expect, it, vi } from "vitest";
import type { Content } from "../../shared/authoredValues.ts";
import type {
  GenerationEnvironment,
  GenerationRequestExecutor,
} from "../../shared/contracts.ts";
import { GenerationError } from "../../shared/generationErrors.ts";
import { heading } from "../../testing/creationFixtures.ts";
import { executeGeneration } from "../../transport/executeGeneration.ts";
import { runFullPageUpdate } from "./runFullPageUpdate.ts";
import {
  fullPageUpdateLayout,
  fullPageUpdateResponse,
  fullPageUpdateSessionFixture,
  bodySections,
} from "../../testing/fullPageUpdateFixtures.ts";

const event = (value: unknown) =>
  new TextEncoder().encode(`data: ${JSON.stringify(value)}\n\n`);

it("streams removal before request completion, includes full model context and does not replay steps", async () => {
  const current = fullPageUpdateSessionFixture();
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
    prompts: testPrompts,
    generationSettings: testGenerationSettings,
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
  const pending = runFullPageUpdate({
    layoutId: "layout",
    currentData: fullPageUpdateLayout() as Content,
    messages: [{ role: "user", content: "Focus on the product" }],
    signal: controller.signal,
    active: () => !controller.signal.aborted,
    request,
    canvas: {
      prepareFullPageUpdateSection: prepareSection,
      beginFullPageUpdate: () => {},
      applyFullPageUpdate: (...args) => current.session.apply(...args),
      finishFullPageUpdate: () => current.session.finish(),
    },
    onProgress: vi.fn(),
  });
  const wire = JSON.stringify(
    fullPageUpdateResponse([
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
    text: "Page updated.",
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
        type: "fullPageUpdated",
        text: "Fixed",
        result: { action: "fullPageUpdate", steps: [] },
      });
    const finishFullPageUpdate = vi.fn();
    const pending = runFullPageUpdate({
      layoutId: "layout",
      currentData: fullPageUpdateLayout() as Content,
      messages: [{ role: "user", content: "Product page" }],
      signal: controller.signal,
      active: () => true,
      request,
      canvas: {
        beginFullPageUpdate: vi.fn(),
        applyFullPageUpdate: vi.fn(),
        finishFullPageUpdate,
      },
      onProgress: vi.fn(),
    });
    if (streamed)
      await expect(pending).rejects.toMatchObject({ retryable: false });
    else expect(await pending).toEqual({ text: "Fixed", clarification: false });
    expect(request).toHaveBeenCalledTimes(streamed ? 1 : 2);
    expect(finishFullPageUpdate).toHaveBeenCalledOnce();
  };
  await run(false);
  await run(true);
});
