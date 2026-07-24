import prompts from "prompts";
import { execFileSync } from "node:child_process";
import { defaultPromptOpts } from "./prompt.ts";
import { readYextrc, updateYextrc, type Yextrc } from "./yextrc.ts";

// Resolves the auth/config the deploy command needs: account ID, universe, API
// key, and Git remote. Non-interactive sources take precedence: env var >
// `.yextrc` (YEXT_ACCOUNT_ID, YEXT_UNIVERSE, YEXT_API_KEY, YEXT_ORIGIN).
//
// Interactive behavior:
//  - When `.yextrc` already provides a complete config, the resolved values are
//    shown and the user is asked whether to enter different ones (auto-filled
//    with the existing values). If they do, they're asked whether to save the
//    new values back to `.yextrc`.
//  - When any value is missing, the user is prompted for it and then asked
//    whether to save the entered values to `.yextrc`.

export interface DeployConfig {
  accountId: string;
  universe: string;
  apiKey: string;
  origin: string;
  partition: Partition;
  apiHost: string;
}

/** Data-center partition, derived from the account ID. */
export type Partition = "US" | "EU";

/** Per-(partition, universe) configuration. */
interface EnvConfig {
  apiHost: string;
}

// The US hosts are known; EU hosts are placeholders.
// This map is the single place the (partition, universe) -> config lives.
const ENV_CONFIG: Record<Partition, Record<string, EnvConfig>> = {
  US: {
    production: { apiHost: "https://api.yextapis.com" },
    sandbox: { apiHost: "https://sbx-api.yextapis.com" },
    qa: { apiHost: "https://qa-api.yextapis.com" },
    dev: { apiHost: "https://dev.yext.com" },
  },
  EU: {
    production: { apiHost: "https://api.eu.yextapis.com" },
  },
};

// EU accounts have a `1` in the hundred-millions digit of the account ID.
function getPartition(accountId: string): Partition {
  const id = Number(accountId);
  return Math.floor(id / 100_000_000) % 10 === 1 ? "EU" : "US";
}

// production/sandbox are the only universes surfaced to users; qa/dev remain
// valid (for internal use) but are intentionally not offered as choices.
const UNIVERSE_CHOICES = ["production", "sandbox"];

// All recognized universes. A universe outside this list is "unknown"; a
// recognized universe with no host for the account's partition is "unsupported".
const VALID_UNIVERSES = ["production", "sandbox", "qa", "dev"];

/**
 * Resolve and validate the deploy config from environment variables,
 * `.yextrc`, and interactive prompts. Throws an actionable error when a value
 * is invalid or a required prompt is cancelled.
 */
export async function resolveConfig(
  rootDir: string = process.cwd()
): Promise<DeployConfig> {
  const yextrc = readYextrc(rootDir);
  const yextrcHasData = Boolean(
    yextrc.accountId || yextrc.universe || yextrc.apiKey || yextrc.origin
  );

  // Non-interactive resolution (may leave fields undefined).
  const base: Yextrc = {
    accountId: process.env.YEXT_ACCOUNT_ID ?? yextrc.accountId,
    universe: process.env.YEXT_UNIVERSE ?? yextrc.universe,
    apiKey: process.env.YEXT_API_KEY ?? yextrc.apiKey,
    origin: process.env.YEXT_ORIGIN ?? yextrc.origin,
  };
  const allPresent = Boolean(
    base.accountId && base.universe && base.apiKey && base.origin
  );

  let promptAll = false;
  if (yextrcHasData && allPresent) {
    showFields(base);

    // Validate the saved configuration up front, before asking anything, so an
    // invalid saved config errors early.
    resolveEnvConfig(base.accountId as string, base.universe as string);

    const { value: useNew } = await prompts(
      {
        type: "select",
        name: "value",
        message: "Use this configuration or input new values?",
        choices: [
          { title: "Use existing", value: false },
          { title: "Input new configuration", value: true },
        ],
        initial: 0,
      },
      defaultPromptOpts
    );
    if (!useNew) {
      return newConfig(base as Required<Yextrc>);
    }

    promptAll = useNew;
  }

  const values = await promptConfig(rootDir, base, promptAll);
  if (promptAll) {
    showFields(values);
  }

  const save = await confirmPrompt("Save these values to .yextrc?", true);
  if (save) {
    updateYextrc(rootDir, values);
  }

  return newConfig(values);
}

async function promptConfig(
  rootDir: string,
  base: Yextrc,
  promptAll: boolean
): Promise<Required<Yextrc>> {
  let accountId = base.accountId as string;
  if (promptAll || !base.accountId) {
    const initialAccountId = promptAll ? base.accountId : undefined;
    accountId = await promptText(
      "Yext account ID",
      "Account ID",
      initialAccountId,
      accountIdValidate
    );
  }

  let universe = base.universe as string;
  if (!base.universe || (promptAll && !process.env.YEXT_UNIVERSE)) {
    const initialUniverse = promptAll ? base.universe : undefined;
    universe = await promptUniverse(initialUniverse);
  }

  // Validate the account ID and universe before asking for the API key.
  resolveEnvConfig(accountId, universe);

  let apiKey = base.apiKey as string;
  if (promptAll || !base.apiKey) {
    const initialApiKey = promptAll ? base.apiKey : undefined;
    apiKey = await promptPassword("Yext App API key", "API key", initialApiKey);
  }

  let origin = base.origin as string;
  if (promptAll || !base.origin) {
    const initialOrigin = promptAll ? base.origin : undefined;
    origin = await promptOrigin(rootDir, initialOrigin);
  }
  return { accountId, universe, apiKey, origin };
}

