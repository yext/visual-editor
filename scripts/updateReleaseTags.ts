import {
  args,
  getPackageInfo,
  getVersionedNpmTags,
  run,
} from "./releaseUtils.js";

/**
 * 1. Select the major-version tags for the published release.
 * 2. Read fresh registry tags and preserve current tags during recovery.
 * 3. Update only the major-version tags. Keep all existing tags unchanged.
 */
const version = args._[0];
if (!version) {
  console.error("No version specified");
  process.exit(1);
}

const releaseTags = getVersionedNpmTags(version);

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

for (const releaseTag of releaseTags) {
  if (args.recover && tags[releaseTag]) {
    if (!getVersionedNpmTags(tags[releaseTag]).includes(releaseTag)) {
      throw new Error(`Invalid npm tag: ${releaseTag}`);
    }
    console.log(
      `Keeping ${releaseTag} at ${tags[releaseTag]} during recovery.`,
    );
  } else if (tags[releaseTag] === version) {
    console.log(`${releaseTag} already points to ${version}.`);
  } else {
    await run("npm", ["dist-tag", "add", `${pkg.name}@${version}`, releaseTag]);
  }
}
