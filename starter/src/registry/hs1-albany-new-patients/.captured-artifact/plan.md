# hs1-albany-new-patients Plan

## Page Metadata

- Requested URL: `https://www.ofc-albany.com/new-patients`
- Final URL: `https://www.ofc-albany.com/new-patients`
- Captured title: `Downers Grove, IL Dentist`
- Captured at: `2026-04-14T16:41:32.118Z`
- Capture mode: headed manual capture after anti-bot block
- Notes:
  - The page content is clearly the New Patients page even though the `<title>` metadata is generic.
  - User request paths conflict (`hs1-new-patients` and `hs1-albany-home/defaultLayout.json`), so implementation will follow the skill contract and current template slug `hs1-albany-new-patients`.

## Ordered Section List

1. Header
2. Breadcrumbs
3. Title band
4. Main content
5. Hours
6. Location / map
7. Contact form
8. Footer
9. Copyright

## Layout Signatures

### 1. Header

- Source evidence:
  - HTML: first visible desktop header at `#id_5a3a8676-1666-5f40-9fd1-779732c80e51`
  - Hidden sticky duplicate at `#id_e9d9e4eb-d852-5859-92af-293e6d451244`
  - CSS: `.logo-a__img { max-width: 130px; }`, `.navigation__list--head { display:flex; flex-wrap:wrap; }`, `.navigation__item--link { ... font-size:.9375rem ... }`, `.phone__number { font-family: montserrat,sans-serif; font-size:1.75rem; font-weight:500; }`
  - Inline section padding:
    - primary header: col 1 `10px/10px`, col 2 `20px/20px`, col 3 `20px/20px`
    - sticky header duplicate: `20px/20px` desktop pads
- Shell wrapper:
  - full-bleed white section
  - contained content, max-width `1170px`
  - horizontal centering via container
  - no extra section edge padding beyond container `15px`
- Immediate content wrapper:
  - one row, desktop 3-column layout
  - columns behave as `2 / 7 / 3` on large screens
- Layout model:
  - desktop: grid/flex equivalent of logo, nav, phone
  - mobile: compact top bar with hamburger, brand text, phone icon, plus slide-over drawer
  - sticky variant should reuse same links/logo/phone and appear after scroll
- Direct children:
  - logo left, navigation center/right, phone right
  - desktop phone aligned to the right edge
- Text blocks:
  - navigation uses Lato fallback stack with uppercase labels
  - phone uses Montserrat, red accent, large size
- Media blocks:
  - logo image constrained to about `130px` max width

### 2. Breadcrumbs

- Source evidence:
  - HTML: `#breadcrumbs > .breadcrumb__list`
  - CSS: `.breadcrumb__list { color:#666; margin:1rem 0; padding:0; }`, `.breadcrumb__item { font-size:.8125rem; color:#fff; }`
- Shell wrapper:
  - full-bleed dark band
  - contained max-width `1170px`
  - compact vertical padding
- Immediate content wrapper:
  - single inline breadcrumb row
- Layout model:
  - inline flex/list, no wrap needed
- Direct children:
  - `Home` link, hidden `>` separator in source CSS, current page label
- Text blocks:
  - small text (`~13px`), white on dark

### 3. Title Band

- Source evidence:
  - HTML: `#id_7d1038ba-dab5-56c4-aa55-4ecdc72bd839`
  - CSS: `.section-editable h1 { ... font-size:1.75rem; line-height:2.125rem; text-transform:uppercase; }`
- Shell wrapper:
  - full-bleed dark band
  - contained max-width `1170px`
  - centered title treatment
- Immediate content wrapper:
  - single-column heading block
- Layout model:
  - block with centered headline
- Text blocks:
  - Montserrat, uppercase, white, normal weight, letter-spacing `1px`

### 4. Main Content

- Source evidence:
  - HTML: `#id_098937af-fd88-5c44-b5f0-15f971ecbe6c`
  - CSS: inline desktop padding top `25px`, bottom `50px`
  - CSS: `.section-pagecontent h2,.section-pagecontent h3 { font-family: montserrat,sans-serif; font-size:1.375rem; font-weight:400; line-height:1.75rem; }`
  - CSS: `.section--light .editable__container a { color:#d3a335; }`
- Shell wrapper:
  - full-bleed white section
  - contained max-width `1170px`
  - desktop padding top `25px`, bottom `50px`
- Immediate content wrapper:
  - single centered column with prose flow
  - no card border/radius
- Layout model:
  - block stack with parent-owned vertical spacing
- Direct children:
  - intro heading and paragraph
  - mission heading and paragraph
  - commitments heading plus bullet list
  - patient forms heading, bullet list, paragraph with Adobe download link and image
  - horizontal rule
  - final heading and paragraph
