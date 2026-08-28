import { resolveConfig } from "../../internal/deploy/config.ts";
import { deploy } from "../../internal/deploy/deploy.ts";
import { pollRevision } from "../../internal/deploy/pollRevision.ts";
import { defineYextveCommand } from "../command.ts";

const usage = `Usage:
  yextve deploy [--verbose]

Create a Section Library revision from the current Git commit.

Options:
  -v, --verbose                    Print API response bodies on errors.
  -h, --help                       Show this help.

Configuration (each resolves: env var > .yextrc > prompt):
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
      verbose: { type: "boolean", short: "v" },
    },
  },
  run: async (values, _positionals, io, _rootDir) => {
    try {
      const verbose = values.verbose ?? false;
      const config = await resolveConfig();
      const revision = await deploy(config, verbose);
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
