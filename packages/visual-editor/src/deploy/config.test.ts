import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import prompts from "prompts";
import { execFileSync } from "node:child_process";
import { resolveConfig } from "./config.ts";
import { defaultPromptOpts } from "./prompt.ts";
import { readYextrc } from "./yextrc.ts";

vi.mock("prompts");
const mockPrompts = vi.mocked(prompts);

function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yextrc-test-"));
  execFileSync("git", ["init", "--quiet", dir]);
  execFileSync("git", [
    "-C",
    dir,
    "remote",
    "add",
    "origin",
    "git@github.com:yext/visual-editor.git",
  ]);
  execFileSync("git", [
    "-C",
    dir,
    "remote",
    "add",
    "upstream",
    "git@github.com:yext/visual-editor-upstream.git",
  ]);
  return dir;
}

function seedYextrc(dir: string, contents: string): void {
  fs.writeFileSync(path.join(dir, ".yextrc"), contents);
}

const FULL_YEXTRC =
  "accountId: '9'\nuniverse: sandbox\napiKey: filekey\norigin: origin\n";

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.YEXT_ACCOUNT_ID;
  delete process.env.YEXT_UNIVERSE;
  delete process.env.YEXT_API_KEY;
  process.env.YEXT_ORIGIN = "origin";
  mockPrompts.mockResolvedValue({ value: false });
});

