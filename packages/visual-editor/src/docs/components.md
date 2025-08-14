---
title: Components
outline: 2
---

## BannerSection

The Banner Section component displays a single, translatable line of rich text. It's designed to be used as a simple, full-width banner on a page. Available on Location templates.

![Preview of the BannerSection component](../components/testing/screenshots/BannerSection/%5Bdesktop%5D%20default%20props%20with%20empty%20document.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop        | Type                                    | Description                                                                                   | Default                    |
| :---------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------- |
| `data.text` | `YextEntityField<TranslatableRichText>` | The rich text to display. It can be linked to a Yext entity field or set as a constant value. | `"Banner Text" (constant)` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                            | Description                           | Default              |
| :----------------------- | :------------------------------ | :------------------------------------ | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`               | The background color of the section.  | `Background Color 6` |
| `styles.textAlignment`   | `"left" \| "right" \| "center"` | The horizontal alignment of the text. | `center`             |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## BreadcrumbsSection

The Breadcrumbs component automatically generates and displays a navigational hierarchy based on a page's position within a Yext directory structure. It renders a list of links showing the path from the main directory root to the current page, helping users understand their location on the site. Available on Location templates.

![Preview of the BreadcrumbsSection component](../components/testing/screenshots/BreadcrumbsSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

Defines the complete set of properties for the BreadcrumbsSection component.

#### Data Props

This object contains the content used by the component.

| Prop                 | Type                 | Description                                                                                  | Default            |
| :------------------- | :------------------- | :------------------------------------------------------------------------------------------- | :----------------- |
| `data.directoryRoot` | `TranslatableString` | The display label for the first link in the breadcrumb trail (the top-level directory page). | `"Directory Root"` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type              | Description                          | Default              |
| :----------------------- | :---------------- | :----------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle` | The background color of the section. | `Background Color 1` |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## CoreInfoSection

The Core Info Section is a comprehensive component designed to display essential business information in a clear, multi-column layout. It typically includes contact details (address, phone, email), hours of operation, and a list of services, with extensive options for customization. Available on Location templates.

![Preview of the CoreInfoSection component](../components/testing/screenshots/CoreInfoSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains all the content to be displayed within the three columns.

| Prop            | Type                                                                                                                                                                                                                    | Description                           | Default |
| :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :------ |
| `data.hours`    | `{ headingText: YextEntityField<TranslatableString>; hours: YextEntityField<HoursType>; }`                                                                                                                              | Content for the "Hours" column.       |         |
| `data.info`     | `{ headingText: YextEntityField<TranslatableString>; address: YextEntityField<AddressType>; phoneNumbers: Array<{ number: YextEntityField<string>; label: TranslatableString; }>; emails: YextEntityField<string[]>; }` | Content for the "Information" column. |         |
| `data.services` | `{ headingText: YextEntityField<TranslatableString>; servicesList: YextEntityField<TranslatableString[]>; }`                                                                                                            | Content for the "Services" column.    |         |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                                                                                                                                          | Description                           | Default |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :------ |
| `styles.backgroundColor` | `BackgroundStyle`                                                                                                                                                             | The background color of the section.  |         |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }`                                                                                                              | Styling for all column headings.      |         |
| `styles.hours`           | `{ startOfWeek: keyof DayOfWeekNames \| "today"; collapseDays: boolean; showAdditionalHoursText: boolean; }`                                                                  | Styling for the "Hours" column.       |         |
| `styles.info`            | `{ showGetDirectionsLink: boolean; phoneFormat: "domestic" \| "international"; includePhoneHyperlink: boolean; emailsListLength?: number; ctaVariant: CTAProps["variant"]; }` | Styling for the "Information" column. |         |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## CustomCodeSection

The CustomCodeSection component allows you to add custom HTML, CSS, and JavaScript to your page. It is useful for integrating third-party widgets or custom scripts that are not supported by the visual editor natively.

### Props

#### Other Props

The CSS styles to be applied to the component.

| Prop         | Type     | Description                                                                                                                                                                                                                | Default |
| :----------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| `css`        | `string` | The CSS styles to be applied to the component.                                                                                                                                                                             |         |
| `html`       | `string` | The HTML content to be rendered. Must be present for the component to display. If not provided, the component will display a message prompting the user to add HTML. This data is expected to have already been sanitized. |         |
| `javascript` | `string` | The JavaScript code to be added as a script tag in the component.                                                                                                                                                          |         |

---

## Directory

The Directory Page component serves as a navigational hub, displaying a list of child entities within a hierarchical structure (e.g., a list of states in a country, or cities in a state). It includes breadcrumbs for easy navigation and renders each child item as a distinct card. Available on Directory templates.

![Preview of the Directory component](../components/testing/screenshots/Directory/%5Bdesktop%5D%20default%20props%20-%20city%20list%20-%20document%20data.png)

### Props

#### Data Props

This object contains the content used by the component.

| Prop                 | Type                                  | Description                                                        | Default                                       |
| :------------------- | :------------------------------------ | :----------------------------------------------------------------- | :-------------------------------------------- |
| `data.directoryRoot` | `TranslatableString`                  | The display label for the root link in the breadcrumbs navigation. | `"Directory Root" (constant)`                 |
| `data.title`         | `YextEntityField<TranslatableString>` | The title for the Directory Section.                               | `"[[name]]" (constant using embedded fields)` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                                | Type                                                                                                                        | Description                                                     | Default              |
| :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- | :------------------- |
| `styles.backgroundColor`            | `BackgroundStyle`                                                                                                           | The main background color for the directory page content.       | `Background Color 1` |
| `styles.breadcrumbsBackgroundColor` | `BackgroundStyle`                                                                                                           | A specific background color for the breadcrumbs navigation bar. | `Background Color 1` |
| `styles.cards`                      | `{ headingLevel: HeadingLevel; backgroundColor?: BackgroundStyle; }`                                                        | Style properties for directory cards.                           |                      |
| `styles.hours`                      | `{ showCurrentStatus: boolean; timeFormat?: "12h" \| "24h"; dayOfWeekFormat?: "short" \| "long"; showDayNames?: boolean; }` | Styling for the hours display on each card.                     |                      |
| `styles.phoneNumberFormat`          | `"domestic" \| "international"`                                                                                             | The display format for phone numbers on the cards.              | `'domestic'`         |
| `styles.phoneNumberLink`            | `boolean`                                                                                                                   | If "true", wraps phone numbers in a clickable "tel:" hyperlink. | `false`              |

---

## EventSection

The Events Section component is designed to display a curated list of events. It features a prominent section heading and renders each event as an individual card, making it ideal for showcasing upcoming activities, workshops, or promotions. Available on Location templates.

![Preview of the EventSection component](../components/testing/screenshots/EventSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop           | Type                                  | Description                                                                                    | Default                           |
| :------------- | :------------------------------------ | :--------------------------------------------------------------------------------------------- | :-------------------------------- |
| `data.events`  | `YextEntityField<EventSectionType>`   | The source of event data, which can be linked to a Yext field or provided as a constant value. | `A list of 3 placeholder events.` |
| `data.heading` | `YextEntityField<TranslatableString>` | The main heading for the entire events section.                                                | `"Upcoming Events" (constant)`    |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                                                                  | Description                          | Default              |
| :----------------------- | :---------------------------------------------------------------------------------------------------- | :----------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                                                     | The background color of the section. | `Background Color 3` |
| `styles.cards`           | `{ headingLevel: HeadingLevel; backgroundColor?: BackgroundStyle; ctaVariant: CTAProps["variant"]; }` | Styling for all the cards.           |                      |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }`                                      | Styling for the heading.             |                      |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## ExpandedFooter

The Expanded Footer is a comprehensive, two-tiered site-wide component for large websites. It includes a primary footer area for a logo, social media links, and utility images, and features two distinct layouts: a standard link list or an "expanded" multi-column mega-footer. It also includes an optional secondary sub-footer for copyright notices and legal links. Avalible on Location templates.

![Preview of the ExpandedFooter component](../components/testing/screenshots/ExpandedFooter/%5Bdesktop%5D%20default%20props.png)

### Props

#### Data Props

This object contains all the content for both footer tiers.

| Prop                   | Type                                                                                                                                                                                                                                                                                                                                                                    | Description                           | Default |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :------ |
| `data.primaryFooter`   | `{ logo: string; facebookLink: string; instagramLink: string; linkedInLink: string; pinterestLink: string; tiktokLink: string; youtubeLink: string; xLink: string; utilityImages: { url: string; linkTarget?: string; }[]; expandedFooter: boolean; footerLinks: TranslatableCTA[]; expandedFooterLinks: { label: TranslatableString; links: TranslatableCTA[]; }[]; }` | Content for the primary footer bar.   |         |
| `data.secondaryFooter` | `{ show: boolean; copyrightMessage: TranslatableString; secondaryFooterLinks: TranslatableCTA[]; }`                                                                                                                                                                                                                                                                     | Content for the secondary header bar. |         |

#### Style Props

This object contains properties for customizing the appearance of both footer tiers.

| Prop                     | Type                                                                                                                                   | Description                           | Default |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :------ |
| `styles.maxWidth`        | `PageSectionProps["maxWidth"]`                                                                                                         | The maximum width of the footer.      |         |
| `styles.primaryFooter`   | `{ backgroundColor?: BackgroundStyle; linksAlignment: "left" \| "right"; logo: ImageStylingProps; utilityImages: ImageStylingProps; }` | Styling for the primary footer bar.   |         |
| `styles.secondaryFooter` | `{ backgroundColor?: BackgroundStyle; linksAlignment: "left" \| "right"; }`                                                            | Styling for the secondary footer bar. |         |

---

## ExpandedHeader

The Expanded Header is a two-tiered component for websites with complex navigation needs. It consists of a primary header for the main logo, navigation links, and calls-to-action, plus an optional secondary "top bar" for utility links (like "Contact Us" or "Log In") and a language selector. Available on Location templates.

![Preview of the ExpandedHeader component](../components/testing/screenshots/ExpandedHeader/%5Bdesktop%5D%20default%20props.png)

### Props

#### Data Props

This object contains all the content for both header tiers.

| Prop                   | Type                                                                                                                                                            | Description                                 | Default |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :------ |
| `data.primaryHeader`   | `{ logo: string; links: TranslatableCTA[]; primaryCTA?: TranslatableCTA; showPrimaryCTA: boolean; secondaryCTA?: TranslatableCTA; showSecondaryCTA: boolean; }` | Content for the main primary header bar.    |         |
| `data.secondaryHeader` | `{ show: boolean; showLanguageDropdown: boolean; secondaryLinks: TranslatableCTA[]; }`                                                                          | Content for the secondary header (top bar). |         |

#### Style Props

This object contains properties for customizing the appearance of both header tiers.

| Prop                     | Type                                                                                                                                                | Description                                 | Default |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :------ |
| `styles.headerPosition`  | `"sticky" \| "scrollsWithPage"`                                                                                                                     | Whether the header is "sticky" or not       |         |
| `styles.maxWidth`        | `PageSectionProps["maxWidth"]`                                                                                                                      | The maximum width of the header             |         |
| `styles.primaryHeader`   | `{ logo: ImageStylingProps; backgroundColor?: BackgroundStyle; primaryCtaVariant: CTAProps["variant"]; secondaryCtaVariant: CTAProps["variant"]; }` | Styling for the main, primary header bar.   |         |
| `styles.secondaryHeader` | `{ backgroundColor?: BackgroundStyle; }`                                                                                                            | Styling for the secondary header (top bar). |         |

---

## FAQSection

The FAQ Section component displays a list of questions and answers in an organized format. It includes a main heading for the section and typically renders the FAQs as an accordion, where users can click on a question to reveal the answer. Available on Location templates.

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop           | Type                                  | Description                                                                                                        | Default                                   |
| :------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| `data.faqs`    | `YextEntityField<FAQSectionType>`     | The source of the FAQ data (questions and answers), which can be linked to a Yext field or provided as a constant. | `A list of 3 placeholder FAQs.`           |
| `data.heading` | `YextEntityField<TranslatableString>` | The main heading for the entire events section.                                                                    | `"Frequently Asked Questions" (constant)` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                             | Description                          | Default              |
| :----------------------- | :--------------------------------------------------------------- | :----------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                | The background color of the section. | `Background Color 3` |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }` | Styling for the heading.             |                      |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## Footer

The Footer appears at the bottom of the page. It serves as a container for secondary navigation, social media links, legal disclaimers, and copyright information. See [Expanded Footer](#expanded-footer) for the newest footer component. Available on Directory and Locator templates.

![Preview of the Footer component](../components/testing/screenshots/Footer/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Other Props

The background color for the entire footer section.

| Prop              | Type              | Description                                         | Default              |
| :---------------- | :---------------- | :-------------------------------------------------- | :------------------- |
| `backgroundColor` | `BackgroundStyle` | The background color for the entire footer section. | `Background Color 1` |

---

## Header

The Header component appears at the top of pages. It serves as the primary navigation and branding element, containing the site logo and optionally a language selector. See [Expanded Header](#expanded-header) for the newest header component. Available on Directory and Locator templates.

![Preview of the Header component](../components/testing/screenshots/Header/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Other Props

If 'true', displays the language selector dropdown in the header.

| Prop                     | Type      | Description                                                       | Default |
| :----------------------- | :-------- | :---------------------------------------------------------------- | :------ |
| `enableLanguageSelector` | `boolean` | If 'true', displays the language selector dropdown in the header. | `false` |
| `logoWidth`              | `number`  | The display width of the site logo in pixels.                     | `80`    |

---

## HeroSection

![Preview of the HeroSection component](../components/testing/screenshots/HeroSection/%5Bdesktop%5D%20%5Bclassic%5D%20version%2017%20props%20using%20constant%20values.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop                     | Type                                     | Description                                                                             | Default                      |
| :----------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------- |
| `data.businessName`      | `YextEntityField<TranslatableString>`    | The primary business name displayed in the hero.                                        | `"Business Name" (constant)` |
| `data.hero`              | `YextStructEntityField<HeroSectionType>` | The main hero content, including an image and primary/secondary call-to-action buttons. | `Placeholder image and CTAs` |
| `data.hours`             | `YextEntityField<HoursType>`             | The entity's hours data, used to display an "Open/Closed" status.                       | `'hours' field`              |
| `data.localGeoModifier`  | `YextEntityField<TranslatableString>`    | A location-based modifier or slogan (e.g., "Serving Downtown").                         | `"Geomodifier" (constant)`   |
| `data.showAverageReview` | `boolean`                                | If 'true', displays the entity's average review rating.                                 | `true`                       |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                              | Type                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                | Default              |
| :-------------------------------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- |
| `styles.backgroundColor`          | `BackgroundStyle`                                      | The background color for the entire section (classic and compact variants). The background color for the featured content (spotlight variant).                                                                                                                                                                                                                                                                                             | `Background Color 1` |
| `styles.businessNameLevel`        | `HeadingLevel`                                         | The HTML heading level for the business name.                                                                                                                                                                                                                                                                                                                                                                                              | `3`                  |
| `styles.desktopContainerPosition` | `"left" \| "center"`                                   | Container position on desktop (spotlight and immersive variants).                                                                                                                                                                                                                                                                                                                                                                          | `left`               |
| `styles.desktopImagePosition`     | `"left" \| "right"`                                    | Positions the image to the left or right of the hero content on desktop (classic and compact variants).                                                                                                                                                                                                                                                                                                                                    | `right`              |
| `styles.image`                    | `ImageStylingProps & { height?: number; }`             | Styling options for the hero image. Classic variant: aspect ratio (ratios 4:1, 3:1, 2:1, and 9:16 are not supported) and height. Immersive variant: height (500px default, minimum height: content height + Page Section Top/Bottom Padding) Spotlight variant: height (500px default, minimum height: content height + Page Section Top/Bottom Padding) Compact variant: aspect ratio (ratios 4:1, 3:1, 2:1, and 9:16 are not supported). |                      |
| `styles.localGeoModifierLevel`    | `HeadingLevel`                                         | The HTML heading level for the local geo-modifier.                                                                                                                                                                                                                                                                                                                                                                                         | `1`                  |
| `styles.mobileContentAlignment`   | `"left" \| "center"`                                   | Content alignment for mobile viewports.                                                                                                                                                                                                                                                                                                                                                                                                    | `left`               |
| `styles.mobileImagePosition`      | `"bottom" \| "top"`                                    | Positions the image to the top or bottom of the hero content on mobile (classic and compact variants).                                                                                                                                                                                                                                                                                                                                     | `top`                |
| `styles.primaryCTA`               | `CTAProps["variant"]`                                  | The visual style variant for the primary call-to-action button.                                                                                                                                                                                                                                                                                                                                                                            | `primary`            |
| `styles.secondaryCTA`             | `CTAProps["variant"]`                                  | The visual style variant for the secondary call-to-action button.                                                                                                                                                                                                                                                                                                                                                                          | `secondary`          |
| `styles.showImage`                | `boolean`                                              | Whether to show the hero image (classic and compact variant).                                                                                                                                                                                                                                                                                                                                                                              | `true`               |
| `styles.variant`                  | `"classic" \| "immersive" \| "spotlight" \| "compact"` | The visual variant for the hero section.                                                                                                                                                                                                                                                                                                                                                                                                   | `classic`            |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## InsightSection

The Insight Section is used to display a curated list of content such as articles, blog posts, or other informational blurbs. It features a main section heading and renders each insight as a distinct card, making it an effective way to showcase valuable content. Available on Location templates.

![Preview of the InsightSection component](../components/testing/screenshots/InsightSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop            | Type                                  | Description                                                                                    | Default                             |
| :-------------- | :------------------------------------ | :--------------------------------------------------------------------------------------------- | :---------------------------------- |
| `data.heading`  | `YextEntityField<TranslatableString>` | The main heading for the entire insights section.                                              | `"Insights"`                        |
| `data.insights` | `YextEntityField<InsightSectionType>` | The source of the insight data, which can be linked to a Yext field or provided as a constant. | `A list of 3 placeholder insights.` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                                                                  | Description                                                           | Default              |
| :----------------------- | :---------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                                                     | The background color for the entire section, selected from the theme. | `Background Color 2` |
| `styles.cards`           | `{ headingLevel: HeadingLevel; backgroundColor?: BackgroundStyle; ctaVariant: CTAProps["variant"]; }` | Styling for the individual insight cards.                             |                      |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }`                                      | Styling for the main section heading.                                 |                      |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## LocatorComponent

