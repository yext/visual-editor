import { testPrompts } from "../internal/layoutGeneration/testing/promptFixtures.ts";
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
    generationSettings: {
      attemptTimeoutMs: 60_000,
      maxOutputTokens: { page: 777, prepare: 111, plan: 222, section: 333 },
    },
    prompts: {
      ...testPrompts,
      prompts: {
        prepare: "ALPHA preparation",
        create: "ALPHA creation\n" + testPrompts.prompts.create,
        fullPageUpdate:
          "ALPHA fullPageUpdate\n" + testPrompts.prompts.fullPageUpdate,
        plan: "ALPHA planning",
        section: "ALPHA section execution",
      },
    },
    locales: ["en", "fr"],
    entity: {
      fields: {
        fields: [
          {
            name: "c_description",
            displayName: "Description",
            definition: { name: "c_description", typeName: "string", type: {} },
          },
          {
            name: "c_empty",
            definition: { name: "c_empty", typeName: "string", type: {} },
          },
          {
            name: "address",
            definition: { name: "address", typeName: "address", type: {} },
            children: {
              fields: [
                {
                  name: "city",
                  definition: { name: "city", typeName: "string", type: {} },
                },
              ],
            },
          },
          {
            name: "c_services",
            definition: {
              name: "c_services",
              typeName: "string",
              type: {},
              isList: true,
            },
          },
          {
            name: "c_team",
            definition: { name: "c_team", type: {}, isList: true },
            children: {
              fields: [
                {
                  name: "name",
                  definition: { name: "name", typeName: "string", type: {} },
                },
              ],
            },
          },
        ],
        displayNames: { "address.city": "City", c_empty: "Empty field" },
      },
      streamDocument: {
        locale: "fr",
        c_description: "Description locale",
        address: { city: "Paris", unused: "Exclude" },
        c_services: ["Delivery", "Collection"],
        c_team: [{ name: "Alex", unused: "Exclude" }, { name: "Sam" }],
        __: { layout: "Exclude", theme: "Exclude" },
        _pageset: "Exclude",
        unused: "Exclude",
      },
    },
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
        { ...edit, mode: "fullPageUpdate" },
        {
          translationMode: "defaultOnly",
          result: { action: "fullPageUpdate", steps: [] },
          text: "No changes",
        }
      )
    ).type
  ).toBe("fullPageUpdated");
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
  expect(requests).toHaveLength(7);
  const instructionPrefixes = [
    "ALPHA preparation",
    "ALPHA creation",
    "ALPHA fullPageUpdate",
    "ALPHA planning",
    "ALPHA section execution",
    "ALPHA section execution",
    "ALPHA section execution",
  ];
  const expectedBudgets = [111, 777, 777, 222, 333, 333, 333];
  requests.forEach((request, index) => {
    const context = JSON.parse(
      request.payload.body.input.at(-1).content
    ).context;
    expect(context.entity).toEqual({
      fields: {
        fields: [
          { name: "c_description", definition: { typeName: "string" } },
          { name: "c_empty", definition: { typeName: "string" } },
          {
            name: "address",
            definition: { typeName: "address" },
            children: {
              fields: [{ name: "city", definition: { typeName: "string" } }],
            },
          },
          {
            name: "c_services",
            definition: { typeName: "string", isList: true },
          },
          {
            name: "c_team",
            definition: { isList: true },
            children: {
              fields: [{ name: "name", definition: { typeName: "string" } }],
            },
          },
        ],
        displayNames: {
          c_description: "Description",
          "address.city": "City",
          c_empty: "Empty field",
        },
      },
      listSources: {},
      previewSample: {
        locale: "fr",
        values: {
          c_description: "Description locale",
          address: { city: "Paris" },
          c_services: ["Delivery", "Collection"],
          c_team: [{ name: "Alex" }, { name: "Sam" }],
        },
      },
    });
    expect(context.locales).toEqual(["en", "fr"]);
    expect(request.payload.body.max_output_tokens).toBe(expectedBudgets[index]);
    expect(
      request.payload.body.instructions.startsWith(instructionPrefixes[index])
    ).toBe(true);
    expect(request.payload.body.instructions).not.toMatch(
      /\{\{(?:componentNames|locales|componentDescriptions|recommendedSections|listGuidance)\}\}/
    );
  });
  expect(
    new Set(requests.map((request) => request.payload.requestId)).size
  ).toBe(7);
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
