![Yext](yext.svg)

# visual-editor

This library provides components necessary to set up a Section Library Pages repository that can interact with Visual Editor in the Yext platform.

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

The command reads the selected Git remote URL and the current commit hash, creates the Section Library if it does not already exist (after confirmation), then creates a revision. It waits for the revision build to finish and displays its elapsed time.

Each layout may include one optional preview image directly in its layout directory. Name the file `preview.png`, `preview.jpg`, `preview.jpeg`, or `preview.webp`; it must be 20 MiB or smaller. During deployment, the image from the selected Git commit is uploaded to mktgcdn and used as that layout's preview image. Once a layout's preview image is set, it can be overwritten by a new image. If no image is present, that layout's former preview image is used.

Before deploying, create a Yext API App in the Yext platform Developer Console and grant it Section Library API write access and have the API key on hand.

Configuration values resolve in this order: environment variable, `.yextrc` in the repository root, then an interactive prompt.

| Environment variable | `.yextrc` field | Description                                       |
| -------------------- | --------------- | ------------------------------------------------- |
| `YEXT_ACCOUNT_ID`    | `accountId`     | Yext account ID                                   |
| `YEXT_UNIVERSE`      | `universe`      | Yext environment (`production` or `sandbox`)      |
| `YEXT_API_KEY`       | `apiKey`        | App API key with Section Library API write access |
| `YEXT_ORIGIN`        | `origin`        | Git remote name                                   |

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
