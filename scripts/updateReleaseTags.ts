import { args, getNpmTag, getPackageInfo, run } from "./releaseUtils.js";

/**
 * 1. Read the current npm tags for this release type.
 * 2. Use the original rules to select the existing tag.
 * 3. Copy the current primary tag to the alias, including after rollback.
 */
const version = args._[0];
if (!version) {
  console.error("No version specified");
  process.exit(1);
}

const releaseTag = getNpmTag(version);
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
const alias = primaryVersion.includes("rc")
  ? "rc"
  : primaryVersion.includes("beta")
    ? "beta"
    : primaryVersion.includes("alpha")
      ? "alpha"
      : "latest";

if (tags[alias] === primaryVersion) {
  console.log(`${alias} already points to ${primaryVersion}.`);
} else {
  await run("npm", ["dist-tag", "add", `${pkg.name}@${primaryVersion}`, alias]);
}
