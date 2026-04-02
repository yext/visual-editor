# Hours Requirements

Use this contract for every section that renders hours.

## Planning Requirements

- For every section that includes hours, decide the render mode before writing code:
  - use `HoursStatus` if the source has a live status line
  - use `HoursTable` if the source is still fundamentally a weekday-plus-interval table
  - only fall back to custom hours rendering when the layout cannot be matched with stock props, stock templates, and CSS overrides
- For every section that includes hours, decide whether stock `HoursStatus` / `HoursTable` are sufficient or whether custom render-time time logic is actually required:
  - if the source can be matched with stock `HoursStatus` / `HoursTable`, prefer them and do not add custom `DateTime.now()` logic
  - only require a two-pass, hydration-safe approach when the implementation adds custom render-time time calculations beyond the stock hours components
- For each hours section, explicitly decide and document:
  - time format
  - day label format (`Mon` vs `Monday` vs custom)
  - whether status shows a separator
  - whether status shows a future day name
  - whether table labels include punctuation such as `:`
  - whether the section uses stock hours components only or custom render-time time logic
  - whether the section is constrained enough to require explicit `HoursTable` row-width / `min-w-0` / interval alignment overrides

## Rendering Requirements

- Hours must always render from `streamDocument.hours`. Never hardcode hours text copied from the captured HTML, CSS, or plan into component output.
- Choose the simplest rendering path that matches the source artifacts:
  - use `HoursStatus` when the source already uses a compact live-status pattern
  - use `HoursTable` when the source is close to stock day-and-interval rows
  - for source hours blocks that combine a status line and a weekly schedule, implement a wrapper around `HoursStatus` and `HoursTable` before considering custom hours rendering
  - use custom hours rendering only when the source requires non-stock row structure or ordering that cannot be achieved with stock props, stock templates, and CSS
- When using `HoursStatus`, prefer `currentTemplate`, `separatorTemplate`, `futureTemplate`, `timeTemplate`, `dayOfWeekTemplate`, and `statusTemplate` before writing custom status logic.
- When using `HoursTable`, prefer `dayOfWeekNames`, `startOfWeek`, `collapseDays`, `intervalStringsBuilderFn`, and section-local `className` overrides before replacing it with custom markup.
- When the stock hours table's default CSS causes width or spacing problems, keep `HoursTable` and fix layout with section-local className overrides such as row width, grid/flex layout, `min-w-0`, and `is-today` overrides.
- When `HoursTable` is used in narrow or multi-column layouts, always inspect spacing. The stock CSS gives rows a fixed width and bolds `.is-today`, which can cause overlap and visual mismatches. Before switching to custom hours markup, add section-local `className` overrides for row width, row layout, `min-w-0`, interval alignment, and `.is-today`.
- `HoursTable` has stock layout CSS that is hostile to constrained or multi-column layouts. In `hours.css`, `.HoursTable-row` is a flex row with a fixed width and `.is-today` is bold by default. In side-by-side tables or narrow containers this often causes overlap, bad spacing, or unwanted emphasis. Do not treat these as reasons to abandon `HoursTable`. First fix them with section-local `className` overrides.
- Before going custom for stock-style hours tables, try these fixes in order:
  - force each `HoursTable` column wrapper to `min-w-0`
  - override `.HoursTable-row` to `width: 100%`
  - prefer an explicit two-column row layout in tight spaces such as `grid-cols-[dayWidth_minmax(0,1fr)]`
  - set `min-w-0` on `.HoursTable-row` and `.HoursTable-intervals`
  - right-align `.HoursTable-intervals` when the source does
  - use `whitespace-nowrap` on `.HoursTable-interval` when the source keeps intervals on one line
  - override `.is-today` when the source does not bold the current day
- When a section uses two side-by-side `HoursTable` columns, do not stop after adding `w-full` on the table root. Also apply `min-w-0` to each column wrapper and explicit row-level overrides on `.HoursTable-row`, `.HoursTable-intervals`, and `.HoursTable-interval`.
- Do not switch to custom hours rendering just to change copy, separators, spacing, bolding, borders, or chevrons.
- Use `HoursStatus` templates for source-specific open/closed copy before considering custom status logic.
- For custom schedule tables, prefer fixed weekday ordering over "current week" calculations unless the source explicitly shows today-relative ordering or highlighting.
- Do not add a live open/closed status line unless the source shows one or the user explicitly requests it.
- Do not inject extra dynamic status text or a stock table when the source shows a simpler hours treatment.
- During implementation, pass explicit props/templates for any visible behavior that differs from library defaults.

## Timezone And SSR Rules

- Stock `HoursStatus` and `HoursTable` can be rendered directly. Do not add extra two-pass handling unless you introduce custom render-time time logic outside those components.
- If the section should be SSR-stable, do not add custom `DateTime.now()` logic.
- If custom live logic is required beyond the stock hours components, use `streamDocument.timezone`, use a two-pass render, and compute against `const now = DateTime.now().setZone(streamDocument.timezone)`.
- `DateTime.now()` in render is disallowed unless the implementation is explicitly two-pass and hydration-safe.

## Validation Requirements

- Verify `HoursStatus` and `HoursTable` output token-by-token against the source, including separators, future day names, abbreviated/custom day labels, and punctuation.
- Verify hours parity for every touched hours section, including interaction and state parity:
  - if the source has no live status line, confirm the implementation does not add one
  - if the source has grouped or custom hours rows, confirm custom hours rendering is justified because stock props, stock templates, and CSS overrides could not match it
  - if the source is a stock-style hours block, confirm `HoursTable` or `HoursStatus` was not replaced with unnecessarily custom logic
  - if the source hours UI expands, collapses, toggles, or shows an affordance such as a chevron/caret, confirm the implementation preserves that behavior and default state
  - if the source uses constrained or side-by-side `HoursTable` columns, confirm the implementation explicitly overrides row width, row layout, wrapper `min-w-0`, interval `min-w-0`, interval alignment, and `.is-today` styling as needed for parity
- Verify hours timezone and SSR safety for every touched hours section:
  - stock `HoursStatus` / `HoursTable` usage should not add custom SSR handling unless extra render-time time logic was introduced
  - SSR-stable sections must not use custom `DateTime.now()` logic
  - any custom implementation that uses `DateTime.now()` during render must also use `streamDocument.timezone` and an explicit two-pass, hydration-safe pattern
  - reject custom hours rendering when `HoursStatus` and `HoursTable` with wrapper state/template/prop overrides would match the source
- Any hours mismatch is a required fix, not an acceptable approximation.
