import {
  ArrayField,
  CustomField,
  AutoField,
  UiState,
  FieldLabel,
} from "@measured/puck";
import {
  EventSectionType,
  EventStruct,
  TranslatableRTF2,
  TranslatableString,
} from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { DateTimeSelector } from "../components/DateTimeSelector.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { getDisplayValue } from "../../../utils/resolveTranslatableString.ts";
import React from "react";

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
  const { t } = usePlatformTranslation();
  const document: any = useDocument();
  const locale = document?.locale ?? "en";

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
      title: {
        type: "custom",
        label: "Title",
        render: ({ onChange, value }) => {
          return (
            <FieldLabel label={t("title", "Title")}>
              <AutoField
                field={{ type: "text" }}
                value={getDisplayValue(value, locale)}
                onChange={(val) =>
                  onChange({
                    ...(typeof value === "object" && !Array.isArray(value)
                      ? value
                      : {}),
                    [locale]: val,
                  })
                }
              />
            </FieldLabel>
          );
        },
      } as CustomField<TranslatableString | undefined>,
      dateTime: DateTimeSelector,
      description: {
        type: "custom",
        label: "Description",
        render: ({ onChange, value }) => {
          return (
            <FieldLabel label={t("description", "Description")}>
              <AutoField
                field={{ type: "textarea" }}
                value={getDisplayValue(value, locale)}
                onChange={(val) =>
                  onChange({
                    ...(typeof value === "object" && !Array.isArray(value)
                      ? value
                      : {}),
                    [locale]: val,
                  })
                }
              />
            </FieldLabel>
          );
        },
      } as CustomField<TranslatableRTF2 | undefined>,
      cta: ctaFields(),
    },
    getItemSummary: (item, i) => t("event", "Event") + " " + ((i ?? 0) + 1),
  };
};
