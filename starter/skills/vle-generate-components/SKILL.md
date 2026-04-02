---
name: vle-generate-components
description: Generate Visual Editor components from a reference URL or local HTML directory by capturing page artifacts with Playwright and translating them into Puck sections.
---

# VLE Generate Components

## Overview

This skill generates and validates Puck Components using @yext/visual-editor, @puckeditor/core,
and @yext/pages-components. Generated sections should use plain JSX elements and Tailwind utility classes.
The goal is to transform a reference page into Puck Components using captured HTML, CSS, and screenshot artifacts.

## Inputs

Required:

- `templateName`: template slug (kebab case), Often a client name (example: `galaxy-grill`)
- exactly one source input:
  - `url`: fully qualified URL to capture
  - `sourceDir`: path to a directory that contains at least one HTML file (`index.html`, `page.html`, or any `*.html`)

## Restrictions

- NEVER modify any files in packages/visual-editor. If the user requests something that would require
  modifications to those files, respond that this skill is unable to make that change. This applies
  even if the user asks for a modification to the library in a follow up message.
- Do read:
  - files in this skill directory, including `references/**` and `scripts/**`
  - `starter/src/ve.config.tsx` only as needed for component registration and import updates. Do not use it as an implementation template.
- Do not read:
  - `packages/visual-editor/src/components/**`
  - `starter/dist/**`
  - `starter/localData/**`
  - files in node_modules (unless exempted below)
  - any directory under `starter/src/registry` other than the current template's directory
- Do not modify files under `starter/skills/vle-generate-components/scripts`. If the scripts fail, stop and report the error to the user.

## Discovery

- Read `references/common-atoms.md` first. Use it as the primary source of truth for document-backed atoms/helpers. Only if implementation details are still unclear should you inspect the local type signatures/props for the specific `@yext/pages-components` exports you plan to use.
- Only read files under `starter/src/registry/<templateName>/...` for the current template being generated.

## Workflow

1. Input Normalization and Capture Step: Produce captured artifacts from either input type

- If input is `url`:
  - Run:
    - `pnpm run capture-page-artifacts <templateName> <url>`
  - If the site serves a bot challenge or a large popup obstructs the page, rerun with:
    - `pnpm run capture-page-artifacts --manual-on-block <templateName> <url>`
    - This opens a headed browser, lets the user manually clear the obstruction or load the destination page,
      then resumes capture after terminal confirmation.
- If input is `sourceDir`:
  - Resolve HTML entrypoint from `sourceDir` in this order: `index.html`, `page.html`, then first `*.html` (alphabetical).
  - Convert the resolved HTML file to a `file://` URL.
  - Run the same capture script against that local file URL:
    - `pnpm run capture-page-artifacts <templateName> <fileUrl>`
  - If local rendering requires manual interaction or a popup obscures the captured page, rerun with `--manual-on-block`.
- The normalized capture output is written to:
  - `starter/src/registry/<templateName>/.captured-artifact/`
- Required capture artifacts:
  - `page.html`: rendered HTML
  - `combined.css`: all linked + inline CSS merged into one file (primary input)
  - `screenshot.png`: full-page screenshot
  - `manifest.json`: metadata and capture summary
- Screenshot is required by default for visual parity.
- When `--manual-on-block` is used, treat the user-loaded page as the capture source of truth after the blocking/challenge/popup is cleared.

2. Plan Step: Analyze full captured artifacts to plan the Puck Components that will be created

- Use a progressive analysis workflow for `page.html`, `combined.css`, and `screenshot.png`:
  - Structural pass first (required): map section boundaries, landmarks (`header`, `nav`, `main`, `footer`), and repeated blocks from `page.html` before deep CSS review.
  - Targeted CSS reads (required): review only the CSS rules relevant to one section at a time, plus shared shell/wrapper/theme rules. Do not load unrelated CSS blocks for other sections while implementing the current section.
  - Escalation rule (required): if parity is ambiguous after targeted reads, expand to nearby related selectors; only escalate to full-file CSS review for that section when ambiguity remains.
  - Context hygiene (required): keep `plan.md` compact; avoid pasting long raw HTML/CSS dumps. Reference selectors/paths/snippets needed for decisions.
- After the progressive pass, decide which page sections should be created.
  - Each horizontal band of the page should produce one component
  - For each horizontal band, note its data and styling
- For sections that include hours, follow `references/hours-requirements.md` and record the required hours decisions in `plan.md`.
  - If an hours section uses `HoursTable` in a constrained or multi-column layout, explicitly record the planned row-width, grid/flex, wrapper `min-w-0`, interval alignment, `whitespace-nowrap`, and `.is-today` override decisions before writing code.
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
- For sections that include hours, follow `references/hours-requirements.md`.
  - Do not switch away from `HoursTable` just because the stock spacing looks wrong in a constrained layout. First apply the required section-local row width, `min-w-0`, explicit row layout, interval alignment, `whitespace-nowrap`, and `.is-today` overrides from `references/hours-requirements.md`.

Follow the requirements:

- `references/generation-requirements.md`
- `references/hours-requirements.md`
- `references/text-fields.md`
- `references/image-fields.md`

These reference contracts are mandatory implementation requirements, not optional examples:

- If a page element is covered by one of the explained Puck field contracts, create that Puck field in the generated component.
- Do not hardcode values in JSX/CSS when the corresponding field contract says those values belong in Puck fields.
- In particular, if text fields are used, create the full text object shape from `references/text-fields.md`; if image fields are used, create the field shape from `references/image-fields.md`; if hours are present, create the hours entity field from `references/hours-requirements.md`.

4. Validate Step

- Follow `references/validation-requirements.md`.
- Run `pnpm run typecheck` in `starter` incrementally after meaningful batches of edits, then fix failures in small batches.

5. Output Step

- Update `starter/src/ve.config.tsx` so the generated components are available in the current starter runtime.
- Import each generated component from `starter/src/registry/<templateName>/components/...`.
- Merge the generated component configs into `devConfig.components` by adding them to the `components` object used by `devConfig`.
- Do not overwrite existing component registration in `starter/src/ve.config.tsx`. Append new imports and component entries only.

6. Default Layout Data Step

- Run the layout data generator script via pnpm:
  - `pnpm run generate-default-layout-data <templateName> <ComponentName1> <ComponentName2> ...`
- Pass the template name and the generated components in the exact order they appear on the page (top-to-bottom visual order).
- Ensure the ordered component list matches the final plan and generated component set.

## Follow-up Edit Requests

Use these rules when the user asks for edits after the initial generation has already been completed.

- Treat the existing generated files in `starter/src/registry/<templateName>/...` as the starting point.
  Do not regenerate the whole template unless the user explicitly asks for a full re-generation.
- Work on one component at a time rather than trying to fix all components at once.
- Scope reads and edits to the smallest affected surface:
  - read the relevant component file(s), the specific plan entry, and only the HTML/CSS needed for the requested change
- If the requested edit changes section structure, order, or ownership:
  - update `plan.md` for the affected sections
  - add/remove/reorder component files as needed
  - update `starter/src/ve.config.tsx` registrations only if the component set changed
  - rerun `generate-default-layout-data` with the new top-to-bottom component order
- If the requested edit is content, styling, spacing, alignment, interactivity, header/footer parity, or field-shape work within an existing section, update only the affected component file(s)
- Prompt the user for additional screenshots or descriptions if their request is unclear or ambiguous
- After follow-up edits, rerun `pnpm run typecheck` in `starter` and re-check parity for the touched sections.