Available on Locator templates.

### Props

#### Other Props

The visual theme for the map tiles, chosen from a predefined list of Mapbox styles.

| Prop            | Type      | Description                                                                         | Default                                |
| :-------------- | :-------- | :---------------------------------------------------------------------------------- | :------------------------------------- |
| `mapStyle`      | `string`  | The visual theme for the map tiles, chosen from a predefined list of Mapbox styles. | `'mapbox://styles/mapbox/streets-v12'` |
| `openNowButton` | `boolean` | If 'true', displays a button to filter for locations that are currently open.       | `false`                                |

---

## NearbyLocationsSection

The Nearby Locations Section dynamically finds and displays a list of business locations within a specified radius of a central point. It's a powerful tool for helping users discover other relevant locations, rendering each result as a detailed card with contact information and business hours. Available on Location templates.

![Preview of the NearbyLocationsSection component](../components/testing/screenshots/NearbyLocationsSection/%5Bdesktop%5D%20default%20props%20with%20empty%20document.png)

### Props

#### Data Props

This object defines the search parameters for finding nearby locations.

| Prop              | Type                                  | Description                                          | Default                         |
| :---------------- | :------------------------------------ | :--------------------------------------------------- | :------------------------------ |
| `data.coordinate` | `YextEntityField<Coordinate>`         | The central coordinate (, ) to search from.          | `'yextDisplayCoordinate' field` |
| `data.heading`    | `YextEntityField<TranslatableString>` | The main heading for the entire section.             | `"Nearby Locations" (constant)` |
| `data.limit`      | `number`                              | The maximum number of locations to find and display. | `3`                             |
| `data.radius`     | `number`                              | The search radius in miles.                          | `10`                            |

