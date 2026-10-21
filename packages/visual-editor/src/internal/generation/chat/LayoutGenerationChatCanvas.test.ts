import type { Data } from "@puckeditor/core";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../edits/applyEditsToLayout.ts";
import type { SectionEditResult, SectionEditTask } from "../edits/types.ts";
import { clone } from "../shared/authoredValues.ts";
import {
  LayoutGenerationChatCanvas,
  serializeChatLayout,
  type ChatCanvasAdapter,
} from "./LayoutGenerationChatCanvas.ts";

const data = (text: string): Data => ({
  root: { props: { title: "Keep" } },
  content: [{ type: "Heading", props: { id: "heading", text } }],
  zones: {},
});

const sectionTask = (
  taskId: string,
  sectionId = "heading"
): SectionEditTask => ({
  taskId,
  sectionId,
  targetComponentIds: [sectionId],
  instructions: "Update copy",
  structuralOperations: [],
  dependsOn: [],
});
const sectionResult = (
  task: SectionEditTask,
  text: string
): SectionEditResult => ({
  taskId: task.taskId,
  sectionId: task.sectionId,
  operations: [
    {
      kind: "update",
      componentId: task.sectionId,
      changes: [{ kind: "set", path: "/text", value: text }],
    },
  ],
});
const sectionAdapter = () => {
  const catalog = createPuckGenerationCatalog({
    Heading: { generation: { props: z.object({ text: z.string() }) } },
  });
  let current: Data = {
    ...data("Original"),
    content: [
      ...data("Original").content,
      { type: "Heading", props: { id: "second", text: "Second" } },
    ],
  };
  const history: Data[] = [clone(current)];
  const target: ChatCanvasAdapter = {
    read: () => clone(current),
    resolve: vi.fn(async (candidate) => candidate),
    validate: vi.fn(),
    materializeSection: vi.fn((baseline, task, result) =>
      materializeSectionEdit(catalog, baseline, task, result)
    ),
    preserveSectionResolution: vi.fn((resolved, candidate) =>
      preserveSectionEditResolution(catalog, resolved, candidate)
    ),
    commit: vi.fn((candidate) => {
      current = clone(candidate);
      history.push(clone(candidate));
    }),
  };
  return {
    target,
    history,
    replace: (value: Data) => {
      current = value;
    },
  };
};

