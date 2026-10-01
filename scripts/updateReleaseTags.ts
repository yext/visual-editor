import {
  args,
  getPackageInfo,
  getVersionedNpmTag,
  run,
} from "./releaseUtils.js";

/**
 * 1. Select the major-version tag for the published release.
 * 2. Read fresh registry tags and preserve the current tag during recovery.
 * 3. Update only the major-version tag. Keep all existing tags unchanged.
 */
const version = args._[0];
if (!version) {
  console.error("No version specified");
  process.exit(1);
}

const releaseTag = getVersionedNpmTag(version);
if (!releaseTag) {
  console.log(
    "This release uses the existing rules. No major-version tag is added.",
  );
  process.exit(0);
}

const { pkg } = await getPackageInfo();
const tags: Record<string, string> = JSON.parse(
  (
    await run(
      "npm",
      ["view", pkg.name, "dist-tags", "--json", "--prefer-online"],
      {
        stdio: "pipe",
      },
    )
  ).stdout,
);

if (args.recover && tags[releaseTag]) {
  if (getVersionedNpmTag(tags[releaseTag]) !== releaseTag) {
    throw new Error(`Invalid npm tag: ${releaseTag}`);
  }
  console.log(`Keeping ${releaseTag} at ${tags[releaseTag]} during recovery.`);
} else if (tags[releaseTag] === version) {
  console.log(`${releaseTag} already points to ${version}.`);
} else {
  await run("npm", ["dist-tag", "add", `${pkg.name}@${version}`, releaseTag]);
}
