# Friendly Faces Plan

## Page Metadata

- URL: `file:///Users/blife/Downloads/Elisabeth%202/pediatrician-local-page-v2.html`
- Title: `Maple Grove Pediatrics | Pediatrician in Cary, NC`
- Captured At: `2026-03-27T13:23:35.050Z`
- Viewport: `1440 x 3025`

## Ordered Sections

1. `FriendlyFacesHeaderSection`
2. `FriendlyFacesHeroSection`
3. `FriendlyFacesCoreInfoSection`
4. `FriendlyFacesAboutSection`
5. `FriendlyFacesServicesSection`
6. `FriendlyFacesPromoSection`
7. `FriendlyFacesReviewsSection`
8. `FriendlyFacesFaqSection`
9. `FriendlyFacesFooterSection`

## Layout Signatures

### 1. Header

- Shell wrapper: full-width white band; contained inner wrapper at `1100px`; centered; shell padding owned by `.header-row` as `24px 0`.
- Immediate content wrapper: no extra card styling; flex row with wrap; `justify-content: space-between`; `align-items: center`; `gap: 24px`.
- Layout model: three direct children ordered left nav, centered brand link, right action nav.
- Direct children: nav groups are inline flex rows with `gap: 20px`; brand link is inline flex with `gap: 12px`; logo badge is `42px` circle.
- Text blocks: Nunito stack; nav links `16px`, ink text, no underline; brand weight `800`.
- Media blocks: no images; decorative logo circle with teal fill and white initial.

### 2. Hero

- Shell wrapper: contained band at `1100px`; centered; `padding-top: 48px`, `padding-bottom: 32px`, `padding-inline: 24px`.
- Immediate content wrapper: single rounded panel with mint-to-white gradient, `1px` border, `32px` radius, `40px` padding.
- Layout model: centered grid; `gap: 20px`; content stacked heading, location, intro copy, CTA row, image.
- Direct children: CTA row is centered flex with wrap and `12px` gap; image wrapper max width `720px`, min height `220px`, radius `28px`.
- Text blocks: Fraunces heading with `line-height: 1.02`, `letter-spacing: -0.03em`, clamp `48px-80px`; location `~20px`, weight `800`, teal; body muted ink.
- Media blocks: full-width cover image inside bordered white frame.

### 3. Core Information

- Shell wrapper: contained band at `1100px`; centered; `padding-top: 56px`, `padding-bottom: 24px`, `padding-inline: 24px`.
- Immediate content wrapper: heading block margin-bottom `24px`; content grid has top padding `8px`.
- Layout model: four-column grid on desktop; single-column below `920px`; `gap: 24px`.
- Direct children: four blocks ordered Visit, Call, Hours, Services; each block is grid with `12px` gap.
- Text blocks: section heading uses Fraunces at `~38px`; subheads use Nunito `~17px`, weight `800`; body uses `16px`.
- Media blocks: no images; contact icons are decorative `36px` mint circles.

### 4. About

- Shell wrapper: contained band at `1100px`; centered; `padding-top: 56px`, `padding-bottom: 24px`, `padding-inline: 24px`.
- Immediate content wrapper: peach card with `28px` radius and `32px` padding.
- Layout model: two equal columns on desktop, one column below `920px`; `gap: 32px`; top aligned.
- Direct children: left column contains section heading only; right column contains eyebrow-style subhead plus paragraph.
- Text blocks: Fraunces heading `~38px`; supporting heading Nunito `~17px` weight `800`; body muted/ink copy.
- Media blocks: none.

### 5. Services

- Shell wrapper: contained band at `1100px`; centered; `padding-top: 56px`, `padding-bottom: 24px`, `padding-inline: 24px`.
- Immediate content wrapper: heading block margin-bottom `24px`.
- Layout model: three-card grid on desktop, single column below `920px`; `gap: 20px`.
- Direct children: cards use parent-owned gap spacing; each card is bordered white panel with `24px` radius and `24px` padding.
- Text blocks: section heading Fraunces `~38px`; card titles Nunito `~17px`, weight `800`; card copy muted.
- Media blocks: decorative numbered mint badges sized `56px` square with `16px` radius.

### 6. Promo

