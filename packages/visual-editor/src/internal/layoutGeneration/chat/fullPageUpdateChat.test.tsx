import type { Data } from "@puckeditor/core";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import type { Content } from "../shared/authoredValues.ts";
import { GenerationError } from "../shared/generationErrors.ts";
import { preserveSectionEditResolution } from "../workflows/edits/applyEditsToLayout.ts";
import { applyFullPageUpdateStep } from "../workflows/fullPageUpdate/applyFullPageUpdateStep.ts";
import type { FullPageUpdateStep } from "../workflows/fullPageUpdate/contracts.ts";
import { chatConfig, layout } from "../testing/chatFixtures.tsx";
import { testGenerationEnvironment } from "../testing/executorFixtures.ts";
import { executeGeneration } from "../transport/executeGeneration.ts";
import { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

vi.mock("../transport/executeGeneration.ts", () => ({
  executeGeneration: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const setup = (componentLabel?: (type: string) => string) => {
  let data: Data = layout();
  data.content[0].props.content.push({
    type: "Heading",
    props: { id: "second", text: "Second" },
  });
  const initial = structuredClone(data);
  const catalog = createPuckGenerationCatalog(chatConfig.components);
  const environment = {
    ...testGenerationEnvironment("/generate", chatConfig),
    diagnostics: { log: vi.fn(), report: vi.fn() },
  };
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(executeGeneration).mockReset();
  const hook = renderHook(() => useLayoutGenerationChat(environment, "layout"));
  const commit = vi.fn((next: Data, _baseline: Data) => {
    data = next;
  });
  act(() => {
    hook.result.current.canvas.attach({
      read: () => data,
      readComponentLabel: componentLabel,
      readSectionLabels: () => ({
        heading: "Section 1 · Heading",
        second: "Section 2 · Heading",
      }),
      resolve: async (candidate) => candidate,
      validate: vi.fn(),
      preview: (next) => {
        data = next;
      },
      commit,
      materializeFullPageUpdate: (baseline, step) =>
        applyFullPageUpdateStep(catalog, baseline as Content, step) as Data,
      preserveSectionResolution: (resolved, candidate) =>
        preserveSectionEditResolution(
          catalog,
          resolved as Content,
          candidate as Content
        ) as Data,
    });
  });
  return { ...hook, commit, initial, data: () => data };
};
const success = (steps: FullPageUpdateStep[] = []) => ({
  type: "fullPageUpdated" as const,
  text: "Page updated.",
  result: { action: "fullPageUpdate" as const, steps },
});

it("updates populated intent pages and reports completion after committing", async () => {
  const current = setup();
  vi.mocked(executeGeneration).mockResolvedValueOnce(
    success([{ kind: "remove", sectionId: "heading" }])
  );
  let completed: Awaited<
    ReturnType<typeof current.result.current.generateIntent>
  > = false;
  await act(async () => {
    completed = await current.result.current.generateIntent("Chicken menu");
  });
  expect(completed).toBe(true);
  expect(executeGeneration).toHaveBeenCalledOnce();
  expect(vi.mocked(executeGeneration).mock.calls[0][0]).toMatchObject({
    mode: "fullPageUpdate",
    currentData: { content: current.initial.content },
    messages: [{ role: "user", content: "Chicken menu" }],
  });
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.commit.mock.calls[0][1]).toEqual(current.initial);
  expect(current.result.current.messages.at(-1)?.sections).toEqual([
    expect.objectContaining({
      description: "Removed this section.",
      status: "applied",
    }),
    expect.objectContaining({
      description: "No change applied to this section.",
      status: "skipped",
    }),
  ]);
  expect(current.result.current.error).toBeNull();
});

it.each(["Event details", undefined])(
  "labels inserted full-page update sections with their display name or type (%s)",
  async (label) => {
    const current = setup(label ? () => label : undefined);
    vi.mocked(executeGeneration).mockResolvedValueOnce(
      success([
        {
          kind: "insert",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
          sections: [
            { type: "Heading", props: { id: "new", text: "New event" } },
          ],
        },
      ])
    );
    await act(async () => {
      await current.result.current.generateIntent("Add an event section");
    });
    expect(current.result.current.messages.at(-1)?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: `New section · ${label ?? "Heading"}`,
          status: "applied",
        }),
      ])
    );
  }
);

it("does not report intent completion for full-page update clarification or failure", async () => {
  const current = setup();
  vi.mocked(executeGeneration)
    .mockResolvedValueOnce({
      type: "fullPageUpdated",
      text: "",
      result: { action: "clarification", question: "Which menu?" },
    })
    .mockRejectedValueOnce(new GenerationError("Test failure"));
  for (let attempt = 0; attempt < 2; attempt++) {
    await act(async () => {
      expect(await current.result.current.generateIntent("Chicken menu")).toBe(
        attempt === 0 ? "clarification" : false
      );
    });
  }
  expect(current.commit).not.toHaveBeenCalled();
  expect(current.result.current.error?.message).toBe("Test failure");
});

