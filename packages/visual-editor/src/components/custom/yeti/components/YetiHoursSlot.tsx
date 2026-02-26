// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { HoursType } from "@yext/pages-components";
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
import { YetiHoursTable } from "../atoms/YetiHoursTable.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiHoursSlotProps {
  data: {
    heading: TranslatableString;
    hours: YextEntityField<HoursType>;
  };
  styles: {
    collapseDays: boolean;
    startOfWeek:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday"
      | "today";
  };
}

const fields: Fields<YetiHoursSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField("Heading", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      hours: YextField("Hours", {
        type: "entityField",
        filter: { types: ["type.hours"] },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      collapseDays: YextField("Collapse Days", {
        type: "radio",
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      }),
      startOfWeek: YextField("Start of Week", {
        type: "select",
        options: [
          { label: "Today", value: "today" },
          { label: "Monday", value: "monday" },
          { label: "Tuesday", value: "tuesday" },
          { label: "Wednesday", value: "wednesday" },
          { label: "Thursday", value: "thursday" },
          { label: "Friday", value: "friday" },
          { label: "Saturday", value: "saturday" },
          { label: "Sunday", value: "sunday" },
        ],
      }),
    },
  }),
};

const YetiHoursSlotComponent: PuckComponent<YetiHoursSlotProps> = ({
  data,
  styles,
  puck,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const heading = resolveComponentData(
    data.heading,
    i18n.language,
    streamDocument
  );
  const hours = resolveComponentData(data.hours, i18n.language, streamDocument);

  if (!hours) {
    return puck.isEditing ? <div className="min-h-[120px]" /> : null;
  }

  return (
    <div className="flex flex-col gap-4 text-[#0F3658]">
      {heading ? (
        <YetiHeading
          level={3}
          className="text-lg font-black uppercase tracking-[0.08em]"
        >
          {heading}
        </YetiHeading>
      ) : null}
      <EntityField
        displayName="Hours"
        fieldId={data.hours.field}
        constantValueEnabled={data.hours.constantValueEnabled}
      >
        <YetiHoursTable
          hours={hours}
          collapseDays={styles.collapseDays}
          startOfWeek={styles.startOfWeek}
          className="text-sm tracking-[0.02em]"
        />
      </EntityField>
    </div>
  );
};

export const defaultYetiHoursSlotProps: YetiHoursSlotProps = {
  data: {
    heading: toTranslatableString("Store Hours"),
    hours: {
      field: "hours",
      constantValue: {},
      constantValueEnabled: false,
    },
  },
  styles: {
    collapseDays: false,
    startOfWeek: "today",
  },
};

export const YetiHoursSlot: ComponentConfig<{ props: YetiHoursSlotProps }> = {
  label: "Yeti Hours Slot",
  fields,
  defaultProps: defaultYetiHoursSlotProps,
  render: (props) => <YetiHoursSlotComponent {...props} />,
};
