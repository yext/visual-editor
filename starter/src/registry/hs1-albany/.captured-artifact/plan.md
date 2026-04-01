# HS1 Albany Capture Plan

- URL: `https://www.ofc-albany.com/`
- Captured title: `Downers Grove, IL Dentist`
- Captured at: `2026-03-26T20:53:26.944Z`
- Final URL: `https://www.ofc-albany.com/`

## Ordered Sections

1. `Hs1AlbanyHeaderSection`
   - Source: `#id_5a3a8676-1666-5f40-9fd1-779732c80e51.section-logo.section-navigation.section-phone`
   - Layout signature:
     - Shell wrapper: contained, `container`, centered, top/bottom padding `10/20px` per column via `#sectionCss`
     - Immediate content wrapper: three-column flex row, logo `col-lg-2`, nav `col-lg-7`, phone `col-lg-3`
     - Layout model: flex row, center-aligned vertically
     - Direct children: logo left, nav center, phone right
     - Text blocks: Montserrat/Lato family mix, nav uppercase, phone Montserrat `1.75rem` `500`, gold `#d3a335`
     - Media blocks: logo image plus wordmark link
2. `Hs1AlbanyHeroSection`
   - Source: `#id_d2812cb3-681c-5c2a-a7b2-2cf94fd09ecc.section-banner`
   - Layout signature:
     - Shell wrapper: full-bleed, `container-fluid`, no visible outer gutters except inherited `15px`
     - Immediate content wrapper: split hero, text overlay width `55%`, media width `45%`
     - Layout model: flex row on desktop, centered vertically
     - Direct children: text block left, image block right
     - Text blocks: title `1.875rem`, subtitle `1.125rem`, uppercase heading, centered text
     - Media blocks: right-side image block with hard split edge; slide dots below
3. `Hs1AlbanyServicesSection`
   - Source: `#id_64eb218f-feba-5959-aa3c-dd8cb17dac8b.section-featuredblocks`
   - Layout signature:
     - Shell wrapper: full-bleed, dark background section
     - Immediate content wrapper: 3-up grid, no side padding on alias column
     - Layout model: flex/grid cards, equal-width columns
     - Direct children: three image tiles, centered titles
     - Text blocks: uppercase Montserrat `1.25rem`, white over darkened images
     - Media blocks: full-card background images with semi-transparent overlays
4. `Hs1AlbanyWelcomeSection`
   - Source: `#id_da793106-4842-5bee-9443-3a3271074313.section-blade`
   - Layout signature:
     - Shell wrapper: full-bleed, white background
     - Immediate content wrapper: contained `max-width 1170px`, two-column split `7/5`
     - Layout model: flex row, centered vertically
     - Direct children: text column left, image column right
     - Text blocks: uppercase title with border accent, subtitle below, long paragraph body, button under body
     - Media blocks: full-height side image, object-cover
5. `Hs1AlbanySignupFormSection`
   - Source: `#id_865d227f-2dc4-5eb9-a0ca-39659d1d1607.exclusive-offer.section-form`
   - Layout signature:
     - Shell wrapper: contained, gold background `section__bg--dark-5`
     - Immediate content wrapper: centered single-column form
     - Layout model: vertical stack
     - Direct children: title, 3 inline inputs, submit button
     - Text blocks: uppercase Montserrat title `1.75rem`, centered
     - Media blocks: none
6. `Hs1AlbanyTestimonialsSection`
   - Source: `#id_88f9aed9-7e83-58d3-a5fd-96a3eb57d871.section-testimonials`
   - Layout signature:
     - Shell wrapper: contained dark charcoal background `#4f4e4e`
     - Immediate content wrapper: centered title with single testimonial card
     - Layout model: vertical stack
     - Direct children: title, quote badge, light card
     - Text blocks: title uppercase white/gold, quote text dark gray `1.375rem`
     - Media blocks: circular quote badge only
7. `Hs1AlbanyHoursSection`
   - Source: `#id_77cf7866-f48d-5b20-81ac-70dbcdf0d45d.section-hours`
   - Layout signature:
     - Shell wrapper: contained, light gray background `#e0e0e0`
     - Immediate content wrapper: centered heading stack plus 7-column hours row
     - Layout model: vertical stack with horizontal schedule grid
     - Direct children: title/subtitle then day columns
     - Text blocks: uppercase title, italic/gold subtitle
     - Media blocks: none
