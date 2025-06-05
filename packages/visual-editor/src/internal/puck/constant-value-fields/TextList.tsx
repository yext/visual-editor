import React, { useState } from "react";
import { AutoField, IconButton, Button, CustomField } from "@measured/puck";
import { Trash2 as TrashIcon } from "lucide-react";
import { Plus as PlusIcon } from "lucide-react";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

const TEXT_LIST_BUTTON_COLOR: string = "#969696";

export const TEXT_LIST_CONSTANT_CONFIG: CustomField<string[]> = {
  type: "custom",
  render: ({ onChange, value, id }) => {
    const [localItems, setLocalItems] = useState<string[]>(value);
    const { t } = usePlatformTranslation();

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
                title={t("deleteItem", "Delete Item")}
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
