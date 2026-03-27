## Page Metadata

- Template: `here-for-you`
- Source URL: `file:///Users/blife/Downloads/Elisabeth%202/physical-therapy-local-supportive-v1.html`
- Title: `Harbor Physical Therapy | Physical Therapy in Providence, RI`
- Captured At: `2026-03-27T14:07:36.964Z`

## Ordered Section List

1. Header
2. Hero
3. Core Information
4. About
5. Promo
6. Reviews
7. Footer

## Layout Signatures

### 1. Header

- Shell wrapper: full-bleed white band, `max-width: none`, centered inner wrapper with `max-width: 1024px`, padding `0 24px`
- Immediate content wrapper: `.header-row` flex row, `justify-content: space-between`, `align-items: center`, `flex-wrap: wrap`, gap `24px`, padding `24px 0 24px 0`
- Layout model: two direct children, brand lockup then nav
- Direct children:
  - brand lockup: inline flex, gap `12px`, logo `42x42`, rounded full
  - nav: inline flex, wrap, gap `20px`, last link rendered as filled pill CTA
- Text blocks: body font `"Manrope", sans-serif`; brand label weight `800`; nav links inherit ink color, CTA weight `700`
- Media blocks: no external media; logo is teal circular badge with white letter

### 2. Hero

- Shell wrapper: contained section, `max-width: 1024px`, centered, margins `12px auto`, padding `0 24px`
- Immediate content wrapper: two-column grid `1fr 1fr`, gap `32px`, align center, padding top `36px`, bottom `24px`
- Layout model: copy column then photo column
- Direct children:
  - copy column: grid stack with `16px` gap
  - photo column: full-height card, min-height `420px`, aspect `4 / 5`, border `1px solid #d7e7e6`, radius `28px`
- Text blocks:
  - `h1`: `"Fraunces", serif`, clamp `3rem` to `5rem`, line-height `1.02`, letter-spacing `-0.03em`
  - location line: `1.15rem`, weight `800`, color `#2d8a87`
  - status paragraph: body font, color `#667685`, max-width `42ch`
- Media blocks: image fills container, `object-fit: cover`, `object-position: 58% 38%`

### 3. Core Information

- Shell wrapper: contained section, `max-width: 1024px`, centered, margins `12px auto`, padding `0 24px`
- Immediate content wrapper: heading block with `24px` bottom margin followed by four-column grid
- Layout model: outer block, inner grid `repeat(4, minmax(0, 1fr))`, gap `24px`, top padding `8px`
- Direct children: four `.core-block` columns with grid gap `12px`
- Text blocks:
  - section heading `h2`: `"Fraunces", serif`, `2.2rem`, line-height `1.02`
  - subheads `h3`: body font, bold, ink color
  - links use teal with single-line truncation where needed
- Media blocks: none

### 4. About

- Shell wrapper: full-bleed mist strip `#edf8f7`, vertical padding `24px`, horizontal padding `0`
- Immediate content wrapper: centered `.section-inner` with `max-width: 1024px`, padding `0 24px`
- Layout model: two-column grid `1.1fr .9fr`, gap `32px`, align start, section padding `32px 0`
- Direct children:
  - heading column first
  - bullet list second with left padding `18px`
- Text blocks:
  - heading `h2`: `"Fraunces", serif`, `2.2rem`
  - list copy: body font, default line-height `1.55`
- Media blocks: none

### 5. Promo

- Shell wrapper: full-bleed sand strip `#f7f2ea`, vertical padding `24px`
- Immediate content wrapper: centered `.section-inner` with `max-width: 1024px`, padding `0 24px`
- Layout model: two-column grid `340px 1fr`, gap `24px`, align center, section padding `24px 0`
- Direct children:
  - image first, min-height `260px`, rounded `16px`
  - copy second, stacked with `16px` gap
- Text blocks:
  - heading `h2`: `"Fraunces", serif`, `2.2rem`
  - body paragraph: body font, ink color
  - CTA: outlined teal pill
- Media blocks: image fills card, `object-fit: cover`

### 6. Reviews

- Shell wrapper: contained section, `max-width: 1024px`, centered, margins `12px auto`, padding `0 24px`
- Immediate content wrapper: heading block with `24px` bottom margin followed by three-column grid
- Layout model: review grid columns `.95fr 1.05fr 1.05fr`, gap `20px`
- Direct children:
  - summary card first
  - two review cards second and third
  - every card has border `1px solid #d7e7e6`, radius `28px`, padding `24px`, internal gap `16px`
- Text blocks:
  - heading `h2`: `"Fraunces", serif`, `2.2rem`
  - score: body font, `2.8rem`, weight `800`, color `#2d8a87`
  - quotes: body font, ink color
- Media blocks: none

### 7. Footer

- Shell wrapper: full-bleed white band with top border `1px solid #d7e7e6`, top margin `64px`
- Immediate content wrapper: centered flex row, `max-width: 1024px`, padding `24px 24px 28px 24px`, gap `24px`, wrap enabled
- Layout model: footer brand, footer nav, social links
- Direct children:
  - brand block: inline flex, gap `12px`, muted descriptor beneath bold brand name
  - nav: inline flex, wrap, gap `20px`
  - social row: inline flex, wrap, gap `12px`
- Text blocks: body font, brand name weight `700+`, descriptor muted `#667685`
- Media blocks: social pills are `40x40`, bordered circles; logo matches header badge

## Header/Footer Link Parity Table

| Section | Group/Band Placement | Index | Label              | Href | Expand/Collapse | Trigger Type |
| ------- | -------------------- | ----- | ------------------ | ---- | --------------- | ------------ |
| header  | primary nav          | 1     | Conditions         | #    | none            | click        |
| header  | primary nav          | 2     | New patients       | #    | none            | click        |
| header  | primary nav          | 3     | Insurance          | #    | none            | click        |
| header  | primary nav          | 4     | Request evaluation | #    | none            | click        |
| footer  | footer nav           | 1     | Conditions         | #    | none            | click        |
| footer  | footer nav           | 2     | New patients       | #    | none            | click        |
| footer  | footer nav           | 3     | Contact            | #    | none            | click        |
| footer  | social links         | 1     | f                  | #    | none            | click        |
| footer  | social links         | 2     | ig                 | #    | none            | click        |
| footer  | social links         | 3     | in                 | #    | none            | click        |

## Implementation Checklist

- [x] Header -> `HereForYouHeaderSection.tsx`
- [x] Hero -> `HereForYouHeroSection.tsx`
- [x] Core Information -> `HereForYouCoreInfoSection.tsx`
- [x] About -> `HereForYouAboutSection.tsx`
- [x] Promo -> `HereForYouPromoSection.tsx`
- [x] Reviews -> `HereForYouReviewsSection.tsx`
- [x] Footer -> `HereForYouFooterSection.tsx`
- [x] Register new imports and category in `starter/src/ve.config.tsx`
- [x] Generate `defaultLayout.json` with page-order component list
