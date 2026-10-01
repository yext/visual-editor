import {
  args,
  getLegacyNpmTag,
  getNpmTag,
  getPackageInfo,
  run,
} from "./releaseUtils.js";

/**
 * 1. Read the primary tag for releases with a major-version tag.
 * 2. Use the original rules to select the existing tag.
 * 3. Copy the current primary tag to the alias, including after rollback.
 */
const version = args._[0];
if (!version) {
  console.error("No version specified");
  process.exit(1);
}

const releaseTag = getNpmTag(version);
if (releaseTag === getLegacyNpmTag(version)) {
  console.log(
    `${releaseTag} uses the existing rules. No major-version tag is added.`,
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

const primaryVersion = tags[releaseTag];
if (!primaryVersion || getNpmTag(primaryVersion) !== releaseTag) {
  throw new Error(`Missing or invalid npm tag: ${releaseTag}`);
}

// Keep the tag selection used before major-version tags were added.
const alias = getLegacyNpmTag(primaryVersion);

if (tags[alias] === primaryVersion) {
  console.log(`${alias} already points to ${primaryVersion}.`);
} else {
  await run("npm", ["dist-tag", "add", `${pkg.name}@${primaryVersion}`, alias]);
}
