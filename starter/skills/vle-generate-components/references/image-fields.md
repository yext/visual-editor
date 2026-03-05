# Image Fields Contract

- Use this rule for **every image prop/field** in generated Puck components.
- Keep image props limited to:
  - `YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>`

## Required Shape

Every image field should follow this TypeScript shape:

```ts
type ExampleLogoImageProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
};
```

## Field Definition Pattern

Use this pattern in `Fields<...>`:

```tsx
const ExampleLogoImageFields: Fields<ExampleLogoImageProps> = {
  logoImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Logo Image",
    filter: {
      types: ["type.image"],
    },
  }),
};
```

## Render Rules

- Resolve with `streamDocument.locale ?? "en"` to keep locale behavior consistent with translatable strings.
- Use `Image` from `@yext/visual-editor`.
- Resolve the image once with `resolveComponentData`.
- Do not add a custom `resolveImage` helper when using the visual-editor `Image` component.

Example:

```tsx
const streamDocument = useDocument();
const locale = streamDocument.locale ?? "en";
const resolvedLogoImage = resolveComponentData(
  props.logoImage,
  locale,
  streamDocument,
);

if (!resolvedLogoImage) {
  return null;
}

return <Image image={resolvedLogoImage} />;
```

## defaultProps Rules

- `defaultProps.logoImage.constantValue` must be a mocked `TranslatableAssetImage`.
- Use the source image URL from the input HTML.
- For type safety, prefer the plain image object shape (`{ url, width, height }`), which is valid because `TranslatableAssetImage` is a union.
- Set `constantValueEnabled` to `true`.
- Copy width/height from the source image when available.

Example:

```tsx
{
  logoImage: {
    field: "",
    constantValue: {
      url: "https://cdn.example.com/logo.png",
      width: 240,
      height: 72,
    },
    constantValueEnabled: true,
  },
}
```
