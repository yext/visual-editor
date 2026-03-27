# Cool Running Plan

- Template: `cool-running`
- Description target: A restrained, utilitarian template with a transactional feeling. Cool colors surround a low information density.
- Source URL: `file:///Users/blife/Downloads/Elisabeth%202/atm-local-practical-v1.html`
- Source title: `CityPoint ATM | Cash Access in Charlotte, NC`
- Captured at: `2026-03-27T14:06:14.465Z`

## Ordered Sections

1. `CoolRunningHeaderSection`
2. `CoolRunningHeroSection`
3. `CoolRunningCoreInfoSection`
4. `CoolRunningUpdateBannerSection`
5. `CoolRunningDetailsSection`
6. `CoolRunningNearbyLocationsSection`
7. `CoolRunningFaqSection`
8. `CoolRunningFooterSection`

## Layout Signatures

### 1. Header

- Shell wrapper:
  - full width white band with `1px` bottom border `#dbe2ea`
  - outer shell uses `margin-bottom: 24px`
  - contained content wrapper `max-width: 1024px`, centered, `padding-left/right: 24px`
- Immediate content wrapper:
  - two stacked flex bands
  - utility row `padding-top/bottom: 10px`
  - header row `padding-top/bottom: 18px`
- Layout model:
  - both bands are `flex`, `justify-content: space-between`, `align-items: center`, `gap: 24px`, `flex-wrap: wrap`
  - nav groups use `flex`, `gap: 20px`, `flex-wrap: wrap`
- Direct children:
  - utility band order: utility nav, status copy
  - main band order: brand lockup, primary nav
  - brand lockup contains 40x40 blue tile, then linked brand name
- Text blocks:
  - utility copy `IBM Plex Sans`, about `15px`, `#5e6d7b`, normal weight
  - brand link `IBM Plex Sans`, about `16px`, `#14202c`, `700`
  - nav links `IBM Plex Sans`, inherit `#14202c`
- Media blocks:
  - no external images
  - logo tile is a text mark inside a 40x40 square with `6px` radius and dark blue fill

### 2. Hero

- Shell wrapper:
  - contained section, centered, `max-width: 1024px`
  - single section owns `padding-top/right/bottom/left: 24px`
- Immediate content wrapper:
  - same section element owns pale blue background `#f4f8fb`
  - `1px` border `#dbe2ea`, `14px` radius
- Layout model:
  - `display: grid`, vertical stack, `gap: 20px`
- Direct children:
  - order: h1, location line, status copy, CTA row
- Text blocks:
  - h1 uses `Space Grotesk`, `clamp(44.8px, 6vw, 72px)`, `#14202c`, heavy negative tracking
  - location copy `IBM Plex Sans`, about `18px`, `#0e446d`, `700`
  - status copy `IBM Plex Sans`, `16px`, `#5e6d7b`, max-width about `42ch`
- Media blocks:
  - none
  - CTA row is flex with `12px` gap; primary pill is filled blue, secondary pill is white with blue border

### 3. Core Info

- Shell wrapper:
  - contained section, centered, `max-width: 1024px`
  - section owns `padding-top/right/bottom/left: 24px`
- Immediate content wrapper:
  - no extra wrapper beyond section
  - section heading owns `margin-bottom: 24px`
- Layout model:
  - three-column grid with `gap: 24px`
  - each column is a grid stack with `gap: 12px`
- Direct children:
  - order: location block, support block, availability block
- Text blocks:
  - section heading `Space Grotesk`, `32px`, `#14202c`
  - column headings `IBM Plex Sans`, about `16px`, `700`
  - body/link copy `IBM Plex Sans`, `16px`, `#14202c` or `#1677c9`
- Media blocks:
  - none
  - address/hours are stream-backed

### 4. Update Banner

- Shell wrapper:
  - contained section, centered, `max-width: 1024px`
  - no outer section padding beyond shared container width
- Immediate content wrapper:
  - pale blue panel `#eef6fd`
  - `1px` border `#dbe2ea`, `6px` radius
  - `padding: 12px 16px`
  - `margin-top/bottom: 24px`
- Layout model:
  - `flex`, `justify-content: space-between`, `align-items: center`, `gap: 16px`, `flex-wrap: wrap`
- Direct children:
  - order: supporting text, CTA link
- Text blocks:
  - supporting copy `IBM Plex Sans`, `16px`, `#14202c`
  - CTA link `IBM Plex Sans`, `16px`, `#1677c9`

### 5. ATM Details

- Shell wrapper:
  - full-width dark blue band `#0e446d`
  - section owns `padding-top/bottom: 24px`
  - `1px` border `#0a3657`
- Immediate content wrapper:
  - centered inner wrapper `max-width: 1024px`, `padding-left/right: 24px`
  - heading block `margin-bottom: 24px`
- Layout model:
  - three-column grid with `gap: 20px`
- Direct children:
  - heading row, then cards grid
