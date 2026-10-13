import {
  applySpecPatch,
  createJsonRenderTransform,
  SPEC_DATA_PART_TYPE,
  type Spec,
  type StreamChunk,
} from "@json-render/core";

type FlatSpec = Spec & { elements: Record<string, any> };
type OperationContext = {
  lineNumber: number;
  operationNumber: number;
  path?: string;
  excerpt: string;
};
export type FlatPatchFailureCategory =
  "malformed_json" | "invalid_patch" | "patch_application";

/** Internal diagnostics shared by the parser and the generation repair loop. */
export class FlatPatchError extends Error {
  readonly lineNumber: number;
  readonly operationNumber: number;
  readonly path?: string;
  readonly excerpt: string;
  constructor(
    readonly category: FlatPatchFailureCategory,
    context: OperationContext,
    detail: string
  ) {
    super(
      `${category === "malformed_json" ? "Malformed JSON Patch output" : "Invalid JSON Patch"} at line ${context.lineNumber}, operation ${context.operationNumber}${context.path ? ` (${context.path})` : ""}: ${detail.slice(0, 240)}\nInvalid operation: ${context.excerpt}`
    );
    this.name = "FlatPatchError";
    this.lineNumber = context.lineNumber;
    this.operationNumber = context.operationNumber;
    this.path = context.path;
    this.excerpt = context.excerpt;
  }
}

