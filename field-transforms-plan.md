# Field transforms: minimal implementation

## Contract

VisualEditor resolves supported Yext content fields automatically at the render boundary, based on field type. There is no resolution opt-in flag. The existing StyledTextComponent and ComprehensiveCTA consume transformed content directly. No raw-or-resolved guessing is needed.

Defaults, editor controls, `resolveData`, layouts, and migrations continue to use authored values. Component render props receive plain resolved data. The existing `YextComponentConfig<Props, typeof fields>` derives render props from the field schema. Define fields with `satisfies YextFields<Props>` to preserve their concrete field types. Standalone render functions use `typeof ComponentConfig.render`; no manual render-prop overrides are needed. There are no new `Resolved*` types, component-definition helpers, source wrappers, or renderer APIs.

The editor uses Puck fieldTransforms. Published pages use the same registry through `VisualEditorRender`, since Puck 0.22.2's `Render` does not accept fieldTransforms. The section-library render template uses `VisualEditorRender` too. Both use the page's StreamDocument and content locale.

## Fields with transforms

| Yext field             | Resolution                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `entityField`          | Resolve mapped or constant content, translations, and embedded references. Structured data remains structured, including addresses, hours, images, rich text, numbers, and booleans. |
| `entityField.repeated` | Resolve manual or linked items using the existing mapping definitions and correct item document. Components read the resulting array instead of calling `resolveItems`.              |
| `translatableString`   | Select the locale and resolve embedded references.                                                                                                                                   |
| `image`                | Resolve localized image content and alternate text while retaining its existing image shape.                                                                                         |
| `ctaSelector`          | Resolve CTA content and retain the selected CTA type.                                                                                                                                |
| `comprehensiveCTA`     | Resolve the internal CTA, button text, and aria label. Preserve action, presentation, and other settings.                                                                            |
| `code`                 | Interpolate embedded references in code fields. Custom Code HTML keeps its existing additional Handlebars processing.                                                                |

No transforms for Puck/native fields or Yext style selectors. The `custom` bridge dispatches using the original `yextFieldType` marker. Native objects and arrays are traversed structurally; slots retain Puck's lifecycle. Root settings remain authored.

## Component adoption

VisualEditor consumes automatically resolved content in HeadingText, HoursStatus, HoursTable, Phone, Address, Image, MapboxStaticMap, Breadcrumbs, Locator headings/filter labels, and Custom Code. Custom result-card controls retain their per-result document context.

Casual Dining adopts transforms for all direct `resolveComponentData` calls in its custom sections:

- Header: navigation/utility text and links, logo and utility images, logo URL.
- Hero, Promo, Story: images.
- Footer: brand image, social links/images, column labels and links, legal links.
- Details: address, hours, phone numbers, dining list.
- Locations: heading text.
- FAQ and Featured: ordinary repeated item sources.

Styled text fields created by `createStyledTextConfig` expose their concrete field schema for inference. Hero, Promo, Story, Featured, FAQ, Details, Reviews, Header, and Footer consume plain text and rich-text data through the existing StyledTextComponent. Details also receives resolved values for its separately declared subheadings. ComprehensiveCTA fields resolve automatically and pass their transformed values directly to the existing renderer.

The shared text and CTA renderers no longer call resolveComponentData. Repeated-item text and review content pass directly into StyledTextComponent without constructing synthetic entity bindings. Rich text stays data until the existing renderer applies typography and HTML rendering; it no longer inspects or clones pre-rendered React elements. Mapped directions labels are localized in the CTA transform while authored binding metadata is available. CTA actions, URL formatting, preset images, styles, and analytics remain in the existing presentation path.

Existing StyledPlainTextProps and StyledRichTextProps accept a content generic for their render inputs. ComprehensiveCTAProps describes plain CTA content. No additional helper, renderer, or Resolved-type families are introduced.

Analytics, formatting, fetching, visibility, theme styling, and rich-text rendering remain in their current presentation paths. No tooltip/source-wrapper work is included; transformed fields no longer supply authored binding metadata to EntityField.

Slotted item sources retain authored references in resolveData/populateSlots. Field transforms run at render time, after slot population; native slot values retain Puck’s lifecycle.

## Saved layouts and migration ownership

This implementation changes render-time values only. Every existing saved field shape remains valid: bindings, localized constants, CTA settings, images, and item mappings are unchanged. Therefore it needs no saved-layout conversion or migration-version increase. Do not add no-op migrations or rewrite default layouts merely to enable transforms.

If a subsequent change alters saved shapes, append built-in migrations in VisualEditor and Casual Dining-specific migrations in casual-dining's registry. VisualEditor must contain no Casual Dining-specific migration code or fixtures. Casual Dining's existing local copies receive only the approved compatibility updates for automatic field resolution.

## Verification

- Focused transform tests cover localization, mapped/constants, embedded references, empty values, false/zero, rich-text data, images, CTA fields, code, and manual/linked item sources.
- Editor/published parity tests use actual Puck 0.22.2 and nested object/array fields inside a slot, with two document locales, and verify authored data remains unchanged.
- Renderer integration tests cover localized links, mapped and constant directions labels, preset images, button attributes, missing CTAs, and rich-text styles.
- Run the VisualEditor TypeScript check and normal editor test suite. No image-matching or screenshot tests.
- Use `updateVE` in casual-dining to pack/install the library, then run its typecheck, validation, and build.

The external website-generation skill is not changed in this repository implementation. New generated components define their content fields and consume inferred plain render props; shared text and CTA renderer examples should pass transformed data directly, while defaults and editor fields keep authored input shapes.

Source-dependent built-in UI (address directions selection and the image asset picker) reads original entity-field bindings from Puck render metadata. Component values remain plain data; metadata is not persisted in layouts.

Casual Dining’s seven existing local content-block/Breadcrumbs copies now consume transformed values and infer their render types from their field schemas. These targeted compatibility updates preserve their local behavior and saved defaults.
