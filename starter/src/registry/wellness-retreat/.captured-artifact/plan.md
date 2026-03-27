# Wellness Retreat Plan

## Page Metadata

- Template: `wellness-retreat`
- Title: `Stillpoint Wellness Studio | Yoga and Recovery in Seattle, WA`
- Source URL: `file:///Users/blife/Downloads/Elisabeth%202/urban-wellness-minimal-local-v1.html`
- Captured At: `2026-03-27T14:05:52.117Z`
- Viewport: `1440x2400`
- Design Intent: restrained, minimal, calm visual rhythm, low-radius surfaces, refined and spacious presentation

## Ordered Section List

1. Header -> `WellnessRetreatHeaderSection.tsx`
2. Hero -> `WellnessRetreatHeroSection.tsx`
3. Core information -> `WellnessRetreatCoreInfoSection.tsx`
4. Studio atmosphere gallery -> `WellnessRetreatGallerySection.tsx`
5. Promo banner -> `WellnessRetreatPromoSection.tsx`
6. Ways to begin cards -> `WellnessRetreatOffersSection.tsx`
7. Studio FAQs -> `WellnessRetreatFaqSection.tsx`
8. Footer -> `WellnessRetreatFooterSection.tsx`

## Layout Signatures

### 1. Header

- Shell wrapper: full-bleed white band, centered, `max-width: 1024px` inner wrapper, horizontal padding `24/24`, top/bottom border `0/0/1/0`
- Immediate content wrapper: flex row, `justify-between`, `align-center`, wrap enabled, gap `24`, padding `22/0/22/0`
- Layout model: outer full-width shell + contained flex row
- Direct children:
  - brand lockup first, inline-flex, gap `12`, logo `38x38`, 1px dark border
  - nav second, flex row, gap `20`, wrap enabled
- Text blocks: Inter, nav/body `16px`, `font-weight: 400`, brand text `700`, left aligned
- Media blocks: no image asset, boxed monogram logo, square, radius `0`

### 2. Hero

- Shell wrapper: contained section, centered, `max-width: 1024px`, section padding `40/24/24/24`, margin `12 auto`
- Immediate content wrapper: no extra wrapper, two-column grid `0.92fr 1.08fr`, gap `32`, align stretch
- Layout model: grid
- Direct children:
  - media first, min-height `430`, radius `4`, overflow hidden
  - copy second, fog background `#f4f5f6`, 1px border `#d9dde1`, padding `32/32/32/32`, grid gap `16`
- Text blocks:
  - h1 uses Cormorant Garamond, clamp around `48-80px`, line-height `.94`, letter-spacing `-0.03em`
  - location uses Inter `18.4px`, `700`, blue `#7f96ac`
  - status uses Inter `16px`, stone `#5f666d`, max-width `40ch`
- Media blocks: hero image fills container with `object-fit: cover`

### 3. Core Information

- Shell wrapper: contained section, centered, `max-width: 1024px`, section padding `0/24/0/24`, margin `12 auto`
- Immediate content wrapper: heading block with bottom margin `24`, then three-column grid with top padding `8`
- Layout model: stacked block + grid `1fr 1fr 1.1fr`, gap `24`
- Direct children: three info blocks in order `Visit`, `Connect`, `Hours`; each is grid with gap `12`
- Text blocks:
  - h2 Cormorant Garamond `37.6px`, line-height `.94`
  - h3 Inter `16px`, `700`
  - body/link Inter `16px`, `400`, dark ink except no special treatment beyond truncation safety
- Media blocks: none

### 4. Gallery

- Shell wrapper: contained section, centered, `max-width: 1024px`, section padding `0/24/0/24`, margin `12 auto`
- Immediate content wrapper: heading margin-bottom `24`, then three-column grid `1.15fr .85fr .85fr`, gap `20`
- Layout model: block + grid
- Direct children: three gallery cards in source order, each min-height `280`, radius `4`, overflow hidden
- Text blocks: heading only, same styling as other section headings
- Media blocks: all images full-bleed inside cards, `object-fit: cover`

### 5. Promo

- Shell wrapper: contained section, centered, `max-width: 1024px`, section padding `0/24/0/24`, margin `12 auto`
- Immediate content wrapper: single relative media panel, min-height `360`, radius `4`, dark background fallback
- Layout model: positioned container with image background and inset overlay card
- Direct children:
  - background image absolutely positioned to fill shell
  - overlay card near top-left via `margin: 32`, max-width `460`, white `rgba(255,255,255,.92)`, padding `24`, grid gap `16`, radius `4`
