import * as React from "react";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import {
  type YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { type StyledTextValue } from "../../../fields/styledFields/StyledTextField.tsx";
import {
  type RichText,
  type TranslatableRichText,
  type TranslatableString,
} from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  renderStyledRichText,
  StyledTextElement,
  getStyledTextStyle,
  type StyledTextAlignment,
  type StyledTextTag,
} from "./styledText.tsx";

type StyledTextConfigProps<TText> = {
  data: {
    text: TText;
  };
  alignment?: StyledTextAlignment;
  fontOptions: StyledTextValue;
  tag?: StyledTextTag;
};

export type StyledPlainTextProps<TText = YextEntityField<TranslatableString>> =
  StyledTextConfigProps<TText>;
export type StyledRichTextProps<TText = YextEntityField<TranslatableRichText>> =
  StyledTextConfigProps<TText>;

type CreateStyledTextConfigOptions = {
  label: string;
  includeColor?: boolean;
  includeAlignment?: boolean;
  textLabelOverride?: string;
  fontOptionsLabelOverride?: string;
  colorLabelOverride?: string;
  alignmentLabelOverride?: string;
} & (
  | {
      kind: "plain";
      tagOptions?: StyledTextTag[];
      tagLabelOverride?: string;
    }
  | {
      kind: "richText";
      tagOptions?: never;
      tagLabelOverride?: never;
    }
);

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
}: CreateStyledTextConfigOptions): YextFields<
  StyledTextConfigProps<YextEntityField<TText>>
> => {
  const fields: YextFields<StyledTextConfigProps<YextEntityField<TText>>> = {
    data: {
      label: textLabelOverride ?? msg("fields.text", "Text"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          resolve: true,
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

/** Render content already resolved by field transforms or supplied directly by a caller. */
export const StyledTextComponent = (
  props:
    | (StyledPlainTextProps<string | undefined> & { kind: "plain" })
    | (StyledRichTextProps<string | RichText | undefined> & {
        kind: "richText";
      })
): React.ReactElement => {
  if (props.kind === "plain") {
    return props.data.text ? (
      <StyledTextElement
        as={props.tag}
        align={props.alignment}
        color={props.fontOptions.color}
        style={getStyledTextStyle(props.fontOptions)}
      >
        {props.data.text}
      </StyledTextElement>
    ) : (
      <></>
    );
  }

  return (
    <>
      {renderStyledRichText({
        content: props.data.text,
        align: props.alignment,
        text: props.fontOptions,
      })}
    </>
  );
};

export function createStyledTextConfig(
  options: CreateStyledTextConfigOptions & { kind: "plain" }
): YextComponentConfig<
  StyledPlainTextProps,
  StyledPlainTextProps<string | undefined>
>;
export function createStyledTextConfig(
  options: CreateStyledTextConfigOptions & { kind: "richText" }
): YextComponentConfig<
  StyledRichTextProps,
  StyledRichTextProps<string | RichText | undefined>
>;
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
  | YextComponentConfig<
      StyledPlainTextProps,
      StyledPlainTextProps<string | undefined>
    >
  | YextComponentConfig<
      StyledRichTextProps,
      StyledRichTextProps<string | RichText | undefined>
    > {
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
        props: StyledRichTextProps<string | RichText | undefined> & {
          puck: { isEditing: boolean };
        }
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
      props: StyledPlainTextProps<string | undefined> & {
        puck: { isEditing: boolean };
      }
    ) => {
      const { puck: _, ...styledTextProps } = props;
      return <StyledTextComponent {...styledTextProps} kind="plain" />;
    },
  };
}
