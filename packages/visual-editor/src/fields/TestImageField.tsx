import React from "react";
import { FieldLabel, type FieldProps } from "@puckeditor/core";
import { type ComplexImageType, type ImageType } from "@yext/pages-components";
import { type YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import {
  ConstantValueModeToggler,
  EntityFieldInput,
  type EntityFieldSelectorField,
} from "./EntityFieldSelectorField.tsx";
import { ImageFieldOverride } from "./ImageField.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import { ImageStylingFields } from "../components/contentBlocks/image/styling.ts";
import { type TranslatableAssetImage } from "../types/images.ts";
import { type RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";

type TestImageValue = YextEntityField<
  ImageType | ComplexImageType | TranslatableAssetImage
> & {
  aspectRatio?: number;
  width?: number;
  imageFillType?: "fill" | "fit";
};

export type TestImageField = Omit<EntityFieldSelectorField, "type"> & {
  type: "testImage";
};

type TestImageFieldOverrideProps = FieldProps<TestImageField>;

const testImageStylesField = {
  type: "object",
  label: "",
  objectFields: {
    aspectRatio: ImageStylingFields.aspectRatio,
    imageFillType: ImageStylingFields.imageFillType,
    width: ImageStylingFields.width,
  },
} as const;

/**
 * Renders a transform-backed image field that preserves Yext mapped-vs-constant
 * authoring while exposing the same image asset and style controls we use for
 * standard image components.
 */
export const TestImageFieldOverride = ({
  field,
  onChange,
  value,
}: TestImageFieldOverrideProps) => {
  const currentValue = value as TestImageValue | undefined;
  const constantValueEnabled = currentValue?.constantValueEnabled ?? true;
  const filter: RenderEntityFieldFilter<Record<string, any>> =
    field.filter &&
    typeof field.filter === "object" &&
    !Array.isArray(field.filter) &&
    Array.isArray(field.filter.types)
      ? field.filter
      : { types: ["type.image"] };
  if (!field.filter) {
    console.error(
      "[VisualEditor] Invalid testImage field config. An image filter is required."
    );
  }

  return (
    <>
      <ConstantValueModeToggler
        fieldTypeFilter={filter.types ?? []}
        constantValueEnabled={constantValueEnabled}
        toggleConstantValueEnabled={(nextConstantValueEnabled) =>
          onChange({
            ...currentValue,
            constantValueEnabled: nextConstantValueEnabled,
            field: nextConstantValueEnabled ? "" : (currentValue?.field ?? ""),
          })
        }
        label={typeof field.label === "string" ? field.label : ""}
        infoTooltipRequirements={undefined}
      />
      {constantValueEnabled ? (
        <FieldLabel label="" el="div">
          <ImageFieldOverride
            field={{
              type: "image",
              label: typeof field.label === "string" ? field.label : "",
            }}
            onChange={(constantValue) =>
              onChange({
                ...currentValue,
                field: "",
                constantValue,
                constantValueEnabled: true,
              })
            }
            value={
              currentValue?.constantValue as TranslatableAssetImage | undefined
            }
          />
        </FieldLabel>
      ) : (
        <EntityFieldInput
          filter={filter}
          label={typeof field.label === "string" ? field.label : ""}
          onChange={(nextValue, uiState) =>
            onChange(
              {
                ...currentValue,
                ...nextValue,
                constantValueEnabled: false,
              },
              uiState
            )
          }
          value={currentValue}
        />
      )}
      <FieldLabel label="" el="div">
        <YextAutoField
          field={testImageStylesField}
          onChange={(styles) =>
            onChange({
              ...currentValue,
              ...(styles as {
                aspectRatio?: number;
                width?: number;
                imageFillType?: "fill" | "fit";
              }),
            })
          }
          value={{
            aspectRatio: currentValue?.aspectRatio,
            imageFillType: currentValue?.imageFillType,
            width: currentValue?.width,
          }}
        />
      </FieldLabel>
    </>
  );
};
