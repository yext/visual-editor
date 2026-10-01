import { appendFileSync } from "node:fs";
import {
  args,
  getNpmTag,
  getPackageInfo,
  getVersionedNpmTags,
} from "./releaseUtils.js";

const tag = args._[0];

if (!tag) {
  console.error("No tag specified");
  process.exit(1);
}

if (typeof tag !== "string" || !tag.startsWith("v")) {
  console.error(`Invalid Git release tag: ${tag}`);
  process.exit(1);
}

const version = tag.slice(1);
const releaseTag = getNpmTag(version);
const versionedTags = getVersionedNpmTags(version);

const { currentVersion } = await getPackageInfo();
if (currentVersion !== version) {
  console.error(
    `Package version from tag "${version}" mismatches with current version "${currentVersion}"`,
  );
  process.exit(1);
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `npm_tag=${releaseTag}\nversioned_npm_tags=${versionedTags.join(" ")}\npackage_version=${version}\n`,
  );
}

// Keep the npm tag output for local use.
console.log(releaseTag);
