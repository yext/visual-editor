import { describe, expect, it, vi } from "vitest";
import { GenerationError } from "../../shared/generationErrors.ts";
import { runSectionTasks } from "./sectionTaskRunner.ts";
import type { SectionEditResult, SectionEditTask } from "./types.ts";
import { validateTaskGraph } from "./utils.ts";

const task = (taskId: string, dependsOn: string[] = []): SectionEditTask => ({
  taskId,
  sectionId: taskId,
  targetComponentIds: [taskId],
  instructions: "Update",
  structuralOperations: [],
  dependsOn,
  generateContent: true,
});
const result = (task: SectionEditTask): SectionEditResult => ({
  taskId: task.taskId,
  sectionId: task.sectionId,
  operations: [],
});
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const setup = (tasks: SectionEditTask[]) => ({
  tasks,
  signal: new AbortController().signal,
  generate: vi.fn(
    async (task: SectionEditTask, _signal: AbortSignal, _feedback?: string) =>
      result(task)
  ),
  commit: vi.fn(
    async (
      _task: SectionEditTask,
      _result?: SectionEditResult,
      _signal?: AbortSignal
    ) => {}
  ),
  onProgress: vi.fn(),
  onOutcome: vi.fn(),
});

describe("browser section coordination", () => {
  it("bounds concurrency and waits for application before starting dependents", async () => {
    const options = setup([task("a"), task("b"), task("c", ["a"]), task("d")]);
    const gates = new Map(
      ["a", "b", "c", "d"].map((id) => [id, deferred<SectionEditResult>()])
    );
    const application = deferred<void>();
    options.generate.mockImplementation(
      (task) => gates.get(task.taskId)!.promise
    );
    options.commit.mockImplementation(async (task) => {
      if (task.taskId === "a") {
        await application.promise;
      }
    });
    const pending = runSectionTasks(options);
    expect(options.generate.mock.calls.map(([task]) => task.taskId)).toEqual([
      "a",
      "b",
    ]);
    gates.get("a")!.resolve(result(task("a")));
    await vi.waitFor(() => expect(options.commit).toHaveBeenCalledOnce());
    expect(options.generate).toHaveBeenCalledTimes(2);
    application.resolve();
    await vi.waitFor(() => expect(options.generate).toHaveBeenCalledTimes(3));
    expect(options.generate.mock.calls[2][0].taskId).toBe("c");
    gates.get("b")!.resolve(result(task("b")));
    await vi.waitFor(() => expect(options.generate).toHaveBeenCalledTimes(4));
    gates.get("c")!.resolve(result(task("c")));
    gates.get("d")!.resolve(result(task("d")));
    expect((await pending).outcomes.map((outcome) => outcome.status)).toEqual([
      "applied",
      "applied",
      "applied",
      "applied",
    ]);
  });

  it("repairs invalid model output once with bounded feedback", async () => {
    const options = setup([task("a")]);
    options.generate.mockRejectedValueOnce(
      new GenerationError("Invalid", true, false, "x".repeat(5000))
    );
    expect((await runSectionTasks(options)).outcomes[0].status).toBe("applied");
    expect(options.generate).toHaveBeenCalledTimes(2);
    expect(options.generate.mock.calls[1][2]).toHaveLength(4000);
  });

  it("repairs local resolution failure before declaring success", async () => {
    const options = setup([task("a"), task("b", ["a"])]);
    options.commit.mockRejectedValueOnce(new Error("Resolver rejected value"));
    const finished = await runSectionTasks(options);
    expect(options.generate.mock.calls.map(([task]) => task.taskId)).toEqual([
      "a",
      "a",
      "b",
    ]);
    expect(options.generate.mock.calls[1][2]).toContain(
      "Resolver rejected value"
    );
    expect(finished.outcomes.map((outcome) => outcome.status)).toEqual([
      "applied",
      "applied",
    ]);
  });

  it("continues independent work and skips transitive dependents after retry exhaustion", async () => {
    const options = setup([
      task("a"),
      task("b", ["a"]),
      task("c", ["b"]),
      task("d"),
    ]);
    options.generate.mockImplementation(async (current) => {
      if (current.taskId === "a") {
        throw new GenerationError("Invalid", true);
      }
      return result(current);
    });
    const finished = await runSectionTasks(options);
    expect(finished.outcomes.map((outcome) => outcome.status)).toEqual([
      "failed",
      "skipped",
      "skipped",
      "applied",
    ]);
    expect(options.generate.mock.calls.map(([task]) => task.taskId)).toEqual([
      "a",
      "d",
      "a",
    ]);
  });

  it("executes pure structural tasks without generation or repair", async () => {
    const options = setup([{ ...task("a"), generateContent: false }]);
    options.commit.mockRejectedValue(new Error("No permission"));
    expect((await runSectionTasks(options)).outcomes[0].status).toBe("failed");
    expect(options.generate).not.toHaveBeenCalled();
    expect(options.commit).toHaveBeenCalledOnce();
  });

  it("cancels promptly and ignores late generation even when transport ignores abort", async () => {
    const controller = new AbortController();
    const options = {
      ...setup([task("a"), task("b")]),
      signal: controller.signal,
    };
    const late = deferred<SectionEditResult>();
    options.generate.mockReturnValue(late.promise);
    const pending = runSectionTasks(options);
    controller.abort();
    expect((await pending).outcomes.map((outcome) => outcome.status)).toEqual([
      "cancelled",
      "cancelled",
    ]);
    late.resolve(result(task("a")));
    await Promise.resolve();
    expect(options.commit).not.toHaveBeenCalled();
  });

  it("preserves successes and aborts outstanding work on transport failure", async () => {
    const options = setup([task("a"), task("b", ["a"]), task("c", ["a"])]);
    const late = deferred<SectionEditResult>();
    options.generate.mockImplementation(async (current) => {
      if (current.taskId === "b") {
        throw new GenerationError("Disconnected", false, true);
      }
      if (current.taskId === "c") {
        return late.promise;
      }
      return result(current);
    });
    const finished = await runSectionTasks(options);
    expect(finished.outcomes.map((outcome) => outcome.status)).toEqual([
      "applied",
      "failed",
      "cancelled",
    ]);
    expect(options.generate.mock.calls[2][1].aborted).toBe(true);
    late.resolve(result(task("c")));
    await Promise.resolve();
    expect(options.commit).toHaveBeenCalledOnce();
  });

  it.each([
    [task("a"), task("a")],
    [task("a"), { ...task("b"), sectionId: "a" }],
    [task("a", ["missing"])],
    [task("a", ["b"]), task("b", ["a"])],
    [task("a", ["b", "b"]), task("b")],
  ])("rejects invalid graphs before generating (%#)", async (...tasks) => {
    expect(() => validateTaskGraph(tasks)).toThrow();
    const options = setup(tasks);
    await expect(runSectionTasks(options)).rejects.toThrow();
    expect(options.generate).not.toHaveBeenCalled();
  });
});
