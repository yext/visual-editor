import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import prompts from "prompts";
import { defaultPromptOpts } from "./prompt.ts";
import {
  createSectionLibrary,
  createSectionLibraryRevision,
  getSectionLibrary,
  listSectionLibraryRevisions,
  updateSectionLibrary,
  SectionLibrary,
  SectionLibraryRevision,
} from "./sectionLibraryApi.ts";
import type { DeployConfig } from "./config.ts";

export interface DeployOptions {
  allowDirty?: boolean;
  allowDuplicate?: boolean;
  isInteractive?: boolean;
}

// These account/universe pairs store built-in libraries with a yext_ ID prefix.
const BUILT_IN_ACCOUNT_UNIVERSES = new Map([
  ["4174974", "production"],
  ["100004623", "production"],
  ["3343916", "sandbox"],
  ["4275038", "qa"],
  ["1000163697", "dev"],
]);

export async function deploy(
  config: DeployConfig,
  verbose: boolean = false,
  options: DeployOptions = {}
): Promise<SectionLibraryRevision | undefined> {
  const rootDir = process.cwd();
  const isInteractive = options.isInteractive ?? Boolean(process.stdin.isTTY);
  const library = readLibrary(rootDir);
  const libraryId = resolveSectionLibraryId(config, library.id);
  const sourceGitOrigin = git(rootDir, "remote", "get-url", config.origin);
  const sourceCommitHash = git(rootDir, "rev-parse", "HEAD");
  const gitStatus = git(rootDir, "status", "--short");

  if (gitStatus) {
    console.warn(
      `Warning: the working tree contains changes that are not included in commit ${sourceCommitHash}:\n${gitStatus}`
    );
    if (options.allowDirty) {
      console.warn("Proceeding because --allow-dirty was provided.");
    } else {
      if (!isInteractive) {
        throw new Error(
          "The working tree contains changes that are not included in the commit. Commit or stash them, or rerun with --allow-dirty."
        );
      }
      if (!(await confirmChoice("Deploy this commit anyway?"))) {
        console.log("Deployment cancelled; no revision was created.");
        return undefined;
      }
    }
  }

  const apiLibrary = await getSectionLibrary(config, libraryId, verbose);
  if (apiLibrary.status === 404) {
    if (!isInteractive) {
      throw new Error(
        `Section library "${libraryId}" does not exist. Create it before running a non-interactive deploy.`
      );
    }
    if (
      !(await confirmChoice(
        `Section library "${libraryId}" does not exist. Create it?`,
        0
      ))
    ) {
      console.log(`Section library "${libraryId}" was not created.`);
      return undefined;
    }
    await createSectionLibrary(config, libraryId, library, verbose);
  } else {
    const revisions = await listSectionLibraryRevisions(
      config,
      libraryId,
      verbose
    );
    const matchingRevisions = revisions.filter(
      (revision) => revision.sourceCommitHash === sourceCommitHash
    );
    if (matchingRevisions.length > 0) {
      const newestRevision = matchingRevisions[0];
      console.warn(
        `Warning: commit ${sourceCommitHash} has already been uploaded in ${matchingRevisions.length} revision${matchingRevisions.length === 1 ? "" : "s"}. Newest match: ${newestRevision.name} (${newestRevision.status}).`
      );
      if (options.allowDuplicate) {
        console.warn("Proceeding because --allow-duplicate was provided.");
      } else {
        if (!isInteractive) {
          throw new Error(
            "The current commit has already been uploaded. Use a different commit, or rerun with --allow-duplicate."
          );
        }
        if (!(await confirmChoice("Upload this commit again?"))) {
          console.log("Deployment cancelled; no revision was created.");
          return undefined;
        }
      }
    }

    if (
      apiLibrary.response.displayName !== library.displayName ||
      apiLibrary.response.description !== library.description
    ) {
      await updateSectionLibrary(config, libraryId, library, verbose);
      console.log(`Updated metadata for Section Library "${libraryId}".`);
    }
  }
  const revision = await createSectionLibraryRevision(
    config,
    libraryId,
    {
      sourceGitOrigin,
      sourceCommitHash,
    },
    verbose
  );

  console.log(
    `Uploaded commit ${sourceCommitHash} to a revision for Section Library "${libraryId}".`
  );

  return revision;
}

function resolveSectionLibraryId(
  config: DeployConfig,
  libraryId: string
): string {
  if (
    BUILT_IN_ACCOUNT_UNIVERSES.get(config.accountId) !== config.universe ||
    libraryId.startsWith("yext_")
  ) {
    return libraryId;
  }
  return `yext_${libraryId}`;
}

async function confirmChoice(
  message: string,
  initial: number = 1
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
      initial,
    },
    defaultPromptOpts
  );
  return value === true;
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