- Text blocks:
  - heading font family Montserrat
  - body copy dark neutral with comfortable line height
  - links gold
- Media blocks:
  - small Adobe badge inline within the paragraph

### 5. Hours

- Source evidence:
  - HTML: `#id_77cf7866-f48d-5b20-81ac-70dbcdf0d45d`
  - CSS: `.hours-a__schedule--wrapper { margin-top:1.875rem; }`
  - CSS: `.hours-a__schedule--border { border-right:2px solid #ccc; }`
  - CSS: `.hours__day { padding-left:15px; padding-right:15px; display:flex!important; align-items:center!important; }`
  - CSS: `.hours__hours { padding-left:15px; padding-right:15px; display:flex!important; flex-direction:column!important; align-items:center!important; justify-content:center; }`
- Shell wrapper:
  - full-bleed light gray section (`section__bg--light-2`)
  - contained max-width `1170px`
  - medium vertical spacing
- Immediate content wrapper:
  - title and subtitle above schedule
  - desktop seven-column schedule
  - mobile stacked rows
- Layout model:
  - desktop: equal 7-column grid with right borders
  - mobile: 3-cell row layout (`day / separator gap / hours`)
- Direct children:
  - title `Hours of Operation`
  - subtitle `Summer Hours`
  - weekday schedule Monday through Sunday
- Text blocks:
  - title/subtitle inherit site title styles
  - day labels bold
- Hours decisions:
  - render mode: custom schedule rendering
  - reason: desktop source is a seven-column band, not a stock vertical weekday table
  - source has no live status line
  - time format: lowercase `9:00 am - 5:00 pm`
  - day labels: full weekday names
  - no future day name/status separator logic needed
  - no `HoursTable` because the source structure is non-stock on desktop and parity would regress

### 6. Location / Map

- Source evidence:
  - HTML: `#id_b764e4aa-aef7-59b9-81ab-bfdac74a6732`
  - CSS: `.map-a { min-height:450px; margin:auto -15px; position:relative; overflow:hidden; }`
  - CSS: `.map__container { margin:0 auto; padding-top:3.125rem; padding-bottom:3.125rem; max-width:1170px; }`
  - CSS: `.map-search { margin-top:1.875rem; padding:0 15px; }`
  - CSS: `.map-a .map-search__location-distance { padding:24px 0 0; font-family: montserrat,sans-serif; font-weight:700; }`
- Shell wrapper:
  - full-bleed white section
  - content wrapper itself is full-width because source uses `container-fluid`
- Immediate content wrapper:
  - two-column row at desktop
  - left info column about `5/12`
  - right map display fills remaining width
- Layout model:
  - responsive 1 column on mobile, 2 columns on desktop
- Direct children:
  - title/caption
  - location info stack with distance, title, address, contact info
  - map panel
- Text blocks:
  - title/subtitle match site section title rules
  - location labels bold
- Media blocks:
  - map should visually fill a tall right column with no inner white seam

### 7. Contact Form

- Source evidence:
  - HTML: `#id_eb810fcb-dc81-59c6-a4a0-00c726b63d1e`
  - CSS: `.form { padding:3.125rem 0; }`
  - CSS: `.section.section-form .form .form__title { ... font-size:1.75rem; line-height:2.125rem; text-transform:uppercase; }`
  - CSS: `.leadFormInfo { color:#fff; text-align:center; margin-top:1.875rem; font-size:16px; }`
- Shell wrapper:
  - full-bleed dark band
  - contained max-width `1170px`
  - generous vertical padding (`50px`)
- Immediate content wrapper:
  - single centered form block
  - no outer card treatment
- Layout model:
  - stacked inputs
  - textarea below grouped inputs
  - note and submit button centered below
- Direct children:
  - title
  - name, email, phone inputs
  - notes textarea
  - PHI notice
  - submit button
- Text blocks:
  - title gold, uppercase
  - helper copy white

### 8. Footer

- Source evidence:
  - HTML: `#id_0dee376d-877b-57cb-9fb6-08b18ea4fffb`
  - CSS: footer column top padding `20px`
  - CSS: `.socialmedia__list { display:flex; flex-wrap:wrap; margin-bottom:0; padding:0; list-style:none; }`
  - CSS: `.socialmedia__item { padding:.1rem; }`
  - CSS: `.socialmedia__link { ... border-radius:25px; background:#dcb65f; width:1.6875rem; height:1.6875rem; font-size:1rem; }`
- Shell wrapper:
  - full-bleed white band
  - contained max-width `1170px`
  - compact top padding
- Immediate content wrapper:
  - desktop 8/4 split
  - logo/brand left, social icons right
- Layout model:
  - responsive stack on small screens
- Direct children:
  - footer logo image and wordmark
  - social icon row

### 9. Copyright

