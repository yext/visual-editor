import React from "react";
import { useDocument, useEntityFields } from "../hooks/index.ts";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import {
  getFieldsForSelector,
  type YextEntityField,
} from "./yextEntityFieldUtils.ts";
import { pt, resolveComponentData } from "../utils/index.ts";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInputRounded,
  CommandItem,
  CommandList,
} from "../internal/puck/ui/Command.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../internal/puck/ui/Popover.tsx";
import { SquarePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * A debounced string input that allows embedding entity fields via a popover selector.
 */
export const EmbeddedFieldStringInputFromEntity = <
  T extends Record<string, any>,
>({
  value,
  onChange,
  filter,
  showFieldSelector = true,
}: {
  value: string;
  onChange: (value: string) => void;
  filter: RenderEntityFieldFilter<T>;
  showFieldSelector: boolean;
}) => {
  const entityFields = useEntityFields();

  const entityFieldOptions = React.useMemo(() => {
    const filteredEntityFields = getFieldsForSelector(entityFields, filter);
    return filteredEntityFields.map((field) => {
      return {
        label: field.displayName ?? field.name,
        value: field.name,
      };
    });
  }, [entityFields, filter]);

  return (
    <EmbeddedFieldStringInputFromOptions
      value={value}
      onChange={onChange}
      options={entityFieldOptions}
      showFieldSelector={showFieldSelector}
      useOptionValueSublabel={false}
    />
  );
};

const commitChanges = (
  currentValue: string,
  originalValue: string,
  onChange: (value: string) => void
) => {
  if (currentValue !== originalValue) {
    onChange(currentValue);
  }
};

export const EmbeddedFieldStringInputFromOptions = ({
  value,
  onChange,
  options,
  showFieldSelector,
  useOptionValueSublabel = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  showFieldSelector: boolean;
  useOptionValueSublabel?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState<number | null>(
    null
  );
  const [inputValue, setInputValue] = React.useState(value);
  const [prevPropValue, setPrevPropValue] = React.useState(value);

  if (value !== prevPropValue) {
    setPrevPropValue(value);
    setInputValue(value);
  }

  const inputValueRef = React.useRef(inputValue);
  const onChangeRef = React.useRef(onChange);
  const valueRef = React.useRef(value);

  if (value === prevPropValue) {
    inputValueRef.current = inputValue;
    onChangeRef.current = onChange;
    valueRef.current = value;
  }

  // Debounce the call to the parent onChange handler
  React.useEffect(() => {
    const handler = setTimeout(() => {
      commitChanges(inputValue, value, onChange);
    }, 800); // 800ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onChange, value]);

  // Ensure changes are saved when the component unmounts
  React.useEffect(() => {
    return () => {
      commitChanges(
        inputValueRef.current,
        valueRef.current,
        onChangeRef.current
      );
    };
  }, []);

  const fieldOptions = React.useMemo(() => {
    return options;
  }, [options]);

  const handleFieldSelect = (fieldName: string) => {
    setOpen(false);
    if (!fieldName) return;
    const textToInsert = `[[${fieldName}]]`;
    let insertionPoint = cursorPosition ?? inputValue.length;

    // Regex to find all instances of [[...]]
    const embeddedFieldRegex = /\[\[.*?\]\]/g;
    let match;

    // Find if the cursor is inside any existing embedded field
    while ((match = embeddedFieldRegex.exec(inputValue)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      if (
        cursorPosition !== null &&
        cursorPosition > startIndex &&
        cursorPosition < endIndex
      ) {
        // If cursor is inside an existing field, move the insertion point to the end of it.
        insertionPoint = endIndex;
        break;
      }
    }

    const newInputValue = [
      inputValue.slice(0, insertionPoint),
      textToInsert,
      inputValue.slice(insertionPoint),
    ].join("");
    setInputValue(newInputValue);
    setCursorPosition(insertionPoint + textToInsert.length);
  };

  return (
    <div className="ve-relative ve-w-full">
      <input
        type="text"
        className="ve-w-full ve-text-gray-700 ve-text-sm ve-rounded ve-border ve-border-gray-300 ve-px-[15px] ve-py-[12px] hover:ve-bg-[color:var(--puck-color-azure-12)] hover:ve-border-[color:var(--puck-color-grey-05)]"
        value={inputValue}
        onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        onBlur={() => {
          commitChanges(inputValue, value, onChange);
        }}
      />
      {showFieldSelector && (
        <div className="ve-absolute ve-right-[12px] ve-top-[1.65rem] -ve-translate-y-1/2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="ve-cursor-pointer ve-text-gray-700 hover:ve-text-gray-800"
                aria-label={pt("addEntityField", "Add entity field")}
              >
                <SquarePlus size={20} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="ve-w-[300px] ve-p-0 ve-bg-opacity-100 ve-bg-white">
              <Command>
                <CommandInputRounded placeholder={pt("search", "Search")} />
                <CommandList>
                  <CommandEmpty>
                    {pt("noMatchesFound", "No matches found.")}
                  </CommandEmpty>
                  <CommandGroup>
                    {fieldOptions.map((option) => (
                      <CommandItemWithResolvedValue
                        key={option.value}
                        option={option}
                        onSelect={() => handleFieldSelect(option.value)}
                        isOpen={open}
                        useOptionValue={useOptionValueSublabel}
                      />
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

const CommandItemWithResolvedValue = ({
  option,
  onSelect,
  isOpen,
  useOptionValue,
}: {
  option: { label: string; value: string };
  onSelect: () => void;
  isOpen: boolean;
  useOptionValue?: boolean;
}) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const [resolvedValue, setResolvedValue] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    if (useOptionValue) {
      return;
    }
    // Only resolve the value if the popover is open and we haven't resolved it yet.
    if (isOpen && resolvedValue === undefined) {
      const fieldToResolve: YextEntityField<unknown> = {
        field: option.value,
        constantValue: undefined,
        constantValueEnabled: false,
      };
      const resolved = resolveComponentData(
        fieldToResolve,
        locale,
        streamDocument
      );
      const finalValue =
        typeof resolved === "object" ? JSON.stringify(resolved) : resolved;
      setResolvedValue(String(finalValue ?? ""));
    }
  }, [isOpen, option.value, streamDocument, resolvedValue, useOptionValue]);

  return (
    <CommandItem
      value={option.value}
      onSelect={onSelect}
      className="ve-cursor-pointer ve-px-5 ve-py-3"
      title={option.label}
    >
      <div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {option.label}
        </div>
        {(resolvedValue || useOptionValue) && (
          <div className="ve-text-xs ve-text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
            {useOptionValue ? option.value : resolvedValue}
          </div>
        )}
      </div>
    </CommandItem>
  );
};
