---
title: Components
outline: 2
---

## VideoSection

The Video Section is used to display an embedded YouTube video. Available on Location templates.

### Props

#### Data Props

This object contains the content to be displayed by the component.

| Prop              | Type                                  | Description                             | Default         |
| :---------------- | :------------------------------------ | :-------------------------------------- | :-------------- |
| `data.assetVideo` | `AssetVideo \| undefined`             | The embedded YouTube video              |                 |
| `data.heading`    | `YextEntityField<TranslatableString>` | The main heading for the video section. | `"" (constant)` |

#### Style Props

This object contains properties for customizing the component's appearance.

| Prop                     | Type                                                             | Description                                                           | Default              |
| :----------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------- |
| `styles.backgroundColor` | `BackgroundStyle`                                                | The background color for the entire section, selected from the theme. | `Background Color 1` |
| `styles.heading`         | `{ level: HeadingLevel; align: "left" \| "center" \| "right"; }` | Styling for the main section heading.                                 |                      |

#### Other Props

If 'true', the component is visible on the live page; if 'false', it's hidden.

| Prop             | Type      | Description                                                                    | Default |
| :--------------- | :-------- | :----------------------------------------------------------------------------- | :------ |
| `liveVisibility` | `boolean` | If 'true', the component is visible on the live page; if 'false', it's hidden. | `true`  |

---
