import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { EventSectionType, EventStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { DateTimeSelector } from "../components/DateTimeSelector.tsx";
import { pt } from "../../../utils/i18nPlatform.ts";

export const EVENT_SECTION_CONSTANT_CONFIG: CustomField<EventSectionType> = {
  type: "custom",
  render: ({
    onChange,
    value,
  }: {
    value: EventSectionType;
    onChange: (value: EventSectionType, uiState?: Partial<UiState>) => void;
  }) => {
    return (
      <div className={"ve-mt-4"}>
        <AutoField
          field={EventStructArrayField()}
          value={value.events}
          onChange={(newValue, uiState) =>
            onChange({ events: newValue }, uiState)
          }
        />
      </div>
    );
  },
};

const EventStructArrayField = (): ArrayField<EventStruct[]> => {
  return {
    label: pt("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      image: {
        type: "object",
        label: pt("image", "Image"),
        objectFields: {
          url: {
            label: pt("url", "URL"),
            type: "text",
          },
        },
      },
      title: {
        type: "text",
        label: pt("title", "Title"),
      },
      dateTime: DateTimeSelector,
      description: {
        type: "textarea",
        label: pt("description", "Description"),
      },
      cta: ctaFields(),
    },
    getItemSummary: (item, i) =>
      item.title ? item.title : pt("event", "Event") + " " + ((i ?? 0) + 1),
  };
};