#### Style Props

This object contains extensive properties for customizing the component's appearance.

| Prop                       | Type                                                                                                                        | Description                                        | Default              |
| :------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- | :------------------- |
| `styles.backgroundColor`   | `BackgroundStyle`                                                                                                           | The background color for the entire section.       | `Background Color 1` |
| `styles.cards`             | `{ headingLevel: HeadingLevel; backgroundColor?: BackgroundStyle; }`                                                        | Styling for the individual location cards.         |                      |
| `styles.heading`           | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }`                                                            | Styling for the main section heading.              |                      |
| `styles.hours`             | `{ showCurrentStatus: boolean; timeFormat?: "12h" \| "24h"; dayOfWeekFormat?: "short" \| "long"; showDayNames?: boolean; }` | Styling for the hours display on each card.        |                      |
| `styles.phoneNumberFormat` | `"domestic" \| "international"`                                                                                             | The display format for phone numbers on the cards. | `'domestic'`         |
| `styles.phoneNumberLink`   | `boolean`                                                                                                                   | If , wraps phone numbers in a clickable hyperlink. | `false`              |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## PhotoGallerySection

The Photo Gallery Section is designed to display a collection of images in a visually appealing format. It consists of a main heading for the section and a flexible grid of images, with options for styling the image presentation. Available on Location templates.

![Preview of the PhotoGallerySection component](../components/testing/screenshots/PhotoGallerySection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop           | Type                                                                       | Description                                                                                  | Default                           |
| :------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :-------------------------------- |
| `data.heading` | `YextEntityField<TranslatableString>`                                      | The main heading for the photo gallery.                                                      | `"Gallery" (constant)`            |
| `data.images`  | `YextEntityField<ImageType[] \| ComplexImageType[] \| GalleryImageType[]>` | The source of the image data, which can be linked to a Yext field or provided as a constant. | `A list of 3 placeholder images.` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                             | Description                                                           | Default              |
| :----------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                | The background color for the entire section, selected from the theme. | `Background Color 1` |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }` | Styling for the main section heading.                                 |                      |
| `styles.image`           | `ImageStylingProps`                                              | Styling options for the gallery images, such as aspect ratio.         |                      |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## ProductSection

