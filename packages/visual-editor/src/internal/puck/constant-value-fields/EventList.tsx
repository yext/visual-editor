import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { EventSectionType, EventStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { DateTimeSelector } from "../components/DateTimeSelector.tsx";

export const EVENT_LIST_CONSTANT_CONFIG: CustomField<EventSectionType> = {
  type: "custom",
  render: ({
    onChange,
    value,
  }: {
    value: EventSectionType;
    onChange: (value: EventSectionType, uiState?: Partial<UiState>) => void;
  }) => {
    return (
      <div
        className={
          "mt-4" + (value.events.length === 0 ? " empty-array-fix" : "")
        }
      >
        <AutoField
          field={EventStructArrayField}
          value={value.events}
          onChange={(newValue, uiState) =>
            onChange({ events: newValue }, uiState)
          }
        />
      </div>
    );
  },
};

const EventStructArrayField: ArrayField<EventStruct[]> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    image: {
      type: "object",
      label: "Image",
      objectFields: {
        url: {
          label: "URL",
          type: "text",
        },
      },
    },
    title: {
      type: "text",
      label: "Title",
    },
    dateTime: DateTimeSelector,
    description: {
      type: "textarea",
      label: "Description",
    },
    cta: ctaFields,
  },
  getItemSummary: (item, i) => item.title ?? "Event " + ((i ?? 0) + 1),
};
