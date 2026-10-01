import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import type { ExecaReturnValue } from "execa";

interface RegistryState {
  tags: Record<string, string>;
  calls: string[][];
  readError?: string;
  updateError?: string;
}

/** Creates a release-script checkout with a local npm command and registry state. */
export async function createReleaseFixture(options: {
  version: string;
  tags?: Record<string, string>;
  readError?: string;
  updateError?: string;
}): Promise<{
  directory: string;
  run: (
    script: "verifyPublish" | "updateReleaseTags",
    args?: string[],
    env?: NodeJS.ProcessEnv,
  ) => Promise<ExecaReturnValue<string>>;
  readState: () => Promise<RegistryState>;
}> {
  const directory = await mkdtemp(
    path.join(tmpdir(), "visual-editor-release-"),
  );
  await mkdir(path.join(directory, "scripts"));
  await mkdir(path.join(directory, "packages/visual-editor"), {
    recursive: true,
  });
  await mkdir(path.join(directory, "bin"));
  for (const file of [
    "releaseUtils.ts",
    "verifyPublish.ts",
    "updateReleaseTags.ts",
  ]) {
    await copyFile(
      new URL(file, import.meta.url),
      path.join(directory, "scripts", file),
    );
  }
  await symlink(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(directory, "node_modules"),
    "dir",
  );
  await writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({ type: "module" }),
  );
  await writeFile(
    path.join(directory, "packages/visual-editor/package.json"),
    JSON.stringify({ name: "@yext/visual-editor", version: options.version }),
  );
  await writeFile(path.join(directory, "github-output"), "");
  await writeFile(
    path.join(directory, "registry.json"),
    JSON.stringify({
      tags: options.tags ?? {},
      calls: [],
      readError: options.readError,
      updateError: options.updateError,
    }),
  );
  await writeFile(
    path.join(directory, "bin/npm"),
    `#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const state = JSON.parse(readFileSync(process.env.RELEASE_TEST_STATE_FILE, "utf8"));
state.calls.push(args);
writeFileSync(process.env.RELEASE_TEST_STATE_FILE, JSON.stringify(state));
if (args[0] === "view") {
  if (state.readError) {
    console.error(state.readError);
    process.exit(1);
  }
  console.log(JSON.stringify(state.tags));
} else if (args[0] === "dist-tag" && args[1] === "add") {
  if (state.updateError) {
    console.error(state.updateError);
    process.exit(1);
  }
  state.tags[args[3]] = args[2].slice(args[2].lastIndexOf("@") + 1);
  writeFileSync(process.env.RELEASE_TEST_STATE_FILE, JSON.stringify(state));
} else {
  console.error("Unexpected npm command");
  process.exit(1);
}
`,
    { mode: 0o755 },
  );

  return {
    directory,
    run: (
      script: "verifyPublish" | "updateReleaseTags",
      args: string[] = [],
      env: NodeJS.ProcessEnv = {},
    ): Promise<ExecaReturnValue<string>> =>
      execa(
        process.execPath,
        ["--import", "tsx", `scripts/${script}.ts`, ...args],
        {
          cwd: directory,
          reject: false,
          env: {
            GITHUB_OUTPUT: "",
            PATH: `${path.join(directory, "bin")}${path.delimiter}${process.env.PATH}`,
            RELEASE_TEST_STATE_FILE: path.join(directory, "registry.json"),
            ...env,
          },
        },
      ),
    readState: async (): Promise<RegistryState> =>
      JSON.parse(await readFile(path.join(directory, "registry.json"), "utf8")),
  };
}
