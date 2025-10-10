import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import { HoursType } from "@yext/pages-components";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  YextField,
  msg,
  pt,
  HoursStatusAtom,
} from "@yext/visual-editor";

export interface HoursStatusProps {
  data: {
    hours: YextEntityField<HoursType>;
  };
  styles: {
    showCurrentStatus?: boolean;
    timeFormat?: "12h" | "24h";
    dayOfWeekFormat?: "short" | "long";
    showDayNames?: boolean;
    className?: string;
  };
}

const hoursStatusWrapperFields: Fields<HoursStatusProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      hours: YextField(msg("fields.hours", "Hours"), {
        type: "entityField",
        filter: {
          types: ["type.hours"],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showCurrentStatus: YextField(
        msg("fields.showCurrentStatus", "Show Current Status"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        }
      ),
      timeFormat: YextField(msg("fields.timeFormat", "Time Format"), {
        type: "radio",
        options: [
          { label: msg("fields.options.hour12", "12-hour"), value: "12h" },
          { label: msg("fields.options.hour24", "24-hour"), value: "24h" },
        ],
      }),
      showDayNames: YextField(msg("fields.showDayNames", "Show Day Names"), {
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      }),
      dayOfWeekFormat: YextField(
        msg("fields.dayOfWeekFormat", "Day of Week Format"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.short", "Short"), value: "short" },
            { label: msg("fields.options.long", "Long"), value: "long" },
          ],
        }
      ),
    },
  }),
};

const HoursStatusWrapper: PuckComponent<HoursStatusProps> = ({
  data,
  styles,
  puck,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const hours = resolveComponentData(data.hours, i18n.language, streamDocument);

  return hours ? (
    <EntityField
      displayName={pt("hours", "Hours")}
      fieldId={data.hours.field}
      constantValueEnabled={data.hours.constantValueEnabled}
    >
      <HoursStatusAtom
        hours={hours}
        className={styles.className}
        showCurrentStatus={styles.showCurrentStatus}
        showDayNames={styles.showDayNames}
        timeFormat={styles.timeFormat}
        dayOfWeekFormat={styles.dayOfWeekFormat}
      />
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-10" />
  ) : (
    <></>
  );
};

export const HoursStatus: ComponentConfig<HoursStatusProps> = {
  label: msg("components.hoursStatus", "Hours Status"),
  fields: hoursStatusWrapperFields,
  defaultProps: {
    data: {
      hours: {
        field: "hours",
        constantValue: {},
      },
    },
    styles: {
      showCurrentStatus: true,
      timeFormat: "12h",
      showDayNames: true,
      dayOfWeekFormat: "long",
      className: "",
    },
  },
  render: (props) => <HoursStatusWrapper {...props} />,
};
