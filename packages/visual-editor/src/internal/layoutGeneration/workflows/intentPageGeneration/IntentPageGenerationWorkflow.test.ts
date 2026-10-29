import { expect, it, vi } from "vitest";
import { IntentPageGenerationWorkflow } from "./IntentPageGenerationWorkflow.ts";
import type { IntentReply } from "../../transport/intentPageGenerationTransport.ts";

const setup = () => {
  const generate = vi.fn<
    ConstructorParameters<typeof IntentPageGenerationWorkflow>[1]
  >(async () => true);
  const cancel = vi.fn();
  const request =
    vi.fn<
      typeof import("../../transport/intentPageGenerationTransport.ts").sendIntentRequest
    >();
  const workflow = new IntentPageGenerationWorkflow(
    "default-layout",
    generate,
    cancel,
    request
  );
  workflow.reconcile({ prompt: "Retained prompt", status: "PENDING" });
  const reply = (status = "RUNNING", extra = {}): IntentReply => ({
    status: "success",
    payload: {
      attemptId: request.mock.calls[0][2],
      generation: {
        attemptId: request.mock.calls[0][2],
        status: status as "RUNNING",
      },
      ...extra,
    },
  });
  const settle = async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  };
  return { workflow, request, generate, cancel, reply, settle };
};

it("keeps clarification turns in the same attempt and saves only after an answer completes generation", async () => {
  const c = setup();
  c.request.mockImplementation(async (type) =>
    type === "saveLayoutSaveState"
      ? c.reply("COMPLETED", { layoutSaved: true })
      : c.reply()
  );
  c.generate
    .mockResolvedValueOnce("clarification")
    .mockResolvedValueOnce("clarification");
  c.generate.mockImplementation(async () => {
    c.workflow.captureDraft({ hash: "final-hash", history: "history" });
    return true;
  });
  c.workflow.autoStart(true);
  await c.settle();
  const attemptId = c.request.mock.calls[0][2];
  expect(c.workflow.state.stage).toBe("clarification");
  expect(c.workflow.state.busy).toBe(false);
  expect(c.workflow.blocked).toBe(true);
  expect(c.workflow.suppressSave("manual")).toBe(true);
  expect(c.request).toHaveBeenCalledTimes(1);
  c.workflow.reconcile({
    prompt: "Retained prompt",
    status: "RUNNING",
    attemptId,
  });
  await c.workflow.answer("https://example.com/book");
  expect(c.workflow.state.stage).toBe("clarification");
  expect(c.request).toHaveBeenCalledTimes(1);
  await c.workflow.answer("Include all stores");
  expect(c.generate.mock.calls).toEqual([
    ["Retained prompt"],
    ["https://example.com/book", true],
    ["Include all stores", true],
  ]);
  expect(c.workflow.state.stage).toBe("completed");
  expect(new Set(c.request.mock.calls.map((call) => call[2]))).toEqual(
    new Set([attemptId])
  );
  expect(c.request.mock.calls.some((call) => call[1].action === "fail")).toBe(
    false
  );
  expect(c.request.mock.calls.at(-1)![1]).toMatchObject({
    hash: "final-hash",
    intentPageGeneration: { attemptId },
  });
});

it("can cancel while waiting for an answer without resuming a finished attempt", async () => {
  const c = setup();
  c.generate.mockResolvedValue("clarification");
  c.request.mockImplementation(async (_type, payload) =>
    c.reply(payload.action === "fail" ? "FAILED" : "RUNNING")
  );
  c.workflow.autoStart(true);
  await c.settle();
  c.workflow.cancel();
  await c.settle();
  expect(c.workflow.state.stage).toBe("failed");
  expect(c.request.mock.calls.at(-1)![1].action).toBe("fail");
  await c.workflow.answer("Late answer");
  expect(c.generate).toHaveBeenCalledOnce();
});

it("reports a failed start once and releases the editor without retrying generation", async () => {
  const c = setup();
  c.request.mockRejectedValueOnce(new Error("Timed out"));
  c.workflow.autoStart(true);
  c.workflow.autoStart(true);
  await c.settle();
  expect(c.request).toHaveBeenCalledTimes(1);
  expect(c.generate).not.toHaveBeenCalled();
  expect(c.workflow.state).toMatchObject({
    stage: "failed",
    busy: false,
    message: "Page generation failed.",
  });
  expect(c.workflow.blocked).toBe(false);
  c.workflow.autoStart(true);
  c.workflow.recover();
  await c.settle();
  expect(c.request).toHaveBeenCalledTimes(1);
  expect(c.generate).not.toHaveBeenCalled();
});

