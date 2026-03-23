const SIZE_DEBUG_PREFIX = "[SIZE_DEBUG]";

type SizeDebugOptions = {
  contentCount?: number | null;
  notes?: string | null;
};

type PerformanceWithMemory = Performance & {
  memory?: {
    usedJSHeapSize?: number;
  };
};

const textEncoder =
  typeof TextEncoder !== "undefined" ? new TextEncoder() : undefined;

const utf8ByteLength = (value: string): number => {
  if (textEncoder) {
    return textEncoder.encode(value).length;
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.byteLength(value, "utf8");
  }

  return unescape(encodeURIComponent(value)).length;
};

const safeSerialize = (
  value: unknown
): {
  serialized: string | null;
  notes?: string;
} => {
  try {
    return {
      serialized: JSON.stringify(value),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      serialized: null,
      notes: `serialization_failed:${message}`,
    };
  }
};

const heapUsedBytes = (): number | null => {
  try {
    if (
      typeof process !== "undefined" &&
      typeof process.memoryUsage === "function"
    ) {
      return process.memoryUsage().heapUsed;
    }
  } catch {
    // ignore heap sampling failures
  }

  try {
    if (typeof performance !== "undefined") {
      const usedHeap = (performance as PerformanceWithMemory).memory
        ?.usedJSHeapSize;
      if (typeof usedHeap === "number") {
        return usedHeap;
      }
    }
  } catch {
    // ignore heap sampling failures
  }

  return null;
};

const layoutContentCount = (value: unknown): number | null => {
  if (
    value &&
    typeof value === "object" &&
    "content" in value &&
    Array.isArray((value as { content?: unknown[] }).content)
  ) {
    return (value as { content: unknown[] }).content.length;
  }

  return null;
};

const joinNotes = (
  ...notes: Array<string | null | undefined>
): string | undefined => {
  const filteredNotes = notes.filter((note): note is string => !!note);
  if (filteredNotes.length === 0) {
    return undefined;
  }

  return filteredNotes.join("; ");
};

const measurePayload = (
  payload: unknown
): {
  bytes: number | null;
  contentCount: number | null;
  notes?: string;
} => {
  if (typeof payload === "string") {
    return {
      bytes: utf8ByteLength(payload),
      contentCount: null,
    };
  }

  const { serialized, notes } = safeSerialize(payload);
  if (serialized === null) {
    return {
      bytes: null,
      contentCount: layoutContentCount(payload),
      notes,
    };
  }

  return {
    bytes: utf8ByteLength(serialized),
    contentCount: layoutContentCount(payload),
    notes,
  };
};

export const createSizeDebugLogger = (
  template: string,
  locale?: string | null
) => {
  let previousBytes: number | null = null;

  return {
    log(stage: string, payload: unknown, options?: SizeDebugOptions) {
      try {
        const measurement = measurePayload(payload);
        const currentHeapUsedBytes = heapUsedBytes();
        const payloadBytes = measurement.bytes;

        console.log(SIZE_DEBUG_PREFIX, {
          template,
          stage,
          locale: locale ?? null,
          layoutBytes: payloadBytes,
          deltaBytesFromPreviousStage:
            previousBytes === null || payloadBytes === null
              ? null
              : payloadBytes - previousBytes,
          contentCount: options?.contentCount ?? measurement.contentCount,
          heapUsedBytes: currentHeapUsedBytes,
          notes: joinNotes(
            measurement.notes,
            currentHeapUsedBytes === null ? "heap_unavailable" : undefined,
            options?.notes
          ),
        });

        if (payloadBytes !== null) {
          previousBytes = payloadBytes;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(SIZE_DEBUG_PREFIX, {
          template,
          stage,
          locale: locale ?? null,
          layoutBytes: null,
          deltaBytesFromPreviousStage: null,
          contentCount: options?.contentCount ?? null,
          heapUsedBytes: null,
          notes: `logging_failed:${message}`,
        });
      }
    },
  };
};
