# Development

This library uses [pnpm](https://pnpm.io/).

## Navigating the codebase

- `locales`: Contains translations for hardcoded strings.
- `cli`: A CLI bundled with `@yext/visual-editor` containing section library development helpers.
- `components`: React helpers for Sections. Also contains the built-in migrations.
- `editor`: Contains the functionality and entrypoints for the part of the Visual Editor that is iframed into Storm.
- `fields`: Types, field definitions, and render helpers for many types of Puck fields supported by Visual Editor.
- `internal`: Various utilities and components used by fields, editor, etc. but not publicly exported
- `local-editor`: Supports the Section Library local development editor.
- `utils`: Various utilities for use in Sections that are publicly exported.
- `vite-plugin`: The Section Library build helper.

## Testing workflow

### Automated tests

#### `pnpm run test:editor`

Runs all tests not under `src/components`. Recommended to run locally during development

#### `pnpm run test:components`

Runs all tests under `src/components` (the screenshot tests). You can run these locally, however it is expected
that they will fail on the first run due to environment differences. Do not commit screenshot updates, Github
Actions is the authoritative source.

### Manual Testing

This tool is meant to be used alongside a repository set up for Yext Pages Section Libraries, it is recommended to
test any changes against a section library.

- Section library starter: [yextsolutions/pages-visual-editor-starter](https://github.com/yextsolutions/pages-visual-editor-starter).
- Yext-created section libraries: [yext-section-libraries](https://github.com/orgs/yext-section-libraries/repositories)

By default, the starter repository references a non-local version of @yext/visual-editor.
To point the starter at this local repository, first run `pnpm pack`, then update the starter's
package.json's @yext/visual-editor dependency to `file:../path/to/the/pack.tgz`.

- using `pnpm pack --pack-destination ~` will place the packed file in your root directory and
  may be easier to access. Either way the command will print the file path upon completion. It
  should look something like `~/yext-visual-editor-[version tag].tgz`

After running this the first time to get and set your file path, an example script to automate this
would look like:

```shell
#!/bin/bash
cd ~/path/to/visual-editor
pnpm i
pnpm pack
cd ~/path/to/starter
npm i @yext/visual-editor --force
npm run dev
```

You should then be able to test your changes leveraging the Visual Editor local-editor.

## Other Notes

### Tailwind

This repo uses Tailwind v3.

This library uses a Tailwind prefix to isolate it's styling. See [docs](https://tailwindcss.com/docs/configuration#prefix).
This means tailwind classes should be prefixed with "ve-" to work properly. Ex:

```tsx
<Box className="ve-w-1/3 ve-flex ve-bg-secondary" />
```

For consistency custom css class should also have the "ve-" prefix.

### Exports

Everything the library exports can be found in `src/index.ts`. Each subdirectory (components,
hooks, and utils) have their own `index.ts` which lists out more verbose exports. You should
follow this pattern when modifying exports. Do not publicly export anything from internal.

### GitHub Actions

We have a number of automated GitHub actions that run when you make a PR including:

- linting and formatting
- building
- running unit tests
- [semantic PR check](https://github.com/marketplace/actions/semantic-pull-request)
- semgrep check
- third party notices generation

### Husky

Husky provides a pre commit hook that runs code linting and formatting.

`pnpm run autofix`
This will run eslint and prettier for you to ensure your code is up to quality standard. It's
recommended to run this after making changes.
