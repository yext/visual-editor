// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiHeading } from "../atoms/YetiHeading.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiSectionHeadingSlotProps {
  data: {
    text: TranslatableString;
  };
  styles: {
    level: 2 | 3 | 4;
    align: "left" | "center";
  };
}

const fields: Fields<YetiSectionHeadingSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      text: YextField("Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      level: YextField("Level", {
        type: "select",
        options: [
          { label: "H2", value: 2 },
          { label: "H3", value: 3 },
          { label: "H4", value: 4 },
        ],
      }),
      align: YextField("Align", {
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
        ],
      }),
    },
  }),
};

const YetiSectionHeadingSlotComponent: PuckComponent<
  YetiSectionHeadingSlotProps
> = ({ data, styles }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const text = resolveComponentData(data.text, i18n.language, streamDocument);

  if (!text) {
    return null;
  }

  return (
    <YetiHeading
      level={styles.level}
      className={`${styles.align === "center" ? "text-center" : "text-left"} font-black uppercase tracking-[0.1em]`}
    >
      {text}
    </YetiHeading>
  );
};

export const defaultYetiSectionHeadingSlotProps: YetiSectionHeadingSlotProps = {
  data: {
    text: toTranslatableString("Section Heading"),
  },
  styles: {
    level: 2,
    align: "left",
  },
};

export const YetiSectionHeadingSlot: ComponentConfig<{
  props: YetiSectionHeadingSlotProps;
}> = {
  label: "Yeti Section Heading Slot",
  fields,
  defaultProps: defaultYetiSectionHeadingSlotProps,
  render: (props) => <YetiSectionHeadingSlotComponent {...props} />,
};
