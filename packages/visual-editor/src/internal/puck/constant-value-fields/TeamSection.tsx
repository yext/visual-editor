import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { TeamSectionType, PersonStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { PHONE_CONSTANT_CONFIG } from "./Phone.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

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
  const { t } = usePlatformTranslation();

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
      name: {
        type: "text",
        label: t("Name", "Name"),
      },
      title: {
        type: "text",
        label: t("Title", "Title"),
      },
      phoneNumber: PHONE_CONSTANT_CONFIG,
      email: {
        type: "text",
        label: t("email", "Email"),
      },
      cta: ctaFields(),
    },
    getItemSummary: (item, i) =>
      item.name
        ? item.name
        : t("teamMember", "Team Member") + " " + ((i ?? 0) + 1),
  };
};