describe("progressive section commits", () => {
  it("serializes resolution and commits against fresh baselines, keeping one history entry per section", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const { target, history } = sectionAdapter();
    const pending = deferred();
    const first = sectionTask("first");
    const second = sectionTask("second", "second");
    vi.mocked(target.resolve).mockImplementationOnce((candidate) =>
      pending.promise.then(() => candidate)
    );
    canvas.attach(target);
    canvas.begin();
    const firstCommit = canvas.commitSection(
      first,
      sectionResult(first, "First applied")
    );
    const secondCommit = canvas.commitSection(
      second,
      sectionResult(second, "Second applied")
    );
    await vi.waitFor(() => expect(target.resolve).toHaveBeenCalledTimes(1));
    expect(target.commit).not.toHaveBeenCalled();
    pending.resolve(data("Unused"));
    await expect(firstCommit).resolves.toBe(true);
    await expect(secondCommit).resolves.toBe(true);
    expect(target.resolve).toHaveBeenCalledTimes(2);
    expect(target.commit).toHaveBeenCalledTimes(2);
    expect(history).toHaveLength(3);
    expect(history[1].content.map((item) => item.props.text)).toEqual([
      "First applied",
      "Second",
    ]);
    expect(history[2].content.map((item) => item.props.text)).toEqual([
      "First applied",
      "Second applied",
    ]);
    expect(vi.mocked(target.commit).mock.calls[1][1]).toEqual(history[1]);
    expect(history[2].root).toEqual(history[0].root);
    canvas.finish();
  });

  it.each(["resolve", "validate"])(
    "keeps an earlier success after %s failure and continues independent work",
    async (failure) => {
      const canvas = new LayoutGenerationChatCanvas();
      const { target, history } = sectionAdapter();
      canvas.attach(target);
      canvas.begin();
      const first = sectionTask("first");
      await canvas.commitSection(first, sectionResult(first, "Applied"));
      if (failure === "resolve") {
        vi.mocked(target.resolve).mockRejectedValueOnce(
          new Error("Task failed")
        );
      } else {
        vi.mocked(target.preserveSectionResolution!).mockImplementationOnce(
          () => {
            throw new Error("Task failed");
          }
        );
      }
      const failed = sectionTask("failed", "second");
      const independent = sectionTask("independent");
      const rejected = expect(
        canvas.commitSection(failed, sectionResult(failed, "Rejected"))
      ).rejects.toThrow("Task failed");
      const continued = canvas.commitSection(
        independent,
        sectionResult(independent, "Continued")
      );
      await rejected;
      await expect(continued).resolves.toBe(true);
      expect(history).toHaveLength(3);
      expect(history[1].content[0].props.text).toBe("Applied");
      expect(target.read().content.map((item) => item.props.text)).toEqual([
        "Continued",
        "Second",
      ]);
      canvas.finish();
    }
  );

  it("deduplicates repeated deliveries and resets deduplication for the next turn", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const { target } = sectionAdapter();
    const task = sectionTask("same-task");
    canvas.attach(target);
    canvas.begin();
    const first = canvas.commitSection(task, sectionResult(task, "Applied"));
    const duplicate = canvas.commitSection(
      task,
      sectionResult(task, "Applied")
    );
    await expect(first).resolves.toBe(true);
    await expect(duplicate).resolves.toBe(false);
    expect(target.commit).toHaveBeenCalledTimes(1);
    canvas.finish();
    canvas.begin();
    await expect(
      canvas.commitSection(task, sectionResult(task, "Next turn"))
    ).resolves.toBe(true);
    expect(target.commit).toHaveBeenCalledTimes(2);
    canvas.finish();
  });

  it.each(["cancel", "context", "layout"])(
    "rejects pending and queued results after %s changes, retaining prior commits",
    async (change) => {
      const canvas = new LayoutGenerationChatCanvas();
      const { target, history, replace } = sectionAdapter();
      canvas.attach(target);
      canvas.begin();
      const first = sectionTask("first");
      await canvas.commitSection(first, sectionResult(first, "Applied"));
      const pending = deferred();
      vi.mocked(target.resolve).mockImplementationOnce((candidate) =>
        pending.promise.then(() => candidate)
      );
      const late = sectionTask("late", "second");
      const queued = sectionTask("queued");
      const rejection = expect(
        canvas.commitSection(late, sectionResult(late, "Late"))
      ).rejects.toThrow(/changed|cancelled/);
      const next = canvas.commitSection(
        queued,
        sectionResult(queued, "Queued")
      );
      await vi.waitFor(() => expect(target.resolve).toHaveBeenCalledTimes(2));
      if (change === "cancel") {
        canvas.finish();
      }
      if (change === "context") {
        canvas.attach(adapter());
      }
      if (change === "layout") {
        replace(data("Manual"));
        canvas.finish();
      }
      const nextRejection = expect(next).rejects.toThrow(/changed|cancelled/);
      pending.resolve(data("Unused"));
      await rejection;
      await nextRejection;
      expect(target.commit).toHaveBeenCalledTimes(1);
      expect(history[1].content[0].props.text).toBe("Applied");
      expect(history).toHaveLength(2);
    }
  );

  it("rejects a manual layout change during resolution without overwriting it", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const { target, replace } = sectionAdapter();
    const pending = deferred();
    vi.mocked(target.resolve).mockImplementationOnce((candidate) =>
      pending.promise.then(() => candidate)
    );
    canvas.attach(target);
    canvas.begin();
    const task = sectionTask("late");
    const rejected = expect(
      canvas.commitSection(task, sectionResult(task, "Late"))
    ).rejects.toThrow("Layout changed");
    await vi.waitFor(() => expect(target.resolve).toHaveBeenCalledTimes(1));
    replace(data("Manual"));
    pending.resolve(data("Unused"));
    await rejected;
    expect(target.read()).toEqual(data("Manual"));
    expect(target.commit).not.toHaveBeenCalled();
    canvas.finish();
  });

  it("stops resolving and queued section applications when their execution signal aborts", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const { target } = sectionAdapter();
    const pending = deferred();
    vi.mocked(target.resolve).mockImplementationOnce((candidate) =>
      pending.promise.then(() => candidate)
    );
    canvas.attach(target);
    canvas.begin();
    const controller = new AbortController();
    const first = sectionTask("first");
    const second = sectionTask("second", "second");
    const rejected = expect(
      canvas.commitSection(
        first,
        sectionResult(first, "Late"),
        controller.signal
      )
    ).rejects.toThrow();
    const queued = expect(
      canvas.commitSection(
        second,
        sectionResult(second, "Queued"),
        controller.signal
      )
    ).rejects.toThrow();
    await vi.waitFor(() => expect(target.resolve).toHaveBeenCalledOnce());
    controller.abort();
    pending.resolve(data("Unused"));
    await rejected;
    await queued;
    expect(target.commit).not.toHaveBeenCalled();
    expect(target.resolve).toHaveBeenCalledOnce();
    canvas.finish();
  });

  it("reads fresh snapshots during the turn and rejects reads after it ends", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const { target } = sectionAdapter();
    target.readSelection = () => "heading";
    canvas.attach(target);
    expect(canvas.selectedComponentId).toBe("heading");
    canvas.begin();
    const snapshot = canvas.read();
    snapshot.content[0].props.text = "Isolated";
    expect(target.read().content[0].props.text).toBe("Original");
    const task = sectionTask("first");
    await canvas.commitSection(task, sectionResult(task, "Applied"));
    expect(canvas.read().content[0].props.text).toBe("Applied");
    canvas.finish();
    expect(() => canvas.read()).toThrow("cancelled");
  });

  it("executes a pure structural task without a generated result", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const { target } = sectionAdapter();
    canvas.attach(target);
    canvas.begin();
    const task = sectionTask("remove", "second");
    task.structuralOperations = [{ kind: "remove", componentId: "second" }];
    await expect(canvas.commitSection(task)).resolves.toBe(true);
    expect(target.read().content.map((item) => item.props.id)).toEqual([
      "heading",
    ]);
    canvas.finish();
  });
});
const adapter = (): ChatCanvasAdapter => ({
  read: () => data("Original"),
  resolve: vi.fn(async (value) => value),
  validate: vi.fn(),
  commit: vi.fn(),
});
const deferred = () => {
  let resolve!: (data: Data) => void;
  const promise = new Promise<Data>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
};

