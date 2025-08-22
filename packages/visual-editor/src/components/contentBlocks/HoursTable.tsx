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

export interface HoursTableProps {
  data: {
    hours: YextEntityField<HoursType>;
  };
  styles: {
    startOfWeek: keyof DayOfWeekNames | "today";
    collapseDays: boolean;
    showAdditionalHoursText: boolean;
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
  startOfWeek: YextField(msg("fields.startOfTheWeek", "Start of the Week"), {
    type: "select",
    hasSearch: true,
    options: "HOURS_OPTIONS",
  }),
  collapseDays: YextField(msg("fields.collapseDays", "Collapse Days"), {
    type: "radio",
    options: [
      { label: msg("fields.options.yes", "Yes"), value: true },
      { label: msg("fields.options.no", "No"), value: false },
    ],
  }),
  showAdditionalHoursText: YextField(
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

export const HoursTable: ComponentConfig<HoursTableProps> = {
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
