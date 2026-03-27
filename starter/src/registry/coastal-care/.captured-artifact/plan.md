# Coastal Care Capture Plan

## Page Metadata

- Template: `coastal-care`
- Source URL: `file:///Users/blife/Downloads/Elisabeth%202/coastal-vet-fullwidth-hero-v1.html`
- Title: `Harbor Animal Clinic | Veterinary Care in Newport, RI`
- Captured At: `2026-03-27T14:07:49.366Z`

## Ordered Section List

1. Header
2. Hero
3. Core information
4. About
5. Services
6. Client reviews
7. FAQs
8. Footer

## Layout Signatures

### 1. Header

- Shell wrapper: full-bleed white band, `max-width: 1024px` inner wrapper, horizontally centered, shell bottom margin `24px`, inner horizontal padding `24px`, header row vertical padding `22px`.
- Immediate content wrapper: flex row, `justify-content: space-between`, `align-items: center`, `gap: 24px`, `flex-wrap: wrap`.
- Layout model: left brand lockup plus right nav actions.
- Direct children:
  - Brand lockup: flex row, `gap: 12px`, circular 42x42 logo pill, clinic name link.
  - Nav: flex row, `gap: 20px`, wrapped, three plain links plus one filled pill CTA.
- Text blocks: body font `"Public Sans", sans-serif`, nav/body weight `700` for CTA and `400-800` elsewhere, ink text `#183347`, sea accent `#2d6f83`.
- Media blocks: no media; decorative circular logo uses flat fill `#2d6f83`.

### 2. Hero

- Shell wrapper: full-bleed image band, no outer max-width, zero shell padding, background image with dark overlay, image positioned center `35%`, min-height `430px`.
- Immediate content wrapper: centered inner wrapper `max-width: 1024px`, horizontal padding `24px`, top padding `56px`, bottom padding `48px`, grid aligned to end.
- Layout model: single framed overlay card anchored lower-left.
- Direct children:
  - Hero card: width constrained to `560px`, translucent white background `rgba(255,255,255,0.92)`, radius `24px`, padding `32px`, grid gap `16px`.
  - CTA row: flex row, `gap: 12px`, wrap.
- Text blocks:
  - H1 uses `"DM Serif Display", "Times New Roman", serif`, `clamp(3rem, 6vw, 5rem)`, line-height `1`, ink `#183347`, left aligned.
  - Location label uses body font, `1.1rem`, weight `800`, sea `#2d6f83`.
  - Supporting copy uses muted `#5f7684`, max width `42ch`.
- Media blocks: full-width hero image with separate dark overlay layer beneath the card.

### 3. Core Information

- Shell wrapper: contained white band, `max-width: 1024px`, centered, padding `24px` on all sides.
- Immediate content wrapper: heading block with `24px` bottom margin, then four-column grid with `24px` gap and `8px` top padding.
- Layout model: grid, `grid-template-columns: repeat(4, 1fr)`, collapses to one column under `900px`.
- Direct children: four stacked info blocks with local heading plus address, call, hours, and care-focus content.
- Text blocks: H2 uses serif at `2.2rem`; body copy uses Public Sans, ink `#183347`; contact links use sea `#2d6f83`; truncated links stay single-line.
- Media blocks: none.

### 4. About

- Shell wrapper: contained white band with standard `24px` outer padding.
- Immediate content wrapper: pale foam panel `#eef6f7`, radius `24px`, padding `32px`, two-column grid `1.15fr / .85fr`, `gap: 32px`, `align-items: start`.
- Layout model: left heading block, right bullet list.
- Direct children:
  - Left column: section heading only, no extra bottom margin.
  - Right column: unordered list with `18px` left padding and `16px` vertical gap.
- Text blocks: serif heading `2.2rem`, body/list items in Public Sans with standard body size and ink text.
- Media blocks: none.

### 5. Services

- Shell wrapper: contained white band, `max-width: 1024px`, centered, `24px` section padding.
- Immediate content wrapper: heading with `24px` bottom margin, followed by three-card grid with `20px` gap.
- Layout model: grid, `repeat(3, 1fr)`, collapses to one column under `900px`.
- Direct children:
  - Card shell: white background, `1px` line border `#d7e3e7`, radius `24px`, overflow hidden.
  - Image: full width, fixed `220px` height, `object-fit: cover`.
  - Card body: `20px` padding, grid gap `16px`.
