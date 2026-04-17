## Page Metadata

- Template slug: `hs1-albany-staff`
- Requested URL: `https://www.ofc-albany.com/staff`
- Captured URL: `https://www.ofc-albany.com/staff`
- Captured title: `Downers Grove, IL Dentist`
- Captured at: `2026-04-14T16:25:16.352Z`
- Capture mode: `headed` with manual continuation after bot check
- Implementation note: the repo has no `starter/src/registry/hs1-albany-home`, so generation is scoped to `starter/src/registry/hs1-albany-staff`

## Ordered Sections

1. `Hs1AlbanyStaffHeaderSection`
2. `Hs1AlbanyStaffBreadcrumbsSection`
3. `Hs1AlbanyStaffTitleSection`
4. `Hs1AlbanyStaffRosterSection`
5. `Hs1AlbanyStaffHoursSection`
6. `Hs1AlbanyStaffLocationSection`
7. `Hs1AlbanyStaffContactFormSection`
8. `Hs1AlbanyStaffFooterSection`
9. `Hs1AlbanyStaffCopyrightSection`

## Layout Signatures

### 1. Header

- Source selectors: `#id_5a3a8676-1666-5f40-9fd1-779732c80e51`, `.logo-a__title`, `.navigation__item--link`, `.phone__number`
- Shell wrapper:
  - full-bleed white band via section `::before`
  - max-width: `1140px` row inside centered container
  - padding: logo column `10px 0`, nav/phone columns `20px 0`
- Immediate content wrapper:
  - 3-column row
  - widths: logo `~16.7%`, nav `~58.3%`, phone `~25%`
- Layout model:
  - flex/grid-equivalent row on desktop
  - centered vertically
  - nav items horizontal with nested dropdown content under `More`
- Direct children:
  - logo left, nav center-right, phone right
  - phone aligned to right edge
- Text blocks:
  - logo title: Montserrat fallback, `28px`, `400`, `1px` tracking, uppercase, `#4a4a4a`
  - nav links: Nunito Sans fallback, `15px`, `700`, `#4a4a4a`
  - phone: Montserrat fallback, `28px`, `500`, `#d3a335`
- Media blocks:
  - logo image left of stacked wordmark, contained, no crop
- Behavior:
  - responsive mobile header needs hamburger/open-close state
  - `More` submenu visible on desktop hover/focus and mobile expand/collapse
  - nested `Patient Education` submenu required

### 2. Breadcrumbs

- Source selectors: `#id_ce7d7f8b-9d97-57cb-a489-596f98b9c07c`, `.breadcrumb__list`
- Shell wrapper:
  - full-bleed gold band via section `::before`, `rgb(229, 201, 137)`
  - contained content width `1110px`
  - vertical padding visually `~18px`
- Immediate content wrapper:
  - single inline row
- Layout model:
  - left-aligned inline breadcrumb text
- Direct children:
  - `Home`, separator `>`, current page `Staff`
- Text blocks:
  - system/Bootstrap fallback, `13px`, white
- Media blocks:
  - none

### 3. Page Title

- Source selectors: `#id_7d1038ba-dab5-56c4-aa55-4ecdc72bd839`, `h1`
- Shell wrapper:
  - full-bleed gold band via section `::before`, same `rgb(229, 201, 137)`
  - contained content width `1110px`
  - bottom padding owned by heading (`20px`)
- Immediate content wrapper:
  - single-column heading row
- Layout model:
  - left-aligned block
- Direct children:
  - one `h1`
- Text blocks:
  - Montserrat fallback, `28px`, `400`, `1px` tracking, uppercase, white
- Media blocks:
  - none

### 4. Staff Roster

- Source selectors: `#id_098937af-fd88-5c44-b5f0-15f971ecbe6c`, `.wrap__staff`, `.staff-member`, `.staff-member__name`, `.staff-member__position`
- Shell wrapper:
  - full-bleed white band
  - contained content width `1110px`
  - section column padding `25px` top / `50px` bottom
