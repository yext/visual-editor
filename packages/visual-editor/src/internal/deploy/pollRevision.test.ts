import { afterEach, describe, expect, it, vi } from "vitest";
import { pollRevision } from "./pollRevision.ts";
import { getSectionLibraryRevision } from "./sectionLibraryApi.ts";
import type { DeployConfig } from "./config.ts";
import ora from "ora";

vi.mock("./sectionLibraryApi.ts", () => ({
  getSectionLibraryRevision: vi.fn(),
}));

vi.mock("ora", () => {
  const spinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
  };
  spinner.start.mockReturnValue(spinner);
  return { default: vi.fn(() => spinner) };
});

const config: DeployConfig = {
  accountId: "123",
  universe: "sandbox",
  apiKey: "api-key",
  origin: "origin",
  partition: "US",
  apiHost: "https://sbx-api.yextapis.com",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("pollRevision", () => {
  it("polls every second until the build succeeds", async () => {
    vi.useFakeTimers();
    vi.mocked(getSectionLibraryRevision)
      .mockResolvedValueOnce({
        name: "revision-name",
        status: "STATUS_BUILD_PROCESSING",
        uid: "revision-uid",
      })
      .mockResolvedValueOnce({
        name: "revision-name",
        status: "STATUS_BUILD_SUCCEEDED",
        uid: "revision-uid",
      });

    const polling = pollRevision(config, "revision-name", false);
    await vi.advanceTimersByTimeAsync(2000);
    await polling;

    expect(getSectionLibraryRevision).toHaveBeenCalledTimes(2);
    expect(ora).toHaveBeenCalledWith(
      "Waiting for Section Library Revision build..."
    );
    expect(vi.mocked(ora).mock.results[0].value.succeed).toHaveBeenCalledWith(
      "Section Library Revision revision-uid build succeeded after 2s."
    );
  });
});
