import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  EventSectionType,
  EventStruct,
  TranslatableRTF2,
  TranslatableString,
} from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { DateTimeSelector } from "../components/DateTimeSelector.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";
import React from "react";
import { generateTranslatableConstantConfig } from "./Text.tsx";

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
  const { t, i18n } = usePlatformTranslation();

  return {
    label: t("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      image: {
        type: "object",
        label: t("image", "Image"),
        objectFields: {
          url: {
            label: t("url", "URL"),
            type: "text",
          },
        },
      },
      title: generateTranslatableConstantConfig<TranslatableString | undefined>(
        { key: "title", defaultValue: "Title" },
        "text"
      ),
      dateTime: DateTimeSelector,
      description: generateTranslatableConstantConfig<
        TranslatableRTF2 | undefined
      >({ key: "description", defaultValue: "Description" }, "textarea"),
      cta: ctaFields(),
    },
    getItemSummary: (item, i): string => {
      if (item?.title) {
        return resolveTranslatableString(item.title, i18n.language);
      }
      return t("event", "Event") + " " + ((i ?? 0) + 1);
    },
  };
};
