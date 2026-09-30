import { parseArgs, type ParseArgsConfig } from "node:util";

export type CliIo = {
  stdout: Pick<NodeJS.WriteStream, "write" | "isTTY">;
  stderr: Pick<NodeJS.WriteStream, "write" | "isTTY">;
};

type ParseArgsOptionConfig = NonNullable<ParseArgsConfig["options"]>[string];

export type CommandParseArgsConfig = Omit<
  ParseArgsConfig,
  "options" | "strict"
> & {
  strict: true;
  options: Record<string, ParseArgsOptionConfig> & {
    help: ParseArgsOptionConfig & { type: "boolean" };
  };
};

export type RuntimeParseArgsConfig<T extends CommandParseArgsConfig> = T & {
  args: readonly string[];
};

export type ParsedCommandArgs<T extends CommandParseArgsConfig> = ReturnType<
  typeof parseArgs<RuntimeParseArgsConfig<T>>
>;

export type YextVECommand<T extends CommandParseArgsConfig> = {
  parseArgsConfig: T;
  usage: string;
  run(
    values: ParsedCommandArgs<T>["values"],
    positionals: ParsedCommandArgs<T>["positionals"],
    io: CliIo,
    rootDir: string
  ): number | Promise<number>;
};

export const defineYextVECommand = <const T extends CommandParseArgsConfig>(
  command: YextVECommand<T>
): YextVECommand<T> => command;