- Source evidence:
  - HTML: `#id_8fe7eebd-2d97-5f1e-b5e8-2ecfc6035e5d`
- Shell wrapper:
  - full-bleed white band contiguous with footer
  - contained max-width `1170px`
- Immediate content wrapper:
  - single centered list of copyright links
- Layout model:
  - stacked on mobile, inline on desktop
- Direct children:
  - Officite copyright link
  - Admin Log In
  - Site Map

## Header / Footer Link Parity Table

| Section | Group/Band                       | Index | Label                                        | Href                                                                   | Behavior                         |
| ------- | -------------------------------- | ----- | -------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| header  | desktop primary nav              | 1     | Home                                         | `https://www.ofc-albany.com`                                           | direct link                      |
| header  | desktop primary nav              | 2     | Staff                                        | `https://www.ofc-albany.com/staff`                                     | direct link                      |
| header  | desktop primary nav              | 3     | Office                                       | `https://www.ofc-albany.com/our-locations`                             | direct link                      |
| header  | desktop primary nav              | 4     | Services                                     | `https://www.ofc-albany.com/dental-services`                           | direct link                      |
| header  | desktop primary nav              | 5     | New Patients                                 | `https://www.ofc-albany.com/new-patients`                              | direct link                      |
| header  | desktop primary nav              | 6     | More                                         | `#`                                                                    | hover/click dropdown trigger     |
| header  | desktop more dropdown            | 1     | Contact Us                                   | `https://www.ofc-albany.com/contact`                                   | direct link                      |
| header  | desktop more dropdown            | 2     | Appointment Request                          | `https://www.ofc-albany.com/appointment`                               | direct link                      |
| header  | desktop more dropdown            | 3     | Testimonials                                 | `https://www.ofc-albany.com/testimonials`                              | direct link                      |
| header  | desktop more dropdown            | 4     | Smile Gallery                                | `https://www.ofc-albany.com/gallery`                                   | direct link                      |
| header  | desktop more dropdown            | 5     | Blog                                         | `https://www.ofc-albany.com/blog`                                      | direct link                      |
| header  | desktop more dropdown            | 6     | Patient Education                            | `https://www.ofc-albany.com/articles/premium_education`                | nested dropdown trigger and link |
| header  | patient education submenu        | 1     | Educational Videos                           | `https://www.ofc-albany.com/articles/premium_education/category/47361` | direct link                      |
| header  | patient education submenu        | 2     | Cosmetic & General Dentistry                 | `https://www.ofc-albany.com/articles/premium_education/category/47362` | direct link                      |
| header  | patient education submenu        | 3     | Emergency Care                               | `https://www.ofc-albany.com/articles/premium_education/category/47363` | direct link                      |
| header  | patient education submenu        | 4     | Endodontics                                  | `https://www.ofc-albany.com/articles/premium_education/category/47364` | direct link                      |
| header  | patient education submenu        | 5     | Implant Dentistry                            | `https://www.ofc-albany.com/articles/premium_education/category/47365` | direct link                      |
| header  | patient education submenu        | 6     | Oral Health                                  | `https://www.ofc-albany.com/articles/premium_education/category/47366` | direct link                      |
| header  | patient education submenu        | 7     | Oral Hygiene                                 | `https://www.ofc-albany.com/articles/premium_education/category/47367` | direct link                      |
| header  | patient education submenu        | 8     | Oral Surgery                                 | `https://www.ofc-albany.com/articles/premium_education/category/47368` | direct link                      |
| header  | patient education submenu        | 9     | Orthodontics                                 | `https://www.ofc-albany.com/articles/premium_education/category/47369` | direct link                      |
| header  | patient education submenu        | 10    | Pediatric Dentistry                          | `https://www.ofc-albany.com/articles/premium_education/category/47370` | direct link                      |
| header  | patient education submenu        | 11    | Periodontal Therapy                          | `https://www.ofc-albany.com/articles/premium_education/category/47371` | direct link                      |
| header  | patient education submenu        | 12    | Technology                                   | `https://www.ofc-albany.com/articles/premium_education/category/47372` | direct link                      |
| header  | mobile drawer                    | 1     | Home                                         | `https://www.ofc-albany.com`                                           | direct link                      |
| header  | mobile drawer                    | 2     | Staff                                        | `https://www.ofc-albany.com/staff`                                     | direct link                      |
| header  | mobile drawer                    | 3     | Office                                       | `https://www.ofc-albany.com/our-locations`                             | direct link                      |
| header  | mobile drawer                    | 4     | Services                                     | `https://www.ofc-albany.com/dental-services`                           | direct link                      |
| header  | mobile drawer                    | 5     | New Patients                                 | `https://www.ofc-albany.com/new-patients`                              | direct link                      |
| header  | mobile drawer                    | 6     | Contact Us                                   | `https://www.ofc-albany.com/contact`                                   | direct link                      |
| header  | mobile drawer                    | 7     | Appointment Request                          | `https://www.ofc-albany.com/appointment`                               | direct link                      |
| header  | mobile drawer                    | 8     | Testimonials                                 | `https://www.ofc-albany.com/testimonials`                              | direct link                      |
| header  | mobile drawer                    | 9     | Smile Gallery                                | `https://www.ofc-albany.com/gallery`                                   | direct link                      |
| header  | mobile drawer                    | 10    | Blog                                         | `https://www.ofc-albany.com/blog`                                      | direct link                      |
| header  | mobile drawer                    | 11    | Patient Education                            | `https://www.ofc-albany.com/articles/premium_education`                | expandable group header          |
| header  | mobile patient education submenu | 1     | Educational Videos                           | `https://www.ofc-albany.com/articles/premium_education/category/47361` | direct link                      |
| header  | mobile patient education submenu | 2     | Cosmetic & General Dentistry                 | `https://www.ofc-albany.com/articles/premium_education/category/47362` | direct link                      |
| header  | mobile patient education submenu | 3     | Emergency Care                               | `https://www.ofc-albany.com/articles/premium_education/category/47363` | direct link                      |
| header  | mobile patient education submenu | 4     | Endodontics                                  | `https://www.ofc-albany.com/articles/premium_education/category/47364` | direct link                      |
| header  | mobile patient education submenu | 5     | Implant Dentistry                            | `https://www.ofc-albany.com/articles/premium_education/category/47365` | direct link                      |
| header  | mobile patient education submenu | 6     | Oral Health                                  | `https://www.ofc-albany.com/articles/premium_education/category/47366` | direct link                      |
| header  | mobile patient education submenu | 7     | Oral Hygiene                                 | `https://www.ofc-albany.com/articles/premium_education/category/47367` | direct link                      |
| header  | mobile patient education submenu | 8     | Oral Surgery                                 | `https://www.ofc-albany.com/articles/premium_education/category/47368` | direct link                      |
| header  | mobile patient education submenu | 9     | Orthodontics                                 | `https://www.ofc-albany.com/articles/premium_education/category/47369` | direct link                      |
| header  | mobile patient education submenu | 10    | Pediatric Dentistry                          | `https://www.ofc-albany.com/articles/premium_education/category/47370` | direct link                      |
| header  | mobile patient education submenu | 11    | Periodontal Therapy                          | `https://www.ofc-albany.com/articles/premium_education/category/47371` | direct link                      |
| header  | mobile patient education submenu | 12    | Technology                                   | `https://www.ofc-albany.com/articles/premium_education/category/47372` | direct link                      |
| footer  | social icons                     | 1     | Facebook                                     | `https://www.facebook.com/Anderson-Optometry-363713737059041/`         | external link                    |
| footer  | social icons                     | 2     | Twitter                                      | `https://twitter.com/InternetMatrix`                                   | external link                    |
| footer  | social icons                     | 3     | Youtube                                      | `https://www.youtube.com/user/webmarketingimatrix`                     | external link                    |
| footer  | copyright links                  | 1     | Copyright © 2026 MH Sub I, LLC dba Officite | `//www.henryscheinone.com/products/officite`                           | external link                    |
| footer  | copyright links                  | 2     | Admin Log In                                 | `https://secure.officite.com`                                          | external link                    |
| footer  | copyright links                  | 3     | Site Map                                     | `https://www.ofc-albany.com/sitemap`                                   | direct link                      |

## Implementation Checklist

- `Hs1AlbanyNewPatientsHeaderSection.tsx`
  - combine visible header, sticky-on-scroll header, and mobile drawer behavior
  - use nested array fields for desktop/mobile nav parity
- `Hs1AlbanyNewPatientsBreadcrumbsSection.tsx`
  - render breadcrumb row with exact two-item structure
- `Hs1AlbanyNewPatientsTitleSection.tsx`
  - render dark title band only
- `Hs1AlbanyNewPatientsContentSection.tsx`
  - preserve all headings, bullets, links, divider, and Adobe badge
- `Hs1AlbanyNewPatientsHoursSection.tsx`
  - custom hours render from resolved `YextEntityField<HoursType>`
- `Hs1AlbanyNewPatientsLocationSection.tsx`
  - two-column location panel with document-backed address/phone and embedded map
- `Hs1AlbanyNewPatientsContactFormSection.tsx`
  - rebuild visual form shell with placeholders, helper note, and submit control
- `Hs1AlbanyNewPatientsFooterSection.tsx`
  - footer logo plus social icons
- `Hs1AlbanyNewPatientsCopyrightSection.tsx`
  - final legal/admin/sitemap links
