import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  TeamSectionType,
  PersonStruct,
  TranslatableString,
} from "../../../types/types.ts";
import { translatableCTAFields } from "./CallToAction.tsx";
import { PHONE_CONSTANT_CONFIG } from "./Phone.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { useMemo } from "react";
import { generateTranslatableConstantConfig } from "./Text.tsx";
import { resolveTranslatableString } from "@yext/visual-editor";

export const TEAM_SECTION_CONSTANT_CONFIG: CustomField<TeamSectionType> = {
  type: "custom",
  render: ({
    onChange,
    value,
  }: {
    value: TeamSectionType;
    onChange: (value: TeamSectionType, uiState?: Partial<UiState>) => void;
  }) => {
    return (
      <div className={"ve-mt-4"}>
        <AutoField
          field={PersonStructArrayField()}
          value={value.people}
          onChange={(newValue, uiState) =>
            onChange({ people: newValue }, uiState)
          }
        />
      </div>
    );
  },
};

const PersonStructArrayField = (): ArrayField<PersonStruct[]> => {
  const { t, i18n } = usePlatformTranslation();

  const nameField = useMemo(() => {
    return generateTranslatableConstantConfig<TranslatableString | undefined>(
      {
        key: "name",
        options: {
          defaultValue: "Name",
        },
      },
      "text"
    );
  }, []);

  const titleField = useMemo(() => {
    return generateTranslatableConstantConfig<TranslatableString | undefined>(
      {
        key: "title",
        options: {
          defaultValue: "Title",
        },
      },
      "text"
    );
  }, []);

  return {
    label: t("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      headshot: {
        type: "object",
        label: t("headshot", "Headshot"),
        objectFields: {
          url: {
            label: t("url", "URL"),
            type: "text",
          },
        },
      },
      name: nameField,
      title: titleField,
      phoneNumber: PHONE_CONSTANT_CONFIG,
      email: {
        type: "text",
        label: t("email", "Email"),
      },
      cta: translatableCTAFields(),
    },
    getItemSummary: (item, i) => {
      const translation = resolveTranslatableString(item.name, i18n.language);
      if (translation) {
        return translation;
      }
      return t("teamMember", "Team Member") + " " + ((i ?? 0) + 1);
    },
  };
};
