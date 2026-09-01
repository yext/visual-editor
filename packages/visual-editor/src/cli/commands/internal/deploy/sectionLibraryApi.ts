import {
  yextApiRequest,
  type YextApiResponse,
  type YextApiError,
} from "./api.ts";
import type { DeployConfig } from "./config.ts";

export interface SectionLibrary {
  id: string;
  displayName: string;
  description: string;
}

export interface SectionLibraryRevision {
  name: string;
  status: SectionLibraryRevisionStatus;
}

type SectionLibraryRevisionStatus =
  | "STATUS_UNSPECIFIED"
  | "STATUS_BUILD_PROCESSING"
  | "STATUS_BUILD_SUCCEEDED"
  | "STATUS_BUILD_SYSTEM_ERROR"
  | "STATUS_BUILD_FAILURE"
  | "STATUS_BUILD_TIMED_OUT";

interface RevisionSource {
  sourceGitOrigin: string;
  sourceCommitHash: string;
}

const ERROR_MESSAGE_OVERRIDES = new Map<number, string>([
  [
    104030,
    "Yext API key does not have required permissions. Add Section Library API write access permissions to your App in Developer Console.",
  ],
]);

export async function createSectionLibrary(
  config: DeployConfig,
  id: string,
  library: SectionLibrary,
  verbose: boolean
): Promise<void> {
  const result = await yextApiRequest(
    "Creating Section Library...",
    "POST",
    `accounts/me/sectionLibraries?sectionLibraryId=${encodeURIComponent(id)}`,
    config,
    verbose,
    { displayName: library.displayName, description: library.description }
  );

  if (!result.ok) {
    throw sectionLibraryApiError(
      result.errors,
      "Failed to create new Section Library."
    );
  }
}

export async function createSectionLibraryRevision(
  config: DeployConfig,
  libraryId: string,
  data: RevisionSource,
  verbose: boolean
): Promise<SectionLibraryRevision> {
  const result = await yextApiRequest(
    "Creating Section Library Revision...",
    "POST",
    `accounts/me/sectionLibraries/${encodeURIComponent(libraryId)}/revisions`,
    config,
    verbose,
    data
  );

  if (!result.ok) {
    throw sectionLibraryApiError(
      result.errors,
      "Failed to upload current commit as a Section Library Revision"
    );
  }
  return result.response as SectionLibraryRevision;
}

export async function getSectionLibrary(
  config: DeployConfig,
  libraryId: string,
  verbose: boolean
): Promise<YextApiResponse> {
  const result = await yextApiRequest(
    "Fetching Section Library...",
    "GET",
    `accounts/me/sectionLibraries/${encodeURIComponent(libraryId)}`,
    config,
    verbose
  );

  if (!result.ok && result.status !== 404) {
    throw sectionLibraryApiError(
      result.errors,
      "Failed to fetch Section Library."
    );
  }

  return result;
}

export async function getSectionLibraryRevision(
  config: DeployConfig,
  revisionName: string,
  verbose: boolean,
  omitLog: boolean = false
): Promise<SectionLibraryRevision> {
  const result = await yextApiRequest(
    omitLog ? "" : "Fetching Section Library Revision...",
    "GET",
    revisionName,
    config,
    verbose
  );

  if (!result.ok) {
    throw sectionLibraryApiError(
      result.errors,
      "Failed to fetch Section Library Revision."
    );
  }
  return result.response as SectionLibraryRevision;
}

function sectionLibraryApiError(
  errors: YextApiError[],
  defaultErrorMsg: string
): Error {
  if (errors.length === 0 || errors[0].message == "") {
    return new Error(defaultErrorMsg);
  }

  const err = errors[0];
  return new Error(ERROR_MESSAGE_OVERRIDES.get(err.code) ?? err.message);
}
