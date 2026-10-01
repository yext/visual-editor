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
    text: "",
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
const revisionId = "019c9cb5-0bc5-76cd-848c-25657b850a8f";
const revisionName = `accounts/123/sectionLibraries/test-library/revisions/${revisionId}`;

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("pollRevision", () => {
  it.each([
    { isInteractive: true, intervalMs: 10_000 },
    { isInteractive: false, intervalMs: 30_000 },
  ])(
    "polls every $intervalMs ms with isInteractive=$isInteractive",
    async ({ isInteractive, intervalMs }) => {
      vi.useFakeTimers();
      vi.mocked(getSectionLibraryRevision)
        .mockResolvedValueOnce({
          name: revisionName,
          status: "STATUS_BUILD_PROCESSING",
        })
        .mockResolvedValueOnce({
          name: revisionName,
          status: "STATUS_BUILD_SUCCEEDED",
        });

      const polling = pollRevision(config, revisionName, false, isInteractive);
      const spinner = vi.mocked(ora).mock.results[0].value;
      await vi.advanceTimersByTimeAsync(1000);
      expect(spinner.text).toContain("1s elapsed");
      expect(getSectionLibraryRevision).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(spinner.text).toContain("2s elapsed");
      await vi.advanceTimersByTimeAsync(intervalMs - 2001);
      expect(getSectionLibraryRevision).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      await polling;

      expect(getSectionLibraryRevision).toHaveBeenCalledTimes(2);
      expect(vi.getTimerCount()).toBe(0);
      expect(ora).toHaveBeenCalledWith(
        "Waiting for Section Library Revision build..."
      );
      expect(vi.mocked(ora).mock.results[0].value.succeed).toHaveBeenCalledWith(
        `Section Library Revision ${revisionId} build succeeded after ${intervalMs / 1000}s.`
      );
    }
  );

  it("stops refreshing the spinner when a status request fails", async () => {
    vi.useFakeTimers();
    vi.mocked(getSectionLibraryRevision).mockRejectedValueOnce(
      new Error("Request failed")
    );

    await expect(
      pollRevision(config, revisionName, false, false)
    ).rejects.toThrow("Request failed");

    expect(vi.getTimerCount()).toBe(0);
    expect(vi.mocked(ora).mock.results[0].value.fail).toHaveBeenCalledWith(
      "Section Library Revision build failed."
    );
  });

  it("rejects when the build reaches an unsuccessful terminal status", async () => {
    vi.useFakeTimers();
    vi.mocked(getSectionLibraryRevision).mockResolvedValueOnce({
      name: revisionName,
      status: "STATUS_BUILD_FAILURE",
    });

    const polling = pollRevision(config, revisionName, false, true);
    const rejection = expect(polling).rejects.toThrow(
      "Section Library Revision failed with status STATUS_BUILD_FAILURE."
    );
    await rejection;
    expect(vi.getTimerCount()).toBe(0);

    const spinner = vi.mocked(ora).mock.results[0]?.value;
    expect(spinner.fail).toHaveBeenCalledWith(
      "Section Library Revision failed with status STATUS_BUILD_FAILURE."
    );
  });
});