describe("creation canvas", () => {
  it("resolves in isolation, preserves root, and commits once", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const target = adapter();
    const pending = deferred();
    target.resolve = vi.fn(() => pending.promise);
    canvas.attach(target);
    canvas.begin();
    canvas.beginCreation();
    const commit = canvas.revealCreation(
      { content: data("Final").content },
      new AbortController().signal
    );
    expect(target.commit).not.toHaveBeenCalled();
    pending.resolve({
      ...data("Final"),
      root: { props: { title: "Resolver" } },
    });
    await commit;
    canvas.finishCreation();
    expect(target.commit).toHaveBeenCalledExactlyOnceWith(
      data("Final"),
      data("Original")
    );
    expect(target.validate).toHaveBeenCalledTimes(2);
  });
  it.each(["cancel", "context", "layout"])(
    "rejects stale resolution after %s changes",
    async (change) => {
      const canvas = new LayoutGenerationChatCanvas();
      const target = adapter();
      const pending = deferred();
      target.resolve = vi.fn(() => pending.promise);
      canvas.attach(target);
      canvas.begin();
      canvas.beginCreation();
      const commit = canvas.revealCreation(
        { content: data("Late").content },
        new AbortController().signal
      );
      const rejection = expect(commit).rejects.toThrow(/changed|ended/);
      if (change === "cancel") {
        canvas.finish();
      }
      if (change === "context") {
        canvas.attach(adapter());
      }
      if (change === "layout") {
        target.read = () => data("Manual");
      }
      pending.resolve(data("Late"));
      await rejection;
      expect(target.commit).not.toHaveBeenCalled();
    }
  );
  it.each(["resolution", "validation"])(
    "leaves the starting layout unchanged on %s failure",
    async (failure) => {
      const canvas = new LayoutGenerationChatCanvas();
      const target = adapter();
      if (failure === "resolution") {
        target.resolve = vi.fn(async () => {
          throw new Error("Failed");
        });
      } else {
        target.validate = vi.fn(() => {
          throw new Error("Failed");
        });
      }
      canvas.attach(target);
      canvas.begin();
      canvas.beginCreation();
      await expect(
        canvas.revealCreation(
          { content: data("Invalid").content },
          new AbortController().signal
        )
      ).rejects.toThrow("Failed");
      canvas.finish();
      expect(target.commit).not.toHaveBeenCalled();
      expect(target.read()).toEqual(data("Original"));
    }
  );
  it("clarifies without resolving or committing", async () => {
    const canvas = new LayoutGenerationChatCanvas();
    const target = adapter();
    canvas.attach(target);
    canvas.begin();
    canvas.finishCreation();
    expect(target.resolve).not.toHaveBeenCalled();
    expect(target.commit).not.toHaveBeenCalled();
  });
  it("rejects populated zones and preserves unexposed serializable configuration", () => {
    expect(() =>
      serializeChatLayout({
        ...data("Original"),
        zones: { legacy: data("Legacy").content },
      })
    ).toThrow("legacy zones");
    const value = data("Original");
    value.content[0].props.parentData = { authored: true };
    value.content[0].props.callback = () => {};
    expect(serializeChatLayout(value).content[0].props.parentData).toEqual({
      authored: true,
    });
    expect(
      serializeChatLayout(value).content[0].props.callback
    ).toBeUndefined();
  });
});

