import React from "react";
import { useDocument, useEntityFields } from "../hooks";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields";
import {
  getFieldsForSelector,
  YextEntityField,
} from "./YextEntityFieldSelector";
import { pt, resolveComponentData } from "../utils";
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
export const EmbeddedFieldStringInput = <T extends Record<string, any>>({
  value,
  onChange,
  filter,
}: {
  value: string;
  onChange: (value: string) => void;
  filter: RenderEntityFieldFilter<T>;
}) => {
  const entityFields = useEntityFields();
  const [open, setOpen] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState<number | null>(
    null
  );
  const [inputValue, setInputValue] = React.useState(value);

  // Update local state if the prop value changes from outside
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce the call to the parent onChange handler
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 800); // 800ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onChange, value]);

  const entityFieldOptions = React.useMemo(() => {
    const filteredEntityFields = getFieldsForSelector(entityFields, filter);
    return filteredEntityFields.map((field) => {
      return {
        label: field.displayName ?? field.name,
        value: field.name,
      };
    });
  }, [entityFields, filter]);

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
        className="ve-w-full ve-text-gray-700 ve-text-sm ve-rounded ve-border ve-border-gray-300 ve-p-2 ve-pr-10" // Add padding-right for the button
        value={inputValue}
        onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
      />
      <div className="ve-absolute ve-right-2 ve-top-[1.4rem] -ve-translate-y-1/2">
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
                  {entityFieldOptions.map((option) => (
                    <CommandItemWithResolvedValue
                      key={option.value}
                      option={option}
                      onSelect={() => handleFieldSelect(option.value)}
                      isOpen={open}
                    />
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const CommandItemWithResolvedValue = ({
  option,
  onSelect,
  isOpen,
}: {
  option: { label: string; value: string };
  onSelect: () => void;
  isOpen: boolean;
}) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const document = useDocument();
  const [resolvedValue, setResolvedValue] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    // Only resolve the value if the popover is open and we haven't resolved it yet.
    if (isOpen && resolvedValue === undefined) {
      const fieldToResolve: YextEntityField<unknown> = {
        field: option.value,
        constantValue: undefined,
        constantValueEnabled: false,
      };
      const resolved = resolveComponentData(fieldToResolve, locale, document);
      const finalValue =
        typeof resolved === "object" ? JSON.stringify(resolved) : resolved;
      setResolvedValue(String(finalValue ?? ""));
    }
  }, [isOpen, option.value, document, resolvedValue]);

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
        {resolvedValue && (
          <div className="ve-text-xs ve-text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
            {resolvedValue}
          </div>
        )}
      </div>
    </CommandItem>
  );
};
