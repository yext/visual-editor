# Formal Finder Capture Plan

## Page Metadata

- Requested URL: `file:///Users/blife/Downloads/Elisabeth%202/cpa-local-formal-v1.html`
- Final URL: `file:///Users/blife/Downloads/Elisabeth%202/cpa-local-formal-v1.html`
- Title: `Harbor Ledger CPA | Certified Public Accountant in Hartford, CT`
- Captured At: `2026-03-27T14:06:46.346Z`
- Screenshot: `starter/src/registry/formal-finder/.captured-artifact/screenshot.png`
- Primary CSS evidence: `.header-shell`, `.footer-shell`, `.inner`, `.hero`, `.hero-inner`, `.core-info-grid`, `.about`, `.cards-grid`, `.reviews`, `.faq-list`

## Ordered Section List

1. Header
2. Hero
3. Core Information
4. About
5. Services
6. Reviews
7. FAQ
8. Footer

## Layout Signatures

### 1. Header

- Shell wrapper: full-bleed white band, centered, `border-bottom: 1px solid #dde1e7`
- Immediate content wrapper: `max-width: 1024px`, `margin: 0 auto`, `padding-inline: 24px`
- Layout model: flex row, `justify-content: space-between`, `align-items: center`, `gap: 24px`, wrap allowed
- Direct children:
  - brand lockup: flex row, centered, `gap: 12px`
  - nav: flex row, centered, `gap: 20px`, wrap allowed
- Text blocks:
  - body font stack: `"Source Sans 3", "Open Sans", sans-serif`
  - brand name/nav labels: `16px`, dark ink/navy, weight `700` for brand and CTA, `400` for plain links
- Media blocks:
  - logo badge: `40x40`, navy fill, white text, `4px` radius
- Target file: `components/FormalFinderHeaderSection.tsx`

### 2. Hero

- Shell wrapper: full-bleed, dark ink background `#1a2230`, white foreground, no max-width, no side padding
- Immediate content wrapper: `max-width: 1024px`, centered, `padding-top: 38px`, `padding-right: 24px`, `padding-bottom: 24px`, `padding-left: 24px`
- Layout model: grid, centered, `gap: 20px`, text centered
- Direct children order: heading, location line, supporting copy, CTA row
- Text blocks:
  - title font stack: `"Libre Baskerville", Georgia, serif`, clamp from `48px` to `76.8px`, weight `700`, centered
  - location: `17.92px`, `#c8d5ea`, weight `700`
  - description: `16px`, `#dbe2ec`, max-width `48ch`
- Media blocks: none
- CTA row: flex row, centered, `gap: 12px`, wrap allowed
- Target file: `components/FormalFinderHeroSection.tsx`

### 3. Core Information

- Shell wrapper: contained band, `max-width: 1024px`, centered, `padding-inline: 24px`
- Immediate content wrapper: heading margin-bottom `24px`; content grid `padding-top: 8px`
- Layout model: grid, `3` equal columns on desktop, single column below `900px`, `gap: 24px`
- Direct children:
  - three info blocks with heading, address/links/hours content
  - each block is a stacked grid with `gap: 12px`
- Text blocks:
  - section heading: `"Libre Baskerville", Georgia, serif`, `32px`, weight `700`
  - block headings: `"Source Sans 3", "Open Sans", sans-serif`, `16.8px`, weight `700`
  - detail copy: `16px`, dark ink, normal weight
- Media blocks: none
- Special behavior: use `Address`, `HoursTable`, `HoursStatus`, and `Link` for address/hours/actions
- Target file: `components/FormalFinderCoreInfoSection.tsx`

### 4. About

- Shell wrapper: contained band, `max-width: 1024px`, centered, `padding-inline: 24px`
- Immediate content wrapper: heading margin-bottom `24px`; inner band has `padding-top: 24px`, `padding-bottom: 24px`, top/bottom borders `1px solid #dde1e7`
- Layout model: grid, `3` equal columns on desktop, single column below `900px`, `gap: 24px`
- Direct children: three text columns with heading then body copy
- Text blocks:
  - section heading: `32px`, serif, weight `700`
  - card headings: `16.8px`, sans, weight `700`
  - body copy: `16px`, line-height `1.55`
- Media blocks: none
- Target file: `components/FormalFinderAboutSection.tsx`

### 5. Services

- Shell wrapper: contained band, `max-width: 1024px`, centered, `padding-inline: 24px`
- Immediate content wrapper: heading margin-bottom `24px`
- Layout model: grid, `3` equal columns on desktop, single column below `900px`, `gap: 20px`
- Direct children: bordered cards with internal stacked spacing
- Text blocks:
  - section heading: `32px`, serif, weight `700`
  - card heading: `16.8px`, sans, weight `700`
  - card body: `16px`
- Media blocks: none
- Card treatment: white background, `1px` border `#dde1e7`, `10px` radius, `20px` padding, `16px` internal gap
- Target file: `components/FormalFinderServicesSection.tsx`

