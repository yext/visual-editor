import { useTranslation } from "react-i18next";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@measured/puck";
import {
  msg,
  resolveDataFromParent,
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextField,
} from "@yext/visual-editor";
import { TimestampAtom, TimestampOption } from "../atoms/timestamp";

export type TimestampProps = {
  /** The start and end date to display */
  data: {
    /** An ISO formatted start date  */
    date: YextEntityField<string>;
    /** An ISO formatted end date  */
    endDate: YextEntityField<string>;
  };

  styles: {
    /** Whether to display just the date or the date and time */
    includeTime: "DATE" | "DATE_TIME";
    /** Whether to display an end date */
    includeRange: "_RANGE" | "";
  };

  /**
   * @internal Controlled data from the parent section.
   */
  parentData?: {
    field: string;
    date: string | undefined;
  };
};

const timestampFields: Fields<TimestampProps> = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
      date: YextField<any, string>(msg("fields.date", "Date"), {
        type: "entityField",
        filter: {
          types: ["type.datetime"],
        },
      }),
      endDate: YextField<any, string>(msg("fields.endDate", "End Date"), {
        type: "entityField",
        filter: {
          types: ["type.datetime"],
        },
      }),
    },
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      includeTime: {
        type: "radio",
        label: msg("fields.includeTime", "Include Time"),
        options: [
          { label: msg("fields.options.no", "No"), value: "DATE" },
          { label: msg("fields.options.yes", "Yes"), value: "DATE_TIME" },
        ],
      },
      includeRange: {
        type: "radio",
        label: msg("fields.includeRange", "Include Range"),
        options: [
          { label: msg("fields.options.no", "No"), value: "" },
          { label: msg("fields.options.yes", "Yes"), value: "_RANGE" },
        ],
      },
    },
  },
};

const TimestampComponent: PuckComponent<TimestampProps> = (props) => {
  const { data, styles, parentData } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const resolvedDate = parentData
    ? parentData.date
    : resolveYextEntityField(streamDocument, data.date);

  const resolvedEndDate = parentData
    ? ""
    : resolveYextEntityField(streamDocument, data.endDate);

  if (!resolvedDate) {
    return <></>;
  }

  return (
    <TimestampAtom
      date={resolvedDate}
      endDate={resolvedEndDate}
      option={
        (parentData
          ? styles.includeTime
          : styles.includeTime + styles.includeRange) as TimestampOption
      }
      locale={i18n.language}
      hideTimeZone
    />
  );
};

export const Timestamp: ComponentConfig<{ props: TimestampProps }> = {
  label: msg("components.timestamp", "Timestamp"),
  fields: timestampFields,
  defaultProps: {
    data: {
      date: {
        field: "",
        constantValue: "2022-12-12T14:00:00",
        constantValueEnabled: true,
      },
      endDate: {
        field: "",
        constantValue: "2022-12-12T15:00:00",
        constantValueEnabled: true,
      },
    },
    styles: {
      includeRange: "",
      includeTime: "DATE",
    },
  },
  resolveFields: (data) => {
    if (data.props.parentData) {
      let fields = resolveDataFromParent(timestampFields, data);
      return setDeep(fields, "styles.objectFields.includeRange.visible", false);
    }

    setDeep(timestampFields, "styles.objectFields.includeRange.visible", true);

    if (data.props.styles.includeRange === "_RANGE") {
      return setDeep(
        timestampFields,
        "data.objectFields.endDate.visible",
        true
      );
    }
    return setDeep(timestampFields, "data.objectFields.endDate.visible", false);
  },
  render: (props) => <TimestampComponent {...props} />,
};
