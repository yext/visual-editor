# Field transforms: minimal implementation

## Contract

VisualEditor resolves explicitly enabled Yext content fields at the render boundary. A field opts in with `resolve: true`. The existing StyledTextComponent and ComprehensiveCTA consume transformed content directly. No raw-or-resolved guessing is needed.

Defaults, editor controls, `resolveData`, layouts, and migrations continue to use authored values. Component render props receive plain resolved data. The existing `YextComponentConfig<AuthoredProps, RenderProps>` accepts a second optional generic for this distinction. There are no new `Resolved*` types, component-definition helpers, source wrappers, or renderer APIs.

The editor uses Puck fieldTransforms. Published pages use the same registry through `VisualEditorRender`, since Puck 0.22.2's `Render` does not accept fieldTransforms. The section-library render template uses `VisualEditorRender` too. Both use the page's StreamDocument and content locale.

## Fields with transforms

| Yext field             | Resolution                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entityField`          | Resolve mapped or constant content, translations, and embedded references. Structured data remains structured, including addresses, hours, images, rich text, numbers, and booleans.                                            |
| `entityField.repeated` | Resolve manual or linked items using the existing mapping definitions and correct item document. Components read the resulting array instead of calling `resolveItems`. Enable with `createItemSource({ resolve: true, ... })`. |
| `translatableString`   | Select the locale and resolve embedded references.                                                                                                                                                                              |
| `image`                | Resolve localized image content and alternate text while retaining its existing image shape.                                                                                                                                    |
| `ctaSelector`          | Resolve CTA content and retain the selected CTA type.                                                                                                                                                                           |
| `comprehensiveCTA`     | Resolve the internal CTA, button text, and aria label. Preserve action, presentation, and other settings.                                                                                                                       |
| `code`                 | Interpolate embedded references only when explicitly enabled. Used for Custom Code JavaScript, not HTML/CSS processing.                                                                                                         |

No transforms for Puck/native fields or Yext style selectors. The `custom` bridge dispatches using the original `yextFieldType` marker. Native objects and arrays are traversed structurally; slots retain Puck's lifecycle. Root settings remain authored.

## Component adoption

VisualEditor adopts transforms in HeadingText, HoursStatus, HoursTable, and CustomCodeSection's JavaScript field.

Casual Dining adopts transforms for all direct `resolveComponentData` calls in its custom sections:

- Header: navigation/utility text and links, logo and utility images, logo URL.
- Hero, Promo, Story: images.
- Footer: brand image, social links/images, column labels and links, legal links.
- Details: address, hours, phone numbers, dining list.
- Locations: heading text.
- FAQ and Featured: ordinary repeated item sources.

Styled text fields created by `createStyledTextConfig` enable transforms centrally. Hero, Promo, Story, Featured, FAQ, Details, Reviews, Header, and Footer consume plain text and rich-text data through the existing StyledTextComponent. Details also enables transforms for its separately declared subheadings. ComprehensiveCTA fields in these sections explicitly enable transforms and pass their transformed values directly to the existing renderer.

The shared text and CTA renderers no longer call resolveComponentData. Repeated-item text and review content pass directly into StyledTextComponent without constructing synthetic entity bindings. Rich text stays data until the existing renderer applies typography and HTML rendering; it no longer inspects or clones pre-rendered React elements. Mapped directions labels are localized in the CTA transform while authored binding metadata is available. CTA actions, URL formatting, preset images, styles, and analytics remain in the existing presentation path.

Existing StyledPlainTextProps and StyledRichTextProps accept a content generic for their render inputs. ComprehensiveCTAProps describes plain CTA content. No additional helper, renderer, or Resolved-type families are introduced.

Analytics, formatting, fetching, visibility, theme styling, and rich-text rendering remain in their current presentation paths. No tooltip/source-wrapper work is included; transformed fields no longer supply authored binding metadata to EntityField.

Slotted item sources do not opt in. Preserve their existing resolveData/populateSlots behavior and authored references. Do not migrate or redesign them.

## Saved layouts and migration ownership

This implementation changes render-time values only. Every existing saved field shape remains valid: bindings, localized constants, CTA settings, images, and item mappings are unchanged. Therefore it needs no saved-layout conversion or migration-version increase. Do not add no-op migrations or rewrite default layouts merely to enable transforms.

If a subsequent change alters saved shapes, append built-in migrations in VisualEditor and Casual Dining-specific migrations in casual-dining's registry. VisualEditor must contain no Casual Dining-specific migration code or fixtures. Leave copied built-ins under casual-dining's shared/components untouched.

## Verification

- Focused transform tests cover localization, mapped/constants, embedded references, empty values, false/zero, rich-text data, images, CTA fields, code, and manual/linked item sources.
- Editor/published parity tests use actual Puck 0.22.2 and nested object/array fields inside a slot, with two document locales, and verify authored data remains unchanged.
- Renderer integration tests cover localized links, mapped and constant directions labels, preset images, button attributes, missing CTAs, and rich-text styles.
- Run the VisualEditor TypeScript check and normal editor test suite. No image-matching or screenshot tests.
- Use `updateVE` in casual-dining to pack/install the library, then run its typecheck, validation, and build.

The external website-generation skill is not changed in this repository implementation. New generated components can opt their content fields in and consume plain render props; shared text and CTA renderer examples should pass transformed data directly, while defaults and editor fields keep authored input shapes.
