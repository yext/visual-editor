# hs1-albany-services plan

## Page metadata

- URL: `https://www.ofc-albany.com/dental-services`
- Final URL: `https://www.ofc-albany.com/dental-services`
- Title: `Downers Grove, IL Dentist`
- Captured at: `2026-04-14T16:34:44.390Z`
- Capture mode: headed manual recovery after bot challenge

## Ordered section list

1. Header
2. Breadcrumbs band
3. Title band
4. Services content
5. Hours of operation
6. Location
7. Contact form
8. Footer
9. Copyright

## Layout signatures

### 1. Header

- Shell wrapper: full-bleed white, contained content, centered, `pt 10-20px`, `pb 10-20px`
- Immediate content wrapper: max width about `1170px`, three-column flex row
- Layout model: desktop flex row, logo left, nav center, phone right
- Direct children:
  - logo block about `330px` wide with remote logo image and two-line wordmark
  - nav list centered with even horizontal spacing and one dropdown band for `More`
  - phone block right-aligned, prominent gold type
- Text blocks:
  - logo text uses Montserrat-style sans fallback, uppercase, dark gray
  - nav text uses Nunito Sans-style sans fallback, medium gray, gold hover
  - phone uses serif/sans hybrid in capture; preserve with Montserrat-style fallback and gold color
- Media blocks: logo image fixed-height, contained, no radius

### 2. Breadcrumbs band

- Shell wrapper: full-bleed `#e5c989`, contained content
- Immediate content wrapper: max width about `1110-1170px`, `py 16px`
- Layout model: single row
- Direct children: inline breadcrumb trail, left aligned
- Text blocks: `13px`, white, subtle weight, slash separator ownership on parent row

### 3. Title band

- Shell wrapper: full-bleed `#e5c989`, contained content
- Immediate content wrapper: max width about `1110-1170px`, `pt 6px`, `pb 18px`
- Layout model: single row
- Direct children: one `h1`
- Text blocks: Montserrat fallback, uppercase, white, about `28px`, light weight, `1px` letter spacing

### 4. Services content

- Shell wrapper: full-bleed white
- Immediate content wrapper: max width about `1110px`, `pt 25px`, `pb 50px`
- Layout model: one constrained text column
- Direct children: intro paragraph, lead-in sentence, bulleted services list, emergency heading, emergency paragraph
- Text blocks:
  - body copy uses Nunito Sans fallback, `16-17px`, dark gray, roomy leading
  - section heading uses Playfair-style serif fallback, gold, about `22px`
- Media blocks: none

### 5. Hours of operation

- Shell wrapper: full-bleed `#e0e0e0`
- Immediate content wrapper: max width about `1170px`, `pt 50px`, `pb 50px`
- Layout model: stacked heading group over weekly schedule
- Direct children:
  - title/subtitle block left aligned
  - desktop schedule is a seven-column row with right borders
  - mobile schedule is a vertical list with day, separator, and right-aligned intervals
- Text blocks:
  - title Montserrat fallback, uppercase, dark gray, about `28px`
  - subtitle Montserrat fallback, gold, about `22px`, lighter weight
  - day/interval copy uses Nunito Sans fallback, black/dark gray
- Hours decisions:
  - render mode: custom rendering backed by `YextEntityField<HoursType>`
  - rationale: source desktop layout is seven horizontal day columns; stock `HoursTable` row layout cannot match without changing source structure
  - time format: `9:00 am - 5:00 pm`
  - day label format: full weekday names
  - status line: none
  - future day name: none
  - punctuation: hyphen with spaces
  - custom time logic: none
  - constrained row overrides: not applicable because custom render is required for parity

### 6. Location

- Shell wrapper: full-bleed white
- Immediate content wrapper: full-width shell with contained inner content at about `1170px`, `pt 50px`, `pb 50px`
- Layout model: desktop two-column layout, left info panel and large open right panel
- Direct children:
  - left column about `41-42%` width with title, subtitle, location label, address, contact info
  - right column blank map canvas area in capture, min height about `450px`
- Text blocks:
  - title Montserrat fallback, uppercase, dark gray, about `28px`
  - subtitle Montserrat fallback, gold, about `22px`
  - location label uses Playfair-style serif fallback, dark gray
  - address/contact copy uses Nunito Sans fallback, dark gray
- Media blocks: no visible map imagery in capture; preserve empty right-side volume

### 7. Contact form

- Shell wrapper: full-bleed `#e5c989`
- Immediate content wrapper: max width about `1110px`, generous `py 64-72px`
- Layout model: centered section heading above two-column form grid
- Direct children:
  - centered heading
  - left stack of three inputs
  - right textarea
  - disclaimer text
  - full-width submit button
- Text blocks:
  - title Montserrat fallback, uppercase, white, about `28px`
  - placeholder text medium gray, bold-ish
  - disclaimer white, centered, small
- Media blocks: none

### 8. Footer

- Shell wrapper: full-bleed white
- Immediate content wrapper: max width about `1110-1170px`, `pt 20px`, `pb 10px`
- Layout model: desktop flex row with logo left and social icons right
- Direct children:
  - logo image + single-line wordmark
  - three social icons in gold circles
- Text blocks: footer wordmark uses Montserrat fallback, dark gray
- Media blocks: logo image fixed-height, contained

### 9. Copyright

- Shell wrapper: full-bleed white
- Immediate content wrapper: max width about `1110-1170px`, `pb 24-32px`
- Layout model: centered inline link row
- Direct children: three inline links with blue separators
- Text blocks: uppercase Lato/Nunito fallback, about `13px`, gold text, centered