The Product Section is used to display a curated list of products in a dedicated section. It features a main heading and renders each product as an individual card, making it ideal for showcasing featured items, new arrivals, or bestsellers. Available on Location templates.

![Preview of the ProductSection component](../components/testing/screenshots/ProductSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop            | Type                                  | Description                                                                                    | Default                             |
| :-------------- | :------------------------------------ | :--------------------------------------------------------------------------------------------- | :---------------------------------- |
| `data.heading`  | `YextEntityField<TranslatableString>` | The main heading for the entire products section.                                              | `"Featured Products" (constant)`    |
| `data.products` | `YextEntityField<ProductSectionType>` | The source of the product data, which can be linked to a Yext field or provided as a constant. | `A list of 3 placeholder products.` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                                                                  | Description                                  | Default              |
| :----------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                                                     | The background color for the entire section. | `Background Color 2` |
| `styles.cards`           | `{ headingLevel: HeadingLevel; backgroundColor?: BackgroundStyle; ctaVariant: CTAProps["variant"]; }` | Styling for the individual product cards.    |                      |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }`                                      | Styling for the main section heading.        |                      |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## PromoSection

The Promo Section is a flexible content component designed to highlight a single, specific promotion. It combines an image with a title, description, and a call-to-action button in a customizable, split-column layout, making it perfect for drawing attention to special offers or announcements. Available on Location templates.

![Preview of the PromoSection component](../components/testing/screenshots/PromoSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop         | Type                                      | Description                                                                                           | Default                                         |
| :----------- | :---------------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------------------------------------------- |
| `data.promo` | `YextStructEntityField<PromoSectionType>` | The source for the promotional content, including an image, title, description, and a call-to-action. | `Placeholder content for a featured promotion.` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                             | Description                                                   | Default              |
| :----------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------ | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                | The background color for the entire section.                  | `Background Color 1` |
| `styles.ctaVariant`      | `CTAProps["variant"]`                                            | The visual style variant for the call-to-action button.       | `'primary'`          |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }` | Styling for the promo's title.                                |                      |
| `styles.image`           | `ImageStylingProps`                                              | Styling options for the promo image, such as aspect ratio.    |                      |
| `styles.orientation`     | `"left" \| "right"`                                              | Positions the image to the left or right of the text content. | `'left'`             |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## StaticMapSection

