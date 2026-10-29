import { afterEach, expect, it, vi } from "vitest";
import type {
  GenerationEnvironment,
  LayoutGenerationRequest,
} from "../internal/layoutGeneration/shared/contracts.ts";
import {
  creation,
  creationCatalog,
} from "../internal/layoutGeneration/testing/creationFixtures.ts";
import {
  editGenerationFixture,
  editPlan,
  planningResponse,
  editResponse,
  editTask,
} from "../internal/layoutGeneration/testing/editFixtures.ts";
import { completed } from "../internal/layoutGeneration/testing/modelFixtures.ts";
import { executeGeneration } from "../internal/layoutGeneration/transport/executeGeneration.ts";
import { createLocalMessageTransport } from "../internal/layoutGeneration/transport/messageTransport.ts";
import { installLocalGenerationHost } from "./localGenerationHost.ts";

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("routes preparation, creation, planning, section execution and repair through messages and the host", async () => {
  const send = vi.spyOn(window, "postMessage").mockImplementation((data) => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data,
        source: window,
        origin: window.location.origin,
      })
    );
  });
  dispose = installLocalGenerationHost("/generate");
  const fetchMock = vi.fn(async (_url: unknown, _options?: RequestInit) =>
    completed({})
  );
  vi.stubGlobal("fetch", fetchMock);
  const environment: GenerationEnvironment = {
    model: "test",
    locales: ["en", "fr"],
    catalog: creationCatalog(),
    transport: createLocalMessageTransport(),
    diagnostics: { log: vi.fn(), report: vi.fn() },
  };
  const run = (request: LayoutGenerationRequest, output: unknown) => {
    fetchMock.mockImplementation(async () =>
      completed(
        request.mode === "plan"
          ? planningResponse(output, environment.catalog, request.currentData!)
          : output
      )
    );
    return executeGeneration(
      request,
      environment,
      new AbortController().signal,
      "local-diagnostic"
    );
  };
  const base = {
    layoutId: "layout",
    messages: [{ role: "user" as const, content: "Update page" }],
    currentData: { content: [] },
  };
  const preparation = {
    question: null,
    translationMode: "defaultOnly",
    cardCounts: [],
  };
  expect((await run({ ...base, mode: "prepare" }, preparation)).type).toBe(
    "prepared"
  );
  expect((await run({ ...base, mode: "create" }, creation())).type).toBe(
    "accepted"
  );
  const fixture = editGenerationFixture();
  environment.catalog = fixture.catalog;
  const edit = { ...base, currentData: fixture.data };
  expect(
    (
      await run(
        { ...edit, mode: "plan", selectedComponentId: null },
        editPlan()
      )
    ).type
  ).toBe("planned");
  const section: LayoutGenerationRequest = {
    ...edit,
    mode: "section",
    task: editTask(),
    sharedIntent: "Update copy",
  };
  expect((await run(section, editResponse())).type).toBe("section-result");
  let feedback = "";
  try {
    await run(section, editResponse(editTask(), "/unknown", "Invalid"));
    expect.fail("Invalid section must require repair");
  } catch (error) {
    expect(error).toMatchObject({ retryable: true, transport: false });
    feedback = (error as { feedback: string }).feedback;
  }
  expect(feedback).toBeTruthy();
  expect(
    (await run({ ...section, validationFeedback: feedback }, editResponse()))
      .type
  ).toBe("section-result");
  const requests = send.mock.calls
    .map(([message]) => message)
    .filter((message) => message.type === "aiPageGenerationRequest");
  expect(requests).toHaveLength(6);
  expect(
    new Set(requests.map((request) => request.payload.requestId)).size
  ).toBe(6);
  fetchMock.mock.calls.forEach(([url, options], index) => {
    expect(url).toBe("/generate");
    expect(JSON.parse(options!.body as string)).toEqual(
      requests[index].payload.body
    );
    expect(options!.headers).toMatchObject({
      "X-Visual-Editor-Correlation-Id": requests[index].payload.requestId,
    });
    expect(Object.keys(requests[index].payload).sort()).toEqual([
      "body",
      "requestId",
    ]);
  });
});
