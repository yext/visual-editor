import { BaseField, FieldLabel, FieldProps } from "@puckeditor/core";
import { MsgString, pt } from "../../utils/i18n/platform.ts";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { withDefaultOption } from "./baseText.tsx";

export type StyledPageSectionValue = {
  contentWidth: string;
  verticalPadding: string;
};

export type StyledPageSectionField = BaseField & {
  type: "styledPageSection";
  label?: string | MsgString;
  visible?: boolean;
};

const defaultPageSectionValue: StyledPageSectionValue = {
  contentWidth: "default",
  verticalPadding: "default",
};

type StyledPageSectionFieldProps = FieldProps<
  StyledPageSectionField,
  StyledPageSectionValue
>;

export const StyledPageSectionFieldOverride = ({
  field,
  value,
  onChange,
}: StyledPageSectionFieldProps) => {
  const currentValue: StyledPageSectionValue = {
    ...defaultPageSectionValue,
    ...value,
  };
  const updateValue = <Key extends keyof StyledPageSectionValue>(
    key: Key,
    nextValue: StyledPageSectionValue[Key]
  ) => {
    onChange({
      ...currentValue,
      [key]: nextValue,
    });
  };

  const contentWidthOptions = withDefaultOption(
    ThemeOptions.MAX_WIDTH.map((option) => ({
      ...option,
      label: pt(option.label),
    }))
  );

  const verticalPaddingOptions = withDefaultOption(
    ThemeOptions.SPACING().map((option) => ({
      ...option,
      label: pt(option.label),
    }))
  );

  return (
    <div>
      {field.label && (
        <div className="ve-mb-3 ve-text-sm ve-font-medium">
          {pt(field.label)}
        </div>
      )}
      <div className="ObjectField">
        <div className="ObjectField-fieldset ve-flex ve-flex-col ve-gap-3">
          <FieldLabel
            label={pt("theme.contentWidth.contentWidth", "Content Width")}
          >
            <Combobox
              selectedOption={
                contentWidthOptions.find(
                  (option) => option.value === currentValue.contentWidth
                ) ?? contentWidthOptions[0]
              }
              onChange={(nextValue) => updateValue("contentWidth", nextValue)}
              optionGroups={[{ options: contentWidthOptions }]}
              disableSearch
            />
          </FieldLabel>
          <FieldLabel
            label={pt("theme.topBottomPadding", "Top/Bottom Padding")}
          >
            <Combobox
              selectedOption={
                verticalPaddingOptions.find(
                  (option) => option.value === currentValue.verticalPadding
                ) ?? verticalPaddingOptions[0]
              }
              onChange={(nextValue) =>
                updateValue("verticalPadding", nextValue)
              }
              optionGroups={[{ options: verticalPaddingOptions }]}
              disableSearch
            />
          </FieldLabel>
        </div>
      </div>
    </div>
  );
};
