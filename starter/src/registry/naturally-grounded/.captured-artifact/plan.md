## Page Metadata

- Template: `naturally-grounded`
- Requested URL: `file:///Users/blife/Downloads/Elisabeth%202/environmental-health-foods-grocery-v2.html`
- Final URL: `file:///Users/blife/Downloads/Elisabeth%202/environmental-health-foods-grocery-v2.html`
- Title: `Field & Root Market | Health Foods Grocery in Burlington, VT`
- Captured At: `2026-03-27T13:23:57.572Z`

## Ordered Sections

1. `NaturallyGroundedHeaderSection`
2. `NaturallyGroundedHeroSection`
3. `NaturallyGroundedStoreUpdateBannerSection`
4. `NaturallyGroundedCoreInfoSection`
5. `NaturallyGroundedAboutSection`
6. `NaturallyGroundedFeaturedDepartmentsSection`
7. `NaturallyGroundedPromoSection`
8. `NaturallyGroundedNearbyLocationsSection`
9. `NaturallyGroundedReviewsSection`
10. `NaturallyGroundedFooterSection`

## Layout Signatures

### 1. Header

- Shell wrapper: full-bleed, centered content, `max-width: 1120px`, `padding-inline: 24px`, white background, 1px bottom border `#d8e2d8`
- Immediate content wrapper: flex row, `justify-content: space-between`, `align-items: center`, `gap: 24px`, `flex-wrap: wrap`, `padding-block: 20px`
- Direct children: left brand lockup with 42px square logo + brand link, right nav with 4 links, 20px link gap
- Text blocks: Work Sans, brand weight 800, nav weight 400, link/button text dark green or ink
- Media blocks: no images, decorative logo badge only

### 2. Hero

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, `padding-top: 48px`, `padding-bottom: 32px`
- Immediate content wrapper: single rounded band, `min-height: 420px`, 30px radius, overflow hidden, produce photo background with 24% dark overlay
- Layout model: flex row, `align-items: center`, inner padding 20px
- Direct children: one translucent content card at left, `max-width: 520px`
- Text blocks: Libre Baskerville heading with `clamp(3rem, 5.6vw, 5rem)`, letter spacing `-0.03em`, Work Sans location 1.24rem weight 800, muted supporting body
- Media blocks: full-band background image, card background `rgba(255,255,255,.92)`, shadow `0 18px 40px rgba(17,24,39,.12)`

### 3. Store Update Banner

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, section spacing `padding-top: 56px`, `padding-bottom: 24px`
- Immediate content wrapper: rounded 18px banner, sage background `#edf4ea`, `padding-top/bottom: 14px`, `padding-inline: 20px`
- Layout model: flex row, `justify-content: space-between`, `align-items: center`, `gap: 16px`, wrap enabled
- Direct children: announcement text left, single policy link right

### 4. Core Info

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, section spacing `56px / 24px`
- Immediate content wrapper: heading block with 24px margin-bottom, then 3-column grid `1fr 1fr 1.15fr`, top padding 8px, 24px gap
- Layout model: grid columns collapse to one column below 920px
- Direct children: visit, contact, offerings blocks; each child is a grid with 12px gap
- Text blocks: section heading 2.5rem Libre Baskerville forest green; subheads Work Sans 1.06rem weight 800
- Media blocks: none

### 5. About

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, section spacing `56px / 24px`
- Immediate content wrapper: heading block then cream card with 28px radius, 32px padding
- Layout model: 3-column grid with 24px gap; collapses to single column below 920px
- Direct children: three value proposition columns with heading + paragraph

### 6. Featured Departments

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, section spacing `56px / 24px`
- Immediate content wrapper: heading block then 3-card grid with 20px gap
- Layout model: cards are border boxes with 24px radius, 1px line border, white background, overflow hidden
- Direct children: top image strip 180px tall, lower body grid with 16px gap and 24px padding
- Text blocks: section heading 2.5rem Libre Baskerville; card headings Work Sans 1.06rem weight 800
- Media blocks: full-width cropped images, `object-fit: cover`, sage fallback band behind images

### 7. Promo

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, section spacing `56px / 24px`
- Immediate content wrapper: centered promo box, `max-width: 720px`, sage background, 28px radius, 1px line border, 32px padding
- Layout model: single-column grid, center aligned, 16px gap
- Text blocks: centered heading/body with forest heading emphasis

### 8. Nearby Locations

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, section spacing `56px / 24px`
- Immediate content wrapper: heading block then 3-card grid with 20px gap
- Layout model: white cards, 24px radius, 1px line border, body padding 24px, 16px gap
- Direct children: store name, location, hours status, store link

### 9. Reviews

- Shell wrapper: contained, centered, `max-width: 1120px`, `padding-inline: 24px`, section spacing `56px / 24px`
- Immediate content wrapper: heading block then 3-card grid with 20px gap
- Layout model: white bordered cards, 24px radius, 24px inner padding, 16px gap
- Direct children: score summary card, review quote card, review quote card
- Text blocks: score uses Work Sans 2.4rem weight 800 in forest green

### 10. Footer

- Shell wrapper: full-bleed white footer, 1px top border `#d8e2d8`, `margin-top: 72px`
- Immediate content wrapper: centered row inside `max-width: 1120px`, `padding-inline: 24px`, `padding-block: 24px`
- Layout model: flex row, `justify-content: space-between`, `align-items: center`, `gap: 24px`, wrap enabled
- Direct children: footer brand lockup, footer nav links, circular social links group with 12px gap
- Text blocks: Work Sans, footer brand title weight 700, descriptor muted ink
- Media blocks: no images, decorative logo badge and circular social chips

## Header/Footer Link Parity Table

| section | group/band  | index | label         | href | expand/collapse | trigger |
| ------- | ----------- | ----- | ------------- | ---- | --------------- | ------- |
| header  | primary-nav | 1     | Departments   | `#`  | none            | click   |
| header  | primary-nav | 2     | Weekly picks  | `#`  | none            | click   |
| header  | primary-nav | 3     | Nearby stores | `#`  | none            | click   |
| header  | primary-nav | 4     | Order pickup  | `#`  | none            | click   |
| footer  | footer-nav  | 1     | Departments   | `#`  | none            | click   |
| footer  | footer-nav  | 2     | Locations     | `#`  | none            | click   |
| footer  | footer-nav  | 3     | Contact       | `#`  | none            | click   |
| footer  | social      | 1     | ig            | `#`  | none            | click   |
| footer  | social      | 2     | f             | `#`  | none            | click   |
| footer  | social      | 3     | tt            | `#`  | none            | click   |

## Implementation Checklist

- [ ] `NaturallyGroundedHeaderSection.tsx`
- [ ] `NaturallyGroundedHeroSection.tsx`
- [ ] `NaturallyGroundedStoreUpdateBannerSection.tsx`
- [ ] `NaturallyGroundedCoreInfoSection.tsx`
- [ ] `NaturallyGroundedAboutSection.tsx`
- [ ] `NaturallyGroundedFeaturedDepartmentsSection.tsx`
- [ ] `NaturallyGroundedPromoSection.tsx`
- [ ] `NaturallyGroundedNearbyLocationsSection.tsx`
- [ ] `NaturallyGroundedReviewsSection.tsx`
- [ ] `NaturallyGroundedFooterSection.tsx`
- [ ] register imports and component keys in `starter/src/ve.config.tsx`
- [ ] run `pnpm run generate-default-layout-data naturally-grounded ...` in visual order
- [ ] run `pnpm run typecheck` and `pnpm run build`
- [ ] complete header/footer parity audit and three-section self-audit
