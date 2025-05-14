import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { TeamSectionType, PersonStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";

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
      <div
        className={
          "ve-mt-4" + (value.people.length === 0 ? " empty-array-fix" : "")
        }
      >
        <AutoField
          field={PersonStructArrayField}
          value={value.people}
          onChange={(newValue, uiState) =>
            onChange({ people: newValue }, uiState)
          }
        />
      </div>
    );
  },
};

const PersonStructArrayField: ArrayField<PersonStruct[]> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    headshot: {
      type: "object",
      label: "Headshot",
      objectFields: {
        url: {
          label: "URL",
          type: "text",
        },
      },
    },
    name: {
      type: "text",
      label: "Name",
    },
    title: {
      type: "text",
      label: "Title",
    },
    phoneNumber: {
      type: "text",
      label: "Phone Number",
    },
    email: {
      type: "text",
      label: "Email",
    },
    cta: ctaFields,
  },
  getItemSummary: (item, i) => item.name ?? "Team Member " + ((i ?? 0) + 1),
};
