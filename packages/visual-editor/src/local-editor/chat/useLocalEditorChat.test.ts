import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Data } from "@puckeditor/core";
import type {
  SectionEditPlan,
  SectionEditTask,
} from "../../internal/generation/editProtocol.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../../internal/generation/editMaterializer.ts";
import { createPuckGenerationCatalog } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";
import { useLocalEditorChat } from "./useLocalEditorChat.ts";
import { chatConfig, layout } from "./chatTestUtils.tsx";

const task = (taskId: string, dependsOn: string[] = []): SectionEditTask => ({
  taskId,
  sectionId: taskId,
  targetComponentIds: [taskId],
  instructions: "Change heading",
  structuralOperations: [],
  dependsOn,
  generateContent: true,
});
const plan = (tasks = [task("heading")]): SectionEditPlan => ({
  intent: "content",
  text: "Updating headings.",
  clarification: null,
  globalStyleGuidance: null,
  sharedIntent: "Use welcoming copy",
  tasks,
});
const usage = { cachedInput: 1, uncachedInput: 2, output: 3 };
const response = (event: unknown) =>
  new Response(
    [JSON.stringify({ type: "usage", usage }), JSON.stringify(event)].join(
      "\n"
    ),
    { headers: { "X-Visual-Editor-Generation": "section-edits-v1" } }
  );
const section = (id: string, value = "Updated") =>
  response({
    type: "section-result",
    result: {
      taskId: id,
      sectionId: id,
      operations: [
        {
          kind: "update",
          componentId: id,
          changes: [{ kind: "set", path: "/text", value }],
        },
      ],
    },
  });
const setup = (
  resolve: (candidate: Data) => Promise<Data> = async (candidate) => candidate
) => {
  let data = layout();
  const catalog = createPuckGenerationCatalog(chatConfig.components);
  const hook = renderHook(() => useLocalEditorChat("/generate", "layout"));
  const commit = vi.fn((next: Data) => {
    data = next;
  });
  act(() => {
    hook.result.current.canvas.attach({
      read: () => data,
      readSelection: () => "heading",
      resolve,
      validate: () => {},
      commit,
      materializeSection: (baseline, task, result) =>
        materializeSectionEdit(catalog, baseline, task, result),
      preserveSectionResolution: (resolved, candidate) =>
        preserveSectionEditResolution(catalog, resolved, candidate),
    });
  });
  return {
    ...hook,
    commit,
    data: () => data,
  };
};
afterEach(() => vi.unstubAllGlobals());

it("plans with selection and sends latest committed data to dependent sections", async () => {
  const current = setup();
  const data = current.data();
  (data.content[0].props as any).content.push({
    type: "Heading",
    props: { id: "second", text: "Second" },
  });
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(init!.body as string);
    return body.mode === "plan"
      ? response({
          type: "planned",
          plan: plan([task("heading"), task("second", ["heading"])]),
        })
      : section(body.task.taskId);
  });
  vi.stubGlobal("fetch", fetchMock);
  await act(async () => {
    await current.result.current.send("Welcome visitors");
  });
  const bodies = fetchMock.mock.calls.map(([, init]) =>
    JSON.parse(init!.body as string)
  );
  expect(bodies[0]).toMatchObject({
    mode: "plan",
    selectedComponentId: "heading",
  });
  expect(bodies[2].currentData.content[0].props.content[0].props.text).toBe(
    "Updated"
  );
  expect(current.commit).toHaveBeenCalledTimes(2);
  expect(
    current.result.current.messages
      .at(-1)
      ?.sections?.map((section) => section.status)
  ).toEqual(["applied", "applied"]);
  expect(current.result.current.usage).toEqual({
    cachedInput: 3,
    uncachedInput: 6,
    output: 9,
  });
});

it("retries planning and section output once and aggregates every attempt", async () => {
  const current = setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      response({
        type: "error",
        error: "Invalid plan",
        retryable: true,
        validationFeedback: "Fix plan",
      })
    )
    .mockResolvedValueOnce(response({ type: "planned", plan: plan() }))
    .mockResolvedValueOnce(
      response({
        type: "error",
        error: "Invalid copy",
        retryable: true,
        validationFeedback: "Fix copy",
      })
    )
    .mockResolvedValueOnce(section("heading"));
  vi.stubGlobal("fetch", fetchMock);
  await act(async () => {
    await current.result.current.send("Update");
  });
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).validationFeedback).toBe(
    "Fix plan"
  );
  expect(JSON.parse(fetchMock.mock.calls[3][1].body).validationFeedback).toBe(
    "Fix copy"
  );
  expect(current.result.current.usage.output).toBe(12);
  expect(current.commit).toHaveBeenCalledOnce();
});

