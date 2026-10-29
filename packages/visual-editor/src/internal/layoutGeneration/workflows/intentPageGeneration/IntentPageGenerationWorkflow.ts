import type { IntentPageGeneration } from "../../../types/templateMetadata.ts";
import {
  sendIntentRequest,
  type IntentReply,
} from "../../transport/intentPageGenerationTransport.ts";

type IntentDraft = { hash: string; history: string };
export type IntentGenerationResult = boolean | "clarification";
type Recovery = "save" | "complete";
type Operation = "start" | "fail" | Recovery;
type Stage =
  | "idle"
  | "interrupted"
  | "starting"
  | "generating"
  | "clarification"
  | "saving"
  | "failed"
  | "completed"
  | "recovery"
  | "stopped";
type IntentState = { stage: Stage; message?: string; busy: boolean };
type Attempt = {
  id: string;
  prompt: string;
  previousAttemptId?: string;
  explicitRetry?: boolean;
  cancelled: boolean;
  draft?: IntentDraft;
  saveOutcome?: "unknown" | "saved" | "unsaved";
  recovery?: Recovery;
};

/** Session-local orchestration; the parent remains the durable source of truth. */
export class IntentPageGenerationWorkflow {
  state: IntentState = { stage: "idle", busy: false };
  private listeners = new Set<() => void>();
  private attempt?: Attempt;
  private attempted = false;
  private assistantOpened = false;
  private controller?: AbortController;
  private savedHash?: string;
  private generation?: IntentPageGeneration;
  constructor(
    private layoutId: string | undefined,
    private generate: (
      prompt: string,
      continuation?: boolean
    ) => Promise<IntentGenerationResult>,
    private cancelGeneration: () => void,
    private request = sendIntentRequest
  ) {}
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.state;
  openAssistantOnce = () => {
    if (this.assistantOpened) return false;
    this.assistantOpened = true;
    return true;
  };
  private update(stage: Stage, busy = false, message?: string) {
    this.state = { stage, busy, message };
    this.listeners.forEach((listener) => listener());
  }
  get canRetrySave() {
    return (
      this.state.stage === "recovery" &&
      !!this.attempt?.draft &&
      this.attempt.saveOutcome !== "saved"
    );
  }
  get canRestart() {
    return (
      this.state.stage === "interrupted" &&
      this.generation?.status === "RUNNING" &&
      this.layoutId !== undefined &&
      !!this.generation.prompt?.trim()
    );
  }
  get restarting() {
    return this.state.stage === "starting" && !!this.attempt?.explicitRetry;
  }
  get recoveryAction() {
    return this.attempt?.recovery;
  }
  get blocked() {
    return (
      !!this.attempt &&
      !["failed", "completed", "stopped"].includes(this.state.stage)
    );
  }
  suppressSave = (hash?: string) => {
    if (this.blocked) return true;
    // Once history moves away, undo/redo must save normally again.
    if (hash !== this.savedHash) this.savedHash = undefined;
    return !!hash && hash === this.savedHash;
  };
  captureDraft = (draft: IntentDraft) => {
    if (
      this.state.stage === "generating" &&
      this.attempt &&
      !this.attempt.cancelled
    ) {
      this.attempt.draft = draft;
    }
  };
  reconcile(generation?: IntentPageGeneration) {
    this.generation = generation;
    const attempt = this.attempt;
    if (!attempt) {
      if (generation?.status === "RUNNING") {
        if (this.state.stage !== "interrupted") this.interrupted();
      } else if (this.state.stage === "interrupted") {
        this.update("idle");
      }
      return;
    }
    if (!generation?.attemptId) return;
    if (this.state.stage === "completed" && generation.attemptId === attempt.id)
      return;
    // Parent metadata can repeat the pending state from before this attempt started.
    if (generation.attemptId === attempt.previousAttemptId) return;
    if (generation.attemptId !== attempt.id || generation.status === "FAILED") {
      this.stop(
        generation.status === "FAILED"
          ? "Page generation failed."
          : "Page generation stopped."
      );
      if (generation.status === "RUNNING") this.interrupted();
    } else if (generation.status === "COMPLETED") {
      this.finish(attempt);
    }
  }
  private interrupted(message?: string) {
    this.update("interrupted", false, message);
  }
  restart = () => {
    const generation = this.generation;
    if (!this.canRestart || this.state.busy || !generation?.prompt) return;
    this.attempted = true;
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      prompt: generation.prompt,
      previousAttemptId: generation.attemptId,
      explicitRetry: true,
      cancelled: false,
    };
    this.attempt = attempt;
    void this.perform(attempt, "start");
  };
  autoStart(ready: boolean) {
    if (
      !ready ||
      this.attempted ||
      this.generation?.status !== "PENDING" ||
      this.layoutId === undefined ||
      !this.generation.prompt?.trim()
    )
      return;
    this.attempted = true; // Synchronous guard, before any await or React update.
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      prompt: this.generation.prompt,
      previousAttemptId: this.generation.attemptId,
      cancelled: false,
    };
    this.attempt = attempt;
    void this.perform(attempt, "start");
  }
  recover = () => {
    const attempt = this.attempt;
    if (
      attempt?.recovery &&
      !this.state.busy &&
      this.state.stage === "recovery"
    ) {
      void this.perform(attempt, attempt.recovery);
    }
  };
  cancel = () => {
    const attempt = this.attempt;
    if (!attempt || !["generating", "clarification"].includes(this.state.stage))
      return;
    attempt.cancelled = true;
    this.cancelGeneration();
    if (this.state.stage === "clarification")
      void this.perform(attempt, "fail");
    // The generation promise settles before fail is sent, keeping lifecycle calls serial.
  };
  dispose = () => {
    this.controller?.abort();
    if (this.attempt) this.attempt.cancelled = true;
    this.attempt = undefined;
    this.cancelGeneration();
  };
  private active(attempt: Attempt) {
    return this.attempt === attempt;
  }
  private stop(message: string, stage: "stopped" | "failed" = "stopped") {
    this.savedHash = this.attempt?.draft?.hash;
    this.dispose();
    this.update(stage, false, message);
  }
  private finish(attempt: Attempt) {
    if (!this.active(attempt)) return;
    this.savedHash = attempt.draft?.hash;
    this.controller?.abort();
    this.cancelGeneration();
    this.update("completed");
  }
  private async lifecycle(
    attempt: Attempt,
    action: "start" | "fail" | "complete",
    explicitRetry = false
  ) {
    const reply = await this.request(
      "updateIntentPageGeneration",
      {
        attemptId: attempt.id,
        layoutId: this.layoutId,
        action,
        ...(explicitRetry ? { explicitRetry: true } : {}),
        ...(action === "complete" ? { savedHash: attempt.draft?.hash } : {}),
      },
      attempt.id,
      this.controller!.signal
    );
    if (
      reply.status === "success" &&
      (reply.payload?.attemptId !== attempt.id ||
        reply.payload.generation?.attemptId !== attempt.id)
    ) {
      throw new Error("The parent replied for a different intent attempt.");
    }
    return reply;
  }
  private validate(reply: IntentReply, attempt: Attempt, expected: string) {
    const generation = reply.payload?.generation;
    if (
      reply.status !== "success" ||
      generation?.attemptId !== attempt.id ||
      generation.status !== expected
    ) {
      throw new Error(
        reply.payload?.message ??
          "The parent has not confirmed the expected generation state."
      );
    }
  }
  /** Handle terminal start/recheck replies before generating or saving output. */
  private confirmRunning(reply: IntentReply, attempt: Attempt) {
    if (!this.active(attempt)) return false;
    if (reply.status === "success") {
      if (reply.payload?.generation?.status === "COMPLETED") {
        this.finish(attempt);
        return false;
      }
      if (reply.payload?.generation?.status === "FAILED") {
        this.stop("Page generation failed.");
        return false;
      }
    }
    this.validate(reply, attempt, "RUNNING");
    return true;
  }
  answer = async (prompt: string) => {
    const attempt = this.attempt;
    if (!attempt || this.state.stage !== "clarification" || !prompt.trim())
      return;
    const operation = await this.generateAttempt(attempt, prompt, true);
    if (operation) await this.perform(attempt, operation);
  };
  private async generateAttempt(
    attempt: Attempt,
    prompt: string,
    continuation = false
  ): Promise<"save" | "fail" | undefined> {
    this.update("generating", true);
    let result: IntentGenerationResult = false;
    try {
      result = await (continuation
        ? this.generate(prompt, true)
        : this.generate(prompt));
    } catch {
      // Persist actual generation failures using the current attempt identity.
    }
    if (!this.active(attempt) || this.state.stage === "completed") return;
    if (result === "clarification" && !attempt.cancelled) {
      this.update("clarification");
      return;
    }
    return result === true && !attempt.cancelled && attempt.draft
      ? "save"
      : "fail";
  }
  private async perform(attempt: Attempt, operation: Operation) {
    this.controller = new AbortController();
    attempt.recovery =
      operation === "save" || operation === "complete" ? operation : undefined;
    this.update(operation === "start" ? "starting" : "saving", true);
    try {
      if (operation === "start") {
        const reply = await this.lifecycle(
          attempt,
          "start",
          attempt.explicitRetry
        );
        if (!this.confirmRunning(reply, attempt)) return;
        const outcome = await this.generateAttempt(attempt, attempt.prompt);
        if (!outcome) return;
        operation = outcome;
        attempt.recovery = operation === "save" ? operation : undefined;
      }
      if (operation === "fail") {
        const reply = await this.lifecycle(attempt, "fail");
        if (!this.active(attempt)) return;
        this.validate(reply, attempt, "FAILED");
        this.update(
          "failed",
          false,
          attempt.cancelled
            ? "Page generation stopped."
            : "Page generation failed."
        );
        return;
      }
      if (operation === "save") {
        // Reconcile identity before every save, including retries of retained output.
        const current = await this.lifecycle(attempt, "start");
        if (!this.confirmRunning(current, attempt)) return;
        attempt.recovery = "complete"; // An unanswered save has an ambiguous durable outcome.
        attempt.saveOutcome = "unknown";
        this.update("saving", true);
        const reply = await this.request(
          "saveLayoutSaveState",
          {
            ...attempt.draft,
            intentPageGeneration: {
              attemptId: attempt.id,
              layoutId: this.layoutId,
            },
          },
          attempt.id,
          this.controller.signal
        );
        if (!this.active(attempt)) return;
        if (!reply.payload?.attemptId) {
          this.stop(
            reply.payload?.message ??
              "This layout cannot save intent generation."
          );
          return;
        }
        if (reply.payload.layoutSaved === false) {
          attempt.recovery = "save";
          attempt.saveOutcome = "unsaved";
        } else if (reply.payload.layoutSaved === true) {
          attempt.saveOutcome = "saved";
        }
        if (reply.status === "error")
          throw new Error(
            reply.payload.message ?? "Unable to save the generated layout."
          );
        if (reply.payload.layoutSaved !== true)
          throw new Error("The parent has not confirmed the draft save.");
        this.validate(reply, attempt, "COMPLETED");
        this.finish(attempt);
        return;
      }
      if (operation === "complete") {
        const reply = await this.lifecycle(attempt, "complete");
        if (!this.active(attempt)) return;
        this.validate(reply, attempt, "COMPLETED");
        this.finish(attempt);
      }
    } catch (error) {
      if (!this.active(attempt) || this.state.stage === "completed") return;
      if (operation === "start" || operation === "fail") {
        if (operation === "start" && attempt.explicitRetry) {
          this.dispose();
          this.interrupted("Unable to restart generation. Please try again.");
          return;
        }
        this.stop("Page generation failed.", "failed");
        return;
      }
      this.update(
        "recovery",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
  /** Available after completion recovery fails: verify RUNNING again before resaving. */
  retrySave = () => {
    if (this.canRetrySave && this.attempt && !this.state.busy) {
      void this.perform(this.attempt, "save");
    }
  };
}
