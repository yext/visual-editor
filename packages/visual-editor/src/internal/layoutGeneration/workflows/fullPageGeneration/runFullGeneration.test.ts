import { expect, it, vi } from "vitest";
import type { Content } from "../../shared/authoredValues.ts";
import type {
  GenerationRequestExecutor,
  GenerationResult,
} from "../../shared/contracts.ts";
import { runFullGeneration } from "./runFullGeneration.ts";

const prepared = (question: string | null = null): GenerationResult => ({
  type: "prepared",
  preparation: {
    question,
    translationMode: question ? null : "defaultOnly",
    cardCounts: [],
  },
});
const content: Content = {
  content: [{ type: "Heading", props: { id: "heading", text: "New page" } }],
};
const setup = () => {
  const request = vi.fn<GenerationRequestExecutor>();
  let createdSectionCount = 0;
  const canvas = {
    beginCreation: vi.fn(),
    revealCreation: vi.fn(async (data: Content) => {
      createdSectionCount = data.content.length;
    }),
    finishCreation: vi.fn(),
    get createdSectionCount() {
      return createdSectionCount;
    },
  };
  return {
    request,
    canvas,
    run: () =>
      runFullGeneration({
        layoutId: "layout",
        currentData: { content: [] },
        messages: [{ role: "user", content: "Create a page" }],
        signal: new AbortController().signal,
        active: () => true,
        request,
        canvas,
        onProgress: vi.fn(),
      }),
  };
};

it.each(["prepare", "create"] as const)(
  "returns clarification from %s without revealing or committing content",
  async (mode) => {
    const current = setup();
    const question = "Which service should the page cover?";
    if (mode === "prepare") {
      current.request.mockResolvedValueOnce(prepared(question));
    } else {
      current.request.mockResolvedValueOnce(prepared()).mockResolvedValueOnce({
        type: "accepted",
        text: question,
        spec: null,
      });
    }
    expect(await current.run()).toEqual({
      text: question,
      clarification: true,
    });
    expect(current.request.mock.calls.map(([request]) => request.mode)).toEqual(
      mode === "prepare" ? ["prepare"] : ["prepare", "create"]
    );
    expect(current.canvas.revealCreation).not.toHaveBeenCalled();
    expect(current.canvas.finishCreation).not.toHaveBeenCalled();
  }
);

it("returns completion after accepting and committing the generated content", async () => {
  const current = setup();
  current.request.mockResolvedValueOnce(prepared()).mockResolvedValueOnce({
    type: "accepted",
    text: "Created the page.",
    spec: content,
  });
  expect(await current.run()).toEqual({
    text: "Created the page.",
    clarification: false,
  });
  expect(current.canvas.revealCreation.mock.calls[0][0]).toEqual(content);
  expect(current.canvas.finishCreation).toHaveBeenCalledOnce();
});

it("rejects clarification after content has streamed without committing the page", async () => {
  const current = setup();
  current.request
    .mockResolvedValueOnce(prepared())
    .mockImplementationOnce(async (_request, _signal, onContent) => {
      await onContent!(content);
      return { type: "accepted", text: "Which service?", spec: null };
    });
  await expect(current.run()).rejects.toThrow(
    "Clarification cannot follow applied creation sections."
  );
  expect(current.canvas.revealCreation).toHaveBeenCalledOnce();
  expect(current.canvas.finishCreation).not.toHaveBeenCalled();
});
