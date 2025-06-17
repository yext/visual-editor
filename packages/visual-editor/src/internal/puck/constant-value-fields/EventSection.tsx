import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  EventSectionType,
  EventStruct,
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { translatableCTAFields } from "./CallToAction.tsx";
import { DateTimeSelector } from "../components/DateTimeSelector.tsx";
import { msg, usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";
import React, { useMemo } from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";

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

  const titleField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("title", "Title"),
      "text"
    );
  }, []);

  const descriptionField = useMemo(() => {
    return TranslatableRichTextField<TranslatableRichText | undefined>(
      msg("fields.description", "Description")
    );
  }, []);

  return {
    label: t("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      image: {
        type: "object",
        label: t("fields.image", "Image"),
        objectFields: {
          url: {
            label: t("fields.url", "URL"),
            type: "text",
          },
        },
      },
      title: titleField,
      dateTime: DateTimeSelector,
      description: descriptionField,
      cta: translatableCTAFields(),
    },
    getItemSummary: (item, i): string => {
      const translation = resolveTranslatableString(item.title, i18n.language);
      if (translation) {
        return translation;
      }
      return t("event", "Event") + " " + ((i ?? 0) + 1);
    },
  };
};
