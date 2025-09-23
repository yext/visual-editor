import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import { DayOfWeekNames, HoursType } from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  EntityField,
  HoursTableAtom,
  resolveComponentData,
  useDocument,
  YextEntityField,
  YextField,
  msg,
  pt,
} from "@yext/visual-editor";

/** Props for the HoursTable component. */
export interface HoursTableProps {
  data: {
    /** The hours data to display in the table. */
    hours: YextEntityField<HoursType>;
  };
  styles: {
    /**
     * The day of week to display at the top of the table.
     * If set to "today", the current day will dynamically be at the top.
     */
    startOfWeek: keyof DayOfWeekNames | "today";
    /** If true, consecutive days that have the same hours will be collapsed into one row. */
    collapseDays: boolean;
    /** Shows the showAdditionalHoursText subfield from the hours field, if present */
    showAdditionalHoursText: boolean;
    /** Alignment of the text in the hours table */
    alignment: "items-start" | "items-center";
  };
}

// HoursTable data field used in HoursTable and CoreInfoSection
export const HoursTableDataField = YextField<any, HoursType>(
  msg("fields.hours", "Hours"),
  {
    type: "entityField",
    filter: {
      types: ["type.hours"],
    },
  }
);

// HoursTable style fields used in HoursTable and CoreInfoSection
export const HoursTableStyleFields = {
  startOfWeek: YextField<keyof DayOfWeekNames | "today">(
    msg("fields.startOfTheWeek", "Start of the Week"),
    {
      type: "select",
      hasSearch: true,
      options: "HOURS_OPTIONS",
    }
  ),
  collapseDays: YextField<boolean>(
    msg("fields.collapseDays", "Collapse Days"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
  showAdditionalHoursText: YextField<boolean>(
    msg("fields.options.showAdditionalHoursText", "Show additional hours text"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
};

const hoursTableFields: Fields<HoursTableProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      hours: HoursTableDataField,
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      ...HoursTableStyleFields,
      alignment: YextField(msg("fields.alignCard", "Align card"), {
        type: "radio",
        options: [
          { label: msg("fields.options.left", "Left"), value: "items-start" },
          {
            label: msg("fields.options.center", "Center"),
            value: "items-center",
          },
        ],
      }),
    },
  }),
};

const VisualEditorHoursTable = ({ data, styles }: HoursTableProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const hours = resolveComponentData(data.hours, i18n.language, streamDocument);

  const { additionalHoursText } = streamDocument as {
    additionalHoursText: string;
  };

  return (
    <div className={`flex flex-col ${styles.alignment}`}>
      {hours && (
        <EntityField
          displayName={pt("hours", "Hours")}
          fieldId="hours"
          constantValueEnabled={data.hours.constantValueEnabled}
        >
          <HoursTableAtom
            hours={hours}
            startOfWeek={styles.startOfWeek}
            collapseDays={styles.collapseDays}
          />
        </EntityField>
      )}
      {additionalHoursText && styles.showAdditionalHoursText && (
        <EntityField
          displayName={pt("hoursText", "Hours Text")}
          fieldId="additionalHoursText"
        >
          <div className="mt-4 text-body-sm-fontSize">
            {additionalHoursText}
          </div>
        </EntityField>
      )}
    </div>
  );
};

export const HoursTable: ComponentConfig<{ props: HoursTableProps }> = {
  fields: hoursTableFields,
  defaultProps: {
    data: {
      hours: {
        field: "hours",
        constantValue: {},
      },
    },
    styles: {
      startOfWeek: "today",
      collapseDays: false,
      showAdditionalHoursText: true,
      alignment: "items-center",
    },
  },
  label: msg("components.hoursTable", "Hours Table"),
  render: (props: HoursTableProps) => <VisualEditorHoursTable {...props} />,
};

export const HoursTableLocked: ComponentConfig<{ props: HoursTableProps }> = {
  ...HoursTable,
  permissions: {
    drag: false,
    duplicate: false,
    delete: false,
    edit: true,
    insert: false,
  },
};
