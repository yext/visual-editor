# CTA Component

The CTA component provides three different types of call-to-action buttons with conditional field visibility and proper label restrictions.

## CTA Types

### 1. Text & Link (Default)

The traditional CTA with text label and link. This is the default behavior and all existing CTAs migrate to this type.

```tsx
<CTA label="Learn More" link="https://example.com" variant="primary" />
```

### 2. Get Directions

Automatically generates a Google Maps directions link when coordinates are provided. Coordinate fields only appear when this type is selected.

```tsx
<CTA
  label="Get Directions"
  ctaType="getDirections"
  coordinate={{ latitude: 40.7128, longitude: -74.006 }}
  variant="primary"
/>
```

### 3. Preset Image

Displays an icon instead of text. The icon is automatically selected based on the preset type. **Label field is hidden when this type is selected.**

```tsx
<CTA
  ctaType="presetImage"
  presetImageType="phone"
  link="tel:+1234567890"
  variant="primary"
/>
```

## Available Preset Image Types

- `phone` - Phone icon
- `email` - Email icon
- `location` - Location pin icon
- `calendar` - Calendar icon
- `star` - Star icon
- `heart` - Heart icon
- `share` - Share icon
- `download` - Download icon
- `play` - Play button icon
- `pause` - Pause button icon
- `next` - Next arrow icon
- `previous` - Previous arrow icon
- `menu` - Hamburger menu icon
- `search` - Search icon
- `close` - Close/X icon
- `check` - Checkmark icon
- `plus` - Plus icon
- `minus` - Minus icon
- `arrow-right` - Right arrow icon
- `arrow-left` - Left arrow icon
- `arrow-up` - Up arrow icon
- `arrow-down` - Down arrow icon

## Props

```tsx
interface CTAProps {
  label?: React.ReactNode;
  link?: string;
  linkType?: LinkType;
  eventName?: string;
  variant?: ButtonProps["variant"];
  className?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  alwaysHideCaret?: boolean;
  ariaLabel?: string;
  ctaType?: "textAndLink" | "getDirections" | "presetImage";
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  presetImageType?: PresetImageType;
}
```

## Usage in Page Sections

The CTA is automatically used in:

- Hero Section (primary and secondary CTAs)
- Promo Section (CTA)
- Grid Section (existing Grid component, as an atom)

When using these sections, you can configure the CTA type through the editor interface. The CTA type field will show options for:

- Text & Link (default)
- Get Directions (coordinate fields appear only when selected)
- Preset Image (preset image type selection appears, label field is hidden)

## Conditional Field Visibility

- **Label Field**: Only visible when CTA type is "Text & Link" or "Get Directions"
- **Coordinate Fields**: Only visible when CTA type is "Get Directions"
- **Preset Image Type Field**: Only visible when CTA type is "Preset Image"

## Migration

Existing CTAs have been automatically migrated to use "Text & Link" as the default CTA type. This ensures backward compatibility while enabling the new functionality.
