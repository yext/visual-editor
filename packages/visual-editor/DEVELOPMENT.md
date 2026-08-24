# Development

This library uses [pnpm](https://pnpm.io/).

## Navigating the codebase

### src

This directory houses all the source code for visual-editor.

#### components

Find EntityField and Editor in this directory.
EntityFieldProvider is used to wrap everything in InternalEditor, EntityField is exported - they live in the same file.
Editor essentially handles getting all the data required for InternalEditor and renders
InternalEditor once all the requisite data is loaded.

#### hooks

Find usePlatformBridgeDocument in this directory. This calls internal useMessage hooks to fetch data
from the Yext platform.

#### [utils](./src/utils/README.md)

#### internal

This directory houses all the code internal to the library. Find useMessage hooks, Puck-specific
ui elements, types, helper functions, and the InternalEditor in this directory. The structure is
largely the same as `src` with `components` housing InternalEditor, `hooks` housing the useMessage
suite, `utils` housing a tailwind classname utility and local storage helper. Puck and types are
named accordingly.

### test

This directory houses all the library's unit tests which are automatically run by GitHub when
a PR is made. We highly recommend running the tests yourself as you develop code using `pnpm run 
test`.

## Testing workflow

This tool is meant to be used alongside a repository set up for Yext Pages, it is recommended to
test any changes against a starter repository. One such starter is
[yextsolutions/pages-visual-editor-starter](https://github.com/yextsolutions/pages-visual-editor-starter).

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

You should then be able to test your changes leveraging the Visual Editor dev mode.

`pnpm run test`
This will automatically run all the unit tests in the library, it's recommended to run this
after making changes.

### Convert legacy templates

Use this engineering tool when you convert one or more legacy templates in a
starter repository to a Section Library. Run it from `packages/visual-editor`.

```sh
pnpm run convert-templates-to-section-library -- \
  --target <starter-path>
```

The default is a dry run. It validates the target starter and reports the
planned library, layouts, and duplicate component IDs. Add `--apply` to replace
the target `src/library` directory. Add `--delete-source` with `--apply` to
remove converted `src/registry/<template-id>` directories after replacement.

```sh
pnpm run convert-templates-to-section-library -- \
  --target <starter-path> --apply --delete-source
```

The target starter must already contain the base Directory and Locator Section
Library source. The converter creates one Entity layout per legacy template. It
keeps the first source for each component ID in sorted template order and
reports all duplicate IDs.

`pnpm run autofix`
This will run eslint and prettier for you to ensure your code is up to quality standard. It's
recommended to run this after making changes.

### A note on Tailwind

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

### Automated jobs

#### GitHub

We have a number of automated GitHub actions that run when you make a PR including:

- linting and formatting
- building
- running unit tests
- [semantic PR check](https://github.com/marketplace/actions/semantic-pull-request)
- semgrep check
- third party notices generation

### Husky

Husky provides a pre commit hook that runs code linting and formatting.
