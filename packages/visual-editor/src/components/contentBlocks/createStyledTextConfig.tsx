import * as React from "react";
import type { ComponentData, DefaultComponentProps } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
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
import {
  ThemeOptions,
  type ThemeColor,
} from "../../utils/themeConfigOptions.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import {
  getStyledTextStyle,
  StyledTextElement,
  styledTextAlignClassName,
  type StyledTextAlignment,
  type StyledTextTag,
} from "./styledText.tsx";

type StyledTextFontOptions = {
  text: StyledTextValue;
  color?: ThemeColor;
};

export type StyledTextParentStyles = {
  className?: string;
  alignment?: StyledTextAlignment;
  fontOptions?: Partial<StyledTextFontOptions>;
  tag?: StyledTextTag;
};

type StyledTextConfigProps<TText> = {
  data: {
    text: YextEntityField<TText>;
  };
  alignment?: StyledTextAlignment;
  fontOptions: StyledTextFontOptions;
  tag?: StyledTextTag;
  parentData?: {
    field: string;
    text?: string | TText;
  };
  parentStyles?: StyledTextParentStyles;
};

export type StyledPlainTextProps = StyledTextConfigProps<TranslatableString>;
export type StyledRichTextProps = StyledTextConfigProps<TranslatableRichText>;
type StyledTextViewProps<TText> = StyledTextConfigProps<TText> & {
  puck?: {
    isEditing: boolean;
  };
};

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

type ResolveFieldsData<Props extends DefaultComponentProps> = Omit<
  ComponentData<Props, string, Record<string, DefaultComponentProps>>,
  "type"
>;

const defaultStyledTextValue: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

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

  if (tagOptions?.length) {
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

const getEffectiveFontOptions = (
  fontOptions: StyledTextFontOptions,
  parentStyles?: StyledTextParentStyles
): StyledTextFontOptions => ({
  ...fontOptions,
  ...parentStyles?.fontOptions,
  text: parentStyles?.fontOptions?.text ?? fontOptions.text,
});

const StyledTextConfigComponent = <
  TText extends TranslatableString | TranslatableRichText,
>(
  props: StyledTextConfigProps<TText> & {
    kind: CreateStyledTextConfigOptions["kind"];
  } & {
    puck: {
      isEditing: boolean;
    };
  }
) => {
  const { data, alignment, fontOptions, puck, kind, parentData, parentStyles } =
    props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const background = useBackground();
  const sourceData = parentData?.text ?? data.text;
  const resolvedAlignment = parentStyles?.alignment ?? alignment;
  const resolvedTag = parentStyles?.tag ?? props.tag;
  const effectiveFontOptions = getEffectiveFontOptions(
    fontOptions,
    parentStyles
  );

  if (kind === "plain") {
    const resolvedText =
      typeof sourceData === "string"
        ? sourceData
        : resolveComponentData(sourceData, i18n.language, streamDocument);

    return resolvedText ? (
      <EntityField
        displayName={pt("text", "Text")}
        fieldId={parentData ? parentData.field : data.text.field}
        constantValueEnabled={!parentData && data.text.constantValueEnabled}
      >
        <StyledTextElement
          as={resolvedTag}
          align={resolvedAlignment}
          color={effectiveFontOptions.color}
          className={parentStyles?.className}
          style={getStyledTextStyle(effectiveFontOptions.text)}
        >
          {resolvedText}
        </StyledTextElement>
      </EntityField>
    ) : puck.isEditing ? (
      <div className="h-[30px] min-w-[100px]" />
    ) : (
      <></>
    );
  }

  const resolvedClassName = themeManagerCn(
    parentStyles?.className,
    resolvedAlignment && styledTextAlignClassName[resolvedAlignment]
  );
  const resolvedData = sourceData
    ? resolveComponentData(sourceData, i18n.language, streamDocument, {
        isDarkBackground: background?.isDarkColor,
        className: resolvedClassName,
        richTextStyleOverrides: {
          ...effectiveFontOptions.text,
          color: effectiveFontOptions.color,
        },
      })
    : undefined;

  return React.isValidElement(resolvedData) ||
    typeof resolvedData === "string" ? (
    <EntityField
      displayName={pt("body", "Body")}
      fieldId={parentData ? parentData.field : data.text.field}
      constantValueEnabled={!parentData && data.text.constantValueEnabled}
    >
      {typeof resolvedData === "string" ? (
        <StyledTextElement
          as={resolvedTag ?? "div"}
          align={resolvedAlignment}
          color={effectiveFontOptions.color}
          className={parentStyles?.className}
          style={getStyledTextStyle(effectiveFontOptions.text)}
        >
          {resolvedData}
        </StyledTextElement>
      ) : (
        resolvedData
      )}
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[60px] min-w-[100px]" />
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
export function createStyledTextConfig(
  options: CreateStyledTextConfigOptions
):
  | YextComponentConfig<StyledPlainTextProps>
  | YextComponentConfig<StyledRichTextProps> {
  if (options.kind === "plain") {
    const fields = buildFields<TranslatableString>(options);

    return {
      label: options.label,
      fields,
      resolveFields: (data: ResolveFieldsData<StyledPlainTextProps>) =>
        resolveDataFromParent(fields, data),
      defaultProps: {
        data: {
          text: {
            field: "",
            constantValue: { defaultValue: "Text" },
            constantValueEnabled: true,
          },
        },
        fontOptions: {
          text: defaultStyledTextValue,
        },
        ...(options.includeAlignment ? { alignment: "left" as const } : {}),
        ...(options.tagOptions?.length
          ? { tag: getDefaultTag(options.tagOptions) }
          : {}),
      },
      render: (
        props: StyledPlainTextProps & { puck: { isEditing: boolean } }
      ) => <StyledPlainText {...props} />,
    };
  }

  const fields = buildFields<TranslatableRichText>(options);

  return {
    label: options.label,
    fields,
    resolveFields: (data: ResolveFieldsData<StyledRichTextProps>) =>
      resolveDataFromParent(fields, data),
    defaultProps: {
      data: {
        text: {
          field: "",
          constantValue: { defaultValue: "Text" },
          constantValueEnabled: true,
        },
      },
      fontOptions: {
        text: defaultStyledTextValue,
      },
      ...(options.includeAlignment ? { alignment: "left" as const } : {}),
      ...(options.tagOptions?.length
        ? { tag: getDefaultTag(options.tagOptions) }
        : {}),
    },
    render: (props: StyledRichTextProps & { puck: { isEditing: boolean } }) => (
      <StyledRichText {...props} />
    ),
  };
}

export const StyledPlainText = (
  props: StyledTextViewProps<TranslatableString>
) => (
  <StyledTextConfigComponent
    {...props}
    puck={props.puck ?? { isEditing: false }}
    kind="plain"
  />
);

export const StyledRichText = (
  props: StyledTextViewProps<TranslatableRichText>
) => (
  <StyledTextConfigComponent
    {...props}
    puck={props.puck ?? { isEditing: false }}
    kind="richText"
  />
);
