# Implement dynamic themes in a section library

Update the section library to consume the versioned theme payload and live theme controls supplied by `@yext/visual-editor`. Update copied components as well as generated templates: upgrading the package alone does not change source files already copied into a library.

Use the Visual Editor `dynamic-theme` checkout at `/Users/blife/yext-js/visual-editor` as the implementation reference. Its working-tree files include the feature; a published package with the same version number may not. First verify that the dependency used by the section library contains these APIs. The `theme-overhaul` branch is not an implementation dependency.

## 1. Inventory the library before editing

Read the target repository's `AGENTS.md` files. Identify the source of generated files and the library's existing migration registry, component registry, catalog, editor, preview, and published templates.

Search both authored and generated code for:

```bash
rg -n 'defaultThemeConfig|ThemeConfig|themeResolver|internalThemeResolver|themeConfig' src
rg -n 'palette-|BACKGROUND_COLOR|SITE_COLOR|CTA_VARIANT|BODY_VARIANT|ctaVariant|typographyId|actionId' src
rg -n 'font-(h[1-6]|body|button|link)|text-(h[1-6]|body|button|link)|on-dark|--display-link-caret' src
rg -n 'HeadingSlot|AddressSlot|PhoneSlot|defaultProps|defaultItemProps|resolveFields|resolveData' src
```

Capture representative existing layouts and their themes before changing props. Include headings on mobile, nested backgrounds, links and buttons, custom colors, typography overrides, generated card slots, and any site-specific variants. Use the old library's appearance as the preservation baseline.

**Complete when:** every theme consumer has an owner and a corresponding source file or template to update, including code that constructs component props programmatically.

## 2. Apply the public contract

The package owns theme validation, collection editing, CSS generation, font loading, and built-in theme conversion. The section library owns its component props, forwarding, local styles, custom schemas, and library-specific layout migrations.

| Concern           | Contract                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| Theme             | `ThemeData`, `themeDataSchema`, and `validateThemeData` from the package entrypoint     |
| Collections       | Ordered, nonempty `colors`, `typography`, and `actions`; the first entry is the default |
| Identity          | Stable `id`; editable `label`. Save identifiers, never display labels or array indices  |
| Shared color      | `{ colorId: string, channel: "background" \| "foreground" }`                            |
| Typography        | An independent `typographyId`; HTML heading semantics remain separate                   |
| Action            | An `actionId`; the selected entry owns button/link presentation and its own typography  |
| Overrides         | Existing component values keep precedence; unspecified properties continue to inherit   |
| Missing selection | Render the first compatible option while preserving the saved identifier                |
| Theme properties  | Mobile sizes/line heights and default/hover/active state values are required            |

Import copied-component dependencies through `@yext/visual-editor/section-library-support`, and general public APIs through `@yext/visual-editor`. Read the [support entrypoint](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/sectionLibrarySupport.ts) before choosing an import; its exports differ from the root entrypoint. Keep imports out of package implementation paths such as `src/internal` or `dist` chunks.

For payload creation or direct editing, clone `defaultThemeData`, change the collections, and call `validateThemeData` before saving. Its `errors` and `warnings` include structured `path` arrays. Errors block saving; recoverable missing/incompatible color references produce warnings. Preserve custom-font metadata and let the package discover fonts across all typography and action entries.

The current [schema](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/types/themeData.ts) is authoritative for supported properties and values. Actions contain typography properties directly; they do not reference typography groups.

Each action's `default`, `hover`, and `active` states define its light-background appearance. An optional `onDark` object contains a complete second set of those states for dark backgrounds; omitting it reuses the light states. `Background` selects the appearance from its resolved background color. Nested backgrounds reset it. For image overlays or gradients, use `ve-theme-on-dark` or `ve-theme-on-light` to select an appearance explicitly.

`validateThemeData` requires typography and action font families to exactly match a bundled Google Font or available custom font selector value, for example `'Open Sans', 'Open Sans Fallback', sans-serif`. Pass the available custom font registry as its second argument: `validateThemeData(theme, customFonts)`. The editor supplies this registry for both field changes and JSON imports. Missing or mismatched fallback names, incorrect generic families, and unavailable fonts are errors at the entry's `fontFamily` path. Legacy shorthand stacks remain renderable but must be corrected before saving through validation.

### Removed APIs and files

