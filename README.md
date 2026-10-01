![Yext](yext.svg)

# visual-editor

This library provides components necessary to set up a Section Library Pages repository that can interact with Visual Editor in the Yext platform.

## Package releases

Run `pnpm run release` from this repository. Select a version and check the npm
tag in the confirmation prompt. The command pushes a Git release tag. CI then
publishes the package with its primary npm tag and updates the release alias.

| Release type      | Primary npm tag   | Release alias |
| ----------------- | ----------------- | ------------- |
| Stable            | `latest-v<major>` | `latest`      |
| Alpha             | `alpha-v<major>`  | `alpha`       |
| Beta              | `beta-v<major>`   | `beta`        |
| Release candidate | `rc-v<major>`     | `rc`          |

For example, `2.0.0-beta.1` uses `beta-v2`. Stable `2.0.0` uses `latest-v2`.
Only `alpha`, `beta`, and `rc` prerelease labels are supported. A stable tag must
always point to a stable release.

Each alias follows the highest released major version for its release type.
`latest` follows stable 1.x until the first stable 2.x release. After that, a
1.x release updates `latest-v1` and keeps `latest` on 2.x. Prerelease tags have
the same rule, separately for each release type.

Tags select the approved release. They can point to an earlier version after
rollback. A consumer that requires stable 2.x must use `latest-v2`. It can use
`rc-v2`, `beta-v2`, or `alpha-v2` before that stable tag exists.

### Release setup

Apply the release scripts and workflows to both the main branch and
`release/1.x` before creating new release tags. CI reads the workflow from the
release commit. Release jobs use one shared queue so their tag updates run
one at a time.

Publishing CI uses Node 24.x and npm 12.2.0. In the npm package settings,
configure the Trusted Publisher to allow both `npm publish` and `npm dist-tag`.
Keep the repository, `publish.yml` workflow filename, and `Release` environment. Older Trusted Publisher connections may permit publication only.

Before the first release with these rules, read the existing tags:

```sh
npm dist-tag ls @yext/visual-editor
```

Add the corresponding primary tag for each existing release alias. Confirm
the version numbers against the registry before running these initial setup
commands. The versions below were the current alias values on 2026-10-01.

```sh
npm dist-tag add @yext/visual-editor@1.4.11 latest-v1
npm dist-tag add @yext/visual-editor@2.0.0-beta.1 beta-v2
npm dist-tag add @yext/visual-editor@1.3.0-alpha.2 alpha-v1
```

Keep the existing aliases. Create `latest-v2` with the first stable 2.x release.
These commands require npm tag-write access.

### Recover an alias update

If publication succeeds but the alias update fails, CI fails and reports the
published version. Correct the npm access or registry error. From this
repository, run the alias update with that published version:

```sh
pnpm run ci-update-release-tags 2.0.0
```

Do not publish the package again. The recovery command reads the current
primary tag. If that tag was rolled back, the command uses the approved
rollback version. Repeated execution is safe.

### Roll back a release

Complete any active release job before changing tags. Set the primary tag to
the approved published version. For example, to roll back stable 2.x:

```sh
npm dist-tag add @yext/visual-editor@2.0.3 latest-v2
pnpm run ci-update-release-tags 2.0.3
```

The second command also changes `latest` if it follows 2.x. It keeps `latest`
on a higher stable major version if one exists. Use the same steps with the
appropriate primary tag for a prerelease rollback.

Consumers must resolve the tag again to get the rollback version. A later
release updates its primary tag and can update its alias again.

### Check release scripts

```sh
pnpm run typecheck:release
pnpm run test:release
```

The release tests use a local npm mock. They do not publish packages or change
registry tags.

## CLI

`@yext/visual-editor` includes the `yextve` CLI for creating a Section Library revision from the current Git commit. In a repository that uses Visual Editor, install the package and run its local CLI:

### Deploy

```sh
npx yextve deploy
```

