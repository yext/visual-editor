## Page Metadata

- Requested URL: `https://www.ofc-albany.com/our-locations`
- Captured title: `Downers Grove, IL Dentist`
- Captured at: `2026-04-14T16:32:58.213Z`
- Source-of-truth content note: the served page content is for Sunny Smiles Dental / Downers Grove, and generation follows that served content exactly.

## Ordered Section List

1. `Hs1AlbanyOfficeHeaderSection`
2. `Hs1AlbanyOfficeHeroSection`
3. `Hs1AlbanyOfficeContentSection`
4. `Hs1AlbanyOfficeHoursSection`
5. `Hs1AlbanyOfficeLocationSection`
6. `Hs1AlbanyOfficeContactFormSection`
7. `Hs1AlbanyOfficeFooterSection`

## Layout Signatures

### 1. Header

- Shell wrapper:
  full-bleed white desktop bar; sticky black mobile bar; centered content at roughly `1200px`
  desktop per-edge padding from section CSS: logo `10px` vertical, nav/phone `20px` vertical
- Immediate content wrapper:
  three-column flex row on desktop: logo, nav, phone
  mobile row with menu button, centered brand, phone icon
- Layout model:
  desktop flex row, `align-items:center`, `justify-content:space-between`
  mobile flex row with collapsible menu drawer behavior
- Direct children:
  logo left, nav center, phone right
  desktop nav has five visible links plus `More` dropdown with secondary links and nested Patient Education links
- Text blocks:
  Montserrat fallback stack
  nav text small black, phone gold and larger weight
- Media blocks:
  compact logo image on white, no background fill

### 2. Hero

- Shell wrapper:
  full-bleed gold band `#e5c989`
  contained content around `1200px`
  small breadcrumb above the title
- Immediate content wrapper:
  vertical stack
- Layout model:
  block layout, left-aligned
- Direct children:
  breadcrumb row, then uppercase title row
- Text blocks:
  breadcrumb tiny muted beige/white
  title uppercase white, Montserrat, medium weight

### 3. Content

- Shell wrapper:
  full-bleed white section
  contained content around `1100px`
  desktop top/bottom padding approx `25px / 50px`
- Immediate content wrapper:
  long editorial stack with a floated office photo at upper right
- Layout model:
  block layout with text flow; office image floats right on desktop
- Direct children:
  intro title/body, office card details, office-hours list, appointment/insurance/payment/financing/facilities blocks
- Text blocks:
  section headings gold `#d3a335`
  body copy gray `#4a4a4a`
  Montserrat headings, Arial/Helvetica-like body fallback
- Media blocks:
  office image around `250x185`, right-aligned
  CareCredit image right-aligned within financing block
- Hours decisions:
  use `HoursTable`
  no live status line
  full weekday labels with punctuation via `Monday:`
  uppercase time format for this section
  stock table retained with explicit row-width and `min-w-0` overrides

### 4. Hours Of Operation

- Shell wrapper:
  full-bleed light gray section `#efefef`
  contained content around `1200px`
  generous vertical padding
- Immediate content wrapper:
  title/subtitle stacked over a seven-column schedule
- Layout model:
  desktop seven-column grid with vertical borders
  mobile single-column row list
- Direct children:
  title, subtitle, day columns
- Text blocks:
  uppercase gray title, gold subtitle
  day labels bold, times lowercase
- Hours decisions:
  custom render justified because source uses a horizontal seven-column schedule that `HoursTable` cannot match without changing structure
  no status line
  weekday labels use full names without punctuation
  lowercase time strings in this section

### 5. Location

- Shell wrapper:
  full-bleed white section
  content spans wider than standard container; left content plus right map
- Immediate content wrapper:
  two-column layout, left info card about `5/12`, right map `7/12`
- Layout model:
  responsive grid, stack on mobile
- Direct children:
  title/subtitle, primary location details, embedded map
- Text blocks:
  gray uppercase title, gold subtitle, bold location label
- Media blocks:
  large map pane with no border radius, light gray border

### 6. Contact Form

- Shell wrapper:
  full-bleed gold section `#e5c989`
  centered content around `1200px`
- Immediate content wrapper:
  centered title above two-column form layout
- Layout model:
  grid: three short inputs left, textarea right, note and submit below full width
- Direct children:
  title, left input column, right textarea, note, submit button
- Text blocks:
  title uppercase white
  note small white
- Media blocks:
  none

### 7. Footer

- Shell wrapper:
  full-bleed white footer
  contained content around `1200px`
  top row logo/social, bottom row legal links
- Immediate content wrapper:
  vertical stack with row gap
- Layout model:
  desktop split top row; centered legal links below
- Direct children:
  logo block, social icons list, legal links row
- Text blocks:
  gray brand text and gold legal links
- Media blocks:
  compact logo image

## Header / Footer Link Parity Table