/**
 * Validate the account ID + universe and resolve the environment config for
 * their partition. Throws an actionable error on invalid input.
 */
function resolveEnvConfig(
  accountId: string,
  universe: string
): { partition: Partition; envConfig: EnvConfig } {
  if (!isValidAccountId(accountId)) {
    throw new Error(
      `Invalid account ID "${accountId}". It must be a positive integer.`
    );
  }
  if (!VALID_UNIVERSES.includes(universe)) {
    const known = UNIVERSE_CHOICES.join(", ");
    throw new Error(
      `Unknown universe "${universe}". Expected one of: ${known}.`
    );
  }
  const partition = getPartition(accountId);
  const envConfig = ENV_CONFIG[partition][universe];
  if (!envConfig) {
    throw new Error(
      `Not supported for this account ID (${accountId}) and universe "${universe}".`
    );
  }
  return { partition, envConfig };
}

function newConfig(values: Required<Yextrc>): DeployConfig {
  const { partition, envConfig } = resolveEnvConfig(
    values.accountId,
    values.universe
  );
  return {
    accountId: values.accountId,
    universe: values.universe,
    apiKey: values.apiKey,
    origin: values.origin,
    partition,
    apiHost: envConfig.apiHost,
  };
}

function showFields(values: Yextrc): void {
  console.log("Using configuration:");
  const rows: [string, string][] = [
    ["Account:", values.accountId ?? ""],
    ["Universe:", values.universe ?? ""],
    ["API Key:", maskSecret(values.apiKey ?? "")],
    ["Git Remote:", values.origin ?? ""],
  ];
  const width = Math.max(...rows.map(([label]) => label.length));
  for (const [label, value] of rows) {
    console.log(`  ${bold(label.padEnd(width))}  ${value}`);
  }
}

function maskSecret(value: string): string {
  return value.length <= 4 ? "****" : `****${value.slice(-4)}`;
}

// Bold for terminals only; plain text when the output is piped/redirected so
// escape codes don't leak into logs.
function bold(text: string): string {
  return process.stdout.isTTY ? `\x1b[1m${text}\x1b[0m` : text;
}

function isValidAccountId(value: string): boolean {
  return /^[0-9]+$/.test(value.trim()) && Number(value.trim()) > 0;
}

function accountIdValidate(value: string): true | string {
  return isValidAccountId(value)
    ? true
    : "Account ID must be a positive integer.";
}

function required(label: string) {
  return (value: string): true | string =>
    value.trim().length > 0 ? true : `${label} is required.`;
}

async function promptText(
  message: string,
  label: string,
  initial?: string,
  validate: (value: string) => true | string = required(label)
): Promise<string> {
  const { value } = await prompts(
    {
      type: "text",
      name: "value",
      message,
      initial,
      validate,
    },
    defaultPromptOpts
  );
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

async function promptPassword(
  message: string,
  label: string,
  initial?: string
): Promise<string> {
  const { value } = await prompts(
    {
      type: "password",
      name: "value",
      message,
      initial,
      validate: required(label),
    },
    defaultPromptOpts
  );
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

async function promptUniverse(current?: string): Promise<string> {
  const initialIndex = current
    ? Math.max(0, UNIVERSE_CHOICES.indexOf(current))
    : 0;
  const { value } = await prompts(
    {
      type: "select",
      name: "value",
      message: "Yext environment",
      choices: UNIVERSE_CHOICES.map((name) => ({ title: name, value: name })),
      initial: initialIndex,
    },
    defaultPromptOpts
  );
  if (typeof value !== "string") {
    throw new Error("A universe is required.");
  }
  return value;
}

async function promptOrigin(
  rootDir: string,
  current?: string
): Promise<string> {
  const origins = gitRemotes(rootDir);
  const initialIndex = current
    ? Math.max(
        0,
        origins.findIndex(({ name }) => name === current)
      )
    : 0;
  const { value } = await prompts(
    {
      type: "select",
      name: "value",
      message: "Git remote",
      choices: origins.map(({ name, url }) => ({
        title: `${name}: ${url}`,
        value: name,
      })),
      initial: initialIndex,
    },
    defaultPromptOpts
  );
  if (typeof value !== "string") {
    throw new Error("A Git remote is required.");
  }
  return value;
}

function gitRemotes(rootDir: string): { name: string; url: string }[] {
  try {
    const names = execFileSync("git", ["remote"], {
      cwd: rootDir,
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
    if (names.length === 0) {
      throw new Error("No Git remotes found.");
    }
    return names.map((name) => ({
      name,
      url: execFileSync("git", ["remote", "get-url", name], {
        cwd: rootDir,
        encoding: "utf8",
      }).trim(),
    }));
  } catch (error) {
    if (error instanceof Error && error.message === "No Git remotes found.") {
      throw error;
    }
    throw new Error("Could not list Git remotes.");
  }
}

async function confirmPrompt(
  message: string,
  initial: boolean
): Promise<boolean> {
  const { value } = await prompts(
    {
      type: "select",
      name: "value",
      message,
      choices: [
        { title: "Yes", value: true },
        { title: "No", value: false },
      ],
      initial: initial ? 0 : 1,
    },
    defaultPromptOpts
  );
  return value;
}
