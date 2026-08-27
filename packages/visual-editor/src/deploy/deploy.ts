import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import prompts from "prompts";
import { defaultPromptOpts } from "./prompt.ts";
import {
  createSectionLibrary,
  createSectionLibraryRevision,
  getSectionLibrary,
  SectionLibrary,
  SectionLibraryRevision,
} from "./sectionLibraryApi.ts";
import type { DeployConfig } from "./config.ts";

export async function deploy(
  config: DeployConfig,
  verbose: boolean = false
): Promise<SectionLibraryRevision | undefined> {
  const rootDir = process.cwd();
  const library = readLibrary(rootDir);
  const apiLibrary = await getSectionLibrary(config, library.id, verbose);
  if (apiLibrary.status === 404) {
    const { value } = await prompts(
      {
        type: "select",
        name: "value",
        message: `Section library "${library.id}" does not exist. Create it?`,
        choices: [
          { title: "Yes", value: true },
          { title: "No", value: false },
        ],
        initial: 0,
      },
      defaultPromptOpts
    );
    if (value !== true) {
      console.log(`Section library "${library.id}" was not created.`);
      return undefined;
    }
    await createSectionLibrary(config, library.id, library, verbose);
  }
  const revision = await createSectionLibraryRevision(
    config,
    library.id,
    {
      sourceGitOrigin: git(rootDir, "remote", "get-url", config.origin),
      sourceCommitHash: git(rootDir, "rev-parse", "HEAD"),
    },
    verbose
  );

  console.log(
    `Uploaded current commit to revision for Section Library "${library.id}".`
  );

  return revision;
}

function readLibrary(rootDir: string): SectionLibrary {
  const filePath = path.join(rootDir, "src", "library", "library.json");
  let library: unknown;
  try {
    library = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read ${filePath}: ${reason}`);
  }
  if (
    !library ||
    typeof library !== "object" ||
    typeof (library as Partial<SectionLibrary>).id !== "string" ||
    typeof (library as Partial<SectionLibrary>).displayName !== "string" ||
    typeof (library as Partial<SectionLibrary>).description !== "string" ||
    !(library as SectionLibrary).id.trim()
  ) {
    throw new Error(
      `${filePath} must contain string "id", "displayName", and "description" fields.`
    );
  }
  return {
    ...(library as SectionLibrary),
    id: (library as SectionLibrary).id.trim(),
  };
}

function git(rootDir: string, ...args: string[]): string {
  try {
    return execFileSync("git", args, { cwd: rootDir, encoding: "utf8" }).trim();
  } catch {
    throw new Error(`Could not run "git ${args.join(" ")}".`);
  }
}
