import {
  GENERATION_LOG_FLUSH_INTERVAL_MS,
  GENERATION_LOG_BUFFER_MAX_BYTES,
} from "../../internal/layoutGeneration/limits.ts";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/** One JSONL file per server session, named for its first log entry. */
export const createGenerationLogger = (directory: string) => {
  let filename: string | undefined;
  let pending = "";
  let pendingBytes = 0;
  let writes = Promise.resolve();
  let timer: ReturnType<typeof setInterval> | undefined;
  let closed = false;
  const flush = () => {
    if (!pending || !filename) {
      return writes;
    }
    const batch = pending;
    const target = filename;
    pending = "";
    pendingBytes = 0;
    writes = writes
      .then(async () => {
        await mkdir(directory, { recursive: true });
        await appendFile(target, batch, "utf8");
      })
      .catch((error) =>
        console.error("Unable to write generation log:", error)
      );
    return writes;
  };
  const log = (message: string, details: object) => {
    if (closed) {
      return;
    }
    const timestamp = new Date().toISOString();
    if (!filename) {
      filename = path.join(directory, timestamp.replaceAll(":", "-") + ".log");
      timer = setInterval(() => void flush(), GENERATION_LOG_FLUSH_INTERVAL_MS);
      timer.unref();
    }
    const line = JSON.stringify({ timestamp, message, ...details }) + "\n";
    pending += line;
    pendingBytes += Buffer.byteLength(line);
    // Flush oversized batches early to keep the active buffer bounded.
    if (pendingBytes >= GENERATION_LOG_BUFFER_MAX_BYTES) {
      void flush();
    }
  };
  return Object.assign(log, {
    flush,
    close: () => {
      closed = true;
      clearInterval(timer);
      return flush();
    },
  });
};
