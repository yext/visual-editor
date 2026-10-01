import assert from "node:assert/strict";
import test from "node:test";
import {
  getNpmTag,
  getVersionChoices,
  getVersionedNpmTags,
} from "./releaseUtils.js";

for (const { version, expectedLegacyTag, expectedVersionedTags } of [
  {
    version: "0.1.0",
    expectedLegacyTag: "latest",
    expectedVersionedTags: ["stable-v0", "latest-v0"],
  },
  {
    version: "1.4.11",
    expectedLegacyTag: "latest",
    expectedVersionedTags: ["stable-v1", "latest-v1"],
  },
  {
    version: "2.0.0",
    expectedLegacyTag: "latest",
    expectedVersionedTags: ["stable-v2", "latest-v2"],
  },
  {
    version: "3.0.0",
    expectedLegacyTag: "latest",
    expectedVersionedTags: ["stable-v3", "latest-v3"],
  },
  {
    version: "1.3.0-alpha.2",
    expectedLegacyTag: "alpha",
    expectedVersionedTags: ["alpha-v1", "latest-v1"],
  },
  {
    version: "2.0.0-alpha.1",
    expectedLegacyTag: "alpha",
    expectedVersionedTags: ["alpha-v2", "latest-v2"],
  },
  {
    version: "1.5.0-beta.1",
    expectedLegacyTag: "beta",
    expectedVersionedTags: ["beta-v1", "latest-v1"],
  },
  {
    version: "2.0.0-beta.1",
    expectedLegacyTag: "beta",
    expectedVersionedTags: ["beta-v2", "latest-v2"],
  },
  {
    version: "1.5.0-rc.1",
    expectedLegacyTag: "rc",
    expectedVersionedTags: ["rc-v1", "latest-v1"],
  },
  {
    version: "2.0.0-rc.1",
    expectedLegacyTag: "rc",
    expectedVersionedTags: ["rc-v2", "latest-v2"],
  },
  {
    version: "3.0.0-beta.1",
    expectedLegacyTag: "beta",
    expectedVersionedTags: ["beta-v3", "latest-v3"],
  },
  {
    version: "2.0.1-test.1",
    expectedLegacyTag: "latest",
    expectedVersionedTags: ["latest-v2"],
  },
  {
    version: "2.0.0-betamax.1",
    expectedLegacyTag: "beta",
    expectedVersionedTags: ["latest-v2"],
  },
  {
    version: "2.0.0-1",
    expectedLegacyTag: "latest",
    expectedVersionedTags: ["latest-v2"],
  },
  {
    version: "2.0.0+beta.build",
    expectedLegacyTag: "beta",
    expectedVersionedTags: ["stable-v2", "latest-v2"],
  },
  {
    version: "2.0.0-alpha.beta.rc.1",
    expectedLegacyTag: "rc",
    expectedVersionedTags: ["alpha-v2", "latest-v2"],
  },
  {
    version: "2.0.0-BETA.1",
    expectedLegacyTag: "latest",
    expectedVersionedTags: ["latest-v2"],
  },
]) {
  test(`when the version is ${version} then legacy and major-version tags are selected`, (): void => {
    assert.equal(getNpmTag(version), expectedLegacyTag);
    assert.deepEqual(getVersionedNpmTags(version), expectedVersionedTags);
  });
}

for (const version of [
  "",
  "invalid",
  "2.0",
  "v2.0.0",
  " 2.0.0",
  "2.0.0\n",
  "02.0.0",
  "2.0.0-01",
]) {
  test(`when the version is ${JSON.stringify(version)} then major-version tag selection fails`, (): void => {
    assert.throws(
      (): string[] => getVersionedNpmTags(version),
      new Error(`Invalid release version: ${version}`),
    );
  });
}

for (const { version, expectedChoices } of [
  {
    version: "2.3.4",
    expectedChoices: [
      { title: "next (2.3.5)", value: "2.3.5" },
      { title: "rc-minor (2.4.0-rc.1)", value: "2.4.0-rc.1" },
      { title: "rc-major (3.0.0-rc.1)", value: "3.0.0-rc.1" },
      { title: "beta-minor (2.4.0-beta.1)", value: "2.4.0-beta.1" },
      { title: "beta-major (3.0.0-beta.1)", value: "3.0.0-beta.1" },
      { title: "alpha-minor (2.4.0-alpha.1)", value: "2.4.0-alpha.1" },
      { title: "alpha-major (3.0.0-alpha.1)", value: "3.0.0-alpha.1" },
      { title: "minor (2.4.0)", value: "2.4.0" },
      { title: "major (3.0.0)", value: "3.0.0" },
      { title: "custom (custom)", value: "custom" },
    ],
  },
  {
    version: "2.0.0-alpha.3",
    expectedChoices: [
      { title: "next (2.0.0-alpha.4)", value: "2.0.0-alpha.4" },
      { title: "alpha (2.0.0-alpha.1)", value: "2.0.0-alpha.1" },
      { title: "custom (custom)", value: "custom" },
    ],
  },
  {
    version: "2.0.0-beta.1",
    expectedChoices: [
      { title: "next (2.0.0-beta.2)", value: "2.0.0-beta.2" },
      { title: "beta (2.0.0-beta.1)", value: "2.0.0-beta.1" },
      { title: "custom (custom)", value: "custom" },
    ],
  },
  {
    version: "2.0.0-rc.2",
    expectedChoices: [
      { title: "next (2.0.0-rc.3)", value: "2.0.0-rc.3" },
      { title: "rc (2.0.0-rc.1)", value: "2.0.0-rc.1" },
      { title: "custom (custom)", value: "custom" },
    ],
  },
  {
    version: "2.0.1-test.1",
    expectedChoices: [
      { title: "next (2.0.1)", value: "2.0.1" },
      { title: "rc-minor (2.1.0-rc.1)", value: "2.1.0-rc.1" },
      { title: "rc-major (3.0.0-rc.1)", value: "3.0.0-rc.1" },
      { title: "beta-minor (2.1.0-beta.1)", value: "2.1.0-beta.1" },
      { title: "beta-major (3.0.0-beta.1)", value: "3.0.0-beta.1" },
      { title: "alpha-minor (2.1.0-alpha.1)", value: "2.1.0-alpha.1" },
      { title: "alpha-major (3.0.0-alpha.1)", value: "3.0.0-alpha.1" },
      { title: "minor (2.1.0)", value: "2.1.0" },
      { title: "major (3.0.0)", value: "3.0.0" },
      { title: "custom (custom)", value: "custom" },
    ],
  },
]) {
  test(`when the version is ${version} then release choices keep the existing increments`, (): void => {
    assert.deepEqual(getVersionChoices(version), expectedChoices);
  });
}

test("when the current version is invalid then release choices fail", (): void => {
  assert.throws((): void => {
    getVersionChoices("invalid");
  }, new Error("Invalid version"));
});