it("records application snapshots and catches later Puck changes without changing the canvas", async () => {
  const canvas = new LayoutGenerationChatCanvas();
  const h = sectionAdapter();
  h.target.inspect = (data) => ({
    validationError:
      data.content[0].props.text === "Later resolution"
        ? "Manual backup differs"
        : null,
  });
  canvas.attach(h.target);
  const diagnostic = vi.fn();
  canvas.onDiagnostic = diagnostic;
  canvas.begin();
  const task = sectionTask("edit");
  await canvas.commitSection(task, sectionResult(task, "Updated"));
  expect(diagnostic.mock.calls.map(([phase]) => phase)).toEqual([
    "turn-start",
    "baseline",
    "materialized",
    "resolved",
    "preserved",
    "commit-readback",
  ]);
  expect(diagnostic).toHaveBeenCalledWith(
    "baseline",
    expect.objectContaining({ task, result: sectionResult(task, "Updated") })
  );
  const before = h.target.read();
  canvas.finish();
  const later = clone(before);
  later.content[0].props.text = "Later resolution";
  h.replace(later);
  canvas.observe(later);
  expect(diagnostic).toHaveBeenLastCalledWith(
    "canvas-observed",
    expect.objectContaining({
      taskId: "edit",
      sectionId: "heading",
      validationError: "Manual backup differs",
      changedPaths: ["/content/0/props/text"],
      snapshot: later,
    })
  );
  const count = diagnostic.mock.calls.length;
  canvas.observe(later);
  expect(diagnostic).toHaveBeenCalledTimes(count);
  expect(h.target.read()).toEqual(later);
  expect(before.content[0].props.text).toBe("Updated");
});

it("logs the failing section and stage when local resolution rejects an accepted result", async () => {
  const canvas = new LayoutGenerationChatCanvas();
  const h = sectionAdapter();
  vi.mocked(h.target.resolve).mockRejectedValueOnce(
    new Error("Resolver failure")
  );
  canvas.attach(h.target);
  const diagnostic = vi.fn();
  canvas.onDiagnostic = diagnostic;
  canvas.begin();
  const task = sectionTask("failing");
  await expect(
    canvas.commitSection(task, sectionResult(task, "Updated"))
  ).rejects.toThrow("Resolver failure");
  expect(diagnostic).toHaveBeenLastCalledWith(
    "section-failed",
    expect.objectContaining({
      taskId: "failing",
      sectionId: "heading",
      stage: "resolve",
      error: "Resolver failure",
      snapshot: h.target.read(),
    })
  );
  expect(h.target.commit).not.toHaveBeenCalled();
});

it("does not fail section application when diagnostic reporting throws", async () => {
  const canvas = new LayoutGenerationChatCanvas();
  const h = sectionAdapter();
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  canvas.attach(h.target);
  canvas.onDiagnostic = () => {
    throw new Error("Log unavailable");
  };
  try {
    canvas.begin();
    const task = sectionTask("edit");
    await expect(
      canvas.commitSection(task, sectionResult(task, "Updated"))
    ).resolves.toBe(true);
    expect(h.target.read().content[0].props.text).toBe("Updated");
  } finally {
    consoleError.mockRestore();
  }
});
