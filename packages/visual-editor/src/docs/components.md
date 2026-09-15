---
title: Components
outline: 2
---

## Address

### Props

Props for the Address component

#### Other Props

| Prop     | Type                                                                                                                           | Description | Default |
| :------- | :----------------------------------------------------------------------------------------------------------------------------- | :---------- | :------ |
| `data`   | `{ address: YextEntityField<AddressType>; }`                                                                                   |             |         |
| `styles` | `{ showRegion?: boolean; showCountry?: boolean; showGetDirectionsLink: boolean; ctaVariant: CTAVariant; color?: ThemeColor; }` |             |         |

---

## BreadcrumbsSection

The Breadcrumbs component automatically generates and displays a navigational hierarchy based on a page's position within a Yext directory structure. It renders a list of links showing the path from the main directory root to the current page, helping users understand their location on the site. Available on Location templates.

![Preview of the BreadcrumbsSection component](../components/testing/screenshots/BreadcrumbsSection/%5Bdesktop%5D%20default%20props%20with%20document%20data.png)

### Props

Defines the complete set of properties for the BreadcrumbsSection component.

#### Data Props

This object contains the content used by the component.

| Prop                 | Type                                  | Description                                                                                  | Default            |
| :------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------- | :----------------- |
| `data.currentPage`   | `YextEntityField<TranslatableString>` | The display label for the last link in the breadcrumb trail (the current page).              | `Name`             |
| `data.directoryRoot` | `TranslatableString`                  | The display label for the first link in the breadcrumb trail (the top-level directory page). | `"Directory Root"` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type         | Description                                                                  | Default              |
| :----------------------- | :----------- | :--------------------------------------------------------------------------- | :------------------- |
| `styles.backgroundColor` | `ThemeColor` | The background color of the section.                                         | `Background Color 1` |
| `styles.linkColor`       | `ThemeColor` | The link color of breadcrumbs.                                               |                      |
| `styles.showCurrentPage` | `boolean`    | Whether to show the current page's link in the breadcrumb trail (last link). | `true`               |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---

## CustomCodeSection

The CustomCodeSection component allows you to add custom HTML, CSS, and JavaScript to your page. It is useful for integrating third-party widgets or custom scripts that are not supported by the visual editor natively.

![Preview of the CustomCodeSection component](../components/testing/screenshots/CustomCodeSection/%5Bdesktop%5D%20default%20props%20with%20empty%20document.png)

### Props

#### Other Props

The CSS styles to be applied to the component.

| Prop             | Type      | Description                                                                                                                                                                                                                | Default |
| :--------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| `css`            | `string`  | The CSS styles to be applied to the component.                                                                                                                                                                             |         |
| `html`           | `string`  | The HTML content to be rendered. Must be present for the component to display. If not provided, the component will display a message prompting the user to add HTML. This data is expected to have already been sanitized. |         |
| `javascript`     | `string`  | The JavaScript code to be added as a script tag in the component.                                                                                                                                                          |         |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden.                                                                                                                                             | `true`  |

---

## Directory

The Directory Page component serves as a navigational hub, displaying a list of child entities within a hierarchical structure (e.g., a list of states in a country, or cities in a state). It includes breadcrumbs for easy navigation and renders each child item as a distinct card. Available on Directory templates.

![Preview of the Directory component](../components/testing/screenshots/Directory/%5Bdesktop%5D%20default%20props%20-%20city%20list%20-%20document%20data.png)

### Props

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                         | Type         | Description                                               | Default              |
| :--------------------------- | :----------- | :-------------------------------------------------------- | :------------------- |
| `styles.backgroundColor`     | `ThemeColor` | The background color for the directory page heading area. | `Background Color 1` |
| `styles.linkColor`           | `ThemeColor` | The color of links in the directory list layout.          |                      |
| `styles.listBackgroundColor` | `ThemeColor` | The background color for the directory list area.         | `Background Color 1` |

---

## HoursStatus

### Props

#### Other Props

