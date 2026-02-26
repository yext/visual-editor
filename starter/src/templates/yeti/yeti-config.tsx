import { Config, DropZone } from "@puckeditor/core";
import {
  YetiSectionsCategory,
  YetiSectionsCategoryComponents,
  YetiSectionsCategoryProps,
} from "@yext/visual-editor";
import {
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