| Section | Group/Band        | Index | Label                                        | Href                                                                   | Behavior           |
| ------- | ----------------- | ----- | -------------------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| header  | desktop-primary   | 1     | Home                                         | `https://www.ofc-albany.com`                                           | direct link        |
| header  | desktop-primary   | 2     | Staff                                        | `https://www.ofc-albany.com/staff`                                     | direct link        |
| header  | desktop-primary   | 3     | Office                                       | `https://www.ofc-albany.com/our-locations`                             | direct link        |
| header  | desktop-primary   | 4     | Services                                     | `https://www.ofc-albany.com/dental-services`                           | direct link        |
| header  | desktop-primary   | 5     | New Patients                                 | `https://www.ofc-albany.com/new-patients`                              | direct link        |
| header  | desktop-more      | 1     | Contact Us                                   | `https://www.ofc-albany.com/contact`                                   | hover dropdown     |
| header  | desktop-more      | 2     | Appointment Request                          | `https://www.ofc-albany.com/appointment`                               | hover dropdown     |
| header  | desktop-more      | 3     | Testimonials                                 | `https://www.ofc-albany.com/testimonials`                              | hover dropdown     |
| header  | desktop-more      | 4     | Smile Gallery                                | `https://www.ofc-albany.com/gallery`                                   | hover dropdown     |
| header  | desktop-more      | 5     | Blog                                         | `https://www.ofc-albany.com/blog`                                      | hover dropdown     |
| header  | desktop-more      | 6     | Patient Education                            | `https://www.ofc-albany.com/articles/premium_education`                | nested hover group |
| header  | patient-education | 1     | Educational Videos                           | `https://www.ofc-albany.com/articles/premium_education/category/47361` | nested link        |
| header  | patient-education | 2     | Cosmetic & General Dentistry                 | `https://www.ofc-albany.com/articles/premium_education/category/47362` | nested link        |
| header  | patient-education | 3     | Emergency Care                               | `https://www.ofc-albany.com/articles/premium_education/category/47363` | nested link        |
| header  | patient-education | 4     | Endodontics                                  | `https://www.ofc-albany.com/articles/premium_education/category/47364` | nested link        |
| header  | patient-education | 5     | Implant Dentistry                            | `https://www.ofc-albany.com/articles/premium_education/category/47365` | nested link        |
| header  | patient-education | 6     | Oral Health                                  | `https://www.ofc-albany.com/articles/premium_education/category/47366` | nested link        |
| header  | patient-education | 7     | Oral Hygiene                                 | `https://www.ofc-albany.com/articles/premium_education/category/47367` | nested link        |
| header  | patient-education | 8     | Oral Surgery                                 | `https://www.ofc-albany.com/articles/premium_education/category/47368` | nested link        |
| header  | patient-education | 9     | Orthodontics                                 | `https://www.ofc-albany.com/articles/premium_education/category/47369` | nested link        |
| header  | patient-education | 10    | Pediatric Dentistry                          | `https://www.ofc-albany.com/articles/premium_education/category/47370` | nested link        |
| header  | patient-education | 11    | Periodontal Therapy                          | `https://www.ofc-albany.com/articles/premium_education/category/47371` | nested link        |
| header  | patient-education | 12    | Technology                                   | `https://www.ofc-albany.com/articles/premium_education/category/47372` | nested link        |
| footer  | social            | 1     | Facebook                                     | `https://www.facebook.com/Anderson-Optometry-363713737059041/`         | icon link          |
| footer  | social            | 2     | Twitter                                      | `https://twitter.com/InternetMatrix`                                   | icon link          |
| footer  | social            | 3     | Youtube                                      | `https://www.youtube.com/user/webmarketingimatrix`                     | icon link          |
| footer  | legal             | 1     | Copyright © 2026 MH Sub I, LLC dba Officite | `//www.henryscheinone.com/products/officite`                           | direct link        |
| footer  | legal             | 2     | Admin Log In                                 | `https://secure.officite.com`                                          | direct link        |
| footer  | legal             | 3     | Site Map                                     | `https://www.ofc-albany.com/sitemap`                                   | direct link        |

## Implementation Checklist

- `Hs1AlbanyOfficeHeaderSection.tsx`: desktop/mobile header, desktop dropdown parity, phone from stream document
- `Hs1AlbanyOfficeHeroSection.tsx`: breadcrumb and title gold band
- `Hs1AlbanyOfficeContentSection.tsx`: long office content, stream address/phone, office photo, financing image, inline CTAs, `HoursTable` list
- `Hs1AlbanyOfficeHoursSection.tsx`: horizontal schedule grid from resolved hours data
- `Hs1AlbanyOfficeLocationSection.tsx`: left location card plus embedded map
- `Hs1AlbanyOfficeContactFormSection.tsx`: visual-only form shell matching source spacing and CTA
- `Hs1AlbanyOfficeFooterSection.tsx`: footer logo, social icons, legal links
- `starter/src/ve.config.tsx`: import/register new components and category entries
- `starter/src/registry/hs1-albany-office/defaultLayout.json`: generate in top-to-bottom section order
