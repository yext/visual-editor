import React, { useState } from "react";
import {
  AutoField,
  Button,
  CustomField,
  FieldLabel,
  IconButton,
} from "@measured/puck";
import { Plus as PlusIcon, Trash2 as TrashIcon } from "lucide-react";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { getLocaleName } from "./Text.tsx";
import { RTF2, TranslatableString } from "../../../types/types.ts";
import { getDisplayValue } from "../../../utils/resolveTranslatableString.ts";
import { useTranslation } from "react-i18next";

const TEXT_LIST_BUTTON_COLOR: string = "#969696";

export const TEXT_LIST_CONSTANT_CONFIG: CustomField<string[]> = {
  type: "custom",
  render: ({ onChange, value, id }) => {
    const [localItems, setLocalItems] = useState<string[]>(value);

    const updateItem = (index: number, value: string) => {
      const updatedItems = [...localItems];
      updatedItems[index] = value;
      setLocalItems(updatedItems);
      onChange(updatedItems);
    };

    const removeItem = (index: number) => {
      const updatedItems = localItems.filter((_, i) => i !== index);
      setLocalItems(updatedItems);
      onChange(updatedItems);
    };

    const addItem = (e?: MouseEvent) => {
      e?.preventDefault();
      setLocalItems([...localItems, ""]);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter") {
        const currentLength = localItems.length;

        addItem();

        // wait for new field to be rendered, then focus
        const fieldsDiv = document.getElementById(id);
        if (fieldsDiv) {
          const observer = new MutationObserver(() => {
            const newField = document.getElementById(
              `${id}-value-${currentLength}`
            );
            if (newField) {
              observer.disconnect();
              newField.focus();
            }
          });

          observer.observe(fieldsDiv, {
            childList: true,
            subtree: true,
          });
        }
      }
    };

    return (
      <div
        id={id}
        className="ve-inline-block ve-pt-4 w-full"
        onKeyUp={handleKeyUp}
      >
        {localItems.map((item, index) => (
          <div key={index} className="ve-flex ve-items-center ve-mb-2 ve-gap-2">
            <div className="ve-grow">
              <AutoField
                field={{ type: "text" }}
                value={item}
                onChange={(itemValue) => updateItem(index, itemValue)}
                id={`${id}-value-${index}`}
              />
            </div>
            <span style={{ color: TEXT_LIST_BUTTON_COLOR }}>
              <IconButton
                onClick={() => removeItem(index)}
                variant="secondary"
                title="Delete Item"
                type="button"
                disabled={localItems.length === 1}
              >
                <TrashIcon />
              </IconButton>
            </span>
          </div>
        ))}
        <span style={{ color: TEXT_LIST_BUTTON_COLOR, width: "auto" }}>
          <Button
            onClick={addItem}
            variant={"secondary"}
            icon={<PlusIcon />}
            fullWidth
          >
            <></>
          </Button>
        </span>
      </div>
    );
  },
};

export const TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG: CustomField<
  TranslatableString[]
> = {
  type: "custom",
  render: ({ onChange, value = [], id }) => {
    const document: any = useDocument();
    const { i18n } = useTranslation();

    const baseLocale = document?.locale ?? "en";
    const locales: string[] = [baseLocale];

    if (typeof document?._pageset === "string") {
      const parsed = JSON.parse(document._pageset);
      if (Array.isArray(parsed?.scope?.locales)) {
        locales.push(...parsed.scope.locales);
      }
    }

    const dedupedLocales = Array.from(new Set(locales));

    const [localItems, setLocalItems] = useState<TranslatableString[]>(value);

    const updateItem = (
      index: number,
      locale: string,
      localeValue: string | RTF2
    ) => {
      const newItems = [...localItems];
      const currentItem = newItems[index];

      newItems[index] =
        typeof currentItem === "object" && !Array.isArray(currentItem)
          ? { ...currentItem, [locale]: localeValue }
          : { [locale]: localeValue };
      setLocalItems(newItems);
      onChange(newItems);
    };

    const addItem = (e?: MouseEvent) => {
      e?.preventDefault();
      const newItems = [...localItems, ""];
      setLocalItems(newItems);
      onChange(newItems);
    };

    const removeItem = (index: number) => {
      const newItems = localItems.filter((_, i) => i !== index);
      setLocalItems(newItems);
      onChange(newItems);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter") {
        const currentLength = localItems.length;
        addItem();

        const fieldsDiv = document.getElementById(id);
        if (fieldsDiv) {
          const observer = new MutationObserver(() => {
            const newField = document.getElementById(
              `${id}-value-${currentLength}-0`
            );
            if (newField) {
              observer.disconnect();
              newField.focus();
            }
          });

          observer.observe(fieldsDiv, { childList: true, subtree: true });
        }
      }
    };

    return (
      <div
        id={id}
        className="ve-inline-block ve-pt-4 w-full"
        onKeyUp={handleKeyUp}
      >
        {localItems.map((item, index) => (
          <div
            key={index}
            className="ve-border ve-rounded ve-p-3 ve-mb-3 ve-space-y-2"
          >
            {dedupedLocales.map((locale, localeIndex) => {
              const autoField: React.ReactElement = (
                <AutoField
                  key={locale}
                  field={{ type: "text" }}
                  id={`${id}-value-${index}-${localeIndex}`}
                  value={getDisplayValue(item, locale)}
                  onChange={(val) => updateItem(index, locale, val)}
                />
              );
              if (dedupedLocales.length <= 1) {
                return autoField;
              }
              return (
                <FieldLabel
                  key={locale}
                  label={getLocaleName(locale, i18n.language)}
                >
                  {autoField}
                </FieldLabel>
              );
            })}
            <div className="ve-flex ve-justify-end">
              <IconButton
                onClick={() => removeItem(index)}
                variant="secondary"
                title="Delete Item"
                type="button"
                disabled={localItems.length === 1}
              >
                <TrashIcon />
              </IconButton>
            </div>
          </div>
        ))}
        <Button
          onClick={addItem}
          variant="secondary"
          icon={<PlusIcon />}
          fullWidth
        >
          <></>
        </Button>
      </div>
    );
  },
};