it.each(["clarification", "globalStyle", "conversation"] as const)(
  "completes a %s plan without section generation",
  async (intent) => {
    const current = setup();
    const noEdits = {
      ...plan([]),
      intent,
      text: "Response",
      clarification: intent === "clarification" ? "Which heading?" : null,
      globalStyleGuidance:
        intent === "globalStyle" ? "Use the global style editor." : null,
    };
    const fetchMock = vi.fn(async () =>
      response({ type: "planned", plan: noEdits })
    );
    vi.stubGlobal("fetch", fetchMock);
    await act(async () => {
      await current.result.current.send("Help");
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(current.commit).not.toHaveBeenCalled();
    expect(current.result.current.messages.at(-1)?.text).toContain("Response");
  }
);

it("retains applied work and actual history on cancellation, ignoring late responses", async () => {
  const current = setup();
  (current.data().content[0].props as any).content.push({
    type: "Heading",
    props: { id: "second", text: "Second" },
  });
  let late!: (value: Response) => void;
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(init!.body as string);
    if (body.mode === "plan") {
      return response({
        type: "planned",
        plan: plan([task("heading"), task("second")]),
      });
    }
    if (body.task.taskId === "second") {
      return new Promise<Response>((resolve) => {
        late = resolve;
      });
    }
    return section("heading");
  });
  vi.stubGlobal("fetch", fetchMock);
  let pending!: Promise<void>;
  act(() => {
    pending = current.result.current.send("Update both");
  });
  await waitFor(() => expect(current.commit).toHaveBeenCalledOnce());
  act(() => current.result.current.cancel());
  expect(
    current.result.current.messages
      .at(-1)
      ?.sections?.map((section) => section.status)
  ).toEqual(["applied", "cancelled"]);
  expect(current.result.current.messages.at(-1)?.text).toContain(
    "Section changes: 1 applied, 1 cancelled."
  );
  await act(async () => {
    late(section("second", "Late"));
    await pending;
  });
  expect(current.commit).toHaveBeenCalledOnce();
  fetchMock.mockImplementation(async () =>
    response({
      type: "planned",
      plan: { ...plan([]), intent: "conversation", text: "Done" },
    })
  );
  await act(async () => {
    await current.result.current.send("What changed?");
  });
  const last = JSON.parse(fetchMock.mock.calls.at(-1)![1]!.body as string);
  expect(last.messages[1].content).toContain("Section 2: cancelled");
  expect(last.currentData.content[0].props.content[0].props.text).toBe(
    "Updated"
  );
  expect(current.result.current.usage.output).toBe(9);
});

it("keeps an earlier application after a later resolver fails twice", async () => {
  const current = setup(async (next) => {
    if ((next.content[0].props as any).content[1].props.text === "Updated") {
      throw new Error("Resolver failed");
    }
    return next;
  });
  (current.data().content[0].props as any).content.push({
    type: "Heading",
    props: { id: "second", text: "Second" },
  });
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(init!.body as string);
    return body.mode === "plan"
      ? response({
          type: "planned",
          plan: plan([task("heading"), task("second", ["heading"])]),
        })
      : section(body.task.taskId);
  });
  vi.stubGlobal("fetch", fetchMock);
  await act(async () => {
    await current.result.current.send("Update both");
  });
  expect(
    current.result.current.messages
      .at(-1)
      ?.sections?.map((section) => section.status)
  ).toEqual(["applied", "failed"]);
  expect(
    (current.data().content[0].props as any).content.map(
      (item: any) => item.props.text
    )
  ).toEqual(["Updated", "Second"]);
  expect(fetchMock).toHaveBeenCalledTimes(4);
});

vi.mock("./chatDiagnostics.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./chatDiagnostics.ts")>()),
  reportChatDiagnostic: vi.fn(),
}));