- Text blocks:
  - h2 Cormorant Garamond `37.6px`, line-height `.94`
  - body Inter `16px`, `400`
  - CTA Inter `16px`, `600`
- Media blocks: background image full-bleed, cover crop, overlay required

### 6. Offers

- Shell wrapper: contained section, centered, `max-width: 1024px`, section padding `0/24/0/24`, margin `12 auto`
- Immediate content wrapper: heading margin-bottom `24`, then three-column grid, gap `20`
- Layout model: block + grid `repeat(3, minmax(0,1fr))`
- Direct children: three cards in source order, each border-top `1px solid #101418`, padding-top `16`, grid gap `12`
- Text blocks:
  - h3 Inter `16.8px`, `700`
  - body Inter `16px`, `400`
- Media blocks: none

### 7. FAQ

- Shell wrapper: contained section, centered, `max-width: 1024px`, section padding `0/24/0/24`, margin `12 auto`
- Immediate content wrapper: heading margin-bottom `24`, then bordered FAQ list with bottom border `1px solid #d9dde1`
- Layout model: stacked details elements
- Direct children: three `details` rows in source order; each has top border `1px solid #d9dde1` and padding `20/0/20/0`
- Text blocks:
  - summary Inter `16px`, `700`, flex between question and plus/minus glyph
  - answer Inter `16px`, stone `#5f666d`, margin-top `12`, max-width `65ch`
- Media blocks: none

### 8. Footer

- Shell wrapper: full-bleed white band with top border `1px solid #d9dde1`, no bottom border, top margin `64`
- Immediate content wrapper: contained row, `max-width: 1024px`, horizontal padding `24/24`, actual row padding `24/24/28/24`, flex with wrap and gap `24`
- Layout model: outer shell + contained flex row with three groups
- Direct children:
  - footer brand first, inline-flex, gap `12`, logo `38x38`
  - nav second, flex row gap `20`
  - social links third, flex row gap `12`
- Text blocks:
  - business name strong `700`
  - descriptor Inter `16px`, stone `#5f666d`
  - nav/social labels Inter `16px`
- Media blocks: no image asset, boxed monogram and bordered social chips `40x40`

## Header/Footer Link Parity Table

| Section | Group/Band  | Index | Visible Label | Href | Expand/Collapse | Trigger Type |
| ------- | ----------- | ----- | ------------- | ---- | --------------- | ------------ |
| header  | primary nav | 1     | Classes       | #    | none            | click        |
| header  | primary nav | 2     | Memberships   | #    | none            | click        |
| header  | primary nav | 3     | Visit         | #    | none            | click        |
| header  | primary nav | 4     | Book a class  | #    | none            | click        |
| footer  | footer nav  | 1     | Classes       | #    | none            | click        |
| footer  | footer nav  | 2     | Memberships   | #    | none            | click        |
| footer  | footer nav  | 3     | Contact       | #    | none            | click        |
| footer  | social      | 1     | ig            | #    | none            | click        |
| footer  | social      | 2     | tt            | #    | none            | click        |
| footer  | social      | 3     | yt            | #    | none            | click        |

## Implementation Checklist

- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatHeaderSection.tsx`
- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatHeroSection.tsx`
- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatCoreInfoSection.tsx`
- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatGallerySection.tsx`
- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatPromoSection.tsx`
- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatOffersSection.tsx`
- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatFaqSection.tsx`
- [ ] Create `starter/src/registry/wellness-retreat/components/WellnessRetreatFooterSection.tsx`
- [ ] Update `starter/src/ve.config.tsx` with imports, category typing, category list, and component registrations
- [ ] Run `pnpm run typecheck` in `starter`
- [ ] Run `pnpm run generate-default-layout-data wellness-retreat WellnessRetreatHeaderSection WellnessRetreatHeroSection WellnessRetreatCoreInfoSection WellnessRetreatGallerySection WellnessRetreatPromoSection WellnessRetreatOffersSection WellnessRetreatFaqSection WellnessRetreatFooterSection`
- [ ] Perform header/footer parity validation against the table above
- [ ] Perform mandatory self-audit on header, hero, and promo sections
