import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  InsuranceProvidersSectionType,
  InsuranceProvidersStruct,
} from "../../../types/types.ts";

export const INSURANCE_PROVIDERS_SECTION_CONSTANT_CONFIG: CustomField<InsuranceProvidersSectionType> =
  {
    type: "custom",
    render: ({
      onChange,
      value,
    }: {
      value: InsuranceProvidersSectionType;
      onChange: (
        value: InsuranceProvidersSectionType,
        uiState?: Partial<UiState>
      ) => void;
    }) => {
      return (
        <div
          className={
            "ve-mt-4" +
            (value.insuranceProviders.length === 0 ? " empty-array-fix" : "")
          }
        >
          <AutoField
            field={InsuranceProvidersStructArrayField}
            value={value.insuranceProviders}
            onChange={(newValue, uiState) =>
              onChange({ insuranceProviders: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const InsuranceProvidersStructArrayField: ArrayField<
  InsuranceProvidersStruct[]
> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    title: {
      type: "text",
      label: "Name",
    },
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
  },
  getItemSummary: (item, i) =>
    item.title ?? "Insurance Provider " + ((i ?? 0) + 1),
};