8. `Hs1AlbanyLocationSection`
   - Source: `#id_b764e4aa-aef7-59b9-81ab-bfdac74a6732.section-map`
   - Layout signature:
     - Shell wrapper: full-bleed
     - Immediate content wrapper: split `5/7`, left white info card, right full-height map
     - Layout model: flex row
     - Direct children: text card left, map surface right
     - Text blocks: title uppercase, subtitle gold, bold section labels, address and contact details
     - Media blocks: embedded/static map filling right half edge-to-edge
9. `Hs1AlbanyContactFormSection`
   - Source: `#id_eb810fcb-dc81-59c6-a4a0-00c726b63d1e.contact-us-im.section-form`
   - Layout signature:
     - Shell wrapper: contained, gold background
     - Immediate content wrapper: centered title with asymmetric form row
     - Layout model: vertical stack; desktop form uses left stacked inputs and right textarea
     - Direct children: title, input cluster, disclaimer, submit button
     - Text blocks: uppercase Montserrat title `1.75rem`, disclaimer small centered
     - Media blocks: none
10. `Hs1AlbanyFooterSection`
    - Source: `#id_0dee376d-877b-57cb-9fb6-08b18ea4fffb.section-logo.section-socialmedia`
    - Layout signature:
      - Shell wrapper: contained, white background
      - Immediate content wrapper: `8/4` split
      - Layout model: flex row, vertically centered
      - Direct children: logo block left, social icon row right
      - Text blocks: wordmark next to footer logo
      - Media blocks: footer logo image
11. `Hs1AlbanyCopyrightSection`
    - Source: `#id_8fe7eebd-2d97-5f1e-b5e8-2ecfc6035e5d.section-copyright`
    - Layout signature:
      - Shell wrapper: contained, white background
      - Immediate content wrapper: centered inline list with separators
      - Layout model: horizontal inline list
      - Direct children: three copyright/admin/sitemap links
      - Text blocks: uppercase Lato `0.8125rem`, bold
      - Media blocks: none

## Header/Footer Link Parity

