# Visual Parity Checklist

## Main Rule

- The output components should preserve the source page's layout contract, not just its general appearance.
- Validate against the input HTML first and the screenshot second.
- Do not accept "close enough" when spacing, containment, or alignment relationships differ.

## Validation Method

For each section, create a compact layout signature from the source HTML before validating the generated component.

Capture these values explicitly:

- Shell wrapper:
  - full-bleed vs contained
  - max-width
  - horizontal centering
  - padding-top, padding-right, padding-bottom, padding-left
- Immediate content wrapper:
  - width behavior
  - padding-top, padding-right, padding-bottom, padding-left
  - border and border radius
- Layout model:
  - display type (`block`, `flex`, `grid`)
  - flex direction or grid columns
  - justify-content
  - align-items
  - wrap behavior
  - column gap and row gap
- Direct children:
  - order
  - width / flex-basis / max-width
  - margin-top, margin-right, margin-bottom, margin-left
  - padding-top, padding-right, padding-bottom, padding-left
- Text blocks:
  - font family fallback strategy
  - font size
  - line height
  - font weight
  - letter spacing when present
  - text alignment
  - width constraints
- Media blocks:
  - width, height, or aspect ratio
  - object-fit behavior
  - border radius
  - overlays, transparency, and positioning

## Required Checks

The following items must match between the generated component and the source section:

- Background color and background treatment
- Text color
- Font family, size, weight, and line height
- Horizontal and vertical alignment
- Border radius and border widths
- Section containment and max-width
- Per-edge padding and margin
- Gap ownership (`gap` on parent vs margins on children)
- Image sizing, cropping, overlays, and transparency

## Spacing Rules

- Validate spacing per edge. Never collapse spacing review into a single "padding/margin/spacing" check.
- Validate section edge spacing separately from interior spacing.
- Prefer parent-owned spacing for repeated layouts:
  - stack spacing should usually live in `gap` or one shared parent rule
  - do not recreate parent `gap` using repeated child margins unless the source truly does that
- First and last child spacing must not silently change section edges.
- Treat added wrappers as suspicious unless they preserve the same spacing ownership as the source.

## Common Failure Modes

Reject parity if any of these are introduced:

- A new wrapper adds extra horizontal or vertical padding.
- Parent padding and child margins combine into double spacing.
- A `gap` layout is replaced by per-child margins that change first/last item spacing.
- A contained section is generated as full-bleed, or vice versa.
- Width constraints move from the source wrapper to the wrong descendant.
- Flex/grid alignment changes but content still looks superficially similar.
- Screenshot matching relies on compensating with arbitrary spacer values.

## Header And Footer Rules

- Header and footer `defaultProps` links must pass strict 1:1 parity against the plan-step link table.
- Validate parity row-by-row for:
  - section (`header` vs `footer`)
  - group/band placement
  - index/order within group
  - visible label text
  - href
  - expand/collapse behavior
  - hover/click trigger type
- The number of links must match exactly for each header/footer group.
- Do not treat set inclusion as pass criteria. Order and grouping are required.
- Also validate header/footer wrapper spacing:
  - band order
  - group padding
  - inter-group gaps
  - contained vs full-width behavior
- Any mega-menus or complex behavior has been implemented

## Pass Criteria

A section passes only if:

- The layout model matches the source.
- The box model matches at the shell, content wrapper, and direct-child level.
- Spacing ownership matches the source without compensating wrappers or duplicate spacing.
- Text and media constraints match closely enough to preserve the same visual structure.
- Header/footer links and grouping match exactly where applicable.