describe("resolveConfig", () => {
  it("offers to save an environment-derived configuration", async () => {
    process.env.YEXT_ACCOUNT_ID = "111";
    process.env.YEXT_UNIVERSE = "sandbox";
    process.env.YEXT_API_KEY = "envkey1234";
    const dir = tmpDir();

    const config = await resolveConfig(dir);

    expect(config).toEqual({
      accountId: "111",
      universe: "sandbox",
      apiKey: "envkey1234",
      origin: "origin",
      partition: "US",
      apiHost: "https://sbx-api.yextapis.com",
    });
    expect(mockPrompts).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(path.join(dir, ".yextrc"))).toBe(false);
  });

  it("prompts to select and saves a Git remote when one is not configured", async () => {
    delete process.env.YEXT_ORIGIN;
    process.env.YEXT_ACCOUNT_ID = "111";
    process.env.YEXT_UNIVERSE = "sandbox";
    process.env.YEXT_API_KEY = "envkey1234";
    const dir = tmpDir();
    mockPrompts
      .mockResolvedValueOnce({ value: "upstream" })
      .mockResolvedValueOnce({ value: true });

    const config = await resolveConfig(dir);

    expect(mockPrompts).toHaveBeenCalledWith(
      {
        type: "select",
        name: "value",
        message: "Git remote",
        choices: [
          {
            title: "origin: git@github.com:yext/visual-editor.git",
            value: "origin",
          },
          {
            title: "upstream: git@github.com:yext/visual-editor-upstream.git",
            value: "upstream",
          },
        ],
        initial: 0,
      },
      defaultPromptOpts
    );
    expect(config.origin).toBe("upstream");
    expect(readYextrc(dir)).toEqual({
      accountId: "111",
      universe: "sandbox",
      apiKey: "envkey1234",
      origin: "upstream",
    });
  });

  it("shows existing .yextrc values and uses them when the user declines to change", async () => {
    const dir = tmpDir();
    seedYextrc(dir, FULL_YEXTRC);
    mockPrompts.mockResolvedValueOnce({ value: false }); // "enter different?" -> no

    const config = await resolveConfig(dir);

    expect(mockPrompts).toHaveBeenCalledTimes(1);
    expect(config.accountId).toBe("9");
    expect(config.universe).toBe("sandbox");
    expect(config.apiKey).toBe("filekey");
  });

  it("lets env vars override .yextrc", async () => {
    process.env.YEXT_UNIVERSE = "production";
    process.env.YEXT_API_KEY = "envkey";
    const dir = tmpDir();
    seedYextrc(dir, FULL_YEXTRC);
    mockPrompts.mockResolvedValueOnce({ value: false }); // decline to change

    const config = await resolveConfig(dir);

    expect(config.universe).toBe("production");
    expect(config.apiKey).toBe("envkey");
    expect(config.accountId).toBe("9");
  });

  it("re-prompts (auto-filled) and updates .yextrc when the user chooses new values", async () => {
    const dir = tmpDir();
    seedYextrc(dir, FULL_YEXTRC);
    mockPrompts
      .mockResolvedValueOnce({ value: true }) // enter different? -> yes
      .mockResolvedValueOnce({ value: "222" }) // account
      .mockResolvedValueOnce({ value: "production" }) // universe
      .mockResolvedValueOnce({ value: "newkey" }) // apiKey
      .mockResolvedValueOnce({ value: "origin" }) // Git remote
      .mockResolvedValueOnce({ value: true }); // update .yextrc? -> yes

    const config = await resolveConfig(dir);

    expect(config).toEqual({
      accountId: "222",
      universe: "production",
      apiKey: "newkey",
      origin: "origin",
      partition: "US",
      apiHost: "https://api.yextapis.com",
    });
    expect(readYextrc(dir)).toEqual({
      accountId: "222",
      universe: "production",
      apiKey: "newkey",
      origin: "origin",
    });
  });

  it("does not prompt for a universe supplied by the environment", async () => {
    process.env.YEXT_UNIVERSE = "production";
    const dir = tmpDir();
    seedYextrc(dir, FULL_YEXTRC);
    mockPrompts
      .mockResolvedValueOnce({ value: true })
      .mockResolvedValueOnce({ value: "222" })
      .mockResolvedValueOnce({ value: "newkey" })
      .mockResolvedValueOnce({ value: "origin" })
      .mockResolvedValueOnce({ value: false });

    const config = await resolveConfig(dir);

    expect(config.universe).toBe("production");
    expect(mockPrompts).not.toHaveBeenCalledWith(
      expect.objectContaining({ message: "Yext environment" })
    );
  });

  it("uses new values but does not persist them when the save is declined", async () => {
    const dir = tmpDir();
    seedYextrc(dir, FULL_YEXTRC);
    mockPrompts
      .mockResolvedValueOnce({ value: true }) // enter different? -> yes
      .mockResolvedValueOnce({ value: "222" })
      .mockResolvedValueOnce({ value: "production" })
      .mockResolvedValueOnce({ value: "newkey" })
      .mockResolvedValueOnce({ value: "origin" })
      .mockResolvedValueOnce({ value: false }); // update .yextrc? -> no

    const config = await resolveConfig(dir);

    expect(config.accountId).toBe("222");
    // .yextrc is unchanged.
    expect(readYextrc(dir)).toEqual({
      accountId: "9",
      universe: "sandbox",
      apiKey: "filekey",
      origin: "origin",
    });
  });

  it("prompts for missing values and persists them when the save is confirmed", async () => {
    const dir = tmpDir();
    mockPrompts
      .mockResolvedValueOnce({ value: "111" }) // account
      .mockResolvedValueOnce({ value: "production" }) // universe
      .mockResolvedValueOnce({ value: "secretkey" }) // apiKey
      .mockResolvedValueOnce({ value: true }); // save? -> yes

    const config = await resolveConfig(dir);

    expect(config).toEqual({
      accountId: "111",
      universe: "production",
      apiKey: "secretkey",
      origin: "origin",
      partition: "US",
      apiHost: "https://api.yextapis.com",
    });
    expect(readYextrc(dir)).toEqual({
      accountId: "111",
      universe: "production",
      apiKey: "secretkey",
      origin: "origin",
    });
  });

  it("does not persist prompted values when the save is declined", async () => {
    const dir = tmpDir();
    mockPrompts
      .mockResolvedValueOnce({ value: "111" })
      .mockResolvedValueOnce({ value: "production" })
      .mockResolvedValueOnce({ value: "secretkey" })
      .mockResolvedValueOnce({ value: false }); // save? -> no

    const config = await resolveConfig(dir);

    expect(config.accountId).toBe("111");
    expect(fs.existsSync(path.join(dir, ".yextrc"))).toBe(false);
  });

  it("only prompts for (and persists) the missing value", async () => {
    process.env.YEXT_UNIVERSE = "sandbox";
    process.env.YEXT_API_KEY = "envkey";
    const dir = tmpDir();
    mockPrompts
      .mockResolvedValueOnce({ value: "333" }) // account only
      .mockResolvedValueOnce({ value: true }); // save? -> yes

    const config = await resolveConfig(dir);

    expect(config.accountId).toBe("333");
    expect(readYextrc(dir)).toEqual({
      accountId: "333",
      universe: "sandbox",
      apiKey: "envkey",
      origin: "origin",
    });
  });

  it("throws when a required prompt is cancelled", async () => {
    mockPrompts.mockResolvedValueOnce({}); // user cancelled account prompt
    await expect(resolveConfig(tmpDir())).rejects.toThrow(
      /Account ID is required/
    );
  });

  it.each(["0", "-1", "1.5", "abc", "12a"])(
    "throws on a non-positive-integer account ID %j",
    async (accountId) => {
      process.env.YEXT_ACCOUNT_ID = accountId;
      process.env.YEXT_UNIVERSE = "sandbox";
      process.env.YEXT_API_KEY = "k";
      await expect(resolveConfig(tmpDir())).rejects.toThrow(
        /must be a positive integer/
      );
    }
  );

  it.each([
    // [accountId, expected partition, expected production host]
    ["9", "US", "https://api.yextapis.com"],
    ["223456789", "US", "https://api.yextapis.com"], // hundred-millions digit = 2
    ["1000000000", "US", "https://api.yextapis.com"], // digit rolls over to 0
    ["123456789", "EU", "https://api.eu.yextapis.com"], // hundred-millions digit = 1
    ["199999999", "EU", "https://api.eu.yextapis.com"],
  ])(
    "derives partition from account ID %j -> %s",
    async (accountId, partition, apiHost) => {
      process.env.YEXT_ACCOUNT_ID = accountId;
      process.env.YEXT_UNIVERSE = "production";
      process.env.YEXT_API_KEY = "k";
      const config = await resolveConfig(tmpDir());
      expect(config.partition).toBe(partition);
      expect(config.apiHost).toBe(apiHost);
    }
  );

  it("throws when the partition + universe combination has no host", async () => {
    // 123456789 is an EU account; EU only supports production.
    process.env.YEXT_ACCOUNT_ID = "123456789";
    process.env.YEXT_UNIVERSE = "sandbox";
    process.env.YEXT_API_KEY = "k";
    await expect(resolveConfig(tmpDir())).rejects.toThrow(
      /Not supported for this account ID/
    );
  });

  it("validates a saved config up front and errors before asking to change it", async () => {
    const dir = tmpDir();
    // Saved EU account with sandbox universe — an unsupported combination.
    seedYextrc(
      dir,
      "accountId: '123456789'\nuniverse: sandbox\napiKey: filekey\n"
    );
    await expect(resolveConfig(dir)).rejects.toThrow(
      /Not supported for this account ID/
    );
    // Errors before the "use a different configuration?" prompt.
    expect(mockPrompts).not.toHaveBeenCalled();
  });

  it("fails fast on an invalid combination before prompting for the API key", async () => {
    // Account + universe come from env (EU + sandbox); API key is missing, so
    // it would be prompted — but the combination is invalid, so we must error
    // before any prompt happens.
    process.env.YEXT_ACCOUNT_ID = "123456789";
    process.env.YEXT_UNIVERSE = "sandbox";
    await expect(resolveConfig(tmpDir())).rejects.toThrow(
      /Not supported for this account ID/
    );
    expect(mockPrompts).not.toHaveBeenCalled();
  });

  it("throws on an unknown universe without prompting", async () => {
    process.env.YEXT_ACCOUNT_ID = "1";
    process.env.YEXT_UNIVERSE = "mars";
    process.env.YEXT_API_KEY = "k";
    await expect(resolveConfig(tmpDir())).rejects.toThrow(
      /Unknown universe "mars"/
    );
    expect(mockPrompts).not.toHaveBeenCalled();
  });
});
