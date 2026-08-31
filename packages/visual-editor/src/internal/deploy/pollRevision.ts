import ora from "ora";
import type { DeployConfig } from "./config.ts";
import {
  getSectionLibraryRevision,
  type SectionLibraryRevision,
} from "./sectionLibraryApi.ts";

const BUILD_SUCCESS_STATUS = "STATUS_BUILD_SUCCEEDED";
const BUILD_PROCESSING_STATUS = "STATUS_BUILD_PROCESSING";
const REVISION_POLLING_TEXT = "Waiting for Section Library Revision build...";

export async function pollRevision(
  config: DeployConfig,
  revisionName: string,
  verbose: boolean
): Promise<void> {
  let lastStatus = BUILD_PROCESSING_STATUS;
  let revision: SectionLibraryRevision | undefined;
  const startedAt = Date.now();
  const spinner = ora(REVISION_POLLING_TEXT).start();
  try {
    while (lastStatus === BUILD_PROCESSING_STATUS) {
      revision = await getSectionLibraryRevision(
        config,
        revisionName,
        verbose,
        true
      );
      lastStatus = revision.status;

      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      spinner.text = `${REVISION_POLLING_TEXT} ${formatElapsed(elapsedSeconds)} elapsed (expected build time: 5-10 minutes)`;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    spinner.fail("Section Library Revision build failed.");
    throw error;
  }

  if (revision?.status === BUILD_SUCCESS_STATUS) {
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    spinner.succeed(
      `Section Library Revision ${revision.uid} build succeeded after ${formatElapsed(elapsedSeconds)}.`
    );
  } else {
    spinner.fail(`Section Library Revision failed with status ${lastStatus}.`);
  }
}

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes ? `${minutes}m` : ""}${seconds % 60}s`;
}
