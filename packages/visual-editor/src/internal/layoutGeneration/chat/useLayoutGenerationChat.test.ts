import type { Data } from "@puckeditor/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../workflows/edits/applyEditsToLayout.ts";
import type {
  SectionEditPlan,
  SectionEditTask,
} from "../workflows/edits/types.ts";
import type { GenerationResult } from "../shared/contracts.ts";
import { GenerationError } from "../shared/generationErrors.ts";
import {
  chatConfig,
  generatedContent,
  layout,
} from "../testing/chatFixtures.tsx";
import {
  stubGenerationExecutor,
  testGenerationEnvironment,
  type ExecutorReply,
} from "../testing/executorFixtures.ts";
import { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

vi.mock("../transport/executeGeneration.ts", () => ({
  executeGeneration: vi.fn(),
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
const section = (id: string, value = "Updated"): GenerationResult =>
  ({
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
  }) satisfies GenerationResult;
const setup = (
  resolve: (candidate: Data) => Promise<Data> = async (candidate) => candidate,
  blank = false
) => {
  let data = layout();
  if (blank) {
    data.content = [];
  }
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

it.each(["created", "clarification", "failure"] as const)(
  "returns intent completion after blank-page generation: %s",
  async (outcome) => {
    const current = setup(async (candidate) => {
      if (outcome === "failure") throw new Error("Resolver failed");
      return candidate;
    }, true);
    const executeMock = vi.fn(async (body: any): Promise<ExecutorReply> => {
      if (body.mode === "prepare") {
        const question =
          body.messages.at(-1).content === "Earlier request" ||
          outcome === "clarification"
            ? "Which page?"
            : null;
        return {
          type: "prepared",
          preparation: {
            question,
            translationMode: question ? null : "defaultOnly",
            cardCounts: [],
          },
        };
      }
      return {
        type: "accepted",
        text: "Created",
        spec: generatedContent("Created"),
      };
    });
    stubGenerationExecutor(executeMock);
    await act(async () => {
      await current.result.current.send("Earlier request");
    });
    await act(async () => {
      expect(await current.result.current.generateIntent("Intent page")).toBe(
        outcome === "clarification" ? "clarification" : outcome === "created"
      );
    });
    expect(current.commit).toHaveBeenCalledTimes(outcome === "created" ? 1 : 0);
    expect(executeMock).toHaveBeenCalledTimes(
      outcome === "clarification" ? 2 : 3
    );
    for (const [request] of executeMock.mock.calls.slice(1)) {
      expect(request.messages).toEqual([
        { role: "user", content: "Intent page" },
      ]);
      expect(request.layoutId).toBe("layout");
    }
  }
);

it("asks the translation question after preparation without generating or committing a page", async () => {
  const current = setup(undefined, true);
  const executeMock = vi.fn(
    async (_body: any): Promise<ExecutorReply> =>
      ({
        type: "prepared",
        preparation: {
          question: "Would you like Spanish translations?",
          translationMode: null,
          cardCounts: [],
        },
      }) satisfies GenerationResult
  );
  stubGenerationExecutor(executeMock);
  await act(async () => {
    await current.result.current.send(
      "Create a page with three cards per section"
    );
  });
  expect(executeMock).toHaveBeenCalledOnce();
  expect(executeMock.mock.calls[0][0].mode).toBe("prepare");
  expect(current.commit).not.toHaveBeenCalled();
  expect(current.result.current.messages.at(-1)?.text).toBe(
    "Would you like Spanish translations?"
  );
});

it.each([
  { answer: "Yes, translate it", translationMode: "translate" },
  { answer: "No, keep fallback text only", translationMode: "defaultOnly" },
] as const)(
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
    const executeMock = vi.fn(async (body: any): Promise<ExecutorReply> => {
      if (body.mode === "prepare") {
        return {
          type: "prepared",
          preparation:
            body.messages.length === 1
              ? { ...preparation, question, translationMode: null }
              : preparation,
        } satisfies GenerationResult;
      }
      return {
        type: "accepted",
        text: "Created",
        spec: generatedContent("Created"),
      } satisfies GenerationResult;
    });
    stubGenerationExecutor(executeMock);
    await act(async () => {
      await current.result.current.send(prompt);
    });
    expect(executeMock).toHaveBeenCalledOnce();
    expect(current.commit).not.toHaveBeenCalled();
    expect(current.result.current.messages.at(-1)?.text).toBe(question);
    await act(async () => {
      await current.result.current.send(answer);
    });
    expect(executeMock).toHaveBeenCalledTimes(3);
    const bodies = executeMock.mock.calls.map(([body]) => body);
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
  const executeMock = vi.fn(async (body: any): Promise<ExecutorReply> => {
    return body.mode === "plan"
      ? ({
          type: "planned",
          plan: plan([task("heading"), task("second", ["heading"])]),
        } satisfies GenerationResult)
      : section(body.task.taskId);
  });
  stubGenerationExecutor(executeMock);
  await act(async () => {
    await current.result.current.send("Welcome visitors");
  });
  const bodies = executeMock.mock.calls.map(([body]) => body);
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
});

it("retries planning and section output once", async () => {
  const current = setup();
  const executeMock = vi
    .fn()
    .mockResolvedValueOnce(
      new GenerationError("Invalid plan", true, false, "Fix plan")
    )
    .mockResolvedValueOnce({
      type: "planned",
      plan: plan(),
    } satisfies GenerationResult)
    .mockResolvedValueOnce(
      new GenerationError("Invalid copy", true, false, "Fix copy")
    )
    .mockResolvedValueOnce(section("heading"));
  stubGenerationExecutor(executeMock);
  await act(async () => {
    await current.result.current.send("Update");
  });
  expect(executeMock.mock.calls[1][0].validationFeedback).toBe("Fix plan");
  expect(executeMock.mock.calls[3][0].validationFeedback).toBe("Fix copy");
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
    const executeMock = vi.fn(
      async () =>
        ({ type: "planned", plan: noEdits }) satisfies GenerationResult
    );
    stubGenerationExecutor(executeMock);
    await act(async () => {
      await current.result.current.send("Help");
    });
    expect(executeMock).toHaveBeenCalledOnce();
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
      if (fail) {
        throw new Error("Resolver failed");
      }
      return candidate;
    });
    const limitations =
      "I cannot change the card grid; that setting is unavailable.";
    const executeMock = vi.fn(async (body: any): Promise<ExecutorReply> => {
      return body.mode === "plan"
        ? ({
            type: "planned",
            plan: { ...plan(), text: "Everything was updated.", limitations },
          } satisfies GenerationResult)
        : section("heading");
    });
    stubGenerationExecutor(executeMock);
    await act(async () => {
      await current.result.current.send("Update the heading and card grid");
    });
    const final = current.result.current.messages.at(-1)!;
    expect(final.text).toBe(
      `Section changes: 1 ${fail ? "failed" : "applied"}.\n\n${limitations}`
    );
    expect(final.text).not.toContain("Everything was updated");
    expect(final.sections?.[0].status).toBe(fail ? "failed" : "applied");
    executeMock.mockImplementation(
      async () =>
        ({
          type: "planned",
          plan: { ...plan([]), intent: "conversation", text: "Done" },
        }) satisfies GenerationResult
    );
    await act(async () => {
      await current.result.current.send("What could not change?");
    });
    const next = executeMock.mock.calls.at(-1)![0];
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
  let late!: (value: ExecutorReply) => void;
  const executeMock = vi.fn(async (body: any): Promise<ExecutorReply> => {
    if (body.mode === "plan") {
      return {
        type: "planned",
        plan: {
          ...plan([task("heading"), task("second")]),
          limitations: "Moving cards between sections is unavailable.",
        },
      } satisfies GenerationResult;
    }
    if (body.task.taskId === "second") {
      return new Promise<ExecutorReply>((resolve) => {
        late = resolve;
      });
    }
    return section("heading");
  });
  stubGenerationExecutor(executeMock);
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
  executeMock.mockImplementation(
    async () =>
      ({
        type: "planned",
        plan: { ...plan([]), intent: "conversation", text: "Done" },
      }) satisfies GenerationResult
  );
  await act(async () => {
    await current.result.current.send("What changed?");
  });
  const last = executeMock.mock.calls.at(-1)![0];
  expect(last.messages[1].content).toContain("Section 2: cancelled");
  expect(last.messages[1].content).toContain(
    "Moving cards between sections is unavailable."
  );
  expect(last.currentData.content[0].props.content[0].props.text).toBe(
    "Updated"
  );
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
  const executeMock = vi.fn(async (body: any): Promise<ExecutorReply> => {
    return body.mode === "plan"
      ? ({
          type: "planned",
          plan: plan([task("heading"), task("second", ["heading"])]),
        } satisfies GenerationResult)
      : section(body.task.taskId);
  });
  stubGenerationExecutor(executeMock);
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
  expect(executeMock).toHaveBeenCalledTimes(4);
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
