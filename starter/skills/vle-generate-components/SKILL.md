---
name: vle-generate-components
---

# Vle Generate Components

## Overview

This skill generates and validates Puck components using the @yext/visual-editor, @puckeditor/core, @chakra-ui/react,
and @yext/pages-components libraries. The goal is to reproduce an existing website perfectly, transforming the
existing HTML into Puck Components.

## Inputs

Required:

- `client`: client slug (example: `galaxy-grill`)
- `html`: local HTML file path
- `screenshot`: a screenshot of the page

Optional:

- Other .css or .js files referenced in the main html

## Discovery

- Do not read files in node_modules unless absolutely necessary
- Read common-atoms.md instead of the package type definitions for @yext/pages-components
- Do not read files under `packages/visual-editor/src/components`.
- Do not read files under `starter/dist` and `starter/localData`.
- Only read files under `starter/src/components/custom/<client>/...` for the current client being generated.
- Exception: read `starter/src/ve.config.tsx` as needed for component registration and import updates.
- Do not read or adapt files from any other directory under `starter/src/components/custom`.
- Do not try to use `BeautifulSoup`, it is not installed.

## Workflow

1. Plan Step: Analyze the provided HTML to plan the Puck Components that will be created

- Examine the provided HTML and screenshots. Decide which page sections should be created.
  - Each horizontal band of the page should produce one component
  - For each horizontal band, note its data, styling, and hidden/interactive content
- For every planned horizontal band, create a compact layout signature before writing code.
  Follow `references/visual-parity-checklist.md` for the exact signature fields.
- Pay special attention to the header/footer
  - Enumerate every link in the header and footer. Note that there may be multiple
    horizontal bands or groupings of links in the header and footer.
  - Build a parity table for header/footer links with one row per source link and these columns:
    - section (`header` or `footer`)
    - group/band name
    - index within group
    - label text (exact visible text)
    - href (absolute or relative URL exactly as represented in HTML behavior)
    - expand/collapse behavior
    - hover/click trigger type

2. Generate Step: Build Puck components

- Generate one Puck Component per component planned in the previous step
- Use the `<html>` and `<screenshot>` input files to guide component creation

## Follow the requirements:

- `references/generation-requirements.md`
- `references/text-fields.md`
- `references/image-fields.md`

3. Validate Step

- There is one component in `starter/src/components/custom/<client>/components` for each component in the plan.
- `references/generation-requirements.md`, `references/text-fields.md`, and `references/image-fields.md` were followed.
- Run `pnpm run typecheck` in `starter` incrementally after meaningful batches of edits (not after every single file write).
- If typecheck fails, address errors in small batches. Actually fix the issue, don't just relax the typecheck.
- Perform a mandatory parity self-audit before finishing. Pick the three sections with the highest risk of visual regression
  (for example: utility/subnav bands, hero overlays, carousels, accordions, header/footer groupings) and for each one:
  - cite the source HTML/CSS evidence used for layout decisions
  - restate the planned layout signature
  - confirm the implementation matches that signature for background, alignment, spacing ownership, and interaction chrome
  - if any item does not match, fix it before producing the final answer
- Verify header/footer link parity with an exact row-by-row comparison between:
  - source parity table from the plan step
  - resulting header/footer `defaultProps` link arrays
- Ensure YextEntityField was used for images and text fields in every component. If not, go back and add it.

## Follow the requirements:

- `references/visual-parity-checklist.md`

4. Review Step

Treat this step as independent from the previous steps. The goal is to fix common implementation problems.

- Implement any mega-menus or complex sections that were skipped in previous steps
- Ensure all max widths, margins, and padding in the generated components match the input html
  - Particularly important to check for full-width image hero sections
- Ensure all text is aligned to match the input html/screenshot
- Ensure all images have a transparent overlay if present in the original html

5. Output Step

- Do not overwrite existing component registration in `starter/src/ve.config.tsx`.
  Append new component registrations and imports for the generated client components.
  If generated registrations duplicate existing keys/imports, stop and ask the user which resolution strategy to use
  (for example: keep existing, replace existing, or rename the new component key).
- Update the imports of `starter/src/ve.config.tsx` accordingly