- Text blocks: H3 uses body font, `1.15rem`, weight `800`; descriptions use muted/ink body copy; CTA is outlined pill.
- Media blocks: three card-top photos with no inner radius beyond card clipping.

### 6. Client Reviews

- Shell wrapper: contained white band, `max-width: 1024px`, centered, `24px` padding.
- Immediate content wrapper: heading with `24px` bottom margin, then three-column grid `.9fr 1.05fr 1.05fr` with `20px` gap.
- Layout model: one summary card plus two testimonial cards; all collapse to one column under `900px`.
- Direct children:
  - Summary and testimonial cards share white background, `1px` border `#d7e3e7`, radius `24px`, `24px` padding, grid gap `16px`.
  - Summary score is prominent and left aligned.
- Text blocks: H2 serif `2.2rem`; score uses Public Sans at `2.8rem`, weight `800`, sea `#2d6f83`; quotes use normal body weight; attribution uses bold label plus second line.
- Media blocks: none.

### 7. FAQs

- Shell wrapper: contained white band, `max-width: 1024px`, centered, `24px` padding.
- Immediate content wrapper: heading with `24px` bottom margin, then one bordered FAQ list with bottom border.
- Layout model: vertical stack of `details` rows, each row separated by a `1px` top border.
- Direct children:
  - Summary row: flex, `justify-content: space-between`, `gap: 16px`, weight `700`, plus/minus affordance on the right.
  - Body copy: `12px` top margin, muted text `#5f7684`.
- Text blocks: heading serif `2.2rem`; FAQ prompts in Public Sans bold; answer copy standard body size.
- Media blocks: none.

### 8. Footer

- Shell wrapper: full-bleed white band, `1px` top border `#d7e3e7`, `24px` top margin.
- Immediate content wrapper: centered inner wrapper `max-width: 1024px`, flex row with wrap, `justify-content: space-between`, `align-items: center`, `gap: 24px`, padding `24px 24px 28px`.
- Layout model: three groups in order: brand block, footer nav, social icons.
- Direct children:
  - Brand block: circular logo plus stacked clinic name and muted location text.
  - Footer nav: flex row, wrapped, plain text links.
  - Social group: flex row, `gap: 12px`, circular 40x40 outlined icons.
- Text blocks: clinic name strong/bold in ink; location muted `#5f7684`; link text inherits ink/sea treatment.
- Media blocks: inline SVG social icons only.

## Header/Footer Link Parity Table

| Section | Group/Band  | Index | Visible Label    | Href | Expand/Collapse | Trigger |
| ------- | ----------- | ----- | ---------------- | ---- | --------------- | ------- |
| header  | primary nav | 1     | Services         | `#`  | none            | click   |
| header  | primary nav | 2     | New clients      | `#`  | none            | click   |
| header  | primary nav | 3     | Care team        | `#`  | none            | click   |
| header  | primary nav | 4     | Book appointment | `#`  | none            | click   |
| footer  | footer nav  | 1     | Services         | `#`  | none            | click   |
| footer  | footer nav  | 2     | New clients      | `#`  | none            | click   |
| footer  | footer nav  | 3     | Contact          | `#`  | none            | click   |
| footer  | social      | 1     | Instagram        | `#`  | none            | click   |
| footer  | social      | 2     | Facebook         | `#`  | none            | click   |

## Implementation Checklist

- [x] `CoastalCareHeaderSection.tsx` for the top white navigation band
- [x] `CoastalCareHeroSection.tsx` for the full-width image hero with framed overlay card
- [x] `CoastalCareCoreInfoSection.tsx` for the four-column info grid
- [x] `CoastalCareAboutSection.tsx` for the pale two-column community-care panel
- [x] `CoastalCareServicesSection.tsx` for the three-card services grid
- [x] `CoastalCareReviewsSection.tsx` for the summary/testimonial cards
- [x] `CoastalCareFaqSection.tsx` for the bordered FAQ details stack
- [x] `CoastalCareFooterSection.tsx` for the bottom navigation/social band