| Prop     | Type                                                                                                                                                                                   | Description | Default |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- | :------ |
| `data`   | `{ hours: YextEntityField<HoursType>; }`                                                                                                                                               |             |         |
| `styles` | `{ showCurrentStatus?: boolean; timeFormat?: "12h" \| "24h"; dayOfWeekFormat?: "short" \| "long"; showDayNames?: boolean; className?: string; bodyVariant?: "lg" \| "base" \| "sm"; }` |             |         |

---

## HoursTable

### Props

Props for the HoursTable component.

#### Other Props

| Prop     | Type                                                                                                                                                     | Description | Default |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- | :------ |
| `data`   | `{ hours: YextEntityField<HoursType>; }`                                                                                                                 |             |         |
| `styles` | `{ startOfWeek: keyof DayOfWeekNames \| "today"; collapseDays: boolean; showAdditionalHoursText: boolean; alignment: "items-start" \| "items-center"; }` |             |         |

---

## ImageWrapper

### Props

#### Other Props

Additional CSS classes to apply to the image.

| Prop            | Type                                                                                                              | Description                                   | Default |
| :-------------- | :---------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- | :------ |
| `className`     | `string`                                                                                                          | Additional CSS classes to apply to the image. |         |
| `data`          | `{ image: YextEntityField<ImageType \| ComplexImageType \| TranslatableAssetImage>; link?: TranslatableString; }` |                                               |         |
| `hideWidthProp` | `boolean`                                                                                                         |                                               |         |
| `sizes`         | `ImgSizesByBreakpoint`                                                                                            |                                               |         |
| `styles`        | `ImageStylingProps`                                                                                               | Size and aspect ratio of the image.           |         |

---

## LocatorComponent

Available on Locator templates.

### Props

#### Other Props

Controls which distance value to display on each locator result card.

| Prop                  | Type                                                                                                                                                                                                                | Description                                                                                                                                                                                                                      | Default                                |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| `distanceDisplay`     | `DistanceDisplayOption`                                                                                                                                                                                             | Controls which distance value to display on each locator result card.                                                                                                                                                            |                                        |
| `filters`             | `{ openNowButton: boolean; showDistanceOptions: boolean; accentColor?: ThemeColor; facetFields?: MultiSelectorValue<string>; keywordsDisplayName?: TranslatableString; }`                                           | Configuration for the filters available in the locator search experience.                                                                                                                                                        |                                        |
| `locationStyles`      | `Array<{ entityType: LocatorEntityType; pinIcon?: { type: "none" \| "icon" \| "customImage"; iconName?: string; image?: TranslatableAssetImage; width?: number; aspectRatio?: number; }; pinColor?: ThemeColor; }>` | Props to customize the locator map pin styles. Controls map pin appearance depending on the result's entity type. The number of entries is locked to the locator entity types for the page set.                                  |                                        |
| `mapStartingLocation` | `{ latitude: string; longitude: string; }`                                                                                                                                                                          | The starting location for the map.                                                                                                                                                                                               |                                        |
| `mapStyle`            | `string`                                                                                                                                                                                                            | The visual theme for the map tiles, chosen from a predefined list of Mapbox styles.                                                                                                                                              | `'mapbox://styles/mapbox/streets-v12'` |
| `pageHeading`         | `{ title: TranslatableString; color?: ThemeColor; }`                                                                                                                                                                | Configuration for the locator page heading. Allows customizing the title text and its color.                                                                                                                                     |                                        |
| `resultCard`          | `Array<{ props: LocatorResultCardProps; }>`                                                                                                                                                                         | Props to customize the locator result card component. Controls which fields are displayed and their styling depending on the result's entity type. The number of entries is locked to the locator entity types for the page set. |                                        |

---

## MainContent

### Props

#### Other Props

| Prop      | Type   | Description | Default |
| :-------- | :----- | :---------- | :------ |
| `content` | `Slot` |             |         |

---

## Phone

### Props

The props for the Phone component

#### Other Props

| Prop     | Type                                                                                                                         | Description | Default |
| :------- | :--------------------------------------------------------------------------------------------------------------------------- | :---------- | :------ |
| `data`   | `{ number: YextEntityField<string>; label: TranslatableString; }`                                                            |             |         |
| `styles` | `{ phoneFormat: "domestic" \| "international"; includePhoneHyperlink: boolean; includeIcon?: boolean; color?: ThemeColor; }` |             |         |

---
