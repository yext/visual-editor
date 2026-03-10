# Theming

Shared styling in the components should be extracted to a set of global variables.

## Potential Theme Properties

- text color
- background color
- accent color
- font family
- font size
- font weight
- max width

For each of these properties, there can be multiple variables to handle:

- different heading levels (h1, h2, etc.) and body text (p)
- links (anchor tags) and buttons
- primary/secondary/etc. colors
- different sections of the page, but only when the same section role is reused across components or is clearly part of a site-wide brand pattern

## Theme Decision Rule

Create a theme variable if:

- a style property and values are shared between components
- a user might reasonably want to modify the style property

DO NOT create a theme variable if:

- a style property is unique to a single component
- each component has a different value for a given styling property
- a section-specific value does not repeat and is not part of a reusable brand system

## Theme Key Naming Rule

Use all-kebab-case CSS variable names in the following format:
`--[[template-name]]-[[description-of-where-the-variable-is-used]]-[[description-of-the-corresponding-css-property]]`

Examples: `--galaxy-grill-h1-text-color`, `--galaxy-grill-header-link-font-size`

## Component Code Updates

- Update the components to use the created theme variables instead of hardcoded styling

Example:
`<Text color="var(--galaxy-grill-text-color)" fontFamily="var(--galaxy-grill-text-font-family)" fontSize="var(--galaxy-grill-text-font-size)" fontWeight={"var(--galaxy-grill-text-font-weight)"} lineHeight="20px">`

## Non-goals

- Do not add runtime loading for theme.json in this step.
- Do not rewrite existing visual-editor theme infrastructure.

## Theme Value Output

Write to `starter/src/registry/<templateName>/theme.json`.
This file is for future use.
The json should be a mapping of
key: the variable name
value: the default value of the variable

Example:

```json
{
  "--galaxy-grill-text-color": "#444444",
  "--galaxy-grill-text-font-family": "'Open Sans', sans-serif",
  "--galaxy-grill-text-font-size": "18px",
  "--galaxy-grill-text-font-weight": "400"
}
```

Also write a version of these values to `starter/src/registry/<templateName>/theme.txt`.
This version should be a drop-in ready `<style>` tag.