it.each(["RUNNING", "FAILED", "COMPLETED"] as const)(
  "does not automatically start a %s intent",
  async (status) => {
    const c = setup();
    c.workflow.reconcile({
      prompt: "Retained prompt",
      status,
      attemptId: "old",
    });
    c.workflow.autoStart(true);
    await c.settle();
    expect(c.request).not.toHaveBeenCalled();
    expect(c.generate).not.toHaveBeenCalled();
  }
);

it("completes tagged saves and suppresses a duplicate autosave of the generated hash", async () => {
  const c = setup();
  c.generate.mockImplementation(async () => {
    c.workflow.captureDraft({ hash: "hash", history: "history" });
    return true;
  });
  c.request.mockImplementation(async (type) =>
    type === "saveLayoutSaveState"
      ? c.reply("COMPLETED", { layoutSaved: true })
      : c.reply()
  );
  c.workflow.autoStart(true);
  await c.settle();
  expect(c.workflow.state.stage).toBe("completed");
  expect(c.workflow.suppressSave("hash")).toBe(true);
  expect(c.workflow.suppressSave("manual-edit")).toBe(false);
  expect(c.workflow.suppressSave("hash")).toBe(false); // Redo must save again.
  c.workflow.autoStart(true);
  expect(c.generate).toHaveBeenCalledTimes(1);
  expect(c.request).toHaveBeenCalledTimes(3);
});

it.each([true, undefined])(
  "recovers completion only after a durable or ambiguous save (%s)",
  async (layoutSaved) => {
    const c = setup();
    c.generate.mockImplementation(async () => {
      c.workflow.captureDraft({ hash: "durable-hash", history: "history" });
      return true;
    });
    c.request.mockImplementation(async (type) => {
      if (type !== "saveLayoutSaveState") return c.reply();
      if (layoutSaved === undefined) throw new Error("Lost reply");
      return {
        status: "error",
        payload: {
          attemptId: c.request.mock.calls[0][2],
          layoutSaved,
          message: "Completion failed",
        },
      };
    });
    c.workflow.autoStart(true);
    await c.settle();
    expect(c.workflow.state.stage).toBe("recovery");
    expect(c.workflow.canRetrySave).toBe(layoutSaved !== true);
    c.request.mockImplementation(async () => c.reply("COMPLETED"));
    c.workflow.recover();
    await c.settle();
    expect(c.request.mock.calls.at(-1)![1]).toMatchObject({
      action: "complete",
      savedHash: "durable-hash",
    });
    expect(c.generate).toHaveBeenCalledTimes(1);
    expect(
      c.request.mock.calls.filter(([type]) => type === "saveLayoutSaveState")
    ).toHaveLength(1);
    expect(c.workflow.state.stage).toBe("completed");
  }
);

it("retains output and rechecks the active attempt before retrying a failed save", async () => {
  const c = setup();
  c.generate.mockImplementation(async () => {
    c.workflow.captureDraft({ hash: "hash", history: "history" });
    return true;
  });
  c.request.mockImplementation(async (type) =>
    type === "saveLayoutSaveState"
      ? {
          status: "error",
          payload: {
            attemptId: c.request.mock.calls[0][2],
            layoutSaved: false,
          },
        }
      : c.reply()
  );
  c.workflow.autoStart(true);
  await c.settle();
  c.request.mockImplementation(async () => c.reply("COMPLETED"));
  c.workflow.recover();
  await c.settle();
  expect(c.request.mock.calls.at(-1)![1]).toMatchObject({ action: "start" });
  expect(c.generate).toHaveBeenCalledTimes(1);
  expect(c.workflow.state.stage).toBe("completed");
});

it.each(["cancel", "failure"])(
  "reports %s once and releases the editor even if failure acknowledgement is lost",
  async (reason) => {
    const c = setup();
    let resolve!: (success: boolean) => void;
    c.generate.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    c.request.mockImplementation(async (_type, payload) => {
      if (payload.action === "fail") throw new Error("Fail write lost");
      return c.reply();
    });
    c.workflow.autoStart(true);
    await c.settle();
    if (reason === "cancel") c.workflow.cancel();
    resolve(false);
    await c.settle();
    expect(c.request.mock.calls.at(-1)![1]).toMatchObject({ action: "fail" });
    expect(c.workflow.state.stage).toBe("failed");
    expect(c.workflow.state.message).toBe("Page generation failed.");
    expect(c.workflow.blocked).toBe(false);
    const calls = c.request.mock.calls.length;
    c.workflow.recover();
    c.workflow.autoStart(true);
    await c.settle();
    expect(c.request).toHaveBeenCalledTimes(calls);
    expect(new Set(c.request.mock.calls.map((call) => call[2])).size).toBe(1);
    expect(c.generate).toHaveBeenCalledTimes(1);
  }
);

