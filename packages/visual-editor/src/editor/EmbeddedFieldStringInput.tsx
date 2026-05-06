import React from "react";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import {
  getScopedEntityFieldDisplayName,
  getFieldsForSelector,
  type YextEntityField,
} from "./yextEntityFieldUtils.ts";
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
import { pt } from "../utils/i18n/platform.ts";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { useCurrentSourceField } from "../hooks/useCurrentSourceField.tsx";
import { useDocument } from "../hooks/useDocument.tsx";
import {
  buildEntityFieldOptionGroups,
  type EntityFieldOptionGroup,
} from "./entityFieldOptionGroups.ts";

export type EmbeddedStringOption = {
  label: string;
  value: string;
};

/**
 * Resolves the object scope that embedded linked-field previews should read
 * from.
 *
 * Without a source field this returns the full stream document. With a source
 * field it resolves that path and returns the selected object, or the first
 * item when the source resolves to a list of objects.
 */
const getSubDocument = (
  streamDocument: StreamDocument | Record<string, unknown> | undefined,
  sourceField?: string
): Record<string, unknown> | undefined => {
  if (!streamDocument || !sourceField) {
    return streamDocument as Record<string, unknown> | undefined;
  }

  const resolvedValue = sourceField
    .split(".")
    .reduce<unknown>((currentValue, segment) => {
      if (!currentValue || typeof currentValue !== "object") {
        return undefined;
      }

      return (currentValue as Record<string, unknown>)[segment];
    }, streamDocument);

  if (Array.isArray(resolvedValue)) {
    const firstItem = resolvedValue[0];
    return firstItem && typeof firstItem === "object"
      ? (firstItem as Record<string, unknown>)
      : undefined;
  }

  return resolvedValue && typeof resolvedValue === "object"
    ? (resolvedValue as Record<string, unknown>)
    : undefined;
};

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
  sourceFieldPath,
  sourceField: sourceFieldFromInputProps,
}: {
  value: string;
  onChange: (value: string) => void;
  filter: RenderEntityFieldFilter<T>;
  showFieldSelector: boolean;
  sourceFieldPath?: string;
  sourceField?: string;
}) => {
  const entityFields = useEntityFields();
  const streamDocument = useDocument();
  const sourceFieldFromPath = useCurrentSourceField(sourceFieldPath);
  const sourceField = sourceFieldFromInputProps || sourceFieldFromPath;

  const entityFieldOptions = React.useMemo(() => {
    const filteredEntityFields = getFieldsForSelector(
      entityFields,
      filter,
      streamDocument,
      sourceField || undefined
    );
    return buildEntityFieldOptionGroups({
      entityFields,
      options: filteredEntityFields.map((field) => ({
        label:
          getScopedEntityFieldDisplayName(
            sourceField || undefined,
            field.name,
            entityFields
          ) ??
          field.displayName ??
          field.name,
        value: field.name,
        fieldPath: sourceField ? `${sourceField}.${field.name}` : field.name,
      })),
      linkedGroupTitle: pt("linkedEntityFields", "Linked Entity Fields"),
      entityGroupTitle: pt("entityFields", "Entity Fields"),
    });
  }, [entityFields, filter, sourceField, streamDocument]);

  return (
    <EmbeddedFieldStringInputFromOptions
      value={value}
      onChange={onChange}
      optionGroups={entityFieldOptions}
      showFieldSelector={showFieldSelector}
      useOptionValueSublabel={false}
      sourceField={sourceField}
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
  optionGroups,
  showFieldSelector,
  useOptionValueSublabel = false,
  sourceField,
}: {
  value: string;
  onChange: (value: string) => void;
  optionGroups: EntityFieldOptionGroup<{ label: string; value: string }>[];
  showFieldSelector: boolean;
  useOptionValueSublabel?: boolean;
  sourceField?: string;
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
                  {optionGroups.map((group, index) => (
                    <CommandGroup key={index} heading={group.title}>
                      {group.options.map((option) => (
                        <CommandItemWithResolvedValue
                          key={option.value}
                          option={option}
                          onSelect={() => handleFieldSelect(option.value)}
                          isOpen={open}
                          useOptionValue={useOptionValueSublabel}
                          sourceField={sourceField}
                        />
                      ))}
                    </CommandGroup>
                  ))}
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
  sourceField,
}: {
  option: { label: string; value: string };
  onSelect: () => void;
  isOpen: boolean;
  useOptionValue?: boolean;
  sourceField?: string;
}) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const subDocument = React.useMemo(
    () => getSubDocument(streamDocument, sourceField),
    [sourceField, streamDocument]
  );
  const [resolvedValue, setResolvedValue] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    if (useOptionValue) {
      return;
    }
    if (!isOpen) {
      return;
    }

    const fieldToResolve: YextEntityField<unknown> = {
      field: option.value,
      constantValue: undefined,
      constantValueEnabled: false,
    };
    const resolved = resolveComponentData(fieldToResolve, locale, subDocument);
    const finalValue =
      typeof resolved === "object" ? JSON.stringify(resolved) : resolved;
    setResolvedValue(String(finalValue ?? ""));
  }, [isOpen, locale, option.value, subDocument, useOptionValue]);

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
