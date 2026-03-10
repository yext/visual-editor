# Component Generation Requirements

Use this contract for every generated component.

## Critical Rules

- Match sections visually as close as possible to 1:1 with the source page (match CSS, layouts, fonts, colors, border-radius, etc.)
- Always match font families, font sizes, font colors, font weight, and background colors 1:1 with the source page
- Always add a Google font equivalent as the fallback for any non-web safe fonts (for example: `'Client Specific Font', 'Open Sans', sans-serif`)
- Everything needed for each component must be contained in a single file (excluding npm imports)
- Use Chakra components wherever possible, but do not use the `sx` prop. Verify the installed interface before generation.

## Required Directory Layout

```text
starter/src/components/custom/<client>/
  components/
    <section-name>.tsx
    ...
```

## Naming Rules

- Display names shown to users should use capitalized words with spaces (for example: `Galaxy Grill`).
- Directory names and file names should be lowercase (prefer kebab-case).
- Component symbols, const/var names, and exported config names should be PascalCase.
- Keep component names stable after first generation; update implementation instead of renaming unless required.
- Prefix client-branded header/footer component symbols with client context (`GalaxyGrillHeaderSection`, `GalaxyGrillFooterSection`).

## Isolation Rules

- Do not import, reference, or adapt sibling client templates under `starter/src/components/custom/<other-client>`.
- Do not read unrelated files in `starter/src` or `packages/visual-editor` to learn conventions or copy implementation patterns.
- Exception: you may read and update `starter/src/ve.config.tsx` so generated components are registered. Registration only needs to work; matching its formatting or conventions is optional.
- Do not read files under `packages/visual-editor/src/components`.
- Only use files in `starter/src/components/custom/<client>/...` within the custom components tree.

## Dependency Rules

- Prefer `@chakra-ui/react`, `@yext/visual-editor`, `@yext/pages-components`, and `@puckeditor/core`.
- Only use another installed library when Chakra cannot match the required behavior cleanly.
- Do not add or use dependencies outside the existing `package.json`.
- ALWAYS use `Address`, `HoursTable`, `HoursStatus`, and `Link` from `@yext/pages-components` when rendering
  any address, hours, ctas, or links. However, they MUST be augmented with CSS/classes to match
  the captured page artifacts

## Puck Section Component Responsibilities

In each `starter/src/components/custom/<client>/components/example-section.tsx`:

- There should be a `ExampleSectionProps` type with the props that will be user-editable in Puck
- There should be a `ExampleSectionFields` of type `Fields<ExampleSectionProps>` that defines
  the Puck fields for the props
- There should be a `ExampleComponent` of type `PuckComponent` that defines rendering for the component.
- There should be a `Example` of type `ComponentConfig`.

## Puck Fields Rules

- Any text on the page should follow `references/text-fields.md`
- Any image on the page should follow `references/image-fields.md`.
- Every Puck field must have a Title Cased label (for example: `Heading Text`).
- Any links on the page should be an object field with Label and Link (href) subfields.
- Repeated items (for example FAQs, cards, header links, footer links) must use an `ArrayField` in Puck and render with `.map(...)` in the component render function.
- All ArrayFields should have a defaultItemProps for adding new items to the array in the editor.
- For repeated item arrays, `defaultProps` must initialize the array length to match the number of items present in `page.html`/`screenshot.png`.
- Hours, Phone, and Address should never be fields. Use the stream document.
- Do not create any style-control fields other than those listed in `text-fields.md` and `image-fields.md`.

## Specialty Component Behaviors

- Hours should always use streamDocument.hours
- Address should always use streamDocument.address
- FAQ/Q&A sections should keep interaction behavior such as show/hide.
- Hero/promo sections should use Chakra-based full-bleed shell wrappers when source parity expects media to reach section edges
  (for example: outer container horizontal padding `0`, content wrapper `maxW="none"`).
- Call To Action and Links should always pair with actionable href/link/CTA data, not just plain text spans.
- Render `Link` from `@yext/pages-components` with visible child text or child markup, not as a self-closing element.
- Headers and Footers:
  - You should implement mega menus or hidden content if found in the captured HTML
  - Use nested arrays in Puck (`ArrayField`) for navigational links.
  - Validate strict 1:1 link parity using `references/visual-parity-checklist.md`.

## Minimum Completion Checklist

- Every major visual band has exactly one section component.
- Header/footer parity has been validated against `references/visual-parity-checklist.md`.
- CTA labels are actionable (link/href/cta), not plain text.
- The output is easy to iterate component-by-component in follow-up prompts.

## Example

See `references/exampleComponent.tsx` for a basic Banner Section starter.
It is a non-authoritative demo only.
When conflicts exist, rules in `*.md` files (especially `generation-requirements.md`, `text-fields.md`, and `image-fields.md`) take precedence.
