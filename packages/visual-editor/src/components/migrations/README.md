# Migrations

Migrations ensure backwards compatibility for component updates. When a site is updated, it immediately begins
using the new components; however, the published and save state data may not reflect the schema of these component updates.
This data is run through `migrate` prior to being rendered so that any migrations will be applied and the data will match with the components.

## When do I need to add a migrations?

1. A component is renamed.

Without a migration, old usages of the component will disappear from the live page and the user will be
required to add the component to the layout again.

2. Component props are updated

Without a migration, new props will not have any data and data contained in old props will not be used.

3. Component fields are updated

If you update some fields, such as select, the new options may not match the old data.

4. A component is removed (optional)

A removed component will automatically disappear from the live page as well as showing a "No Configuration for" message in the editor. Add a removed migration to handle this.

## How do I create a migration?

In the `migrations` directory, create a new file of the form `1234_example_migration.ts` where
the number increases sequentially and the rest of the name is a brief description of the migration.

In that file, export an object of type `Migration`, which is object mapping component names to
`MigrationActions` (see [migrate.ts](https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/utils/migrate.ts)).
The component name should be the name the component is registered as in
`ve.config.ts` or [`_componentCategories.ts`](https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/components/_componentCategories.ts).

There are three [`MigrationActions`](https://github.com/yext/visual-editor/blob/1210ee5bae73bff1456563b57506ff163fa59cb6/packages/visual-editor/src/utils/migrate.ts#L11):

### Removed

Removes a component from all layouts.

```ts
{
  action: "removed";
}
```

### Renamed

Renames all existing usages of a component to `newName`.
This name should be the name of the component as it is registered as in `ve.config.ts` or `_componentCategories.ts`.

```ts
{ action: "renamed", newName: string }
```

### Updated

Transforms the existing props to the new set of props.
See https://puckeditor.com/docs/api-reference/functions/transform-props

```ts
{
  action: "updated";
  propTransformation: (oldProps: Record<string, any>) => Record<string, any>;
}

// Example
// Renames a prop from "heading" to "title" while keeping all other props
{
  action: "updated";
  propTransformation: ({ heading, ...props }) => ({ title: heading, ...props });
}
```

In `migrationRegistry.ts`, import your migration and append it to the array. Migrations are run in order.

## How do I test a migration?

In the local dev starter, create a layout with the existing components. Log the layout data
and save it somewhere. Then, make your component updates. In the editor, set the layout data
to your previously saved data. Confirm the old data is migrated to the new version successfully.

### Adding Test Cases

When updating a component requires a migration, new test cases should be added.
Each component has a `Component.test.tsx` file with an array of
[ComponentTests](https://github.com/yext/visual-editor/blob/1210ee5bae73bff1456563b57506ff163fa59cb6/packages/visual-editor/src/components/testing/componentTests.setup.ts#L32).

The first two ComponentTests test the default props of the current version of the component.
The `expect` cases should be updated to match the new version.

The rest of the ComponentTests test specific component versions. These should not be
updated unless making an intentional breaking change to existing component usages.

For the new version, two test cases should be added: one using all Entity Values
possible for the component and another using all Constant Values.
It is recommended to configure the component in the `localDev` editor, log
the component data, and copy it into the test file.
