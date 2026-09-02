![Yext](yext.svg)

# visual-editor

This library provides components necessary to set up a Pages repository that can interact with Visual Editor in the Yext platform.

## Hooks

| Hook                                                                                 |
| ------------------------------------------------------------------------------------ |
| [usePlatformBridgeDocument](./src/hooks/README.md#usePlatformBridgeDocument)         |
| [usePlatformBridgeEntityFields](./src/hooks/README.md#usePlatformBridgeEntityFields) |

## Components

| Component                                                               |
| ----------------------------------------------------------------------- |
| [Editor](src/editor/README.md#editor)                                   |
| [EntityField](src/editor/README.md#entityfield)                         |
| [YextEntityFieldSelector](src/editor/README.md#YextEntityFieldSelector) |

## Utils

| Function                                                               |
| ---------------------------------------------------------------------- |
| [resolveYextEntityField](./src/utils/README.md#resolveYextEntityField) |

## CLI

`@yext/visual-editor` includes the `yextve` CLI for creating a Section Library revision from the current Git commit. In a repository that uses Visual Editor, install the package and run its local CLI:

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
