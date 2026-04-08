import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { Button } from "../internal/puck/ui/button.tsx";
import {
  type ComboboxOption,
  type ComboboxOptionGroup,
} from "../internal/types/combobox.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";

/**
  Example usage:

  import type { PuckComponent } from "@puckeditor/core";
  import { msg } from "../utils/i18n/platform.ts";
  import { YextComponentConfig, YextFields } from "./fields.ts";

  export type MyComponentProps = {
    foo: string;
  };

  const myComponentFields: YextFields<MyComponentProps> = {
    foo: {
      type: "basicSelector",
      label: msg("tone", "Tone"),
      options: [
        { label: "Neutral", value: "neutral" },
        { label: "Bold", value: "bold" },
      ],
      disableSearch: false,
    },
  };

  const MyComponentWrapper: PuckComponent<MyComponentProps> = ({ foo }) => {
    return <div>{foo}</div>;
  };

  export const MyComponent: YextComponentConfig<MyComponentProps> = {
    label: msg("components.myComponent", "My Component"),
    fields: myComponentFields,
    // resolveData: (data) => {...},
    render: (props) => <MyComponentWrapper {...props} />,
  };
 */

export type BasicSelectorField = BaseField & {
  type: "basicSelector";
  label?: string | MsgString;
  visible?: boolean;
  translateOptions?: boolean;
  noOptionsPlaceholder?: string | MsgString;
  noOptionsMessage?: string | MsgString;
  disableSearch?: boolean;
} & (
    | {
        options: ComboboxOption[];
        optionGroups?: never;
      }
    | {
        options?: never;
        optionGroups: ComboboxOptionGroup[];
      }
  );

type BasicSelectorFieldProps = FieldProps<BasicSelectorField> & {
  children: React.ReactNode;
};

export const BasicSelectorFieldOverride = ({
  field,
  value,
  onChange,
}: BasicSelectorFieldProps) => {
  const {
    label,
    options = [],
    optionGroups = [{ options }],
    translateOptions = true,
    noOptionsPlaceholder = pt(
      "basicSelectorNoOptionsLabel",
      "No options available"
    ),
    noOptionsMessage,
    disableSearch,
  } = field;

  const translatedOptionGroups = translateOptions
    ? optionGroups.map((group) => ({
        title: group.title && pt(group.title),
        description: group.description && pt(group.description),
        options: group.options.map((option) => ({
          ...option,
          label: pt(option.label),
        })),
      }))
    : optionGroups;

  const serializedOptions = translatedOptionGroups.reduce(
    (allOptions, group) => allOptions.concat(group.options),
    [] as ComboboxOption[]
  );
  const translatedLabel = label && pt(label);
  const noOptions = serializedOptions.length === 0;

  if (noOptions) {
    return (
      <>
        {translatedLabel && <FieldLabel label={translatedLabel} />}
        <Button variant="puckSelect" disabled={true}>
          {pt(noOptionsPlaceholder)}
        </Button>
        {noOptionsMessage && (
          <p className="ve-text-xs ve-mt-3">{pt(noOptionsMessage)}</p>
        )}
      </>
    );
  }

  const selector = (
    <Combobox
      selectedOption={
        serializedOptions.find(
          (option) => JSON.stringify(option.value) === JSON.stringify(value)
        ) ?? serializedOptions[0]
      }
      onChange={(selectedValue: string) => onChange(selectedValue)}
      optionGroups={translatedOptionGroups}
      disabled={noOptions}
      disableSearch={disableSearch}
    />
  );

  return translatedLabel ? (
    <FieldLabel label={translatedLabel}>{selector}</FieldLabel>
  ) : (
    selector
  );
};
