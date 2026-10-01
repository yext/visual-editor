import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createReleaseFixture } from "./mocks.js";

for (const {
  name,
  version,
  tags,
  expectedTags,
  expectedUpdate,
  readError,
  updateError,
  expectedError,
} of [
  {
    name: "stable 1.x is the current major",
    version: "1.4.12",
    tags: {
      "latest-v1": "1.4.12",
      latest: "1.4.11",
      "beta-v2": "2.0.0-beta.1",
    },
    expectedTags: {
      "latest-v1": "1.4.12",
      latest: "1.4.12",
      "beta-v2": "2.0.0-beta.1",
    },
    expectedUpdate: ["dist-tag", "add", "@yext/visual-editor@1.4.12", "latest"],
  },
  {
    name: "the first stable 2.x release is available",
    version: "2.0.0",
    tags: { "latest-v1": "1.4.11", "latest-v2": "2.0.0", latest: "1.4.11" },
    expectedTags: {
      "latest-v1": "1.4.11",
      "latest-v2": "2.0.0",
      latest: "2.0.0",
    },
    expectedUpdate: ["dist-tag", "add", "@yext/visual-editor@2.0.0", "latest"],
  },
  {
    name: "a legacy stable release follows stable 2.x",
    version: "1.4.12",
    tags: { "latest-v1": "1.4.12", "latest-v2": "2.0.0", latest: "2.0.0" },
    expectedTags: {
      "latest-v1": "1.4.12",
      "latest-v2": "2.0.0",
      latest: "2.0.0",
    },
  },
  {
    name: "the existing alias has a higher major without a primary tag",
    version: "1.4.12",
    tags: { "latest-v1": "1.4.12", latest: "2.0.0" },
    expectedTags: { "latest-v1": "1.4.12", latest: "2.0.0" },
  },
  {
    name: "the next stable major is available",
    version: "3.0.0",
    tags: { "latest-v2": "2.0.0", "latest-v3": "3.0.0", latest: "2.0.0" },
    expectedTags: {
      "latest-v2": "2.0.0",
      "latest-v3": "3.0.0",
      latest: "3.0.0",
    },
    expectedUpdate: ["dist-tag", "add", "@yext/visual-editor@3.0.0", "latest"],
  },
  {
    name: "the primary tag was rolled back after publication",
    version: "2.0.4",
    tags: { "latest-v2": "2.0.3", latest: "2.0.4" },
    expectedTags: { "latest-v2": "2.0.3", latest: "2.0.3" },
    expectedUpdate: ["dist-tag", "add", "@yext/visual-editor@2.0.3", "latest"],
  },
  {
    name: "the alias already matches a rolled-back primary tag",
    version: "2.0.4",
    tags: { "latest-v2": "2.0.3", latest: "2.0.3" },
    expectedTags: { "latest-v2": "2.0.3", latest: "2.0.3" },
  },
  {
    name: "a beta release is available",
    version: "2.0.0-beta.2",
    tags: { "beta-v2": "2.0.0-beta.2", beta: "2.0.0-beta.1", latest: "1.4.11" },
    expectedTags: {
      "beta-v2": "2.0.0-beta.2",
      beta: "2.0.0-beta.2",
      latest: "1.4.11",
    },
    expectedUpdate: [
      "dist-tag",
      "add",
      "@yext/visual-editor@2.0.0-beta.2",
      "beta",
    ],
  },
  {
    name: "a legacy beta follows a higher beta major",
    version: "1.5.0-beta.1",
    tags: {
      "beta-v1": "1.5.0-beta.1",
      "beta-v2": "2.0.0-beta.1",
      beta: "2.0.0-beta.1",
    },
    expectedTags: {
      "beta-v1": "1.5.0-beta.1",
      "beta-v2": "2.0.0-beta.1",
      beta: "2.0.0-beta.1",
    },
  },
  {
    name: "an alpha release follows a legacy alpha",
    version: "2.0.0-alpha.1",
    tags: {
      "alpha-v1": "1.3.0-alpha.2",
      "alpha-v2": "2.0.0-alpha.1",
      alpha: "1.3.0-alpha.2",
      beta: "3.0.0-beta.1",
    },
    expectedTags: {
      "alpha-v1": "1.3.0-alpha.2",
      "alpha-v2": "2.0.0-alpha.1",
      alpha: "2.0.0-alpha.1",
      beta: "3.0.0-beta.1",
    },
    expectedUpdate: [
      "dist-tag",
      "add",
      "@yext/visual-editor@2.0.0-alpha.1",
      "alpha",
    ],
  },
  {
    name: "an rc alias does not yet exist",
    version: "2.0.0-rc.1",
    tags: { "rc-v2": "2.0.0-rc.1", latest: "1.4.11" },
    expectedTags: { "rc-v2": "2.0.0-rc.1", rc: "2.0.0-rc.1", latest: "1.4.11" },
    expectedUpdate: ["dist-tag", "add", "@yext/visual-editor@2.0.0-rc.1", "rc"],
  },
  {
    name: "the primary tag is missing",
    version: "2.0.0",
    tags: { latest: "1.4.11" },
    expectedTags: { latest: "1.4.11" },
    expectedError: "Missing or invalid npm tag: latest-v2",
  },
  {
    name: "a stable primary tag points to a prerelease",
    version: "2.0.0",
    tags: { "latest-v2": "2.0.0-beta.1", latest: "1.4.11" },
    expectedTags: { "latest-v2": "2.0.0-beta.1", latest: "1.4.11" },
    expectedError: "Missing or invalid npm tag: latest-v2",
  },
  {
    name: "the existing stable alias points to a prerelease",
    version: "2.0.0",
    tags: { "latest-v2": "2.0.0", latest: "2.0.0-beta.1" },
    expectedTags: { "latest-v2": "2.0.0", latest: "2.0.0-beta.1" },
    expectedError: "Invalid npm tag latest",
  },
  {
    name: "the registry read fails",
    version: "2.0.0",
    tags: { "latest-v2": "2.0.0", latest: "1.4.11" },
    expectedTags: { "latest-v2": "2.0.0", latest: "1.4.11" },
    readError: "Registry is unavailable",
    expectedError: "Registry is unavailable",
  },
  {
    name: "the alias update fails",
    version: "2.0.0",
    tags: { "latest-v2": "2.0.0", latest: "1.4.11" },
    expectedTags: { "latest-v2": "2.0.0", latest: "1.4.11" },
    expectedUpdate: ["dist-tag", "add", "@yext/visual-editor@2.0.0", "latest"],
    updateError: "Tag update is not permitted",
    expectedError: "Tag update is not permitted",
  },
]) {
  test(`when ${name} then the alias ${expectedError ? "update fails" : "has the approved version"}`, async (context): Promise<void> => {
    const fixture = await createReleaseFixture({
      version,
      tags,
      readError,
      updateError,
    });
    context.after((): Promise<void> =>
      rm(fixture.directory, { recursive: true, force: true }),
    );
    const result = await fixture.run("updateReleaseTags", [version]);
    const state = await fixture.readState();

    assert.equal(result.exitCode, expectedError ? 1 : 0);
    if (expectedError)
      assert.ok(result.stderr.includes(expectedError), result.stderr);
    else assert.equal(result.stderr, "");
    assert.deepEqual(state.tags, expectedTags);
    assert.deepEqual(state.calls, [
      ["view", "@yext/visual-editor", "dist-tags", "--json", "--prefer-online"],
      ...(expectedUpdate ? [expectedUpdate] : []),
    ]);
  });
}

