import * as React from "react";
import { useTranslation } from "react-i18next";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import {
  type YextComponentConfig,
  type YextFields,
} from "../../fields/fields.ts";
import { type StyledTextValue } from "../../fields/styledFields/StyledTextField.tsx";
import { useBackground } from "../../hooks/useBackground.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import {
  renderStyledRichText,
  StyledTextElement,
  getStyledTextStyle,
  type StyledTextAlignment,
  type StyledTextTag,
} from "./styledText.tsx";

type StyledTextConfigProps<TText> = {
  data: {
    text: YextEntityField<TText>;
  };
  alignment?: StyledTextAlignment;
  fontOptions: StyledTextValue;
  tag?: StyledTextTag;
};

export type StyledPlainTextProps = StyledTextConfigProps<TranslatableString>;
export type StyledRichTextProps = StyledTextConfigProps<TranslatableRichText>;

type CreateStyledTextConfigOptions = {
  kind: "plain" | "richText";
  label: string;
  includeColor?: boolean;
  includeAlignment?: boolean;
  tagOptions?: StyledTextTag[];
  textLabelOverride?: string;
  fontOptionsLabelOverride?: string;
  colorLabelOverride?: string;
  alignmentLabelOverride?: string;
  tagLabelOverride?: string;
};

const defaultStyledTextValue: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

/**
 * Builds the editor field definitions for a styled text component.
 */
const buildFields = <TText,>({
  kind,
  includeColor,
  includeAlignment,
  tagOptions,
  textLabelOverride,
  fontOptionsLabelOverride,
  colorLabelOverride,
  alignmentLabelOverride,
  tagLabelOverride,
}: CreateStyledTextConfigOptions): YextFields<StyledTextConfigProps<TText>> => {
  const fields: YextFields<StyledTextConfigProps<TText>> = {
    data: {
      label: textLabelOverride ?? msg("fields.text", "Text"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.text", "Text"),
          filter: {
            types:
              kind === "plain"
                ? ["type.string"]
                : ["type.string", "type.rich_text_v2"],
          },
        },
      },
    },
    fontOptions: {
      label:
        fontOptionsLabelOverride ?? msg("fields.fontOptions", "Font Options"),
      type: "styledText",
      includeColor,
      colorLabel: colorLabelOverride ?? msg("fields.fontColor", "Font Color"),
    },
  };

  if (includeAlignment) {
    fields.alignment = {
      label: alignmentLabelOverride ?? msg("fields.align", "Alignment"),
      type: "radio",
      options: ThemeOptions.ALIGNMENT,
    };
  }

  if (kind === "plain" && tagOptions?.length) {
    fields.tag = {
      label: tagLabelOverride ?? msg("fields.tag", "Tag"),
      type: "select",
      options: tagOptions.map((tag) => ({
        label: tag.toUpperCase(),
        value: tag,
      })),
    };
  }

  return fields;
};

const getDefaultTag = (
  tagOptions?: StyledTextTag[]
): StyledTextTag | undefined => {
  if (!tagOptions?.length) {
    return undefined;
  }

  return tagOptions.includes("span") ? "span" : tagOptions[0];
};

export const StyledTextComponent = <
  TText extends TranslatableString | TranslatableRichText,
>(
  props: StyledTextConfigProps<TText> & {
    kind: CreateStyledTextConfigOptions["kind"];
  }
) => {
  const { data, alignment, fontOptions, kind } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const background = useBackground();
  const sourceData = data.text;

  if (kind === "plain") {
    const resolvedText = resolveComponentData(
      sourceData,
      i18n.language,
      streamDocument
    );

    return resolvedText ? (
      <EntityField
        displayName={pt("text", "Text")}
        fieldId={data.text.field}
        constantValueEnabled={data.text.constantValueEnabled}
      >
        <StyledTextElement
          as={props.tag}
          align={alignment}
          color={fontOptions.color}
          style={getStyledTextStyle(fontOptions)}
        >
          {resolvedText}
        </StyledTextElement>
      </EntityField>
    ) : (
      <></>
    );
  }

  const resolvedData = sourceData
    ? resolveComponentData(sourceData, i18n.language, streamDocument, {
        isDarkBackground: background?.isDarkColor,
      })
    : undefined;

  return React.isValidElement(resolvedData) ||
    typeof resolvedData === "string" ? (
    <EntityField
      displayName={pt("body", "Body")}
      fieldId={data.text.field}
      constantValueEnabled={data.text.constantValueEnabled}
    >
      {renderStyledRichText({
        content: resolvedData,
        align: alignment,
        text: fontOptions,
      })}
    </EntityField>
  ) : (
    <></>
  );
};

export function createStyledTextConfig(
  options: CreateStyledTextConfigOptions & { kind: "plain" }
): YextComponentConfig<StyledPlainTextProps>;
export function createStyledTextConfig(
  options: CreateStyledTextConfigOptions & { kind: "richText" }
): YextComponentConfig<StyledRichTextProps>;
/**
 * Creates a styled text component config for plain or rich text content.
 *
 * Operation overview:
 * 1. Build the shared field definitions for the selected text kind.
 * 2. Derive the default props shared by all styled text configs.
 * 3. Add plain-text-only defaults such as the semantic tag when requested.
 * 4. Return a config whose renderer fixes the text kind at render time.
 */
export function createStyledTextConfig(
  options: CreateStyledTextConfigOptions
):
  | YextComponentConfig<StyledPlainTextProps>
  | YextComponentConfig<StyledRichTextProps> {
  const defaultProps: Pick<
    StyledPlainTextProps,
    "data" | "fontOptions" | "alignment"
  > = {
    data: {
      text: {
        field: "",
        constantValue: { defaultValue: "Text" },
        constantValueEnabled: true,
      },
    },
    fontOptions: defaultStyledTextValue,
    ...(options.includeAlignment ? { alignment: "left" as const } : {}),
  };

  if (options.kind === "richText") {
    return {
      label: options.label,
      fields: buildFields<TranslatableRichText>(options),
      defaultProps,
      render: (
        props: StyledRichTextProps & { puck: { isEditing: boolean } }
      ) => {
        const { puck: _, ...styledTextProps } = props;
        return <StyledTextComponent {...styledTextProps} kind="richText" />;
      },
    };
  }

  return {
    label: options.label,
    fields: buildFields<TranslatableString>(options),
    defaultProps: {
      ...defaultProps,
      ...(options.tagOptions?.length
        ? { tag: getDefaultTag(options.tagOptions) }
        : {}),
    },
    render: (
      props: StyledPlainTextProps & { puck: { isEditing: boolean } }
    ) => {
      const { puck: _, ...styledTextProps } = props;
      return <StyledTextComponent {...styledTextProps} kind="plain" />;
    },
  };
}