it("discards callbacks from superseded attempts", async () => {
  const c = setup();
  let resolve!: (success: boolean) => void;
  c.generate.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      })
  );
  c.request.mockImplementation(async () => c.reply());
  c.workflow.autoStart(true);
  await c.settle();
  c.workflow.reconcile({
    prompt: "Retained",
    status: "RUNNING",
    attemptId: "other",
  });
  c.workflow.captureDraft({ hash: "stale", history: "stale" });
  resolve(true);
  await c.settle();
  expect(c.workflow.state.stage).toBe("interrupted");
  expect(c.request).toHaveBeenCalledTimes(1);
  expect(c.cancel).toHaveBeenCalled();
});

it("stops on an invalid-layout save error without an attemptId", async () => {
  const c = setup();
  c.generate.mockImplementation(async () => {
    c.workflow.captureDraft({ hash: "hash", history: "history" });
    return true;
  });
  c.request.mockImplementation(async (type) =>
    type === "saveLayoutSaveState"
      ? { status: "error", payload: { message: "Invalid default layout" } }
      : c.reply()
  );
  c.workflow.autoStart(true);
  await c.settle();
  expect(c.workflow.state.stage).toBe("stopped");
  expect(c.workflow.suppressSave("hash")).toBe(true);
  c.workflow.recover();
  expect(c.request).toHaveBeenCalledTimes(3);
});

it("ignores repeated pending metadata from before the attempt started", async () => {
  const c = setup();
  c.workflow.reconcile({
    prompt: "Prompt",
    status: "PENDING",
    attemptId: "previous",
  });
  c.request.mockImplementation(async () => c.reply());
  let resolve!: (success: boolean) => void;
  c.generate.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      })
  );
  c.workflow.autoStart(true);
  await c.settle();
  c.workflow.reconcile({
    prompt: "Prompt",
    status: "PENDING",
    attemptId: "previous",
  });
  expect(c.workflow.state.stage).toBe("generating");
  expect(c.cancel).not.toHaveBeenCalled();
  c.workflow.dispose();
  resolve(false);
  await c.settle();
});

const interruptedGeneration = {
  prompt: "Retained prompt",
  status: "RUNNING" as const,
  attemptId: "previous",
};

it("offers recovery for unowned RUNNING metadata without taking ownership or failing it", async () => {
  const c = setup();
  for (let i = 0; i < 3; i++) {
    c.workflow.reconcile({ ...interruptedGeneration });
    c.workflow.autoStart(true);
  }
  await c.settle();
  expect(c.workflow.state).toMatchObject({
    stage: "interrupted",
    busy: false,
  });
  expect(c.workflow.canRestart).toBe(true);
  expect(c.workflow.blocked).toBe(false);
  expect(c.request).not.toHaveBeenCalled();
  expect(c.generate).not.toHaveBeenCalled();
  expect(c.cancel).not.toHaveBeenCalled();
});

it("persists one explicit restart before generating and saves with the fresh attempt identity", async () => {
  const c = setup();
  c.workflow.reconcile(interruptedGeneration);
  let acknowledge!: (reply: IntentReply) => void;
  c.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        acknowledge = resolve;
      })
  );
  c.request.mockImplementation(async (type) =>
    type === "saveLayoutSaveState"
      ? c.reply("COMPLETED", { layoutSaved: true })
      : c.reply()
  );
  let finishGeneration!: (success: boolean) => void;
  c.generate.mockImplementation(
    () =>
      new Promise((resolve) => {
        finishGeneration = resolve;
      })
  );
  c.workflow.restart();
  c.workflow.restart();
  c.workflow.reconcile({ ...interruptedGeneration });
  c.workflow.autoStart(true);
  expect(c.request).toHaveBeenCalledTimes(1);
  expect(c.workflow.restarting).toBe(true);
  expect(c.workflow.state.busy).toBe(true);
  expect(c.generate).not.toHaveBeenCalled();
  const attemptId = c.request.mock.calls[0][2];
  expect(attemptId).not.toBe("previous");
  expect(c.request.mock.calls[0].slice(0, 3)).toEqual([
    "updateIntentPageGeneration",
    {
      layoutId: "default-layout",
      attemptId,
      action: "start",
      explicitRetry: true,
    },
    attemptId,
  ]);
  acknowledge(c.reply());
  await c.settle();
  expect(c.generate).toHaveBeenCalledExactlyOnceWith("Retained prompt");
  c.workflow.reconcile({ ...interruptedGeneration, attemptId });
  c.workflow.restart();
  c.workflow.autoStart(true);
  expect(c.workflow.state.stage).toBe("generating");
  expect(c.workflow.canRestart).toBe(false);
  expect(c.request).toHaveBeenCalledTimes(1);
  c.workflow.captureDraft({ hash: "new", history: "new history" });
  finishGeneration(true);
  await c.settle();
  expect(c.workflow.state.stage).toBe("completed");
  expect(c.request.mock.calls[1][1]).not.toHaveProperty("explicitRetry");
  expect(c.request.mock.calls[2][1]).toMatchObject({
    hash: "new",
    intentPageGeneration: { layoutId: "default-layout", attemptId },
  });
});

