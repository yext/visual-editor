---
name: vle-generate-components
description: Generate Visual Editor components from a reference URL by capturing page artifacts with Playwright and translating them into Puck sections.
---

# VLE Generate Components

## Overview

This skill generates and validates Puck Components using the @yext/visual-editor, @puckeditor/core, @chakra-ui/react,
and @yext/pages-components libraries. The goal is to transform a reference page into Puck Components
using captured HTML, CSS, and screenshot artifacts.

## Inputs

Required:

- `templateName`: template slug (kebab case), Often a client name (example: `galaxy-grill`)
- `url`: fully qualified URL to capture

## Restrictions

- Do read:
  - files in this skill directory, including `references/**` and `scripts/**`
  - `starter/src/ve.config.tsx` only as needed for component registration and import updates. Do not use it as an implementation template.
- Do not read:
  - `packages/visual-editor/src/components/**`
  - `starter/dist/**`
  - `starter/localData/**`
  - files in node_modules (unless absolutely necessary)
  - any directory under `starter/src/registry` other than the current template's directory
- Do not modify files under `starter/skills/vle-generate-components/scripts`. If the scripts fail, stop and report the error to the user.

## Discovery

- Read common-atoms.md instead of the package type definitions for @yext/pages-components
- Only read files under `starter/src/registry/<templateName>/...` for the current template being generated.

## Workflow

1. Capture Step: Open the URL and save page artifacts

- Run the capture script:
  - `pnpm run capture-page-artifacts <templateName> <url>`
  - If the site serves a bot challenge, rerun with `pnpm run capture-page-artifacts --manual-on-block <templateName> <url>`.
    This opens a headed browser, lets the user manually complete the challenge or load the destination page,
    then resumes capture after terminal confirmation.
- The capture output is written to:
  - `starter/src/registry/<templateName>/.captured-artifact/`
- Required capture artifacts:
  - `page.html`: rendered HTML
  - `combined.css`: all linked + inline CSS merged into one file (primary input)
  - `screenshot.png`: full-page screenshot
  - `manifest.json`: metadata and capture summary
- Screenshot is required by default for visual parity.
- When `--manual-on-block` is used, treat the user-loaded page as the capture source of truth after the challenge is cleared.

2. Plan Step: Analyze full captured artifacts to plan the Puck Components that will be created

- Use a progressive analysis workflow for `page.html`, `combined.css`, and `screenshot.png`:
  - Structural pass first (required): map section boundaries, landmarks (`header`, `nav`, `main`, `footer`), and repeated blocks from `page.html` before deep CSS review.
  - Targeted CSS reads (required): review only the CSS rules relevant to one section at a time, plus shared shell/wrapper/theme rules. Do not load unrelated CSS blocks for other sections while implementing the current section.
  - Escalation rule (required): if parity is ambiguous after targeted reads, expand to nearby related selectors; only escalate to full-file CSS review for that section when ambiguity remains.
  - Context hygiene (required): keep `plan.md` compact; avoid pasting long raw HTML/CSS dumps. Reference selectors/paths/snippets needed for decisions.
- After the progressive pass, decide which page sections should be created.
  - Each horizontal band of the page should produce one component
  - For each horizontal band, note its data and styling
- For every planned horizontal band, create a compact layout signature before writing code.
  Follow `references/visual-parity-checklist.md` for the exact signature fields.
- Pay special attention to the header/footer
  - Enumerate every link in the header and footer. Note that there may be multiple
    horizontal bands or groupings of links in the header and footer.
  - Build a header/footer parity table using the required columns from `references/visual-parity-checklist.md`.
- Write the full plan to:
  - `starter/src/registry/<templateName>/.captured-artifact/plan.md`
- `plan.md` should include:
  - page metadata (url/title/captured timestamp)
  - ordered section list (top-to-bottom)
  - one layout signature per section
  - header/footer link parity table
  - implementation checklist that maps each planned section to a target component filename

3. Generate Step: Build Puck components

- Generate one Puck Component per component planned in the previous step
- Use `page.html`, `combined.css`, `screenshot.png`, and `plan.md` to guide component creation

## Follow the requirements:

- `references/generation-requirements.md`
- `references/text-fields.md`
- `references/image-fields.md`

4. Validate Step

- There is one component in `starter/src/registry/<templateName>/components` for each component in the plan.
- `references/generation-requirements.md`, `references/text-fields.md`, and `references/image-fields.md` were followed.
- Run `pnpm run typecheck` in `starter` incrementally after meaningful batches of edits (not after every single file write).
- If typecheck fails, address errors in small batches. Actually fix the issue, don't just relax the typecheck.
- Verify header/footer parity with an exact row-by-row comparison as defined in `references/visual-parity-checklist.md`,
  using the source parity table from the plan step and the resulting header/footer `defaultProps` link arrays.
- Ensure YextEntityField was used for images and text fields in every component. If not, go back and add it.
- Perform a mandatory parity self-audit before finishing. Pick the three sections with the highest risk of visual regression
  (for example: utility/subnav bands, hero overlays, carousels, accordions, header/footer groupings) and for each one:
  - cite the source HTML/CSS evidence used for layout decisions
  - restate the planned layout signature
  - confirm the implementation matches that signature for background, alignment, and spacing ownership
  - if any item does not match, fix it before producing the final answer
- After self-audit, perform a full-page final sweep across every generated section for:
  - shell and content-wrapper max-width parity, including full-width image hero behavior
  - per-edge margin and padding parity
  - text alignment parity
  - required media overlays and transparency treatment
  - if any item does not match, fix it

## Follow the requirements:

- `references/visual-parity-checklist.md`

5. Output Step

- Do not overwrite existing component registration in `starter/src/ve.config.tsx`.
  Append new component registrations and imports for the generated template components.
  If generated registrations duplicate existing keys/imports, stop and ask the user which resolution strategy to use
  (for example: keep existing, replace existing, or rename the new component key).
- Update the imports of `starter/src/ve.config.tsx` accordingly

6. Default Layout Data Step

- Run the layout data generator script via pnpm:
  - `pnpm run generate-default-layout-data <templateName> <ComponentName1> <ComponentName2> ...`
- Pass the template name and the generated components in the exact order they appear on the page (top-to-bottom visual order).
- Ensure the ordered component list matches the final plan and generated component set.