/** Frame strict JSONL records before passing them to json-render's transform. */
export const createFlatPatchStream = (
  initial: FlatSpec,
  onText: (delta: string) => void,
  onSpec: (spec: FlatSpec) => void
) => {
  const spec = structuredClone(initial) as FlatSpec;
  const transform = createJsonRenderTransform();
  const reader = transform.readable.getReader();
  const writer = transform.writable.getWriter();
  const contexts: OperationContext[] = [];
  let failure: FlatPatchError | undefined;
  let patchCount = 0;
  let parsedOperationCount = 0;
  let operationNumber = 0;
  let lineNumber = 1;
  let pending = "";
  let proseLine = false;
  let cancelled = false;
  let closed = false;
  let nextBarrier = 0;
  const barriers = new Map<number, () => void>();
  const pump = (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        const chunk = value as StreamChunk & {
          data?: { type?: string; patch?: any };
        };
        if ((chunk as any).type === "flat-patch-barrier") {
          barriers.get((chunk as any).id)?.();
          barriers.delete((chunk as any).id);
          continue;
        }
        if (cancelled || failure) continue;
        if (chunk.type === "text-delta") onText((chunk as any).delta);
        if (chunk.type !== SPEC_DATA_PART_TYPE || chunk.data?.type !== "patch")
          continue;
        const context = contexts.shift()!;
        try {
          applySpecPatch(spec, chunk.data.patch);
          patchCount++;
          onSpec(structuredClone(spec));
        } catch (error) {
          failure = new FlatPatchError(
            "patch_application",
            context,
            String(error)
          );
        }
      }
    } finally {
      for (const resolve of barriers.values()) resolve();
      barriers.clear();
    }
  })();
  // Observe pump rejection immediately; cancel() also waits for its settlement.
  void pump.catch(() => {});
  const forward = async (delta: string) => {
    const id = ++nextBarrier;
    const barrier = new Promise<void>((resolve) => barriers.set(id, resolve));
    await writer.write({ type: "text-delta", id: "1", delta } as StreamChunk);
    await writer.write({ type: "flat-patch-barrier", id } as StreamChunk);
    await barrier;
    if (failure) throw failure;
  };
  const record = async (line: string, newline: boolean) => {
    const trimmed = line.trim();
    if (/^(?:\{|\\n\s*\{)/.test(trimmed)) {
      const pathMatch = trimmed.match(/"path"\s*:\s*("(?:\\.|[^"\\])*")/);
      let path: string | undefined;
      try {
        path = pathMatch ? JSON.parse(pathMatch[1]) : undefined;
      } catch {
        /* Invalid escapes are diagnosed by parsing the complete record below. */
      }
      const context: OperationContext = {
        lineNumber,
        operationNumber: operationNumber + 1,
        path,
        excerpt: trimmed.slice(0, 240),
      };
      let operation: any;
      try {
        operation = JSON.parse(trimmed);
      } catch (error) {
        const position = Number(
          (error as Error).message.match(/position (\d+)/)?.[1]
        );
        const start = Number.isFinite(position)
          ? Math.max(0, Math.min(trimmed.length - 240, position - 120))
          : Math.max(0, trimmed.length - 240);
        context.excerpt = trimmed.slice(start, start + 240);
        operationNumber++;
        throw (failure = new FlatPatchError(
          "malformed_json",
          context,
          String(error)
        ));
      }
      if (
        !["op", "path", "from"].some((key) => Object.hasOwn(operation, key))
      ) {
        await forward(line + (newline ? "\n" : ""));
        return;
      }
      operationNumber++;
      parsedOperationCount++;
      try {
        validatePatch(operation);
      } catch (error) {
        throw (failure = new FlatPatchError(
          "invalid_patch",
          context,
          String(error)
        ));
      }
      contexts.push(context);
      // Trimming ensures indented operations are recognized by json-render.
      await forward(trimmed + (newline ? "\n" : ""));
    } else await forward(line + (newline ? "\n" : ""));
  };
  const push = async (delta: string) => {
    if (failure) throw failure;
    const parts = delta.split("\n");
    for (let index = 0; index < parts.length; index++) {
      const newline = index < parts.length - 1;
      if (proseLine) await forward(parts[index] + (newline ? "\n" : ""));
      else {
        pending += parts[index];
        if (newline) {
          await record(pending, true);
          pending = "";
        } else if (pending.trim() && !/^[{`\\]/.test(pending.trimStart())) {
          // Prose is safe to stream immediately; JSON records wait for a complete line.
          await forward(pending);
          pending = "";
          proseLine = true;
        }
      }
      if (newline) {
        lineNumber++;
        proseLine = false;
      }
    }
  };
  const finish = async () => {
    if (failure) throw failure;
    if (pending) {
      await record(pending, false);
      pending = "";
    }
    await writer.write({ type: "text-end", id: "1" } as StreamChunk);
    await writer.close();
    closed = true;
    await pump;
    if (failure) throw failure;
    return { spec, patchCount };
  };
  const cancel = async () => {
    cancelled = true;
    await Promise.allSettled([
      ...(closed ? [] : [writer.abort(), reader.cancel()]),
      pump,
    ]);
  };
  return {
    push,
    finish,
    cancel,
    get stats() {
      return { parsedOperationCount, patchCount };
    },
  };
};

const validatePatch = (patch: any) => {
  if (!patch || typeof patch !== "object" || Array.isArray(patch))
    throw new Error("Malformed JSON Patch operation");
  if (!["add", "remove", "replace", "move", "copy", "test"].includes(patch.op))
    throw new Error("Unsupported JSON Patch operation");
  validatePointer(patch.path);
  const expectedKeys = [
    "op",
    "path",
    ...(patch.op === "add" || patch.op === "replace" || patch.op === "test"
      ? ["value"]
      : []),
    ...(patch.op === "move" || patch.op === "copy" ? ["from"] : []),
  ];
  if (
    Object.keys(patch).some((key) => !expectedKeys.includes(key)) ||
    expectedKeys.some((key) => !Object.hasOwn(patch, key))
  )
    throw new Error(`Malformed JSON Patch ${patch.op} operation`);
  if (patch.op === "move" || patch.op === "copy") validatePointer(patch.from);
  rejectDangerousKeys(patch.value);
};

const validatePointer = (pointer: unknown) => {
  if (
    typeof pointer !== "string" ||
    (pointer !== "" && !pointer.startsWith("/"))
  )
    throw new Error("Malformed JSON Pointer");
  for (const segment of pointer === "" ? [] : pointer.slice(1).split("/")) {
    if (/~(?![01])/.test(segment))
      throw new Error("Malformed JSON Pointer escape");
    const decoded = segment.replace(/~[01]/g, (part) =>
      part === "~1" ? "/" : "~"
    );
    if (["__proto__", "prototype", "constructor"].includes(decoded))
      throw new Error("Reserved prototype property in JSON Pointer");
  }
};

const rejectDangerousKeys = (value: unknown, seen = new WeakSet<object>()) => {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (!Array.isArray(value)) {
    for (const key of Object.keys(value)) {
      if (["__proto__", "prototype", "constructor"].includes(key))
        throw new Error(`Reserved prototype property ${key} in patch value`);
      rejectDangerousKeys((value as Record<string, unknown>)[key], seen);
    }
  } else value.forEach((child) => rejectDangerousKeys(child, seen));
};
