import fs from "node:fs";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import packageJson from "../../package.json" with { type: "json" };
import { deployCmd } from "./commands/deploy.ts";
import { validateCmd } from "./commands/validate.ts";
import {
  type CliIo,
  type CommandParseArgsConfig,
  type ParsedCommandArgs,
  type RuntimeParseArgsConfig,
  type YextveCommand,
} from "./command.ts";

const usage = `Usage:
  yextve <command> [options]

Commands:
  deploy                           Upload a Section Library revision.
  validate                         Validate a Section Library.

Options:
  -h, --help                       Show this help.
  --version                        Show the package version.

Run "yextve <command> --help" for command-specific options.
`;

const commands: Record<string, YextveCommand<CommandParseArgsConfig>> = {
  deploy: deployCmd,
  validate: validateCmd,
};

export const runCli = async (
  args: string[],
  io: CliIo = { stdout: process.stdout, stderr: process.stderr },
  rootDir: string = process.cwd()
): Promise<number> => {
  // handle help
  if (args.length === 1 && ["-h", "--help"].includes(args[0])) {
    io.stdout.write(usage);
    return 0;
  }

  // handle version
  if (args.length === 1 && args[0] === "--version") {
    io.stdout.write(`${packageJson.version}\n`);
    return 0;
  }

  const commandName = args[0];

  // print usage and return error status if invlaid command provided
  if (!commandName || !Object.hasOwn(commands, commandName)) {
    io.stderr.write(usage);
    return 2;
  }

  const command = commands[commandName];

  // parse args
  let parsedArgs: ParsedCommandArgs<CommandParseArgsConfig>;
  try {
    const config: RuntimeParseArgsConfig<CommandParseArgsConfig> = {
      ...command.parseArgsConfig,
      args: args.slice(1),
    };
    parsedArgs = parseArgs(config);
  } catch (error) {
    io.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n\n${command.usage}`
    );
    return 2;
  }

  // show command specific help
  if ("help" in parsedArgs.values && parsedArgs.values.help) {
    io.stdout.write(command.usage);
    return 0;
  }

  // run command
  return command.run(parsedArgs.values, parsedArgs.positionals, io, rootDir);
};

if (
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) ===
    fs.realpathSync(fileURLToPath(import.meta.url))
) {
  process.exitCode = await runCli(process.argv.slice(2));
}
