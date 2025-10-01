import {
  CustomField,
  AutoField,
  UiState,
  ObjectField,
  FieldLabel,
} from "@measured/puck";
import {
  EventSectionType,
  EventStruct,
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { LINK_ONLY_CTA_CONFIG } from "./EnhancedCallToAction.tsx";
import { DateTimeSelector } from "../components/DateTimeSelector.tsx";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import React, { useMemo } from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { IMAGE_CONSTANT_CONFIG } from "./Image.tsx";

export const defaultEvent: EventStruct = {
  image: {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  title: { en: "Event Title", hasLocalizedValue: "true" },
  description: {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    hasLocalizedValue: "true",
  },
  dateTime: "2022-12-12T14:00:00",
  cta: {
    link: "#",
    label: { en: "Learn More", hasLocalizedValue: "true" },
    linkType: "URL",
    ctaType: "textAndLink",
  },
};

// const fillArray = <T,>(
//   array: T[],
//   newLength: number,
//   defaultObject: T
// ): T[] => {
//   // Handle invalid lengths
//   if (newLength < 0) {
//     return [];
//   }

//   const currentLength = array.length;

//   if (newLength === currentLength) {
//     // If the length is the same, return a copy of the original array
//     return [...array];
//   } else if (newLength < currentLength) {
//     // 1. Truncate the array (length y < length x)
//     // Use .slice(0, newLength) to get the first 'newLength' elements.
//     return array.slice(0, newLength);
//   } else {
//     // 2. Extend the array (length y > length x)
//     // Create an array of 'newLength - currentLength' default objects.
//     const defaultFill: T[] = Array(newLength - currentLength).fill(
//       defaultObject
//     );

//     // Combine the original array (all elements preserved) with the default objects.
//     return [...array, ...defaultFill];
//   }
// };

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
        <FieldLabel label={pt("numberOfCards", "Number of Cards")}>
          <AutoField
            field={{
              type: "number",
              min: 0,
            }}
            value={
              "numberOfConstantCards" in value ? value.numberOfConstantCards : 0
            }
            onChange={(newValue, uiState) => {
              onChange({ numberOfConstantCards: newValue }, uiState);
            }}
          />
        </FieldLabel>
      </div>
    );
  },
};

export const EVENT_CONSTANT_CONFIG = (): ObjectField<EventStruct> => {
  const titleField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("title", "Title"),
      { types: ["type.string"] }
    );
  }, []);

  const descriptionField = useMemo(() => {
    return TranslatableRichTextField<TranslatableRichText | undefined>(
      msg("fields.description", "Description")
    );
  }, []);

  return {
    type: "object",
    objectFields: {
      image: {
        ...IMAGE_CONSTANT_CONFIG,
        label: pt("fields.image", "Image"),
      },
      title: titleField,
      dateTime: DateTimeSelector,
      description: descriptionField,
      cta: LINK_ONLY_CTA_CONFIG,
    },
  };
};