| Section | Band/Group        | Index | Visible Label                                | Href                                                                   | Expand/Collapse | Trigger     |
| ------- | ----------------- | ----- | -------------------------------------------- | ---------------------------------------------------------------------- | --------------- | ----------- |
| header  | logo              | 1     | Sunny Smiles                                 | `https://www.ofc-albany.com`                                           | none            | click       |
| header  | primary-nav       | 1     | Home                                         | `https://www.ofc-albany.com`                                           | none            | click       |
| header  | primary-nav       | 2     | Staff                                        | `https://www.ofc-albany.com/staff`                                     | none            | click       |
| header  | primary-nav       | 3     | Office                                       | `https://www.ofc-albany.com/our-locations`                             | none            | click       |
| header  | primary-nav       | 4     | Services                                     | `https://www.ofc-albany.com/dental-services`                           | none            | click       |
| header  | primary-nav       | 5     | New Patients                                 | `https://www.ofc-albany.com/new-patients`                              | none            | click       |
| header  | primary-nav       | 6     | More                                         | `#`                                                                    | expands submenu | hover/click |
| header  | more-submenu      | 1     | Contact Us                                   | `https://www.ofc-albany.com/contact`                                   | none            | click       |
| header  | more-submenu      | 2     | Appointment Request                          | `https://www.ofc-albany.com/appointment`                               | none            | click       |
| header  | more-submenu      | 3     | Testimonials                                 | `https://www.ofc-albany.com/testimonials`                              | none            | click       |
| header  | more-submenu      | 4     | Smile Gallery                                | `https://www.ofc-albany.com/gallery`                                   | none            | click       |
| header  | more-submenu      | 5     | Blog                                         | `https://www.ofc-albany.com/blog`                                      | none            | click       |
| header  | more-submenu      | 6     | Patient Education                            | `https://www.ofc-albany.com/articles/premium_education`                | expands submenu | hover/click |
| header  | patient-education | 1     | Educational Videos                           | `https://www.ofc-albany.com/articles/premium_education/category/47361` | none            | click       |
| header  | patient-education | 2     | Cosmetic & General Dentistry                 | `https://www.ofc-albany.com/articles/premium_education/category/47362` | none            | click       |
| header  | patient-education | 3     | Emergency Care                               | `https://www.ofc-albany.com/articles/premium_education/category/47363` | none            | click       |
| header  | patient-education | 4     | Endodontics                                  | `https://www.ofc-albany.com/articles/premium_education/category/47364` | none            | click       |
| header  | patient-education | 5     | Implant Dentistry                            | `https://www.ofc-albany.com/articles/premium_education/category/47365` | none            | click       |
| header  | patient-education | 6     | Oral Health                                  | `https://www.ofc-albany.com/articles/premium_education/category/47366` | none            | click       |
| header  | patient-education | 7     | Oral Hygiene                                 | `https://www.ofc-albany.com/articles/premium_education/category/47367` | none            | click       |
| header  | patient-education | 8     | Oral Surgery                                 | `https://www.ofc-albany.com/articles/premium_education/category/47368` | none            | click       |
| header  | patient-education | 9     | Orthodontics                                 | `https://www.ofc-albany.com/articles/premium_education/category/47369` | none            | click       |
| header  | patient-education | 10    | Pediatric Dentistry                          | `https://www.ofc-albany.com/articles/premium_education/category/47370` | none            | click       |
| header  | patient-education | 11    | Periodontal Therapy                          | `https://www.ofc-albany.com/articles/premium_education/category/47371` | none            | click       |
| header  | patient-education | 12    | Technology                                   | `https://www.ofc-albany.com/articles/premium_education/category/47372` | none            | click       |
| header  | utility           | 1     | (877) 393-3348                               | `tel:(877) 393-3348`                                                   | none            | click       |
| footer  | brand             | 1     | Sunny Smiles                                 | `https://www.ofc-albany.com`                                           | none            | click       |
| footer  | social            | 1     | Facebook                                     | `https://www.facebook.com/Anderson-Optometry-363713737059041/`         | none            | click       |
| footer  | social            | 2     | Twitter                                      | `https://twitter.com/InternetMatrix`                                   | none            | click       |
| footer  | social            | 3     | Youtube                                      | `https://www.youtube.com/user/webmarketingimatrix`                     | none            | click       |
| footer  | copyright         | 1     | Copyright © 2026 MH Sub I, LLC dba Officite | `//www.henryscheinone.com/products/officite`                           | none            | click       |
| footer  | copyright         | 2     | Admin Log In                                 | `https://secure.officite.com`                                          | none            | click       |
| footer  | copyright         | 3     | Site Map                                     | `https://www.ofc-albany.com/sitemap`                                   | none            | click       |

## Implementation Checklist

- [ ] `Hs1AlbanyHeaderSection` -> `components/Hs1AlbanyHeaderSection.tsx`
- [ ] `Hs1AlbanyHeroSection` -> `components/Hs1AlbanyHeroSection.tsx`
- [ ] `Hs1AlbanyServicesSection` -> `components/Hs1AlbanyServicesSection.tsx`
- [ ] `Hs1AlbanyWelcomeSection` -> `components/Hs1AlbanyWelcomeSection.tsx`
- [ ] `Hs1AlbanySignupFormSection` -> `components/Hs1AlbanySignupFormSection.tsx`
- [ ] `Hs1AlbanyTestimonialsSection` -> `components/Hs1AlbanyTestimonialsSection.tsx`
- [ ] `Hs1AlbanyHoursSection` -> `components/Hs1AlbanyHoursSection.tsx`
- [ ] `Hs1AlbanyLocationSection` -> `components/Hs1AlbanyLocationSection.tsx`
- [ ] `Hs1AlbanyContactFormSection` -> `components/Hs1AlbanyContactFormSection.tsx`
- [ ] `Hs1AlbanyFooterSection` -> `components/Hs1AlbanyFooterSection.tsx`
- [ ] `Hs1AlbanyCopyrightSection` -> `components/Hs1AlbanyCopyrightSection.tsx`
- [ ] Register all generated components in `starter/src/ve.config.tsx`
- [ ] Generate `starter/src/registry/hs1-albany/defaultLayout.json` in final visual order
