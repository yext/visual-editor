# Warm Editorial Plan

## Page Metadata

- Template Name: `warm-editorial`
- Source URL: `file:///Users/blife/Downloads/Elisabeth%202/modern-bakery-fullwidth-hero-v1.html`
- Title: `North Common Bakehouse | Bakery in Burlington, VT`
- Captured At: `2026-03-27T14:08:45.684Z`

## Ordered Section List

1. Header shell with brand lockup and right-aligned nav
2. Promo banner with short announcement and inline CTA
3. Full-bleed hero image with centered translucent editorial card
4. Core information grid with visit, call, and hours
5. Featured picks card grid with three product cards
6. About/value proposition three-column editorial strip
7. FAQ accordion list
8. Footer shell with brand block, footer nav, and circular social icons

## Layout Signatures

### 1. Header

- Shell wrapper: full-width cream background, centered, `max-width: 1024px` inner wrapper, outer bottom margin `24px`, inner horizontal padding `24px`
- Immediate content wrapper: `.header-row` flex row, `justify-content: space-between`, `align-items: center`, `flex-wrap: wrap`, gap `24px`, vertical padding `20px`
- Layout model: left brand lockup + right nav row
- Direct children: brand lockup flex row with 12px gap; nav flex row with 20px gap and wrapped links
- Text blocks: Space Grotesk sans; brand and links weight 700/500; body color `#2b211d`; text alignment left
- Media blocks: square 42x42 brick logo tile with 4px radius and centered white letter

### 2. Promo Banner

- Shell wrapper: contained band, `max-width: 1024px`, centered, outer margin top/bottom `24px`, horizontal padding `24px`, no vertical shell padding
- Immediate content wrapper: butter bar, 1px border `#e7c98c`, radius `4px`, padding `14px 18px`
- Layout model: flex row, `justify-content: space-between`, `gap: 16px`, wrap enabled
- Direct children: left message paragraph, right CTA link
- Text blocks: Space Grotesk sans, message weight 500, CTA brick colored and semibold appearance
- Media blocks: none

### 3. Hero

- Shell wrapper: full-bleed section, no max-width, zero side padding, background image with dark overlay
- Immediate content wrapper: centered inner wrapper `max-width: 1024px`, `min-height: 460px`, padding top `64px`, right `24px`, bottom `44px`, left `24px`
- Layout model: grid, `justify-items: center`, `align-content: center`
- Direct children: single centered hero card with `max-width: 620px`
- Text blocks: Newsreader serif for `h1`, clamp `3.3rem` to `5.6rem`, line-height `0.98`, center aligned; location line Space Grotesk 1.05rem bold brick; body muted `#726156`, max-width `44ch`
- Media blocks: full-width background image with `cover`, focal point near center/48%, overlay `rgba(39,23,16,0.4)`; card background `rgba(255,250,243,0.92)`, 1px light border, 8px radius, 32px padding

### 4. Core Information

- Shell wrapper: contained section, `max-width: 1024px`, centered, padding `24px 24px`
- Immediate content wrapper: section heading margin-bottom `24px`; content grid padding-top `8px`
- Layout model: 3-column grid, gap `24px`, collapses to 1 column under 900px
- Direct children: three `.core-block` columns with grid layout and 12px gap
- Text blocks: heading uses Newsreader serif `2.1rem`; block titles Space Grotesk 1rem bold; body copy 1rem, left aligned
- Media blocks: none

### 5. Featured Picks

- Shell wrapper: contained section, `max-width: 1024px`, centered, padding `24px 24px`
- Immediate content wrapper: section heading margin-bottom `24px`; card grid gap `20px`
- Layout model: 3-column grid, collapses to 1 column under 900px
- Direct children: three white cards with overflow-hidden radius `8px`
- Text blocks: section heading Newsreader `2.1rem`; card titles Space Grotesk `1.2rem` bold; descriptions Space Grotesk 1rem
- Media blocks: card images full width, fixed height `210px`, `object-fit: cover`; card body padding `20px` with 16px internal gap

### 6. About Strip

- Shell wrapper: contained section, `max-width: 1024px`, centered, padding `24px 24px`
- Immediate content wrapper: heading margin-bottom `24px`; content strip top and bottom border `1px solid #eadbcb`, interior padding `24px 0`
- Layout model: 3-column grid, gap `24px`, collapses to 1 column under 900px
- Direct children: three editorial text blocks
- Text blocks: section heading Newsreader `2.1rem`; small block headings Space Grotesk 1rem bold with 8px bottom margin; body Space Grotesk 1rem
- Media blocks: none

### 7. FAQ

- Shell wrapper: contained section, `max-width: 1024px`, centered, padding `24px 24px`
- Immediate content wrapper: heading margin-bottom `24px`; faq list bottom border 1px `#eadbcb`
- Layout model: stacked details elements
- Direct children: each `details` row has top border and vertical padding `20px 0`
- Text blocks: section heading Newsreader `2.1rem`; summary Space Grotesk bold, row flex with 16px gap and trailing plus/minus; answer text muted `#726156` with top margin `12px`
- Media blocks: none

### 8. Footer

- Shell wrapper: full-width cream background, top margin `24px`, top border `1px solid #eadbcb`
- Immediate content wrapper: centered inner wrapper `max-width: 1024px`, padding `24px 24px 28px`
- Layout model: flex row, `justify-content: space-between`, `align-items: center`, wrap enabled, gap `24px`
- Direct children: brand lockup, footer nav, social link row
- Text blocks: Space Grotesk sans; brand/location stacked text; nav links regular-to-medium; location muted
- Media blocks: same 42x42 brick logo tile; social icons 40x40 circles with 1px border and brick icon color

## Header/Footer Link Parity Table

| Section | Group/Band  | Index | Label        | Href | Expand/Collapse | Trigger Type |
| ------- | ----------- | ----- | ------------ | ---- | --------------- | ------------ |
| header  | primary nav | 1     | Menu         | #    | none            | direct link  |
| header  | primary nav | 2     | Preorders    | #    | none            | direct link  |
| header  | primary nav | 3     | Hours        | #    | none            | direct link  |
| header  | primary nav | 4     | Order online | #    | none            | direct link  |
| footer  | footer nav  | 1     | Menu         | #    | none            | direct link  |
| footer  | footer nav  | 2     | Preorders    | #    | none            | direct link  |
| footer  | footer nav  | 3     | Contact      | #    | none            | direct link  |
| footer  | social      | 1     | Instagram    | #    | none            | direct link  |
| footer  | social      | 2     | Facebook     | #    | none            | direct link  |

## Implementation Checklist

- [ ] `WarmEditorialHeaderSection.tsx` for header shell and nav parity
- [ ] `WarmEditorialAnnouncementSection.tsx` for promo banner
- [ ] `WarmEditorialHeroSection.tsx` for full-bleed hero card and CTAs
- [ ] `WarmEditorialCoreInfoSection.tsx` for visit/call/hours grid
- [ ] `WarmEditorialFeaturedPicksSection.tsx` for three retail cards
- [ ] `WarmEditorialAboutSection.tsx` for editorial value strip
- [ ] `WarmEditorialFaqSection.tsx` for details/summary accordion
- [ ] `WarmEditorialFooterSection.tsx` for footer nav and social parity