| Previous dependency                                                        | Replacement                                                                                   |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `defaultThemeConfig`, developer `ThemeConfig`, runtime `themeResolver`     | Versioned saved theme data and `applyTheme`                                                   |
| `themeConfig` editor/shell prop                                            | Remove the prop; the package reads the saved theme                                            |
| `internalThemeResolver.ts`                                                 | Removed; use public runtime helpers or shared atoms                                           |
| `themeResolver.ts` as a merge utility                                      | `deepMerge` remains exported publicly; its package implementation is now `utils/deepMerge.ts` |
| `defaultThemeData.json`                                                    | Typed object in `utils/defaultThemeData.ts`, exported as `defaultThemeData`                   |
| Internal `ThemeData` re-export                                             | Import `ThemeData` directly from a public package entrypoint                                  |
| `StyleSelectOption` / `TailwindConfig` imported from `themeResolver.ts`    | Type imports from `@yext/visual-editor`; their definitions now live in `types/types.ts`       |
| `CTAVariant`, CTA `variant`, Address `ctaVariant`, `isCtaVariantWithColor` | `actionId`, selected presentation, and ordinary component color overrides                     |
| `ThemeOptions.CTA_VARIANT` / `BODY_VARIANT`                                | Live action / typography collection fields                                                    |
| Old palette and role CSS variables/classes                                 | Shared atoms, entry attributes, and the new page variables                                    |

Retain unrelated options such as heading levels, alignment, spacing choices, phone formats, and image options. `BACKGROUND_COLOR` and `SITE_COLOR` remain supported field option names, but now resolve the current collection. They are not fixed arrays to enumerate for generation.

## 3. Update fields and their renderers together

This example uses the package's live controls while retaining component-level custom colors:

```tsx
import {
  Background,
  CTA,
  Heading,
  type ThemeColor,
  type YextFields,
} from "@yext/visual-editor/section-library-support";

type PromoStyles = {
  background?: ThemeColor;
  typographyId?: string;
  actionId?: string;
  color?: ThemeColor;
};

export const promoStyleFields: YextFields<PromoStyles> = {
  background: {
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
    label: "Background",
  },
  typographyId: {
    type: "themeCollection",
    collection: "typography",
    label: "Typography",
  },
  actionId: {
    type: "themeCollection",
    collection: "actions",
    label: "Action preset",
  },
  color: {
    type: "basicSelector",
    options: "SITE_COLOR",
    label: "Text color",
  },
};

export const Promo = ({
  styles,
  title,
  href,
}: {
  styles: PromoStyles;
  title: string;
  href: string;
}) => (
  <Background background={styles.background}>
    <Heading level={2} typographyId={styles.typographyId} color={styles.color}>
      {title}
    </Heading>
    <CTA
      actionId={styles.actionId}
      link={href}
      linkType="URL"
      normalizeLink={true}
      label="Details"
    />
  </Background>
);
```

Keep new selection identifiers unset when the component has no authored choice; package fields and atoms use the first available entry. Reserve deterministic `main-*` assignments for migration or an explicitly authored baseline layout.

For a shared-only pair selector, `type: "themeCollection", collection: "colors"` stores an identifier suitable for `Background.backgroundId`. Adding `channel: true` stores a `ThemeColorReference`. For existing component color controls, retain the `basicSelector` option names shown above, or use `themeColor` when the component needs transformed render values. These paths preserve custom-color controls. A shared-only collection field does not provide custom literals.

Selecting a background pair establishes its foreground for descendants. Let ordinary text inherit it unless a local color is authored. Shared backgrounds support gradients and alpha; foregrounds support alpha. Use `getThemeColorCssValue(reference, true)` for text/border CSS so gradient references receive a compatible solid fallback. Use `resolveThemeColor(theme, reference, true)` for concrete solid values. For map APIs requiring hex specifically, use `getThemeColorHexValue` from the root entrypoint; a resolved color may still be RGB or HSL.

### Follow the matching updated components

All paths below refer to the Visual Editor checkout. Compare the relevant diff against `main`, then adapt it to the library's own component names, content bindings, and custom styles.

