import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Data } from "@puckeditor/core";
import { testGenerationEnvironment } from "./generationTestEnvironment.ts";
import type { SectionEditPlan, SectionEditTask } from "../editProtocol.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../editMaterializer.ts";
import { createPuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";
import { chatConfig, generatedContent, layout } from "./chatTestUtils.tsx";

vi.mock("../engine.ts", async () => ({
  executeGeneration: (await import("./generationTestClient.ts"))
    .mockGenerationRequest,
}));
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
  limitations: null,
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
  resolve: (candidate: Data) => Promise<Data> = async (candidate) => candidate,
  blank = false
) => {
  let data = layout();
  if (blank) data.content = [];
  const catalog = createPuckGenerationCatalog(chatConfig.components);
  const hook = renderHook(() =>
    useLayoutGenerationChat(testGenerationEnvironment("/generate"), "layout")
  );
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

it("asks the translation question after preparation without generating or committing a page", async () => {
  const current = setup(undefined, true);
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
    response({
      type: "prepared",
      preparation: {
        question: "Would you like Spanish translations?",
        translationMode: null,
        cardCounts: [],
      },
    })
  );
  vi.stubGlobal("fetch", fetchMock);
  await act(async () => {
    await current.result.current.send(
      "Create a page with three cards per section"
    );
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string).mode).toBe(
    "prepare"
  );
  expect(current.commit).not.toHaveBeenCalled();
  expect(current.result.current.messages.at(-1)?.text).toBe(
    "Would you like Spanish translations?"
  );
});

it.each([
  { answer: "Yes, translate it", translationMode: "translate" },
  { answer: "No, keep fallback text only", translationMode: "defaultOnly" },
])(
  "carries the original card requirements into generation after answering: $answer",
  async ({ answer, translationMode }) => {
    const current = setup(undefined, true);
    const prompt = "Create a page with three cards per section";
    const question = "Would you like Spanish translations?";
    const preparation = {
      question: null,
      translationMode,
      cardCounts: [{ componentType: "Cards", instanceIndex: null, count: 3 }],
    };
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init!.body as string);
      if (body.mode === "prepare") {
        return response({
          type: "prepared",
          preparation:
            body.messages.length === 1
              ? { ...preparation, question, translationMode: null }
              : preparation,
        });
      }
      return new Response(
        JSON.stringify({
          type: "accepted",
          text: "Created",
          spec: generatedContent("Created"),
        }) + "\n",
        {
          headers: { "X-Visual-Editor-Generation": "strict-puck-overrides-v2" },
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    await act(async () => {
      await current.result.current.send(prompt);
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(current.commit).not.toHaveBeenCalled();
    expect(current.result.current.messages.at(-1)?.text).toBe(question);
    await act(async () => {
      await current.result.current.send(answer);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const bodies = fetchMock.mock.calls.map(([, init]) =>
      JSON.parse(init!.body as string)
    );
    expect(bodies.map((body) => body.mode)).toEqual([
      "prepare",
      "prepare",
      "create",
    ]);
    const messages = [
      { role: "user", content: prompt },
      { role: "assistant", content: question },
      { role: "user", content: answer },
    ];
    expect(bodies[1].messages).toEqual(messages);
    expect(bodies[2]).toMatchObject({ mode: "create", preparation, messages });
    expect(current.commit).toHaveBeenCalledOnce();
    expect(current.data().content).toEqual(generatedContent("Created").content);
  }
);

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
    expect(current.result.current.messages.at(-1)?.text).toBe(
      intent === "clarification"
        ? "Which heading?"
        : intent === "globalStyle"
          ? "Response\n\nUse the global style editor."
          : "Response"
    );
  }
);

it.each([false, true])(
  "retains batch limitations with actual outcomes and in history (failure %s)",
  async (fail) => {
    const current = setup(async (candidate) => {
      if (fail) throw new Error("Resolver failed");
      return candidate;
    });
    const limitations =
      "I cannot change the card grid; that setting is unavailable.";
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init!.body as string);
      return body.mode === "plan"
        ? response({
            type: "planned",
            plan: { ...plan(), text: "Everything was updated.", limitations },
          })
        : section("heading");
    });
    vi.stubGlobal("fetch", fetchMock);
    await act(async () => {
      await current.result.current.send("Update the heading and card grid");
    });
    const final = current.result.current.messages.at(-1)!;
    expect(final.text).toBe(
      `Section changes: 1 ${fail ? "failed" : "applied"}.\n\n${limitations}`
    );
    expect(final.text).not.toContain("Everything was updated");
    expect(final.sections?.[0].status).toBe(fail ? "failed" : "applied");
    fetchMock.mockImplementation(async () =>
      response({
        type: "planned",
        plan: { ...plan([]), intent: "conversation", text: "Done" },
      })
    );
    await act(async () => {
      await current.result.current.send("What could not change?");
    });
    const next = JSON.parse(fetchMock.mock.calls.at(-1)![1]!.body as string);
    expect(next.messages[1].content).toContain(limitations);
    expect(next.messages[1].content).not.toContain("Everything was updated");
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
        plan: {
          ...plan([task("heading"), task("second")]),
          limitations: "Moving cards between sections is unavailable.",
        },
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
  expect(last.messages[1].content).toContain(
    "Moving cards between sections is unavailable."
  );
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

vi.mock(
  "../../../local-editor/generationDiagnostics.ts",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../local-editor/generationDiagnostics.ts")
    >()),
    reportChatDiagnostic: vi.fn(),
  })
);
