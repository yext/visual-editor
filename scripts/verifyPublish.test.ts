import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createReleaseFixture } from "./mocks.js";

for (const { name, version, args, expectedTag, expectedError } of [
  {
    name: "a stable 1.x tag matches",
    version: "1.4.11",
    args: ["v1.4.11"],
    expectedTag: "latest-v1",
  },
  {
    name: "a stable 2.x tag matches",
    version: "2.0.0",
    args: ["v2.0.0"],
    expectedTag: "latest-v2",
  },
  {
    name: "an alpha tag matches",
    version: "2.0.0-alpha.1",
    args: ["v2.0.0-alpha.1"],
    expectedTag: "alpha-v2",
  },
  {
    name: "a beta tag matches",
    version: "2.0.0-beta.1",
    args: ["v2.0.0-beta.1"],
    expectedTag: "beta-v2",
  },
  {
    name: "an rc tag matches",
    version: "2.0.0-rc.1",
    args: ["v2.0.0-rc.1"],
    expectedTag: "rc-v2",
  },
  {
    name: "a future major tag matches",
    version: "3.0.0",
    args: ["v3.0.0"],
    expectedTag: "latest-v3",
  },
  {
    name: "no tag is supplied",
    version: "2.0.0",
    args: [],
    expectedError: "No tag specified",
  },
  {
    name: "the Git tag has no v prefix",
    version: "2.0.0",
    args: ["2.0.0"],
    expectedError: "Invalid Git release tag",
  },
  {
    name: "the Git tag has an extra prefix",
    version: "2.0.0",
    args: ["release-v2.0.0"],
    expectedError: "Invalid Git release tag",
  },
  {
    name: "the Git tag has two v prefixes",
    version: "2.0.0",
    args: ["vv2.0.0"],
    expectedError: "Invalid release version",
  },
  {
    name: "the Git tag has an extra suffix",
    version: "2.0.0",
    args: ["v2.0.0v"],
    expectedError: "Invalid release version",
  },
  {
    name: "the version has an unknown prerelease label",
    version: "2.0.0-dev.1",
    args: ["v2.0.0-dev.1"],
    expectedError: "Unsupported prerelease label",
  },
  {
    name: "the package version differs",
    version: "2.0.1",
    args: ["v2.0.0"],
    expectedError: "mismatches with current version",
  },
]) {
  test(`when ${name} then verification ${expectedError ? "fails" : "returns CI outputs"}`, async (context): Promise<void> => {
    const fixture = await createReleaseFixture({ version });
    context.after((): Promise<void> =>
      rm(fixture.directory, { recursive: true, force: true }),
    );
    const result = await fixture.run("verifyPublish", args, {
      GITHUB_OUTPUT: path.join(fixture.directory, "github-output"),
    });

    assert.equal(result.exitCode, expectedError ? 1 : 0);
    assert.equal(result.stdout, expectedTag ?? "");
    if (expectedError)
      assert.ok(result.stderr.includes(expectedError), result.stderr);
    else assert.equal(result.stderr, "");
    assert.equal(
      await readFile(path.join(fixture.directory, "github-output"), "utf8"),
      expectedTag ? `npm_tag=${expectedTag}\npackage_version=${version}\n` : "",
    );
    assert.deepEqual((await fixture.readState()).calls, []);
  });
}

test("when verification runs locally then it prints the npm tag", async (context): Promise<void> => {
  const fixture = await createReleaseFixture({ version: "2.0.0-beta.1" });
  context.after((): Promise<void> =>
    rm(fixture.directory, { recursive: true, force: true }),
  );
  const result = await fixture.run("verifyPublish", ["v2.0.0-beta.1"]);
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "beta-v2");
  assert.equal(result.stderr, "");
});
