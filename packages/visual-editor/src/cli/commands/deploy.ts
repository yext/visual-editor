import { resolveConfig } from "./internal/deploy/config.ts";
import { deploy } from "./internal/deploy/deploy.ts";
import { pollRevision } from "./internal/deploy/pollRevision.ts";
import { defineYextveCommand } from "../command.ts";

const usage = `Usage:
  yextve deploy [-u <universe>] [--verbose] [--allow-dirty] [--allow-duplicate]

Create a Section Library revision from the current Git commit.

Options:
  -u, --universe <universe>        production | sandbox
  -v, --verbose                    Print API response bodies on errors.
  --allow-dirty                    Deploy with uncommitted or untracked changes.
  --allow-duplicate                Deploy a commit that was already uploaded.
  -h, --help                       Show this help.

Configuration (env var > .yextrc > prompt; -u and YEXT_UNIVERSE conflict):
  YEXT_ACCOUNT_ID / accountId      Yext account ID
  YEXT_UNIVERSE   / universe       Yext environment: production | sandbox
  YEXT_API_KEY    / apiKey         API key
  YEXT_ORIGIN     / origin         Git remote name

.yextrc lives in the repo root; prompted values are saved back to it.
`;

export const deployCmd = defineYextveCommand({
  usage,
  parseArgsConfig: {
    strict: true,
    allowPositionals: false,
    options: {
      help: { type: "boolean", short: "h" },
      universe: { type: "string", short: "u" },
      verbose: { type: "boolean", short: "v" },
      "allow-dirty": { type: "boolean" },
      "allow-duplicate": { type: "boolean" },
    },
  },
  run: async (values, _positionals, io, rootDir) => {
    try {
      const verbose = values.verbose ?? false;
      const config = await resolveConfig(rootDir, values.universe);
      const revision = await deploy(config, verbose, {
        allowDirty: values["allow-dirty"] ?? false,
        allowDuplicate: values["allow-duplicate"] ?? false,
        isInteractive: Boolean(process.stdin.isTTY),
      });
      if (revision) {
        await pollRevision(config, revision.name, verbose);
      }
      return 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const label = io.stderr.isTTY ? "\x1b[1;31merror:\x1b[0m" : "error:";
      io.stderr.write(`${label} ${message}\n`);
      return 1;
    }
  },
});