it.each(["error", "timeout", "wrong attempt"])(
  "allows retry after a %s acknowledgment without generating",
  async (failure) => {
    const c = setup();
    c.workflow.reconcile(interruptedGeneration);
    c.request.mockImplementationOnce(async () => {
      if (failure === "timeout") throw new Error("Timed out");
      return failure === "error"
        ? { status: "error", payload: { message: "Persistence failed" } }
        : {
            status: "success",
            payload: { attemptId: "other", generation: interruptedGeneration },
          };
    });
    c.workflow.restart();
    await c.settle();
    expect(c.generate).not.toHaveBeenCalled();
    expect(c.workflow.canRestart).toBe(true);
    expect(c.workflow.state).toMatchObject({
      stage: "interrupted",
      busy: false,
      message: "Unable to restart generation. Please try again.",
    });
    c.workflow.reconcile({ ...interruptedGeneration });
    expect(c.workflow.state.message).toContain("Unable to restart");
    c.request.mockImplementationOnce(() => new Promise(() => {}));
    c.workflow.restart();
    expect(c.request).toHaveBeenCalledTimes(2);
    expect(c.request.mock.calls[1][2]).not.toBe(c.request.mock.calls[0][2]);
    expect(c.request.mock.calls[1][1].explicitRetry).toBe(true);
    c.workflow.dispose();
  }
);

it("ignores an old generation result after a replacement attempt starts", async () => {
  const c = setup();
  c.request.mockImplementation(async (_type, _payload, attemptId) => ({
    status: "success",
    payload: { attemptId, generation: { attemptId, status: "RUNNING" } },
  }));
  let finishOld!: (success: boolean) => void;
  c.generate.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishOld = resolve;
      })
  );
  c.generate.mockResolvedValue("clarification");
  c.workflow.autoStart(true);
  await c.settle();
  c.workflow.reconcile(interruptedGeneration);
  c.workflow.restart();
  await c.settle();
  expect(c.workflow.state.stage).toBe("clarification");
  finishOld(true);
  await c.settle();
  expect(c.workflow.state.stage).toBe("clarification");
  expect(c.request).toHaveBeenCalledTimes(2);
  expect(
    c.request.mock.calls.every(
      ([type, payload]) =>
        type === "updateIntentPageGeneration" && payload.action === "start"
    )
  ).toBe(true);
});

it("keeps a locally started RUNNING attempt owned during normal generation", async () => {
  const c = setup();
  c.request.mockImplementation(async () => c.reply());
  c.generate.mockImplementation(() => new Promise(() => {}));
  c.workflow.autoStart(true);
  await c.settle();
  const attemptId = c.request.mock.calls[0][2];
  for (let i = 0; i < 3; i++) {
    c.workflow.reconcile({ ...interruptedGeneration, attemptId });
    c.workflow.autoStart(true);
    c.workflow.restart();
  }
  expect(c.workflow.state.stage).toBe("generating");
  expect(c.workflow.canRestart).toBe(false);
  expect(c.request).toHaveBeenCalledTimes(1);
  expect(c.generate).toHaveBeenCalledOnce();
  c.workflow.dispose();
});

it("ignores late start acknowledgments from a superseded attempt", async () => {
  const c = setup();
  let acknowledgeOld!: (reply: IntentReply) => void;
  c.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        acknowledgeOld = resolve;
      })
  );
  c.workflow.autoStart(true);
  const oldReply = c.reply();
  c.workflow.reconcile(interruptedGeneration);
  c.request.mockImplementation(async (_type, _payload, attemptId) => ({
    status: "success",
    payload: { attemptId, generation: { attemptId, status: "RUNNING" } },
  }));
  c.generate.mockResolvedValue("clarification");
  c.workflow.restart();
  await c.settle();
  acknowledgeOld(oldReply);
  await c.settle();
  expect(c.workflow.state.stage).toBe("clarification");
  expect(c.generate).toHaveBeenCalledOnce();
  expect(c.request).toHaveBeenCalledTimes(2);
});
