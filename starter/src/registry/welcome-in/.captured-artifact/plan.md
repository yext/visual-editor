# Welcome In Capture Plan

- URL: `file:///Users/blife/Downloads/Elisabeth%202/kids-bookshop-playful-local-v1.html`
- Title: `Juniper Story House | Children's Bookshop in Ann Arbor, MI`
- Captured At: `2026-03-27T14:04:39.522Z`

## Ordered Sections

1. `WelcomeInHeaderSection`
   - Source selectors: `.header-shell`, `.inner`, `.header-row`, `.brand-lockup`, `nav`, `.button.button-solid`
   - Layout signature:
     - Shell wrapper: full-width, max-width none, centered content via inner wrapper, padding `0/0/0/0`, white background, bottom border `1px #d9dced`
     - Immediate content wrapper: contained, `max-width: 1024px`, centered, padding `0 24px`
     - Layout model: flex row, `justify-content: space-between`, `align-items: center`, wrap enabled, gap `24px`
     - Direct children: brand lockup first, nav second; both size to content
     - Text blocks: Atkinson Hyperlegible Next fallback sans-serif, body-scale nav text, brand link bold
     - Media blocks: circular 42x42 logo badge, fully rounded, solid berry background
2. `WelcomeInHeroSection`
   - Source selectors: `.hero`, `.hero-panel`, `.hero-location`, `.hero-status`, `.cta-row`, `.hero-media`
   - Layout signature:
     - Shell wrapper: contained, `max-width: 1024px`, centered, padding `40px 24px 20px 24px`
     - Immediate content wrapper: full width inside shell, padding `32px` all edges, border `1px #f1dfc5`, radius `34px`, warm panel background `#fff6ea`
     - Layout model: grid, centered items, row gap `24px`
     - Direct children: h1, location, description, CTA row, media
     - Text blocks: Baloo 2 fallback display heading with `line-height: .95`, `letter-spacing: -0.03em`, centered; supporting copy centered with `max-width: 44ch`
     - Media blocks: image wrapper `min(100%, 720px)`, min-height `220px`, border `1px #d9dced`, radius `34px`, `object-fit: cover`
3. `WelcomeInCoreInfoSection`
   - Source selectors: `.section-heading`, `.core-info-grid`, `.core-block`, `.info-link`
   - Layout signature:
     - Shell wrapper: contained, `max-width: 1024px`, centered, padding `0 24px`, margin `12px auto`
     - Immediate content wrapper: none beyond section heading + grid, grid top padding `8px`
     - Layout model: heading centered, info grid `repeat(4, minmax(0, 1fr))`, gap `24px`
     - Direct children: Visit, Call, Hours, Good to know blocks in source order
     - Text blocks: Baloo 2 heading centered; Atkinson section labels bold; body copy regular
     - Media blocks: none
4. `WelcomeInAboutSection`
   - Source selectors: `.section-heading`, `.about`, `.about h3`
   - Layout signature:
     - Shell wrapper: contained, `max-width: 1024px`, centered, padding `0 24px`, margin `12px auto`
     - Immediate content wrapper: panel with padding `32px`, border `1px #d8ebfb`, radius `34px`, background `#f1f8ff`
     - Layout model: centered heading, three-column grid, gap `24px`
     - Direct children: three text-only columns
     - Text blocks: Baloo 2 display heading; Atkinson bold subheads; regular body copy
     - Media blocks: none
5. `WelcomeInFeaturedShelvesSection`
   - Source selectors: `.section-heading`, `.cards-grid`, `.card`, `.card-media`, `.card-body`
   - Layout signature:
     - Shell wrapper: contained, `max-width: 1024px`, centered, padding `0 24px`, margin `12px auto`
     - Immediate content wrapper: heading plus three-column grid
     - Layout model: cards grid `repeat(3, minmax(0, 1fr))`, gap `20px`
     - Direct children: card media first, card body second
     - Text blocks: Baloo 2 section heading; Atkinson bold card titles; regular body and link text
     - Media blocks: fixed-height `180px` media area, overflow hidden, `object-fit: cover`, card radius `34px`
6. `WelcomeInReviewsSection`
   - Source selectors: `.section-heading`, `.reviews`, `.review-summary`, `.review-card`, `.review-score`
   - Layout signature:
     - Shell wrapper: contained, `max-width: 1024px`, centered, padding `0 24px`, margin `12px auto`
     - Immediate content wrapper: heading plus three-column review grid
     - Layout model: grid columns `.9fr 1.1fr 1.1fr`, gap `20px`
     - Direct children: summary card first, then two quote cards
     - Text blocks: Baloo 2 heading centered; score `3rem`, berry, bold, centered; quote/body copy regular
     - Media blocks: none
7. `WelcomeInFooterSection`
   - Source selectors: `.footer-shell`, `.inner.footer-row`, `.footer-brand`, `nav`, `.social`, `.social a`
   - Layout signature:
     - Shell wrapper: full-width white band, top border `1px #d9dced`, margin-top `64px`
     - Immediate content wrapper: contained, `max-width: 1024px`, centered, padding `24px 24px 28px 24px`
     - Layout model: flex row, `justify-content: space-between`, `align-items: center`, wrap enabled, gap `24px`
     - Direct children: brand block, footer nav, social links
     - Text blocks: Atkinson bold brand title and muted tagline; footer nav matches header link sizing
     - Media blocks: circular logo badge plus circular 40x40 social buttons

## Header/Footer Link Parity

| section | group/band  | index | label        | href | behavior           | trigger |
| ------- | ----------- | ----- | ------------ | ---- | ------------------ | ------- |
| header  | primary nav | 1     | Books by age | `#`  | static link        | click   |
| header  | primary nav | 2     | Events       | `#`  | static link        | click   |
| header  | primary nav | 3     | Gift cards   | `#`  | static link        | click   |
| header  | primary nav | 4     | Visit shop   | `#`  | solid CTA link     | click   |
| footer  | footer nav  | 1     | Books by age | `#`  | static link        | click   |
| footer  | footer nav  | 2     | Events       | `#`  | static link        | click   |
| footer  | footer nav  | 3     | Contact      | `#`  | static link        | click   |
| footer  | social      | 1     | ig           | `#`  | static social link | click   |
| footer  | social      | 2     | f            | `#`  | static social link | click   |
| footer  | social      | 3     | tt           | `#`  | static social link | click   |

## Implementation Checklist

- [x] `components/WelcomeInHeaderSection.tsx`
- [x] `components/WelcomeInHeroSection.tsx`
- [x] `components/WelcomeInCoreInfoSection.tsx`
- [x] `components/WelcomeInAboutSection.tsx`
- [x] `components/WelcomeInFeaturedShelvesSection.tsx`
- [x] `components/WelcomeInReviewsSection.tsx`
- [x] `components/WelcomeInFooterSection.tsx`
- [x] Register all components in `starter/src/ve.config.tsx`
- [x] Generate `starter/src/registry/welcome-in/defaultLayout.json`
