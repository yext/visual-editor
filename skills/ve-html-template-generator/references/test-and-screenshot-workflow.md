# Test and Screenshot Workflow

Use this on every generation as the default post-generation parity workflow.

## Goal

- Create a smoke test that renders the generated client template/config.
- Capture screenshots for quick visual review.
- Reuse the existing Vitest browser + screenshot matcher workflow.
- Prefer section-level source-vs-generated comparison before whole-page comparison.
- Always capture section-level source-vs-generated parity in one pass (report-first defaults).

## Scaffold Test

Run:

```bash
python3 scripts/scaffold_client_template_smoke_test.py \
  --client-slug <client> \
  --template-path starter/src/templates/<client>/<client>-template.tsx \
  --config-path starter/src/templates/<client>/<client>-config.tsx
```

This creates:

- `packages/visual-editor/src/components/generated/<Client>Template.smoke.test.tsx`

## Required Section Parity (Default)

Run:

```bash
python3 scripts/scaffold_client_template_section_parity_test.py \
  --client-slug <client> \
  --html-path /path/to/source.html \
  --config-path starter/src/templates/<client>/<client>-config.tsx \
  --overwrite
```

This creates:

- `packages/visual-editor/src/components/generated/<Client>Template.section-parity.test.tsx`
- `packages/visual-editor/src/components/generated/<Client>Template.section-parity.source.html`

Run section parity test:

```bash
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

For a brand-new generated parity test, run once with `--update` to seed screenshot baselines:

```bash
pnpm -C packages/visual-editor exec vitest run --update \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

After the initial parity run, apply one focused correction pass immediately, then rerun smoke + section parity.
After those reruns, run final build checks:

```bash
pnpm -C packages/visual-editor build
pnpm -C starter build
```

Default workflow is now: `generate -> parity -> correction pass -> rerun -> build gate`.

Optional section parity controls:

```bash
CLIENT_TEMPLATE_SECTION_PARITY_LIMIT=10 \
CLIENT_TEMPLATE_SECTION_PARITY_ALL_VIEWPORTS=1 \
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

Optional section parity gate:

```bash
CLIENT_TEMPLATE_SECTION_PARITY_MAX_DIFF=<pixel-threshold> \
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

## Optional Full-Page Parity

Optional full-page parity scaffold:

```bash
python3 scripts/scaffold_client_template_visual_parity_test.py \
  --client-slug <client> \
  --html-path /path/to/source.html \
  --config-path starter/src/templates/<client>/<client>-config.tsx \
  --overwrite
```

This creates:

- `packages/visual-editor/src/components/generated/<Client>Template.visual-parity.test.tsx`
- `packages/visual-editor/src/components/generated/<Client>Template.source.html`

## Run Test

Run only the generated test:

```bash
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.smoke.test.tsx
```

For a brand-new generated smoke test, run once with `--update` to seed screenshot baselines:

```bash
pnpm -C packages/visual-editor exec vitest run --update \
  src/components/generated/<Client>Template.smoke.test.tsx
```

Smoke screenshots should capture full page height so lower-page sections (for example footer/legal) are included in review.

Run visual parity test:

```bash
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.visual-parity.test.tsx
```

For a brand-new generated visual parity test, run once with `--update` to seed screenshot baselines:

```bash
pnpm -C packages/visual-editor exec vitest run --update \
  src/components/generated/<Client>Template.visual-parity.test.tsx
```

Optional parity gate:

```bash
CLIENT_TEMPLATE_PARITY_MAX_DIFF=<pixel-threshold> \
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.visual-parity.test.tsx
```

## Test Expectations

Generated smoke tests should:

- render a minimal layout using the generated client config
- verify no fatal render errors
- run across desktop/tablet/mobile viewports
- capture full rendered page height screenshots for baseline visual review

Generated visual parity tests should:

- capture section-level source screenshot baselines and generated section screenshots
- log diff pixel counts per section so large regressions are easy to triage
- default to report-only behavior unless explicit parity thresholds are provided
- treat section pairing as a heuristic by source order and generated section registration order (manual review is still required)
- capture source HTML screenshot baselines per viewport
- capture generated template screenshots per viewport
- log source-vs-generated diff pixel counts
- optionally fail when diff exceeds `CLIENT_TEMPLATE_PARITY_MAX_DIFF`

## Notes

- Keep smoke tests lightweight; they are intended for rapid iteration feedback.
- Keep screenshot parity advisory-first: fix missing media/structure/wiring issues first, then tune styling.
- Do not break baseline slot behavior or field editability for screenshot parity wins.
- Apply a single parity-driven correction pass by default; only run extra passes for severe mismatches or explicit user request.
- Prioritize high-impact parity fixes: missing imagery/maps, wrong section hierarchy, readability/contrast failures, and major spacing/layout breaks.
- Treat hierarchy/order mismatches as mandatory correction targets in the default pass (for example stacked store info ordering, header/footer theme contrast).
- For map sections that require API keys, prefer deterministic fallbacks and modest screenshot thresholds.
- If the local environment cannot run browser screenshot tests, still generate the test file and report that execution was skipped.
- Use parity screenshots as an iterative loop: fix largest visual gaps first (missing media, spacing, hierarchy, contrast), rerun parity test, repeat.
