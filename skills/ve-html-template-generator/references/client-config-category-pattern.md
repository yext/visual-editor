# Client Config and Category Pattern

Use this pattern to keep client templates isolated, slot-based, and visible in both package `mainConfig` and starter `/edit`.

## Goal

- Keep custom section/slot/atom implementation in package custom paths.
- Expose client sections in one visible left-nav category.
- Register client slot components in one hidden category.
- Keep starter as a consumer of package config, not the source of truth.
- Ensure every `type: "<Client...Slot>"` referenced in section defaults is present in slot category component maps.

## Package Category Files

Add:

- `packages/visual-editor/src/components/categories/<Client>SectionsCategory.tsx`
- `packages/visual-editor/src/components/categories/<Client>SlotsCategory.tsx`

Pattern:

```tsx
import {
  YetiHeaderSection,
  YetiHeaderSectionProps,
} from "../custom/yeti/components/YetiHeaderSection.tsx";

export interface YetiSectionsCategoryProps {
  YetiHeaderSection: YetiHeaderSectionProps;
}

export const YetiSectionsCategoryComponents = {
  YetiHeaderSection,
};

export const YetiSectionsCategory = Object.keys(
  YetiSectionsCategoryComponents,
) as (keyof YetiSectionsCategoryProps)[];
```

Apply the same shape for slots category files.

Slot registration rule:

- If a section default uses `type: "YetiHoursSlot"`, then `YetiHoursSlot` must be included in `YetiSlotsCategoryComponents`.

## Starter Client Config Example

`starter/src/templates/<client>/<client>-config.tsx` should import category/component maps from `@yext/visual-editor`:

```tsx
import { Config, DropZone } from "@puckeditor/core";
import {
  YetiSectionsCategory,
  YetiSectionsCategoryComponents,
  YetiSectionsCategoryProps,
  YetiSlotsCategory,
  YetiSlotsCategoryComponents,
  YetiSlotsCategoryProps,
} from "@yext/visual-editor";

export interface YetiTemplateProps
  extends YetiSectionsCategoryProps,
    YetiSlotsCategoryProps {}

export const yetiConfig: Config<YetiTemplateProps> = {
  components: {
    ...YetiSectionsCategoryComponents,
    ...YetiSlotsCategoryComponents,
  },
  categories: {
    yetiSections: {
      title: "Yeti Sections",
      components: YetiSectionsCategory,
    },
    yetiSlots: {
      components: YetiSlotsCategory,
      visible: false,
    },
  },
  root: {
    render: () => (
      <DropZone
        zone="default-zone"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      />
    ),
  },
};
```

## Package MainConfig Integration

To make generated sections available in default `main` template flow:

1. Export new category files from `packages/visual-editor/src/components/categories/index.ts`.
2. Register `<Client>SectionsCategoryComponents` and `<Client>SlotsCategoryComponents` in `packages/visual-editor/src/components/configs/mainConfig.tsx`.
3. Add one visible `<client>Sections` and one hidden `<client>Slots` category in `mainConfig.categories`.
4. Keep `directoryConfig` and `locatorConfig` unchanged unless explicitly requested.

## Starter Editor Integration

When `starter/src/ve.config.tsx` exists:

1. Keep `devConfig` based on `...mainConfig.components` and `...mainConfig.categories`.
2. Add `<client>-location` -> `<client>Config` in `componentRegistry`.
3. Avoid starter-local ownership of client categories/components when package `mainConfig` already includes them.

Do not add slot categories to visible starter nav categories.

## Notes

- Keep category IDs deterministic (`<client>Sections`, `<client>Slots`).
- Keep section category titles human-readable (`Yeti Sections`).
- Include header and footer sections in the visible section category.
