# Component Generation Requirements

Use this contract for every generated component.

## Critical Rules

- Match sections visually as close as possible to 1:1 with the source page (match CSS, layouts, fonts, colors, border-radius, etc.)
- Always match font families, font sizes, font colors, font weight, and background colors 1:1 with the source page
- Treat each section's outer shell as responsible for ambient background color and vertical spacing so there are no unintended white seams between adjacent sections.
- Always add a Google font equivalent as the fallback for any non-web safe fonts (for example: `'Template Specific Font', 'Open Sans', sans-serif`)
- Everything needed for each component must be contained in a single file (excluding npm imports)
- Use plain JSX elements and Tailwind utility classes for layout and styling.

## Required Directory Layout

```text
starter/src/registry/<template>/
  components/
    <SectionName>.tsx
    ...
```

## Naming Rules

- Display names shown to users should use capitalized words with spaces (for example: `Galaxy Grill`).
- Directory names should be lowercase.
- Component `.tsx` file names should be PascalCase.
- Component symbols, const/var names, and exported config names should be PascalCase.
- Keep component names stable after first generation; update implementation instead of renaming unless required.
- Prefix template-branded header/footer component symbols with template context (`GalaxyGrillHeaderSection`, `GalaxyGrillFooterSection`).

## Isolation Rules

- Do not import, reference, or adapt sibling templates under `starter/src/registry/<other-template>`.
- Do not read unrelated files in `starter/src` or `packages/visual-editor` to learn conventions or copy implementation patterns.
- Exception: you may read and update `starter/src/ve.config.tsx` so generated components are registered. Registration only needs to work; matching its formatting or conventions is optional.
- Do not read files under `packages/visual-editor/src/components`.
- Only use files in `starter/src/registry/<template>/...` within the template registry tree.

## Dependency Rules

- Prefer `@yext/visual-editor`, `@yext/pages-components`, and `@puckeditor/core`, plus plain React/JSX and Tailwind classes.
- Do not introduce another UI library for generated components unless the user explicitly requests it.
- Do not add or use dependencies outside the existing `package.json`.
- ALWAYS use `Address` and `Link` from `@yext/pages-components` for addresses and real links/CTAs, not UI toggles.
- Hours must always use a `YextEntityField<HoursType>` prop backed by an entity field selector, with default props `{ field: "hours", constantValue: {} }`.
- Follow `references/hours-requirements.md` for hours planning, rendering, parity, and timezone/SSR rules.
- Images should be based on a url or svg. They should not use a `file://` url.

## Puck Section Component Responsibilities

In each `starter/src/registry/<template>/components/ExampleSection.tsx`:

- There should be a `ExampleSectionProps` type with the props that will be user-editable in Puck
- There should be a `ExampleSectionFields` of type `Fields<ExampleSectionProps>` that defines
  the Puck fields for the props
- There should be a `ExampleSectionComponent` of type `PuckComponent` that defines rendering for the component.
- There should be a `ExampleSection` of type `ComponentConfig`.

## Puck Fields Rules

- Any text on the page should follow `references/text-fields.md`
- Any image on the page should follow `references/image-fields.md`.
- The contracts in `references/text-fields.md`, `references/image-fields.md`, and `references/hours-requirements.md` are required output shapes, not optional examples.
- If one of those references explains a field shape for content in the section, generate that full Puck field shape in the component.
- Do not hardcode values in render/CSS when those values belong in the explained Puck field shape.
- In particular, do not reduce text fields to only the `text` selector while hardcoding font size, color, weight, or text transform. Those must be created as Puck subfields exactly as described in `references/text-fields.md`.
- Every Puck field must have a Title Cased label (for example: `Heading Text`).
- Any links on the page should be an object field with Label and Link (href) subfields.
- Repeated items (for example FAQs, cards, header links, footer links) must use an `ArrayField` in Puck and render with `.map(...)` in the component render function.
- All ArrayFields should have a defaultItemProps for adding new items to the array in the editor.
- For repeated item arrays, `defaultProps` must initialize the array length to match the number of items present in `page.html`/`screenshot.png`.
- Hours should always be an entity field selector, not hardcoded output.
- Phone and Address should never be fields. Use the stream document.
- Do not create any style-control fields other than those listed in `text-fields.md` and `image-fields.md`.

## Specialty Component Behaviors

- Address should always use streamDocument.address
- Phone should use the stream document value and render in a properly formatted human-readable form.
- FAQ/Q&A sections should keep interaction behavior such as show/hide.
- Hero/promo sections should use plain JSX full-bleed shell wrappers when source parity expects media to reach section edges
  (for example: outer container classes like `px-0`, content wrapper classes like `max-w-none`).
- When source parity requires media to fill its container, apply sizing to both the media element and its wrapper so cards and hero images truly render full-height/full-width with cover behavior.
- Call To Action and Links should always pair with actionable href/link/CTA data, not just plain text spans.
- Render `Link` from `@yext/pages-components` with visible child text or child markup, not as a self-closing element.
- Preserve source vertical and horizontal alignment behavior for multi-column blocks
- Preserve source list-marker visibility for bullets
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

See `references/ExampleSection.tsx` for an example section starter.
It is a non-authoritative demo only.
When conflicts exist, rules in `*.md` files take precedence, especially:

- `generation-requirements.md`
- `hours-requirements.md`
- `validation-requirements.md`
- `text-fields.md`
- `image-fields.md`