it("continues clarification in full-page update mode, then returns ordinary chat to edits", async () => {
  const current = setup();
  const execute = vi.mocked(executeGeneration);
  execute
    .mockResolvedValueOnce({
      type: "fullPageUpdated",
      text: "",
      result: { action: "clarification", question: "Which service?" },
    })
    .mockResolvedValueOnce(success([{ kind: "remove", sectionId: "heading" }]));
  await act(async () => {
    expect(
      await current.result.current.generateIntent("Focus the page on a service")
    ).toBe("clarification");
  });
  expect(current.result.current.messages.at(-1)?.text).toBe("Which service?");
  expect(current.commit).not.toHaveBeenCalled();
  await act(async () => {
    expect(await current.result.current.generateIntent("Repairs", true)).toBe(
      true
    );
  });
  expect(execute.mock.calls.map(([request]) => request.mode)).toEqual([
    "fullPageUpdate",
    "fullPageUpdate",
  ]);
  expect(
    execute.mock.calls[1][0].messages.map((message) => message.content)
  ).toEqual(["Focus the page on a service", "Which service?", "Repairs"]);
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.commit.mock.calls[0][1]).toEqual(current.initial);
  execute.mockImplementationOnce(async (request) => {
    expect(request.mode).toBe("plan");
    throw new GenerationError("Test stop");
  });
  await act(async () => {
    await current.result.current.send("Adjust wording");
  });
  expect(execute.mock.calls[2][0].mode).toBe("plan");
});

it("cancellation retains streamed changes once and releases the editor", async () => {
  const current = setup();
  let applied!: () => void;
  const revealed = new Promise<void>((resolve) => {
    applied = resolve;
  });
  vi.mocked(executeGeneration).mockImplementationOnce(
    async (_payload, _environment, signal, _id, _content, onStep) => {
      await onStep!({ kind: "remove", sectionId: "heading" }, 0);
      applied();
      await new Promise<void>((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
      return success();
    }
  );
  let pending!: ReturnType<typeof current.result.current.generateIntent>;
  act(() => {
    pending = current.result.current.generateIntent("Product page");
  });
  await act(async () => {
    await revealed;
  });
  expect(current.result.current.isGeneratingPage).toBe(true);
  act(() => {
    current.result.current.cancel();
  });
  await act(async () => {
    expect(await pending).toBe(false);
  });
  expect(
    current.data().content[0].props.content.map((item: any) => item.props.id)
  ).toEqual(["second"]);
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.result.current.isGeneratingPage).toBe(false);
  expect(current.result.current.isStreaming).toBe(false);
  expect(current.result.current.messages.at(-1)?.text).toContain(
    "Steps completed: 1."
  );
});

it("failure retains completed steps, reports partial completion and does not retry", async () => {
  const current = setup();
  const execute = vi.mocked(executeGeneration);
  execute.mockClear();
  execute.mockImplementationOnce(
    async (_payload, _environment, _signal, _id, _content, onStep) => {
      await onStep!({ kind: "remove", sectionId: "heading" }, 0);
      throw new GenerationError("Invalid later step", true);
    }
  );
  await act(async () => {
    expect(await current.result.current.generateIntent("Product page")).toBe(
      false
    );
  });
  expect(execute).toHaveBeenCalledOnce();
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.result.current.error?.message).toBe("Invalid later step");
  expect(current.result.current.messages.at(-1)?.text).toContain(
    "Steps completed: 1."
  );
  expect(current.result.current.isGeneratingPage).toBe(false);
});

it("shows existing sections waiting while intent generation streams decisions", async () => {
  const current = setup();
  let reveal!: () => void;
  let finish!: () => void;
  const revealed = new Promise<void>((resolve) => {
    reveal = resolve;
  });
  const hold = new Promise<void>((resolve) => {
    finish = resolve;
  });
  vi.mocked(executeGeneration).mockImplementationOnce(
    async (_payload, _environment, _signal, _id, _content, onStep) => {
      await onStep!({ kind: "remove", sectionId: "heading" }, 0);
      reveal();
      await hold;
      return success([{ kind: "remove", sectionId: "heading" }]);
    }
  );
  let pending!: ReturnType<typeof current.result.current.generateIntent>;
  act(() => {
    pending = current.result.current.generateIntent("Chicken menu");
  });
  expect(current.result.current.messages.at(-1)?.sections).toEqual([
    expect.objectContaining({
      label: "Section 1 · Heading",
      status: "waiting",
    }),
    expect.objectContaining({
      label: "Section 2 · Heading",
      status: "waiting",
    }),
  ]);
  await act(async () => {
    await revealed;
  });
  expect(current.result.current.messages.at(-1)?.sections).toEqual([
    expect.objectContaining({
      label: "Section 1 · Heading",
      status: "applied",
    }),
    expect.objectContaining({
      label: "Section 2 · Heading",
      status: "waiting",
    }),
  ]);
  await act(async () => {
    finish();
    await pending;
  });
});