| Copied component or responsibility  | Reference and changes to carry over                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Headings                            | [HeadingText.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/contentBlocks/HeadingText.tsx): add `typographyId` to props and fields, forward it to `Heading`, retain semantic level and alignment                                                                                                                                                                                                       |
| Plain text and rich text            | [body.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/atoms/body.tsx), [styledText.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/helpers/styledFields/styledText.tsx), [maybeRTF.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/helpers/maybeRTF.tsx): selected typography, inheritance, and local overrides across both rendering paths |
| Buttons, links, CTAs                | [cta.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/atoms/cta.tsx), [ComprehensiveCTA.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/helpers/ComprehensiveCTA.tsx): forward `actionId`; presentation follows the selected preset, while link destination/button behavior stays separate                                                                                 |
| Address and phone                   | [Address.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/contentBlocks/Address.tsx), [Phone.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/contentBlocks/Phone.tsx): expose and forward `actionId`, preserve custom colors, update `resolveFields` visibility paths                                                                                                      |
| Breadcrumbs and linked images       | [Breadcrumbs.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/Breadcrumbs.tsx), [Image.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/contentBlocks/image/Image.tsx): previously implicit links now need action selection and forwarding                                                                                                                         |
| Directory containers and lists      | [Directory.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/directory/Directory.tsx), [DirectoryWrapper.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/directory/DirectoryWrapper.tsx): carry action selection through the container into list links                                                                                                    |
| Directory cards and generated slots | [DirectoryCard.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/directory/DirectoryCard.tsx): preserve nested slot styling and selections when constructing or synchronizing cards; review every prop constructor against the current child types                                                                                                                                               |
| Locator heading and controls        | [Locator.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/locator/Locator.tsx), [LocatorWrapper.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/locator/LocatorWrapper.tsx): forward page-heading typography and resolve shared colors                                                                                                                   |
| Locator result cards                | [LocatorResultCard.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/locator/LocatorResultCard.tsx): independent typography selectors and action selectors for primary/secondary CTAs, directions, phone, and email                                                                                                                                                                              |
| Surfaces, spacing, and images       | [background.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/atoms/background.tsx), [pageSection.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/atoms/pageSection.tsx), [image.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/atoms/image.tsx): pair inheritance, page variables, and image sizing                                         |
| Maps                                | [MapPinIcon.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/sections/locator/MapPinIcon.tsx), [MapboxStaticMap.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/contentBlocks/MapboxStaticMap.tsx): resolve concrete colors with the correct channel and format                                                                                                            |

Audit copied default builders separately from renderers. For example, a builder still constructing `AddressSlot.styles.ctaVariant` must write or preserve `actionId` instead. Spreading existing props can hide obsolete keys from TypeScript excess-property checks. Keep slot IDs, parent bindings, linked/manual sources, and existing overrides intact.

For styled CTA controls, follow [ComprehensiveCTAField.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/fields/styledFields/ComprehensiveCTAField.tsx) and [baseText.tsx](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/fields/styledFields/baseText.tsx). Button/link presentation changes must retain existing shared typography overrides. Font-dependent choices should follow the inherited preset font without resetting an authored weight or italic choice merely because the preset changed. Add no override properties, status indicators, or reset controls.

Prefer the shared atoms over copying their implementation. Their `data-ve-background`, `data-ve-typography`, and `data-ve-action` attributes connect DOM elements to generated entry styles; they are not analytics attributes. If custom DOM is necessary, resolve the entry with `useThemeData` and `resolveThemeEntry`, then apply its resolved identifier to the matching attribute on an element with the `components` class. Keep the original saved identifier in props. Generate any needed variable names with `themeVariable`, never labels or a hand-maintained role map.

New page CSS variables are `--ve-page-content-max-width`, `--ve-page-section-vertical-spacing`, `--ve-image-border-radius`, `--ve-card-border-radius`, and `--ve-card-border-width`. Generated entry rules have low specificity so ordinary component classes and inline overrides can keep precedence. Preserve unrelated styling, but remove old role classes, old variable aliases, and runtime on-dark variants.

**Complete when:** each field is forwarded through every wrapper and slot to its renderer, and a theme with completely different identifiers works without changing component code.

## 4. Update templates and generation

Use the current [published template](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/vite-plugin/templates/section-library-render.tsx), [editor template](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/vite-plugin/templates/section-library-editor.tsx), and [config template](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/vite-plugin/templates/section-library-config.tsx) as references. Edit the library's template sources and regenerate derived files through its normal workflow, preserving site-specific integrations.

