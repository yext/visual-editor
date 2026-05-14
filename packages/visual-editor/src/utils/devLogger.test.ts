import { beforeEach, describe, expect, it, vi } from "vitest";
import { DevLogger } from "./devLogger.ts";

describe("DevLogger", () => {
  beforeEach(() => {
    new DevLogger().enable(false);
    vi.restoreAllMocks();
  });

  it("buffers logs until debug is enabled and then flushes them", () => {
    const consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    const devLogger = new DevLogger();

    devLogger.logData("ENTITY_FIELDS", { fields: [] });

    expect(consoleLogSpy).not.toHaveBeenCalled();

    devLogger.enable(true);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      "[DEBUG] xYextDebug enabled"
    );
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      2,
      "[DEBUG]",
      "ENTITY_FIELDS",
      "-",
      {
        fields: [],
      }
    );
  });

  it("does not disable logging when a new DevLogger is created after enable", () => {
    const consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    const firstLogger = new DevLogger();

    firstLogger.enable(true);
    consoleLogSpy.mockClear();

    const secondLogger = new DevLogger();
    secondLogger.log("still enabled");

    expect(consoleLogSpy).toHaveBeenCalledWith("[DEBUG]", "still enabled");
  });
});
