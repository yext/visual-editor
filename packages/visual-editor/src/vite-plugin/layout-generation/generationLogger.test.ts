// @vitest-environment node
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { createGenerationLogger } from "./generationLogger.ts";

it("buffers entries for ten seconds using the first timestamp as the filename", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "generation-logs-"));
  vi.useFakeTimers();
  const log = createGenerationLogger(path.join(directory, ".generated/logs"));
  try {
    expect(readdirSync(directory)).toEqual([]);
    vi.setSystemTime(new Date("2026-10-12T12:00:00.123Z"));
    log("Request", { correlationId: "one", body: { input: "hello\nworld" } });
    vi.setSystemTime(new Date("2026-10-12T12:00:01.000Z"));
    log("Response", { correlationId: "two", usage: { output_tokens: 2 } });
    expect(readdirSync(directory)).toEqual([]);
    await vi.advanceTimersByTimeAsync(9_999);
    expect(readdirSync(directory)).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    await log.flush();
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
    await log.close();
    vi.useRealTimers();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("flushes pending entries on close and stops its timer", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "generation-logs-"));
  vi.useFakeTimers();
  const log = createGenerationLogger(directory);
  try {
    log("Before close", {});
    await log.close();
    expect(vi.getTimerCount()).toBe(0);
    const filename = readdirSync(directory)[0];
    expect(readFileSync(path.join(directory, filename), "utf8")).toContain(
      "Before close"
    );
    log("After close", {});
    await log.flush();
    expect(readFileSync(path.join(directory, filename), "utf8")).not.toContain(
      "After close"
    );
  } finally {
    await log.close();
    vi.useRealTimers();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("reports disk errors without failing generation", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "generation-logs-"));
  const report = vi.spyOn(console, "error").mockImplementation(() => {});
  const log = createGenerationLogger(path.join(directory, "blocked"));
  try {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(path.join(directory, "blocked"), "file");
    log("Request", {});
    await expect(log.close()).resolves.toBeUndefined();
    expect(report).toHaveBeenCalledOnce();
  } finally {
    await log.close();
    report.mockRestore();
    rmSync(directory, { recursive: true, force: true });
  }
});
