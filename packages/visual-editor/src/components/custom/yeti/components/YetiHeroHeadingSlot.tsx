// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  TranslatableString,
  YextEntityField,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiHeading } from "../atoms/YetiHeading.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiHeroHeadingSlotProps {
  data: {
    heading: YextEntityField<TranslatableString>;
  };
  styles: {
    level: 1 | 2 | 3 | 4;
    align: "left" | "center";
  };
}

const fields: Fields<YetiHeroHeadingSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<unknown, TranslatableString>("Heading", {
        type: "entityField",
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
          { label: "H1", value: 1 },
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

const YetiHeroHeadingSlotComponent: PuckComponent<YetiHeroHeadingSlotProps> = ({
  data,
  styles,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const heading = resolveComponentData(
    data.heading,
    i18n.language,
    streamDocument
  );

  if (!heading) {
    return null;
  }

  return (
    <EntityField
      displayName="Heading"
      fieldId={data.heading.field}
      constantValueEnabled={data.heading.constantValueEnabled}
    >
      <YetiHeading
        level={styles.level}
        className={`font-black uppercase tracking-[0.2em] ${styles.align === "center" ? "text-center" : "text-left"}`}
      >
        {heading}
      </YetiHeading>
    </EntityField>
  );
};

export const defaultYetiHeroHeadingSlotProps: YetiHeroHeadingSlotProps = {
  data: {
    heading: {
      field: "name",
      constantValue: toTranslatableString("YETI Store"),
      constantValueEnabled: false,
    },
  },
  styles: {
    level: 1,
    align: "left",
  },
};

export const YetiHeroHeadingSlot: ComponentConfig<{
  props: YetiHeroHeadingSlotProps;
}> = {
  label: "Yeti Hero Heading Slot",
  fields,
  defaultProps: defaultYetiHeroHeadingSlotProps,
  render: (props) => <YetiHeroHeadingSlotComponent {...props} />,
};
