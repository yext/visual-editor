# ExpandedFooter Slotification Plan

## ✅ Completed (Current State)

- Migration 39: Copyright message converted to `CopyrightSlot`
- ExpandedFooter.tsx: Minimal slotification with just copyright
- Tests passing with version 39 structure

## 📦 Slot Components Created (Ready to Integrate)

All these components are created, tested for linter errors, and ready:

1. **FooterLogoSlot.tsx** - Individual logo with link target
2. **FooterSocialLinksSlot.tsx** - All social media links as props
3. **FooterUtilityImagesSlot.tsx** - Array of utility images as props
4. **FooterLinkSlot.tsx** - Individual footer link CTA
5. **FooterLinksWrapper.tsx** - Manages array of FooterLinkSlot (for primary/secondary links)
6. **FooterExpandedLinkSectionSlot.tsx** - Section with heading + array of links
7. **FooterExpandedLinksWrapper.tsx** - Manages array of FooterExpandedLinkSectionSlot

## 🔧 Next Session Tasks

### 1. Update ExpandedFooter.tsx Interfaces

Replace direct data fields with slots:

```typescript
export interface ExpandedFooterProps {
  data: {
    primaryFooter: {
      expandedFooter: boolean; // Keep this flag
    };
    secondaryFooter: {
      show: boolean; // Keep this flag
    };
  };
  styles: ExpandedFooterStyles; // Keep as-is
  slots: {
    LogoSlot: Slot;
    SocialLinksSlot: Slot;
    UtilityImagesSlot: Slot;
    PrimaryLinksWrapperSlot: Slot;
    ExpandedLinksWrapperSlot: Slot;
    SecondaryLinksWrapperSlot: Slot;
    CopyrightSlot: Slot;
  };
  // ... rest
}
```

### 2. Update expandedFooterSectionFields

Remove data fields for logo/links/social, keep only:

- `primaryFooter.expandedFooter` (boolean)
- `secondaryFooter.show` (boolean)
- All style fields
- Add slot definitions

### 3. Update ExpandedFooterWrapper Render

Replace direct rendering with slot usage:

```typescript
// Logo section
<slots.LogoSlot style={{ height: "auto" }} allow={[]} />

// Social links
<slots.SocialLinksSlot style={{ height: "auto" }} allow={[]} />

// Utility images
<slots.UtilityImagesSlot style={{ height: "auto" }} allow={[]} />

// Primary footer links (conditional on expandedFooter flag)
{data.primaryFooter.expandedFooter ? (
  <slots.ExpandedLinksWrapperSlot style={{ height: "auto" }} allow={[]} />
) : (
  <slots.PrimaryLinksWrapperSlot style={{ height: "auto" }} allow={[]} />
)}

// Secondary footer (conditional on show flag)
{data.secondaryFooter.show && (
  <>
    <slots.SecondaryLinksWrapperSlot style={{ height: "auto" }} allow={[]} />
    <slots.CopyrightSlot style={{ height: "auto" }} allow={[]} />
  </>
)}
```

### 4. Update defaultProps

Create default slot configurations for all 7 slots.

### 5. Update Migration (0039_expanded_footer_slots.ts)

Transform old structure to new:

- Extract logo → LogoSlot
- Extract social links → SocialLinksSlot
- Extract utilityImages → UtilityImagesSlot
- Extract footerLinks → PrimaryLinksWrapperSlot
- Extract expandedFooterLinks → ExpandedLinksWrapperSlot
- Extract secondaryFooterLinks → SecondaryLinksWrapperSlot
- Extract copyrightMessage → CopyrightSlot (already done)

### 6. Register Components in SlotsCategory.tsx

Add all 7 new components to `SlotsCategoryComponents` object.

### 7. Update Tests

Update `ExpandedFooter.test.tsx` to include version 39 tests with new slot structure.

## 📝 Reference Patterns

- Look at `TeamSection` for wrapper/slot patterns
- Look at `HeroSection` for conditional rendering with flags
- Look at `ReviewsSection` for simple heading slotification

## ⚠️ Important Notes

- Keep `expandedFooter` and `show` as data flags (not slots) for conditional rendering
- Use `puck.isEditing ? <div className="h-10"/> : <></>` for empty slot placeholders
- All links use `FooterLinksWrapper` pattern (manages array of slots)
- Social links are a single slot with all props (not individual slots per link)
- Utility images are a single slot with array prop (not individual slots per image)