The Static Map Section displays a non-interactive map image of a business's location. It uses the entity's address or coordinates to generate the map and requires a valid API key from mapbox. Available on Location templates.

![Preview of the StaticMapSection component](../components/testing/screenshots/StaticMapSection/%5Bdesktop%5D%20default%20props%20with%20coordinate%20-%20no%20api%20key.png)

### Props

#### Data Props

This object contains the configuration needed to generate the map.

| Prop   | Type            | Description                                                        | Default |
| :----- | :-------------- | :----------------------------------------------------------------- | :------ |
| `data` | `StaticMapData` | This object contains the configuration needed to generate the map. |         |

#### Styles Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type              | Description                          | Default              |
| :----------------------- | :---------------- | :----------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle` | The background color of the section. | `Background Color 1` |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## TeamSection

The Team Section is designed to showcase a list of people, such as employees, executives, or other team members. It features a main section heading and renders each person's information—typically a photo, name, and title—as an individual card. Available on Location templates.

![Preview of the TeamSection component](../components/testing/screenshots/TeamSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop   | Type       | Description                                                        | Default |
| :----- | :--------- | :----------------------------------------------------------------- | :------ |
| `data` | `TeamData` | This object contains the content to be displayed by the component. |         |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop     | Type         | Description                                                                 | Default |
| :------- | :----------- | :-------------------------------------------------------------------------- | :------ |
| `styles` | `TeamStyles` | This object contains properties for customizing the component's appearance. |         |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## TestimonialSection

The Testimonial Section is used to display a list of customer testimonials or reviews. It features a main section heading and renders each testimonial as an individual card, providing social proof and building trust with visitors. Available on Location templates.

![Preview of the TestimonialSection component](../components/testing/screenshots/TestimonialSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop                | Type                                      | Description                                                                                        | Default                                 |
| :------------------ | :---------------------------------------- | :------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| `data.heading`      | `YextEntityField<TranslatableString>`     | The main heading for the entire testimonials section.                                              | `"Featured Testimonials" (constant)`    |
| `data.testimonials` | `YextEntityField<TestimonialSectionType>` | The source of the testimonial data, which can be linked to a Yext field or provided as a constant. | `A list of 3 placeholder testimonials.` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                                 | Description                                                           | Default              |
| :----------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                    | The background color for the entire section, selected from the theme. | `Background Color 2` |
| `styles.cards`           | `{ headingLevel: HeadingLevel; backgroundColor?: BackgroundStyle; }` | Styling for the individual testimonial cards.                         |                      |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }`     | Styling for the main section heading.                                 |                      |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---
