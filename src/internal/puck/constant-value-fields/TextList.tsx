import React, { useState } from "react";
import { AutoField, IconButton, Button, CustomField } from "@measured/puck";
import { Trash2 as TrashIcon } from "lucide-react";
import { Plus as PlusIcon } from "lucide-react";

export const TEXT_LIST_CONSTANT_CONFIG: CustomField<string[]> = {
  type: "custom",
  render: ({ onChange, value }) => {
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

    const addItem = () => {
      setLocalItems([...localItems, ""]);
    };

    return (
      <div>
        {localItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              gap: "4px",
            }}
          >
            <AutoField
              field={{ type: "text" }}
              value={item}
              onChange={(itemValue) => updateItem(index, itemValue)}
            />
            <span style={{ color: "#969696" }}>
              <IconButton
                onClick={() => removeItem(index)}
                variant={"secondary"}
                title={"Delete"}
                disabled={localItems.length === 1}
              >
                <TrashIcon />
              </IconButton>
            </span>
          </div>
        ))}
        <span style={{ color: "#969696", width: "auto" }}>
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
