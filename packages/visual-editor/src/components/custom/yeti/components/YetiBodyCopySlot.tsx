// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiParagraph } from "../atoms/YetiParagraph.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiBodyCopySlotProps {
  data: {
    copy: TranslatableString;
  };
  styles: {
    align: "left" | "center";
  };
}

const fields: Fields<YetiBodyCopySlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      copy: YextField("Copy", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
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

const YetiBodyCopySlotComponent: PuckComponent<YetiBodyCopySlotProps> = ({
  data,
  styles,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const copy = resolveComponentData(data.copy, i18n.language, streamDocument);
  if (!copy) {
    return null;
  }

  return (
    <YetiParagraph
      className={`text-base leading-relaxed ${styles.align === "center" ? "text-center" : "text-left"}`}
    >
      {copy}
    </YetiParagraph>
  );
};

export const defaultYetiBodyCopySlotProps: YetiBodyCopySlotProps = {
  data: {
    copy: toTranslatableString(
      "Choose from 9 different fonts and 12 design galleries to make your drinkware your own."
    ),
  },
  styles: {
    align: "left",
  },
};

export const YetiBodyCopySlot: ComponentConfig<{
  props: YetiBodyCopySlotProps;
}> = {
  label: "Yeti Body Copy Slot",
  fields,
  defaultProps: defaultYetiBodyCopySlotProps,
  render: (props) => <YetiBodyCopySlotComponent {...props} />,
};