- Immediate content wrapper:
  - intro paragraph block, then stacked list of staff cards
- Layout model:
  - desktop card: 2 columns, image left `~30%`, text right `~70%`
  - mobile card: stacked image then text
  - second card text sits on very light gray panel
- Direct children:
  - intro copy
  - staff item 1
  - staff item 2
- Text blocks:
  - intro: Lato regular fallback, `16px`, `400`, `#4a4a4a`, `25.6px` line-height
  - name: Montserrat fallback, `28px`, `400`, uppercase, `#4a4a4a`
  - role: Montserrat fallback, `22px`, `300`, `1.5px` tracking, gold `#d3a335`
  - bio: Nunito Sans fallback, `16px`, `400`, `#4a4a4a`
- Media blocks:
  - portrait/landscape staff images, fixed left column, cover behavior
  - second card needs pale-gray text background block

### 5. Hours Of Operation

- Source selectors: `#id_77cf7866-f48d-5b20-81ac-70dbcdf0d45d`, `.hours-a__title`, `.hours-a__schedule--wrapper`
- Shell wrapper:
  - full-bleed light gray band via section `::before`, `rgb(224, 224, 224)`
  - contained content width `1110px`
  - inner section padding `50px 0`
- Immediate content wrapper:
  - title/subtitle stack followed by schedule block
- Layout model:
  - desktop: single row of 7 equal columns with vertical separators
  - mobile: stacked day/time rows
- Direct children:
  - title
  - subtitle
  - hours table
- Text blocks:
  - title: Montserrat fallback, `28px`, `400`, uppercase, `#4a4a4a`
  - subtitle: Montserrat fallback, `22px`, `300`, `1.5px` tracking, gold `#d3a335`
  - day labels: `16px`, `700`, black
  - interval text: `16px`, `400`, black
- Media blocks:
  - none
- Hours decisions:
  - render mode: `HoursTable`
  - time format: `9:00 am - 5:00 pm`
  - day labels: full names, no punctuation
  - no status line
  - no future day name
  - stock hours components only, no custom render-time time logic
  - required overrides: desktop root becomes 7-column flex row, `.HoursTable-row` width `14.285%`, row `min-w-0`, mobile rows become 2-column grid, intervals centered on desktop and right-aligned on mobile, `whitespace-nowrap`, `.is-today` set back to normal weight

### 6. Location

- Source selectors: `#id_b764e4aa-aef7-59b9-81ab-bfdac74a6732`, `.map__col`, `.map__title`, `.map__caption`
- Shell wrapper:
  - full-bleed white band
  - outer content is effectively full width
  - card row centered inside `1110px` max width with `57px` top/bottom breathing room
- Immediate content wrapper:
  - left white info card over blank right map canvas
- Layout model:
  - desktop: 2 columns, info card `475px` wide, blank map pane fills remainder
  - mobile: stack card above map pane
- Direct children:
  - left info card
  - right map display area
- Text blocks:
  - title/subtitle match hours styling
  - location label: Montserrat fallback, `22px`, `500`, `#4a4a4a`
  - body/address: Nunito Sans fallback, `16px`, `400`, `#4a4a4a`
- Media blocks:
  - captured artifact shows blank white map canvas, not a rendered map image
  - preserve blank pane rather than inventing an interactive map treatment
- Data decisions:
  - use stream document for address and phone
  - keep location copy labels editable via text fields

### 7. Contact Form

- Source selectors: `#id_eb810fcb-dc81-59c6-a4a0-00c726b63d1e`, `.form__title`, `.form__control`, `.leadFormInfo`, `.submit`
- Shell wrapper:
  - full-bleed gold band via section `::before`, `rgb(229, 201, 137)`
  - contained content width `1110px`
  - inner padding `50px 0`
- Immediate content wrapper:
  - centered title
  - 2-column form body: left stacked inputs, right textarea
  - disclaimer line
  - full-width submit button
