// @vitest-environment node
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { createGenerationLogger } from "./generationLogger.ts";

it("creates a log lazily and appends entries using the first timestamp as the filename", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "generation-logs-"));
  vi.useFakeTimers();
  try {
    const log = createGenerationLogger(path.join(directory, ".generated/logs"));
    expect(readdirSync(directory)).toEqual([]);
    vi.setSystemTime(new Date("2026-10-12T12:00:00.123Z"));
    log("Request", { correlationId: "one", body: { input: "hello\nworld" } });
    vi.setSystemTime(new Date("2026-10-12T12:00:01.000Z"));
    log("Response", { correlationId: "two", usage: { output_tokens: 2 } });
    const logDirectory = path.join(directory, ".generated/logs");
    expect(readdirSync(logDirectory)).toEqual(["2026-10-12T12-00-00.123Z.log"]);
    const entries = readFileSync(
      path.join(logDirectory, readdirSync(logDirectory)[0]),
      "utf8"
    )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(entries).toEqual([
      {
        timestamp: "2026-10-12T12:00:00.123Z",
        message: "Request",
        correlationId: "one",
        body: { input: "hello\nworld" },
      },
      {
        timestamp: "2026-10-12T12:00:01.000Z",
        message: "Response",
        correlationId: "two",
        usage: { output_tokens: 2 },
      },
    ]);
  } finally {
    vi.useRealTimers();
    rmSync(directory, { recursive: true, force: true });
  }
});
