import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  TeamSectionType,
  PersonStruct,
  TranslatableString,
} from "../../../types/types.ts";
import { translatableCTAFields } from "./CallToAction.tsx";
import { PHONE_CONSTANT_CONFIG } from "./Phone.tsx";
import { msg, usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { useMemo } from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";

export const defaultPerson: PersonStruct = {
  name: { en: "First Last", hasLocalizedValue: "true" },
  title: { en: "Associate Agent", hasLocalizedValue: "true" },
  phoneNumber: "(202) 770-6619 ",
  email: "jkelley@[company].com",
  cta: {
    label: { en: "Visit Profile", hasLocalizedValue: "true" },
    link: "#",
    linkType: "URL",
  },
  headshot: {
    url: "https://placehold.co/80x80",
    height: 80,
    width: 80,
  },
};

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
  const document = useDocument();

  const nameField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("fields.name", "Name"),
      { types: ["type.string"] }
    );
  }, []);

  const titleField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("fields.title", "Title"),
      { types: ["type.string"] }
    );
  }, []);

  return {
    label: t("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      headshot: {
        type: "object",
        label: t("fields.headshot", "Headshot"),
        objectFields: {
          url: {
            label: t("fields.url", "URL"),
            type: "text",
          },
        },
      },
      name: nameField,
      title: titleField,
      phoneNumber: PHONE_CONSTANT_CONFIG,
      email: {
        type: "text",
        label: t("fields.email", "Email"),
      },
      cta: translatableCTAFields(),
    },
    defaultItemProps: defaultPerson,
    getItemSummary: (item, i) => {
      const translation =
        item?.name && resolveComponentData(item.name, i18n.language, document);
      if (translation) {
        return translation;
      }
      return t("teamMember", "Team Member") + " " + ((i ?? 0) + 1);
    },
  };
};