- Shell wrapper: contained band at `1100px`; centered; `padding-top: 56px`, `padding-bottom: 24px`, `padding-inline: 24px`.
- Immediate content wrapper: mint card with border, `28px` radius, `24px` padding.
- Layout model: two-column grid `360px 1fr` on desktop, one column below `920px`; `gap: 24px`; vertically centered.
- Direct children: image left, copy right; CTA row left-aligned inside copy stack.
- Text blocks: Fraunces headline `~38px`; body muted `16px`.
- Media blocks: image frame min height `280px`, `24px` radius, cover crop, white background, thin border.

### 7. Reviews

- Shell wrapper: contained band at `1100px`; centered; `padding-top: 56px`, `padding-bottom: 24px`, `padding-inline: 24px`.
- Immediate content wrapper: heading block margin-bottom `24px`.
- Layout model: three-card grid on desktop, one column below `920px`; `gap: 20px`.
- Direct children: first card is score summary; next two are testimonial cards; all use the same bordered white card shell.
- Text blocks: section heading Fraunces `~38px`; score `40px`, teal, weight `800`; testimonial titles Nunito `~17px`, weight `800`; quotes muted.
- Media blocks: none.

### 8. FAQ

- Shell wrapper: contained band at `1100px`; centered; `padding-top: 56px`, `padding-bottom: 24px`, `padding-inline: 24px`.
- Immediate content wrapper: heading block margin-bottom `24px`; FAQ list is grid with `16px` gap.
- Layout model: stacked details elements.
- Direct children: each item is bordered white panel with `18px` radius and `20px` padding.
- Text blocks: heading Fraunces `~38px`; question summary Nunito `16px` weight `800`; answer text muted with `12px` top spacing.
- Media blocks: none; disclosure icon is `+/-` on summary trailing edge.

### 9. Footer

- Shell wrapper: full-width white band with `1px` top border and `72px` top margin.
- Immediate content wrapper: contained row at `1100px`; centered; inline padding `24px`; footer row owns all vertical spacing.
- Layout model: flex row with wrap, `justify-content: space-between`, `align-items: center`, `gap: 24px`.
- Direct children: brand block, footer nav, social link row.
- Text blocks: Nunito, ink text, weight `800` on brand; nav links `16px`.
- Media blocks: no images; social links are `40px` bordered circles.

## Header And Footer Link Parity

| Section | Group/Band  | Index | Label                  | Href | Expand/Collapse | Trigger |
| ------- | ----------- | ----- | ---------------------- | ---- | --------------- | ------- |
| header  | primary nav | 1     | Services               | `#`  | none            | click   |
| header  | primary nav | 2     | New patients           | `#`  | none            | click   |
| header  | brand       | 1     | Maple Grove Pediatrics | `#`  | none            | click   |
| header  | actions     | 1     | Forms                  | `#`  | none            | click   |
| header  | actions     | 2     | Book a visit           | `#`  | none            | click   |
| footer  | brand       | 1     | Maple Grove Pediatrics | `#`  | none            | click   |
| footer  | navigation  | 1     | Services               | `#`  | none            | click   |
| footer  | navigation  | 2     | New patients           | `#`  | none            | click   |
| footer  | navigation  | 3     | Contact                | `#`  | none            | click   |
| footer  | social      | 1     | f                      | `#`  | none            | click   |
| footer  | social      | 2     | ig                     | `#`  | none            | click   |
| footer  | social      | 3     | yt                     | `#`  | none            | click   |

## Implementation Checklist

- [ ] `FriendlyFacesHeaderSection.tsx`: centered tri-column header with exact nav grouping and pill action parity.
- [ ] `FriendlyFacesHeroSection.tsx`: mint gradient hero panel with centered copy, dual CTAs, and full-width rounded image.
- [ ] `FriendlyFacesCoreInfoSection.tsx`: four-up information grid using stream-backed address, phone, and hours.
- [ ] `FriendlyFacesAboutSection.tsx`: peach two-column reassurance band.
- [ ] `FriendlyFacesServicesSection.tsx`: three bordered service cards with numbered mint badges.
- [ ] `FriendlyFacesPromoSection.tsx`: split promo card with left media and right CTA copy.
- [ ] `FriendlyFacesReviewsSection.tsx`: review score card plus two testimonial cards.
- [ ] `FriendlyFacesFaqSection.tsx`: stacked FAQ details cards.
- [ ] `FriendlyFacesFooterSection.tsx`: footer row with brand, nav parity, and social circles.
