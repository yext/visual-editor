import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
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
import { useTranslation, initReactI18next } from "react-i18next";
import i18n from "i18next";
import { TranslatableString } from "src/editor/YextEntityFieldSelector.js";
import LanguageDetector from "i18next-browser-languagedetector";

export type BannerSectionProps = {
  text: YextEntityField<TranslatableString>;
  textAlignment: "left" | "right" | "center";
  backgroundColor?: BackgroundStyle;
  liveVisibility: boolean;
};

const bannerSectionFields: Fields<BannerSectionProps> = {
  text: YextField<any, TranslatableString>("Text", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
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

// TODO: Put this in the a separate file
i18n
  .use(LanguageDetector) // Add language detector
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    resources: {
      en: {
        translation: {
          Test: "A hardcoded value in English",
        },
      },
      es: {
        translation: {
          Test: "A hardcoded value in Spanish",
        },
      },
    },
    fallbackLng: "en",
    deteoptionsction: {
      // This is necessary for the browser language detector to work. Unclear about all of the options.
      order: ["navigator", "localStorage", "cookie", "querystring", "htmlTag"], // Detection sources
      lookupLocalStorage: "i18nextLng", // Key for localStorage
      lookupCookie: "i18next", // Key for cookie
      caches: ["localStorage", "cookie"], // Cache detected language
    },

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

const BannerComponent = ({
  text,
  textAlignment,
  backgroundColor,
}: BannerSectionProps) => {
  const document = useDocument();
  const resolvedText = resolveYextEntityField<TranslatableString>(
    document,
    text
  );
  const { t } = useTranslation();

  const foo = resolvedText as unknown as string;

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[textAlignment];

  console.log("resolvedText", resolvedText);
  return (
    <PageSection background={backgroundColor} verticalPadding="sm">
      {/* This shows how we'd translate normal built-in strings. We'd need to do it globally. */}
      <div className="block">{t("Test")}</div>
      <div className="block">
        <Body>{foo}</Body>
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
