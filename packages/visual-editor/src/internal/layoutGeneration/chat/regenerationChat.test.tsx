import type { Data } from "@puckeditor/core";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import type { Content } from "../shared/authoredValues.ts";
import { GenerationError } from "../shared/generationErrors.ts";
import { preserveSectionEditResolution } from "../workflows/edits/applyEditsToLayout.ts";
import { applyRegenerationStep } from "../workflows/fullPageRegeneration/applyRegenerationStep.ts";
import type { RegenerationStep } from "../workflows/fullPageRegeneration/contracts.ts";
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
const setup = () => {
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
      resolve: async (candidate) => candidate,
      validate: vi.fn(),
      preview: (next) => {
        data = next;
      },
      commit,
      materializeRegeneration: (baseline, step) =>
        applyRegenerationStep(catalog, baseline as Content, step) as Data,
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
const success = (steps: RegenerationStep[] = []) => ({
  type: "regenerated" as const,
  text: "Regenerated.",
  result: { action: "regenerate" as const, steps },
});

it("continues clarification in regeneration mode, then returns ordinary chat to edits", async () => {
  const current = setup();
  const execute = vi.mocked(executeGeneration);
  execute
    .mockResolvedValueOnce({
      type: "regenerated",
      text: "",
      result: { action: "clarification", question: "Which service?" },
    })
    .mockResolvedValueOnce(success([{ kind: "remove", sectionId: "heading" }]));
  await act(async () => {
    await current.result.current.regenerate("Focus the page on a service");
  });
  expect(current.result.current.messages.at(-1)?.text).toBe("Which service?");
  expect(current.commit).not.toHaveBeenCalled();
  await act(async () => {
    await current.result.current.send("Repairs");
  });
  expect(execute.mock.calls.map(([request]) => request.mode)).toEqual([
    "regenerate",
    "regenerate",
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
  let pending!: Promise<void>;
  act(() => {
    pending = current.result.current.regenerate("Product page");
  });
  await act(async () => {
    await revealed;
  });
  expect(current.result.current.isCreating).toBe(true);
  act(() => {
    current.result.current.cancel();
  });
  await act(async () => {
    await pending;
  });
  expect(
    current.data().content[0].props.content.map((item: any) => item.props.id)
  ).toEqual(["second"]);
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.result.current.isCreating).toBe(false);
  expect(current.result.current.isStreaming).toBe(false);
  expect(current.result.current.messages.at(-1)?.text).toContain(
    "1 step completed"
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
    await current.result.current.regenerate("Product page");
  });
  expect(execute).toHaveBeenCalledOnce();
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.result.current.error?.message).toBe("Invalid later step");
  expect(current.result.current.messages.at(-1)?.text).toContain(
    "1 step completed"
  );
  expect(current.result.current.isCreating).toBe(false);
});