- Text blocks:
  - heading `Space Grotesk`, `32px`, white
  - card titles `IBM Plex Sans`, about `16px`, `700`, white
  - card copy `IBM Plex Sans`, `16px`, white
- Media blocks:
  - none
  - cards use semi-transparent white fill and `14px` radius

### 6. Nearby Locations

- Shell wrapper:
  - full-width dark blue band with same border treatment as ATM Details
  - `padding-top/bottom: 24px`
- Immediate content wrapper:
  - centered inner wrapper `max-width: 1024px`, `padding-left/right: 24px`
- Layout model:
  - heading followed by three-column grid with `gap: 20px`
- Direct children:
  - each card stacks title, locality, status, CTA
- Text blocks:
  - heading `Space Grotesk`, `32px`, white
  - card texts `IBM Plex Sans`, mostly `16px`, white
  - CTA links remain white
- Media blocks:
  - none

### 7. FAQ

- Shell wrapper:
  - full-width dark blue band with same border treatment as previous dark sections
  - `padding-top/bottom: 24px`
- Immediate content wrapper:
  - centered inner wrapper `max-width: 1024px`, `padding-left/right: 24px`
- Layout model:
  - section heading then single-column grid `gap: 16px`
  - each FAQ item is a native `details` block
- Direct children:
  - three closed accordions in source order
- Text blocks:
  - heading `Space Grotesk`, `32px`, white
  - summary copy `IBM Plex Sans`, `16px`, `700`, white
  - answer copy `IBM Plex Sans`, `16px`, white with reduced opacity treatment
- Media blocks:
  - none
  - `+ / −` indicator stays right-aligned inside summary

### 8. Footer

- Shell wrapper:
  - full width white band with top border `#dbe2ea`
  - `margin-top: 64px`, `padding-top: 24px`
- Immediate content wrapper:
  - centered inner wrapper `max-width: 1024px`
  - footer row padding `top: 24px`, `right/left: 24px`, `bottom: 28px`
- Layout model:
  - single flex row with `justify-content: space-between`, `align-items: center`, `gap: 24px`, `flex-wrap: wrap`
  - brand block is nested flex with `gap: 12px`
  - footer nav `flex` with `gap: 20px`
  - social group `flex` with `gap: 12px`
- Direct children:
  - order: brand block, footer nav, social links
- Text blocks:
  - title `IBM Plex Sans`, `14-16px`, `700`, `#14202c`
  - tagline `IBM Plex Sans`, `16px`, `#5e6d7b`
- Media blocks:
  - logo tile repeats 40x40 square
  - social links are 40x40 outlined circles

## Header/Footer Link Parity

| Section | Band / Group | Index | Visible Label   | Href | Expand / Collapse | Trigger                    |
| ------- | ------------ | ----- | --------------- | ---- | ----------------- | -------------------------- |
| header  | utility nav  | 1     | Nearby branches | `#`  | none              | direct link                |
| header  | utility nav  | 2     | Support         | `#`  | none              | direct link                |
| header  | brand lockup | 1     | CityPoint ATM   | `#`  | none              | direct link                |
| header  | primary nav  | 1     | Services        | `#`  | none              | direct link                |
| header  | primary nav  | 2     | Accessibility   | `#`  | none              | direct link                |
| header  | primary nav  | 3     | Nearby ATMs     | `#`  | none              | direct link                |
| header  | primary nav  | 4     | Get directions  | `#`  | none              | direct link, outlined pill |
| footer  | footer nav   | 1     | Services        | `#`  | none              | direct link                |
| footer  | footer nav   | 2     | Accessibility   | `#`  | none              | direct link                |
| footer  | footer nav   | 3     | Support         | `#`  | none              | direct link                |
| footer  | social       | 1     | f               | `#`  | none              | direct link, circular icon |
| footer  | social       | 2     | in              | `#`  | none              | direct link, circular icon |
| footer  | social       | 3     | x               | `#`  | none              | direct link, circular icon |

## Implementation Checklist

- [x] Create `starter/src/registry/cool-running/components/CoolRunningHeaderSection.tsx`
- [x] Create `starter/src/registry/cool-running/components/CoolRunningHeroSection.tsx`
- [x] Create `starter/src/registry/cool-running/components/CoolRunningCoreInfoSection.tsx`
- [x] Create `starter/src/registry/cool-running/components/CoolRunningUpdateBannerSection.tsx`
- [x] Create `starter/src/registry/cool-running/components/CoolRunningDetailsSection.tsx`
- [x] Create `starter/src/registry/cool-running/components/CoolRunningNearbyLocationsSection.tsx`
- [x] Create `starter/src/registry/cool-running/components/CoolRunningFaqSection.tsx`
- [x] Create `starter/src/registry/cool-running/components/CoolRunningFooterSection.tsx`
- [x] Register all generated components in `starter/src/ve.config.tsx`
- [x] Generate `starter/src/registry/cool-running/defaultLayout.json`
