# Validation Requirements

Use this checklist before finishing any generation or follow-up edit request.

## Required Checks

- There is one component in `starter/src/registry/<templateName>/components` for each component in the plan.
- `references/generation-requirements.md`, `references/text-fields.md`, `references/image-fields.md`, and `references/hours-requirements.md` were followed.
- Ensure `YextEntityField` was used for images and text fields in every component. If not, go back and add it.

## Typecheck

- Run `pnpm run typecheck` in `starter` incrementally after meaningful batches of edits, not after every single file write.
- If typecheck fails, address errors in small batches. Actually fix the issue; do not relax the typecheck.

## Visual Parity Checks

- Verify header/footer parity with an exact row-by-row comparison as defined in `references/visual-parity-checklist.md`, using the source parity table from the plan step and the resulting header/footer `defaultProps` link arrays.
- Follow `references/hours-requirements.md` for all hours-specific parity, interaction, timezone, and SSR validation.

## Mandatory Self-Audit

- Perform a parity self-audit before finishing. Pick the three sections with the highest risk of visual regression, for example:
  - core info or location details sections
  - full-width hero sections
  - carousels or accordions
  - header or footer groupings
- For each selected section:
  - cite the source HTML/CSS evidence used for layout decisions
  - restate the planned layout signature
  - confirm the implementation matches that signature for background, alignment, and spacing ownership
  - if any item does not match, fix it before producing the final answer

## Final Sweep

- After self-audit, perform a full-page final sweep across every generated section for:
  - shell and content-wrapper max-width parity, including full-width image hero behavior
  - per-edge margin and padding parity
  - text alignment parity
  - required media overlays and transparency treatment
- If any item does not match, fix it.
- Follow `references/visual-parity-checklist.md` for the full layout-signature and parity method.