### 6. Reviews

- Shell wrapper: contained band, `max-width: 1024px`, centered, `padding-inline: 24px`
- Immediate content wrapper: heading margin-bottom `24px`
- Layout model: grid with columns `.9fr 1.1fr 1.1fr` on desktop, single column below `900px`, `gap: 20px`
- Direct children:
  - summary card first
  - two quote cards second and third
- Text blocks:
  - section heading: `32px`, serif, weight `700`
  - score: `44.8px`, navy `#27354a`, weight `700`
  - card copy: `16px`
- Media blocks: none
- Card treatment: `1px` border `#dde1e7`, `10px` radius, `24px` padding, `16px` internal gap
- Target file: `components/FormalFinderReviewsSection.tsx`

### 7. FAQ

- Shell wrapper: contained band, `max-width: 1024px`, centered, `padding-inline: 24px`
- Immediate content wrapper: heading margin-bottom `24px`
- Layout model: block list
- Direct children: three `details` rows with top border and bottom padding; wrapper adds bottom border
- Text blocks:
  - section heading: `32px`, serif, weight `700`
  - summary: `16px`, sans, weight `700`
  - answer: `16px`, stone `#6a7381`, top margin `12px`
- Media blocks: none
- Interaction: native expand/collapse with summary affordance
- Target file: `components/FormalFinderFaqSection.tsx`

### 8. Footer

- Shell wrapper: full-bleed white band, top border `1px solid #dde1e7`, no bottom border, top margin `64px`
- Immediate content wrapper: `max-width: 1024px`, centered, `padding-top: 24px`, `padding-right: 24px`, `padding-bottom: 28px`, `padding-left: 24px`
- Layout model: flex row, `justify-content: space-between`, `align-items: center`, `gap: 24px`, wrap allowed
- Direct children:
  - footer brand lockup: flex row, centered, `gap: 12px`
  - footer nav: flex row, centered, `gap: 20px`
  - social link row: flex row, `gap: 12px`
- Text blocks:
  - brand title: `16px`, dark ink, weight `700`
  - subtitle: `16px`, stone `#6a7381`
  - nav labels/social labels: `16px`, navy
- Media blocks:
  - logo badge: `40x40`, navy fill, white text, `4px` radius
  - social circles: `40x40`, `1px` line border, full radius
- Target file: `components/FormalFinderFooterSection.tsx`

## Header/Footer Link Parity Table

| Section | Group / Band | Index | Visible Label         | Href | Expand / Collapse | Trigger Type |
| ------- | ------------ | ----- | --------------------- | ---- | ----------------- | ------------ |
| header  | brand lockup | 1     | Harbor Ledger CPA     | `#`  | none              | direct link  |
| header  | primary nav  | 1     | Services              | `#`  | none              | direct link  |
| header  | primary nav  | 2     | Industries            | `#`  | none              | direct link  |
| header  | primary nav  | 3     | Contact               | `#`  | none              | direct link  |
| header  | primary nav  | 4     | Schedule consultation | `#`  | none              | direct link  |
| footer  | footer nav   | 1     | Services              | `#`  | none              | direct link  |
| footer  | footer nav   | 2     | Industries            | `#`  | none              | direct link  |
| footer  | footer nav   | 3     | Contact               | `#`  | none              | direct link  |
| footer  | social       | 1     | in                    | `#`  | none              | direct link  |
| footer  | social       | 2     | f                     | `#`  | none              | direct link  |
| footer  | social       | 3     | x                     | `#`  | none              | direct link  |

## Implementation Checklist

- [ ] `FormalFinderHeaderSection` -> `components/FormalFinderHeaderSection.tsx`
- [ ] `FormalFinderHeroSection` -> `components/FormalFinderHeroSection.tsx`
- [ ] `FormalFinderCoreInfoSection` -> `components/FormalFinderCoreInfoSection.tsx`
- [ ] `FormalFinderAboutSection` -> `components/FormalFinderAboutSection.tsx`
- [ ] `FormalFinderServicesSection` -> `components/FormalFinderServicesSection.tsx`
- [ ] `FormalFinderReviewsSection` -> `components/FormalFinderReviewsSection.tsx`
- [ ] `FormalFinderFaqSection` -> `components/FormalFinderFaqSection.tsx`
- [ ] `FormalFinderFooterSection` -> `components/FormalFinderFooterSection.tsx`
- [ ] Append imports, component registrations, category props, category ordering, and category registration in `starter/src/ve.config.tsx`
- [ ] Run `pnpm run generate-default-layout-data formal-finder FormalFinderHeaderSection FormalFinderHeroSection FormalFinderCoreInfoSection FormalFinderAboutSection FormalFinderServicesSection FormalFinderReviewsSection FormalFinderFaqSection FormalFinderFooterSection`
