import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
  resolveTranslatableString,
  useDocument,
  Body,
  PageSection,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.js";
import { useTranslation } from "react-i18next";
import { TranslatableString } from "src/editor/YextEntityFieldSelector.js";

export type BannerSectionProps = {
  text: YextEntityField<TranslatableString>;
  text2: YextEntityField<string>;
  text3: YextEntityField<TranslatableString>;
  text4: YextEntityField<TranslatableString>;
  textAlignment: "left" | "right" | "center";
  backgroundColor?: BackgroundStyle;
  liveVisibility: boolean;
};

const bannerSectionFields: Fields<BannerSectionProps> = {
  text: YextField<any, TranslatableString>(
    "Normal Translations with bad locale, used as TranslatableString",
    {
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
      locales: ["en", "es", "fr", "fake"],
    }
  ),
  text2: YextField<any, string>("No translations, used as string", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  // locales missing from this one
  text3: YextField<any, TranslatableString>(
    "No translations, used as TranslatableString, string as default",
    {
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    }
  ),
  text4: YextField<any, TranslatableString>(
    "Translations, used as TranslatableString, string as default",
    {
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
      locales: ["en", "es", "fr"],
    }
  ),
  textAlignment: YextField("Text Alignment", {
    type: "radio",
    options: "ALIGNMENT",
  }),
  backgroundColor: YextField("Background Color", {
    type: "select",
    hasSearch: true,
    options: "DARK_BACKGROUND_COLOR",
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const BannerComponent = ({
  text,
  text2,
  text3,
  text4,
  textAlignment,
  backgroundColor,
}: BannerSectionProps) => {
  const document = useDocument();
  const resolvedText = resolveYextEntityField<TranslatableString>(
    document,
    text
  );
  const { t } = useTranslation();

  const resolvedText2 = resolveYextEntityField<TranslatableString>(
    document,
    text2
  );

  const resolvedText3 = resolveYextEntityField<TranslatableString>(
    document,
    text3
  );

  const resolvedText4 = resolveYextEntityField<TranslatableString>(
    document,
    text4
  );
  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[textAlignment];

  return (
    <PageSection background={backgroundColor} verticalPadding="sm">
      {/* This shows how we'd translate normal built-in strings. We'd need to do it globally. */}
      <div className="block">{t("Test")}</div>
      <div className="block">
        <Body>{resolveTranslatableString(resolvedText)}</Body>
      </div>
      <div className="block">
        <Body>{resolveTranslatableString(resolvedText2)}</Body>
      </div>
      <div className="block">
        <Body>{resolveTranslatableString(resolvedText3)}</Body>
      </div>
      <div className="block">
        <Body>{resolveTranslatableString(resolvedText4)}</Body>
      </div>
    </PageSection>
  );
};

export const BannerSection: ComponentConfig<BannerSectionProps> = {
  label: "Banner Section",
  fields: bannerSectionFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: {
        en: "Default text in English",
        es: "Default text in Spanish",
      },
      constantValueEnabled: true,
    },
    text2: {
      field: "",
      constantValue: "Normal field w/o translations",
      constantValueEnabled: true,
    },
    text3: {
      field: "",
      constantValue: "I should have translations",
      constantValueEnabled: true,
    },
    text4: {
      field: "",
      constantValue: "Translations but single line constant value",
      constantValueEnabled: true,
    },
    textAlignment: "center",
    backgroundColor: backgroundColors.background6.value,
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <BannerComponent {...props} />
    </VisibilityWrapper>
  ),
};