- Layout model:
  - desktop grid `~48% / ~48%`
  - mobile single column
- Direct children:
  - title
  - name/email/phone input stack
  - notes textarea
  - disclaimer
  - submit CTA
- Text blocks:
  - title: Montserrat fallback, `28px`, `400`, uppercase, white
  - placeholders: bold Lato fallback, `18px`, mid gray
  - disclaimer: `14px`, white, centered
  - submit label: Nunito Sans fallback, `15px`, `700`, uppercase, white
- Media blocks:
  - none

### 8. Footer

- Source selectors: `#id_0dee376d-877b-57cb-9fb6-08b18ea4fffb`, `.logo_footer`, `.socialmedia__link`
- Shell wrapper:
  - full-bleed white band
  - centered `1140px` row
  - top padding `20px`
  - light divider line below
- Immediate content wrapper:
  - two-column row, logo left and social icons right
- Layout model:
  - desktop horizontal split `8/4`
  - mobile stacked
- Direct children:
  - footer logo group
  - social icon list
- Text blocks:
  - wordmark title matches header/footer Montserrat style
- Media blocks:
  - footer logo image fixed `120x78`
  - social buttons gold circles `32x32`

### 9. Copyright

- Source selectors: `#id_8fe7eebd-2d97-5f1e-b5e8-2ecfc6035e5d`, `.copyright__list`, `.copyright__link`
- Shell wrapper:
  - full-bleed white band
  - centered single row
  - height `64px`
- Immediate content wrapper:
  - inline list centered
- Layout model:
  - horizontal list with thin separators
  - mobile wrap allowed
- Direct children:
  - copyright link
  - admin log in link
  - site map link
- Text blocks:
  - Lato regular fallback, `13px`, `700`, uppercase, gold `#d3a335`
- Media blocks:
  - none

## Header And Footer Parity Table