test("when stable 2.x follows stable 1.x then later 1.x releases keep latest on 2.x", async (context): Promise<void> => {
  const fixture = await createReleaseFixture({
    version: "1.4.12",
    tags: { "latest-v1": "1.4.12", latest: "1.4.11" },
  });
  context.after((): Promise<void> =>
    rm(fixture.directory, { recursive: true, force: true }),
  );
  assert.equal(
    (await fixture.run("updateReleaseTags", ["1.4.12"])).exitCode,
    0,
  );
  const state = await fixture.readState();
  state.tags["latest-v2"] = "2.0.0";
  await writeFile(
    path.join(fixture.directory, "registry.json"),
    JSON.stringify(state),
  );
  assert.equal((await fixture.run("updateReleaseTags", ["2.0.0"])).exitCode, 0);
  state.tags["latest-v1"] = "1.4.13";
  state.tags.latest = "2.0.0";
  state.calls = (await fixture.readState()).calls;
  await writeFile(
    path.join(fixture.directory, "registry.json"),
    JSON.stringify(state),
  );
  assert.equal(
    (await fixture.run("updateReleaseTags", ["1.4.13"])).exitCode,
    0,
  );
  assert.deepEqual((await fixture.readState()).tags, {
    "latest-v1": "1.4.13",
    "latest-v2": "2.0.0",
    latest: "2.0.0",
  });
  assert.equal(
    (await fixture.readState()).calls.filter(
      (call): boolean => call[0] === "dist-tag",
    ).length,
    2,
  );
});

test("when an alias update is retried then the current primary tag is used once", async (context): Promise<void> => {
  const fixture = await createReleaseFixture({
    version: "2.0.4",
    tags: { "latest-v2": "2.0.4", latest: "2.0.3" },
    updateError: "Tag update is not permitted",
  });
  context.after((): Promise<void> =>
    rm(fixture.directory, { recursive: true, force: true }),
  );
  const failed = await fixture.run("updateReleaseTags", ["2.0.4"]);
  assert.equal(failed.exitCode, 1);
  assert.ok(failed.stderr.includes("Tag update is not permitted"));
  const state = await fixture.readState();
  delete state.updateError;
  state.tags["latest-v2"] = "2.0.2";
  await writeFile(
    path.join(fixture.directory, "registry.json"),
    JSON.stringify(state),
  );
  assert.equal((await fixture.run("updateReleaseTags", ["2.0.4"])).exitCode, 0);
  assert.equal((await fixture.run("updateReleaseTags", ["2.0.4"])).exitCode, 0);
  assert.deepEqual((await fixture.readState()).tags, {
    "latest-v2": "2.0.2",
    latest: "2.0.2",
  });
  assert.deepEqual(
    (await fixture.readState()).calls.filter(
      (call): boolean => call[0] === "dist-tag",
    ),
    [
      ["dist-tag", "add", "@yext/visual-editor@2.0.4", "latest"],
      ["dist-tag", "add", "@yext/visual-editor@2.0.2", "latest"],
    ],
  );
});

for (const { args, expectedError } of [
  { args: [], expectedError: "No version specified" },
  { args: ["2.0.0-dev.1"], expectedError: "Unsupported prerelease label" },
  { args: ["invalid"], expectedError: "Invalid release version" },
]) {
  test(`when alias update arguments are ${JSON.stringify(args)} then validation fails before npm runs`, async (context): Promise<void> => {
    const fixture = await createReleaseFixture({ version: "2.0.0" });
    context.after((): Promise<void> =>
      rm(fixture.directory, { recursive: true, force: true }),
    );
    const result = await fixture.run("updateReleaseTags", args);
    assert.equal(result.exitCode, 1);
    assert.ok(result.stderr.includes(expectedError), result.stderr);
    assert.deepEqual((await fixture.readState()).calls, []);
  });
}