- Call `applyTheme(document, relativePrefixToRoot)` in the published head and `applyTheme(document, "./")` in the editor head. Remove the former theme-config argument and `themeConfig` props.
- Retain `SectionLibraryVisualEditorProvider`, stylesheets, translation loaders, and the existing editor/preview setup. They supply the document and live theme context.
- Retain `toPuckFields` conversion for custom Yext field definitions and keep hidden/shared slot components registered.
- Preserve the `migrate(...builtInRegistry, libraryRegistry)` call before `resolveAllData` and rendering. Pass the library registry into the editor and local shell through `sectionLibraryMigrationRegistry`.

Use native `themeCollection` definitions and package color schemas where possible. Package-managed editor/local generation rebuilds registered catalogs using the active theme. A library-owned generation service must pass `themeData` to `createPuckGenerationCatalog(components, { themeData })` and rebuild after theme replacement. `inferFieldZodSchema(field, { themeData })` also supports current-theme inference.

For custom explicit schemas, construct choices with `z.literal(entry.id).describe(entry.label)` and include the channel for individual color references. Verify the final model-facing JSON Schema, not just the Zod object: each option's display name must survive conversion. Supply the same current-theme contract to page creation, page updates, section creation, and section edits. Keep theme-bound schemas out of process-global caches that can reuse another site's choices.

**Complete when:** published and editor rendering share the payload, and generation offers only the active theme's identifiers and per-option labels after live replacement.

## 5. Migrate library-owned layouts

The package converts old site themes into deterministic `main-*` entries at loading boundaries. Its append-only [dynamic layout migration](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/migrations/0084_dynamic_theme.ts) converts common saved selections and some known component shapes. Library migrations run after built-in migrations. A renamed library component or custom prop shape may still need its own conversion.

Append a migration to the library's existing registry for each uncovered shape. Preserve every existing migration and both registry version markers. Audit historical layouts, local storage, undo history, pasted/reset layouts, previews, and published loading paths. Route them through the established package/editor flows rather than adding a second theme engine.

For example, a copied phone component registered under a custom name needs its old implicit link selection materialized if the built-in migration did not identify it:

```ts
import type { Migration } from "@yext/visual-editor";

// For a component whose historical default was the ordinary light-surface link.
export const contactPhoneActionMigration: Migration = {
  ContactPhone: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      styles: {
        ...props.styles,
        actionId: props.styles?.actionId ?? "main-link",
      },
    }),
  },
};
```

Choose migration identifiers from the package's [default data](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/utils/defaultThemeData.ts) and [theme conversion](/Users/blife/yext-js/visual-editor/packages/visual-editor/src/components/migrations/themeData.ts). Historical dark-surface links may need an already-materialized inverse entry; custom presentation/typography roles need a deliberate mapping. If that choice depends on ancestors, inspect the content tree in a content migration rather than guessing inside an isolated prop transformation. Keep those historical rules inside migrations.

Preserve identifiers already written by built-in migration, custom literals, foreground overrides, local typography, and component identity. Different pages must choose the same site-wide entry identifiers without random IDs or dependence on page-open order. Do not generate site-wide theme entries inside a component migration. For new components, use collection defaults rather than migration mappings.

**Complete when:** independently migrated pages resolve against the same valid theme, repeating migration leaves data unchanged, and runtime rendering contains no old role resolution.

## 6. Verify and hand off

Use the target library's existing validation, type-check, test, generation, and build commands. Keep new cases in its existing suites where practical. Follow its local instructions; for this work, leave `i18n:update` to the user and do not run Docker component tests. If optional screenshots run, clean up generated differences before finishing.

Verify all of the following against both an old migrated theme and two valid themes with entirely different identifiers:

- Rename/reorder preserves saved selections; deletion falls back without rewriting them; each relevant selector updates with the collection.
- Heading semantics are independent of typography, with mobile typography below 640px.
- Background pairs establish inherited foreground; channel selection, gradients, transparency, and solid fallbacks work.
- Action typography is independent; button/link presentation follows the preset; hover and active values apply explicitly.
- Existing component overrides and custom colors survive preset and font changes, including generated or synchronized card slots.
- Missing references are visible as warnings; invalid direct payload updates are rejected through the public validator.
- Model-facing schemas contain only the current theme's choices and preserve option descriptions across every generation workflow.
- Migrations preserve literals, overrides, history, and independently migrated page references.
- Published output, editor, and preview agree; referenced custom and catalog fonts load after live theme replacement.

Deliver a changed-component inventory, appended migration details, checks actually run, and any remaining visual differences. Separate an environment-blocked screenshot run from a passing visual comparison.