| Section | Group/Band                | Index | Label                                        | Href                                                                   | Expand/Collapse | Trigger           |
| ------- | ------------------------- | ----- | -------------------------------------------- | ---------------------------------------------------------------------- | --------------- | ----------------- |
| Header  | Primary nav               | 1     | Home                                         | `https://www.ofc-albany.com`                                           | none            | click             |
| Header  | Primary nav               | 2     | Staff                                        | `https://www.ofc-albany.com/staff`                                     | none            | click             |
| Header  | Primary nav               | 3     | Office                                       | `https://www.ofc-albany.com/our-locations`                             | none            | click             |
| Header  | Primary nav               | 4     | Services                                     | `https://www.ofc-albany.com/dental-services`                           | none            | click             |
| Header  | Primary nav               | 5     | New Patients                                 | `https://www.ofc-albany.com/new-patients`                              | none            | click             |
| Header  | Primary nav               | 6     | More                                         | `#`                                                                    | expands submenu | hover/focus/click |
| Header  | More submenu              | 1     | Contact Us                                   | `https://www.ofc-albany.com/contact`                                   | none            | click             |
| Header  | More submenu              | 2     | Appointment Request                          | `https://www.ofc-albany.com/appointment`                               | none            | click             |
| Header  | More submenu              | 3     | Testimonials                                 | `https://www.ofc-albany.com/testimonials`                              | none            | click             |
| Header  | More submenu              | 4     | Smile Gallery                                | `https://www.ofc-albany.com/gallery`                                   | none            | click             |
| Header  | More submenu              | 5     | Blog                                         | `https://www.ofc-albany.com/blog`                                      | none            | click             |
| Header  | More submenu              | 6     | Patient Education                            | `https://www.ofc-albany.com/articles/premium_education`                | expands submenu | hover/focus/click |
| Header  | Patient Education submenu | 1     | Educational Videos                           | `https://www.ofc-albany.com/articles/premium_education/category/47361` | none            | click             |
| Header  | Patient Education submenu | 2     | Cosmetic & General Dentistry                 | `https://www.ofc-albany.com/articles/premium_education/category/47362` | none            | click             |
| Header  | Patient Education submenu | 3     | Emergency Care                               | `https://www.ofc-albany.com/articles/premium_education/category/47363` | none            | click             |
| Header  | Patient Education submenu | 4     | Endodontics                                  | `https://www.ofc-albany.com/articles/premium_education/category/47364` | none            | click             |
| Header  | Patient Education submenu | 5     | Implant Dentistry                            | `https://www.ofc-albany.com/articles/premium_education/category/47365` | none            | click             |
| Header  | Patient Education submenu | 6     | Oral Health                                  | `https://www.ofc-albany.com/articles/premium_education/category/47366` | none            | click             |
| Header  | Patient Education submenu | 7     | Oral Hygiene                                 | `https://www.ofc-albany.com/articles/premium_education/category/47367` | none            | click             |
| Header  | Patient Education submenu | 8     | Oral Surgery                                 | `https://www.ofc-albany.com/articles/premium_education/category/47368` | none            | click             |
| Header  | Patient Education submenu | 9     | Orthodontics                                 | `https://www.ofc-albany.com/articles/premium_education/category/47369` | none            | click             |
| Header  | Patient Education submenu | 10    | Pediatric Dentistry                          | `https://www.ofc-albany.com/articles/premium_education/category/47370` | none            | click             |
| Header  | Patient Education submenu | 11    | Periodontal Therapy                          | `https://www.ofc-albany.com/articles/premium_education/category/47371` | none            | click             |
| Header  | Patient Education submenu | 12    | Technology                                   | `https://www.ofc-albany.com/articles/premium_education/category/47372` | none            | click             |
| Footer  | Social icons              | 1     | Facebook                                     | `https://www.facebook.com/Anderson-Optometry-363713737059041/`         | none            | click             |
| Footer  | Social icons              | 2     | Twitter                                      | `https://twitter.com/InternetMatrix`                                   | none            | click             |
| Footer  | Social icons              | 3     | Youtube                                      | `https://www.youtube.com/user/webmarketingimatrix`                     | none            | click             |
| Footer  | Copyright links           | 1     | Copyright © 2026 MH Sub I, LLC dba Officite | `//www.henryscheinone.com/products/officite`                           | none            | click             |
| Footer  | Copyright links           | 2     | Admin Log In                                 | `https://secure.officite.com`                                          | none            | click             |
| Footer  | Copyright links           | 3     | Site Map                                     | `https://www.ofc-albany.com/sitemap`                                   | none            | click             |

## Implementation Checklist

- `Hs1AlbanyStaffHeaderSection` -> `components/Hs1AlbanyStaffHeaderSection.tsx`
- `Hs1AlbanyStaffBreadcrumbsSection` -> `components/Hs1AlbanyStaffBreadcrumbsSection.tsx`
- `Hs1AlbanyStaffTitleSection` -> `components/Hs1AlbanyStaffTitleSection.tsx`
- `Hs1AlbanyStaffRosterSection` -> `components/Hs1AlbanyStaffRosterSection.tsx`
- `Hs1AlbanyStaffHoursSection` -> `components/Hs1AlbanyStaffHoursSection.tsx`
- `Hs1AlbanyStaffLocationSection` -> `components/Hs1AlbanyStaffLocationSection.tsx`
- `Hs1AlbanyStaffContactFormSection` -> `components/Hs1AlbanyStaffContactFormSection.tsx`
- `Hs1AlbanyStaffFooterSection` -> `components/Hs1AlbanyStaffFooterSection.tsx`
- `Hs1AlbanyStaffCopyrightSection` -> `components/Hs1AlbanyStaffCopyrightSection.tsx`
- Update `starter/src/ve.config.tsx` imports, `DevProps`, and `components` registration entries without altering existing template registrations
- Run `pnpm run generate-default-layout-data hs1-albany-staff ...` with the component order listed above
- Run `pnpm run typecheck` in `starter` and fix any issues
- Final self-audit sections: header, staff roster, hours
