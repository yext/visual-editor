import assert from "node:assert/strict";
import test from "node:test";
import { getNpmTag } from "./releaseUtils.js";

for (const { version, expectedTag } of [
  { version: "1.4.11", expectedTag: "latest-v1" },
  { version: "2.0.0", expectedTag: "latest-v2" },
  { version: "3.0.0", expectedTag: "latest-v3" },
  { version: "1.3.0-alpha.2", expectedTag: "alpha-v1" },
  { version: "2.0.0-alpha.1", expectedTag: "alpha-v2" },
  { version: "1.5.0-beta.1", expectedTag: "beta-v1" },
  { version: "2.0.0-beta.1", expectedTag: "beta-v2" },
  { version: "1.5.0-rc.1", expectedTag: "rc-v1" },
  { version: "2.0.0-rc.1", expectedTag: "rc-v2" },
  { version: "2.0.0+beta.1", expectedTag: "latest-v2" },
  { version: "2.0.0-beta.1+rc.1", expectedTag: "beta-v2" },
]) {
  test(`when version is ${version} then its npm tag is ${expectedTag}`, (): void => {
    assert.equal(getNpmTag(version), expectedTag);
  });
}

for (const { version, expectedError } of [
  { version: "invalid", expectedError: "Invalid release version: invalid" },
  { version: "2.0", expectedError: "Invalid release version: 2.0" },
  { version: "v2.0.0", expectedError: "Invalid release version: v2.0.0" },
  { version: " 2.0.0", expectedError: "Invalid release version:  2.0.0" },
  { version: "2.0.0\n", expectedError: "Invalid release version: 2.0.0\n" },
  {
    version: "2.0.0-dev.1",
    expectedError: "Unsupported prerelease label: dev",
  },
  {
    version: "2.0.0-betamax.1",
    expectedError: "Unsupported prerelease label: betamax",
  },
  {
    version: "2.0.0-latest.1",
    expectedError: "Unsupported prerelease label: latest",
  },
  { version: "2.0.0-1", expectedError: "Unsupported prerelease label: 1" },
]) {
  test(`when version is ${JSON.stringify(version)} then tag selection fails`, (): void => {
    assert.throws((): string => getNpmTag(version), new Error(expectedError));
  });
}