## Header/footer link parity table

| Section | Group/Band                | Index | Label                                        | Href                                                                   | Expand/Collapse | Trigger              |
| ------- | ------------------------- | ----- | -------------------------------------------- | ---------------------------------------------------------------------- | --------------- | -------------------- |
| header  | primary nav               | 1     | Home                                         | `https://www.ofc-albany.com`                                           | none            | direct link          |
| header  | primary nav               | 2     | Staff                                        | `https://www.ofc-albany.com/staff`                                     | none            | direct link          |
| header  | primary nav               | 3     | Office                                       | `https://www.ofc-albany.com/our-locations`                             | none            | direct link          |
| header  | primary nav               | 4     | Services                                     | `https://www.ofc-albany.com/dental-services`                           | none            | direct link          |
| header  | primary nav               | 5     | New Patients                                 | `https://www.ofc-albany.com/new-patients`                              | none            | direct link          |
| header  | primary nav               | 6     | More                                         | `#`                                                                    | expands         | hover/click dropdown |
| header  | more dropdown             | 1     | Contact Us                                   | `https://www.ofc-albany.com/contact`                                   | none            | direct link          |
| header  | more dropdown             | 2     | Appointment Request                          | `https://www.ofc-albany.com/appointment`                               | none            | direct link          |
| header  | more dropdown             | 3     | Testimonials                                 | `https://www.ofc-albany.com/testimonials`                              | none            | direct link          |
| header  | more dropdown             | 4     | Smile Gallery                                | `https://www.ofc-albany.com/gallery`                                   | none            | direct link          |
| header  | more dropdown             | 5     | Blog                                         | `https://www.ofc-albany.com/blog`                                      | none            | direct link          |
| header  | more dropdown             | 6     | Patient Education                            | `https://www.ofc-albany.com/articles/premium_education`                | expands         | hover/click submenu  |
| header  | patient education submenu | 1     | Cosmetic & General Dentistry                 | `https://www.ofc-albany.com/articles/premium_education/category/47361` | none            | direct link          |
| header  | patient education submenu | 2     | Emergency Care                               | `https://www.ofc-albany.com/articles/premium_education/category/47362` | none            | direct link          |
| header  | patient education submenu | 3     | Endodontics                                  | `https://www.ofc-albany.com/articles/premium_education/category/47363` | none            | direct link          |
| header  | patient education submenu | 4     | Implant Dentistry                            | `https://www.ofc-albany.com/articles/premium_education/category/47364` | none            | direct link          |
| header  | patient education submenu | 5     | Oral Health                                  | `https://www.ofc-albany.com/articles/premium_education/category/47365` | none            | direct link          |
| header  | patient education submenu | 6     | Oral Hygiene                                 | `https://www.ofc-albany.com/articles/premium_education/category/47366` | none            | direct link          |
| header  | patient education submenu | 7     | Oral Surgery                                 | `https://www.ofc-albany.com/articles/premium_education/category/47367` | none            | direct link          |
| header  | patient education submenu | 8     | Orthodontics                                 | `https://www.ofc-albany.com/articles/premium_education/category/47368` | none            | direct link          |
| header  | patient education submenu | 9     | Pediatric Dentistry                          | `https://www.ofc-albany.com/articles/premium_education/category/47369` | none            | direct link          |
| header  | patient education submenu | 10    | Periodontal Health                           | `https://www.ofc-albany.com/articles/premium_education/category/47370` | none            | direct link          |
| header  | patient education submenu | 11    | Restorative Dentistry                        | `https://www.ofc-albany.com/articles/premium_education/category/47371` | none            | direct link          |
| header  | patient education submenu | 12    | TMD                                          | `https://www.ofc-albany.com/articles/premium_education/category/47372` | none            | direct link          |
| footer  | social icons              | 1     | Facebook                                     | `https://www.facebook.com/Anderson-Optometry-363713737059041/`         | none            | direct link          |
| footer  | social icons              | 2     | Twitter                                      | `https://twitter.com/InternetMatrix`                                   | none            | direct link          |
| footer  | social icons              | 3     | Youtube                                      | `https://www.youtube.com/user/webmarketingimatrix`                     | none            | direct link          |
| footer  | copyright                 | 1     | Copyright © 2026 MH Sub I, LLC dba Officite | `//www.henryscheinone.com/products/officite`                           | none            | direct link          |
| footer  | copyright                 | 2     | Admin Log In                                 | `https://secure.officite.com`                                          | none            | direct link          |
| footer  | copyright                 | 3     | Site Map                                     | `https://www.ofc-albany.com/sitemap`                                   | none            | direct link          |

## Implementation checklist

- [x] `Hs1AlbanyServicesHeaderSection.tsx`
- [x] `Hs1AlbanyServicesBreadcrumbsSection.tsx`
- [x] `Hs1AlbanyServicesTitleSection.tsx`
- [x] `Hs1AlbanyServicesContentSection.tsx`
- [x] `Hs1AlbanyServicesHoursSection.tsx`
- [x] `Hs1AlbanyServicesLocationSection.tsx`
- [x] `Hs1AlbanyServicesContactFormSection.tsx`
- [x] `Hs1AlbanyServicesFooterSection.tsx`
- [x] `Hs1AlbanyServicesCopyrightSection.tsx`
- [x] register new sections in `starter/src/ve.config.tsx`
- [x] run `generate-default-layout-data` in top-to-bottom order
- [x] run `pnpm run typecheck` in `starter`