Run the command from the dependent repository's root. That repository must include `src/library/library.json`:

```json
{
  "id": "my-section-library",
  "displayName": "My Section Library",
  "description": "Reusable sections for my site."
}
```

The command reads the selected Git remote URL and the current commit hash, then creates a revision. With terminal input, it offers to create a missing Section Library. Without terminal input, a missing Section Library is an error: create it before deploying. The command waits for the revision build to finish and returns success only when the build succeeds.

For the built-in Section Library accounts, the API stores library IDs with a `yext_` prefix. When the configured account and universe match a built-in account, `deploy` adds that prefix to the ID from `library.json` if needed. For example, `bar-social-dining` is deployed as `yext_bar-social-dining` in sandbox account `3343916`.

Each layout may include one optional preview image directly in its layout directory. Name the file `preview.png`, `preview.jpg`, `preview.jpeg`, or `preview.webp`; it must be 1 MiB or smaller. During deployment, the image from the selected Git commit is uploaded to mktgcdn and used as that layout's preview image. Once a layout's preview image is set, it can be overwritten by a new image. If no image is present, that layout's former preview image is used.

Before deploying, create a Yext API App in the Yext platform Developer Console and grant it Section Library API write access and have the API key on hand.

Configuration values resolve in this order: `--universe` (for the universe only), environment variable, `.yextrc` in the repository root, then an interactive prompt. `--universe` and `YEXT_UNIVERSE` cannot be used together.

| Environment variable | `.yextrc` field | Description                                       |
| -------------------- | --------------- | ------------------------------------------------- |
| `YEXT_ACCOUNT_ID`    | `accountId`     | Yext account ID                                   |
| `YEXT_UNIVERSE`      | `universe`      | Yext environment (`production` or `sandbox`)      |
| `YEXT_API_KEY`       | `apiKey`        | App API key with Section Library API write access |
| `YEXT_ORIGIN`        | `origin`        | Git remote name                                   |

When stdin is a TTY, `deploy` prompts for missing values, asks whether to use or replace a complete saved configuration, and offers to save prompted values in `.yextrc`. Without a TTY, all four values must be present and valid through the environment, `.yextrc`, or `--universe`. The command does not prompt or write `.yextrc` in that mode. For example, an orchestrator can set the four environment variables once and run `yextve deploy` with detached stdin in each pre-provisioned library repository.

A dirty working tree requires `--allow-dirty`, and a commit that already has a revision requires `--allow-duplicate`, when stdin is not a TTY. Interactive deployments continue to ask for confirmation. Both modes wait for the submitted revision build to succeed or fail.

Use `--verbose` (or `-v`) to print API request details and response data:

```sh
npx yextve deploy --verbose
```

### Convert legacy templates

Use this engineering tool when you convert one or more legacy templates in a
starter repository to a Section Library. Run it from the section library repository.

```sh
npx --package=@yext/visual-editor@latest yextve convert-template
```

The default is a dry run. It validates the starter and reports the
planned library, layouts, and duplicate component IDs. Add `--apply` to replace
the `src/library` directory. Add `--delete-source` with `--apply` to
remove converted `src/registry/<template-id>` directories after replacement.

```sh
npx --package=@yext/visual-editor@latest yextve convert-template \
  --apply --delete-source
```

If the starter does not contain the base Directory and Locator source, the
converter adds it to the converted Section Library. The converter creates one
Entity layout per legacy template, keeps the first source for each component ID
in sorted template order, and reports all duplicate IDs.

### Add Directory and Locator

Run this command from a Section Library repository to add editable Directory
and Locator sections and layouts. If `src/library/library.json` exists, its ID
prefixes the generated layout IDs. Otherwise, the IDs are `directory` and
`locator`.

```sh
npx --package=@yext/visual-editor@latest yextve add-directory-locator
```

The command stops before overwriting existing shared, Directory, or Locator
source. Pass `--overwrite` to replace those files after reviewing the generated
output.
