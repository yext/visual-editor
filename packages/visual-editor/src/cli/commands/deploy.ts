import { resolveConfig } from "./internal/deploy/config.ts";
import { deploy } from "./internal/deploy/deploy.ts";
import { pollRevision } from "./internal/deploy/pollRevision.ts";
import { defineYextVECommand } from "../command.ts";

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

.yextrc lives in the repo root. With terminal input, missing values are prompted
and can be saved. Without terminal input, all values are required and .yextrc
is never written. A missing Section Library fails; revision builds are awaited.
`;

export const deployCmd = defineYextVECommand({
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
      const isInteractive = Boolean(process.stdin.isTTY);
      const config = await resolveConfig(
        rootDir,
        values.universe,
        isInteractive
      );
      const revision = await deploy(config, verbose, {
        allowDirty: values["allow-dirty"] ?? false,
        allowDuplicate: values["allow-duplicate"] ?? false,
        isInteractive,
      });
      if (!revision && !isInteractive) {
        throw new Error("No Section Library revision was created.");
      }
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
