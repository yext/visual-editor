import semver from "semver";
import { args, getNpmTag, getPackageInfo, run } from "./releaseUtils.js";

/**
 * 1. Read the current npm tags for this release type.
 * 2. Keep the alias on the highest released major version.
 * 3. Copy the current primary tag to the alias, including after rollback.
 */
const version = args._[0];
if (!version) {
  console.error("No version specified");
  process.exit(1);
}

const releaseTag = getNpmTag(version);
const channel = releaseTag.slice(0, releaseTag.lastIndexOf("-v"));
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

for (const [tag, taggedVersion] of Object.entries(tags)) {
  if (tag !== channel && !tag.startsWith(`${channel}-v`)) continue;

  const primaryTag = getNpmTag(taggedVersion);
  if (
    (tag === channel && !primaryTag.startsWith(`${channel}-v`)) ||
    (tag !== channel && primaryTag !== tag)
  ) {
    throw new Error(`Invalid npm tag ${tag}: ${taggedVersion}`);
  }

  if (semver.major(taggedVersion) > semver.major(primaryVersion)) {
    console.log(`Keeping ${channel}. A higher major version is available.`);
    process.exit(0);
  }
}

if (tags[channel] === primaryVersion) {
  console.log(`${channel} already points to ${primaryVersion}.`);
} else {
  await run("npm", [
    "dist-tag",
    "add",
    `${pkg.name}@${primaryVersion}`,
    channel,
  ]);
}
