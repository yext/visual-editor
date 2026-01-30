import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { HoursType } from "@yext/pages-components";
import { useDocument } from "../../hooks/useDocument";
import { resolveComponentData } from "../../utils/resolveComponentData";
import { EntityField } from "../../editor/EntityField";
import { YextEntityField } from "../../editor/YextEntityFieldSelector";
import { YextField } from "../../editor/YextField";
import { msg, pt } from "../../utils/i18n/platform";
import { HoursStatusAtom } from "../atoms/hoursStatus";
import { resolveDataFromParent } from "../../editor/ParentData";

export interface HoursStatusProps {
  data: {
    /** The hours field to display the status for */
    hours: YextEntityField<HoursType>;
  };

  styles: {
    /** Whether to show the open status ("Open Now" or "Closed") */
    showCurrentStatus?: boolean;
    /** The time format to use */
    timeFormat?: "12h" | "24h";
    /** The day of week format ("Mon" vs. "Monday") */
    dayOfWeekFormat?: "short" | "long";
    /** Whether to show day names ("Monday", "Tuesday") */
    showDayNames?: boolean;
    /** Additional class names to apply to the underlying component */
    className?: string;
    /** The body size variant */
    bodyVariant?: "lg" | "base" | "sm";
  };

  /** @internal */
  parentData?: {
    field: string;
    hours: HoursType;
    timezone: string;
  };
}

export const hoursStatusWrapperFields: Fields<HoursStatusProps> = {
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
  parentData,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const hours = parentData
    ? parentData.hours
    : resolveComponentData(data.hours, i18n.language, streamDocument);

  return hours ? (
    <EntityField
      displayName={parentData ? parentData.field : pt("hours", "Hours")}
      fieldId={data.hours.field}
      constantValueEnabled={!parentData && data.hours.constantValueEnabled}
    >
      <HoursStatusAtom
        hours={hours}
        timezone={parentData?.timezone}
        className={styles.className}
        showCurrentStatus={styles.showCurrentStatus}
        showDayNames={styles.showDayNames}
        timeFormat={styles.timeFormat}
        dayOfWeekFormat={styles.dayOfWeekFormat}
        bodyVariant={styles.bodyVariant}
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
  resolveFields: (data) =>
    resolveDataFromParent(hoursStatusWrapperFields, data),
  render: (props) => <HoursStatusWrapper {...props} />,
};
