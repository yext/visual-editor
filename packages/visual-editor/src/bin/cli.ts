import { parseArgs } from "node:util";
import { resolveConfig } from "../deploy/config.ts";
import { deploy } from "../deploy/deploy.ts";
import { pollRevision } from "../deploy/pollRevision.ts";

const USAGE = `yextve — manage Yext Pages for Marketers Section Libraries

Usage:
  yextve deploy

Options:
  -h, --help          Show this help
  -v, --verbose       Print API response bodies on errors

Configuration (each resolves: env var > .yextrc > prompt):
  YEXT_ACCOUNT_ID / accountId    Yext account ID
  YEXT_UNIVERSE   / universe     Yext environment: production | sandbox
  YEXT_API_KEY    / apiKey       API key
  YEXT_ORIGIN     / origin       Git remote name

.yextrc lives in the repo root; prompted values are saved back to it.
`;

async function runDeploy(verbose: boolean): Promise<void> {
  const config = await resolveConfig();
  const revision = await deploy(config, verbose);

  if (revision) {
    await pollRevision(config, revision.name, verbose);
  }
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      verbose: { type: "boolean", short: "v" },
    },
  });

  const command = positionals[0];

  if (values.help || !command) {
    console.log(USAGE);
    return;
  }

  switch (command) {
    case "deploy":
      await runDeploy(values.verbose ?? false);
      break;
    default:
      throw new Error(
        `Unknown command "${command}". Run "yextve --help" for usage.`
      );
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const label = process.stderr.isTTY ? "\x1b[1;31merror:\x1b[0m" : "error:";
  console.error(`${label} ${message}`);
  process.exit(1);
});
