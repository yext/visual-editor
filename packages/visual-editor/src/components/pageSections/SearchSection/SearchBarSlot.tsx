import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import { SearchBar } from "@yext/search-ui-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaMicrophone } from "react-icons/fa";
import { resolveDataFromParent } from "../../../editor/ParentData.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  defaultSearchData,
  SearchBarAlignProps,
  SearchBarHeightProps,
  SearchBarRoundedProps,
  SearchBarWidthProps,
} from "./defaultPropsAndTypes.ts";
import { useEntityPreviewSearcher } from "./searchConfig.ts";
import { useTypingEffect } from "./useTypeEffect.ts";
import {
  createVisualAutocompleteConfig,
  getAlignment,
  getHeight,
  getRounded,
  getWidth,
} from "./utils.tsx";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<
    ArrayLike<{
      transcript: string;
    }>
  >;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

export interface SearchBarSlotProps {
  styles: {
    showIcon: boolean;
    voiceSearch: boolean;
    isTypingEffect: boolean;
    enableVisualAutoComplete: boolean;
    visualAutoCompleteVerticalKey?: string;
    limit?: number;
    height?: SearchBarHeightProps;
    width?: SearchBarWidthProps;
    align?: SearchBarAlignProps;
    rounded: SearchBarRoundedProps;
  };
  parentData?: {
    showSearchResultsSection: boolean;
  };
}

const searchBarSlotFields: Fields<SearchBarSlotProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showIcon: YextField(msg("fields.showIcon", "Show Icon"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      voiceSearch: YextField(msg("fields.voiceSearch", "Voice Search"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      isTypingEffect: YextField(msg("fields.isTypingEffect", "Type Effect"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      enableVisualAutoComplete: YextField(
        msg("fields.enableVisualAutoComplete", "Enable Visual Autocomplete"),
        {
          type: "radio",
          options: "SHOW_HIDE",
        }
      ),
      rounded: YextField(msg("fields.borderRadius", "Border Radius"), {
        type: "select",
        options: [
          {
            label: msg("fields.none", "None"),
            value: "none",
          },
          {
            label: msg("fields.small", "Small"),
            value: "small",
          },
          {
            label: msg("fields.medium", "Medium"),
            value: "medium",
          },
          {
            label: msg("fields.large", "Large"),
            value: "large",
          },
          {
            label: msg("fields.pill", "Pill"),
            value: "pill",
          },
        ],
      }),
      visualAutoCompleteVerticalKey: YextField(
        msg(
          "fields.visualAutoCompleteVerticalKey",
          "Visual Autocomplete Vertical Key"
        ),
        {
          type: "text",
        }
      ),
      limit: YextField(msg("fields.limit", "Limit"), {
        type: "number",
        min: 0,
        max: 5,
      }),
      height: YextField(msg("fields.height", "Height"), {
        type: "radio",
        options: [
          {
            label: msg("fields.base", "Base"),
            value: "base",
          },
          {
            label: msg("fields.large", "Large"),
            value: "large",
          },
          {
            label: msg("fields.extraLarge", "Extra Large"),
            value: "extraLarge",
          },
        ],
      }),
      width: YextField(msg("fields.width", "Width"), {
        type: "radio",
        options: [
          {
            label: msg("fields.small", "Small"),
            value: "small",
          },
          {
            label: msg("fields.half", "Half"),
            value: "half",
          },
          {
            label: msg("fields.full", "Full"),
            value: "full",
          },
        ],
      }),
      align: YextField(msg("fields.searchBarAlign", "Search Bar Align"), {
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      }),
    },
  }),
};

const SearchBarSlotInternal: PuckComponent<SearchBarSlotProps> = ({
  styles: {
    showIcon,
    voiceSearch,
    isTypingEffect,
    enableVisualAutoComplete,
    visualAutoCompleteVerticalKey = "products",
    limit = 3,
    height = "base",
    width = "full",
    align = "left",
    rounded = "none",
  },
  parentData,
  puck,
}) => {
  const document = useDocument();
  const { placeholder } = useTypingEffect({
    env: "PRODUCTION",
    enabled: isTypingEffect,
    locale: document.locale,
  });
  const { t } = useTranslation();
  const entityPreviewSearcher = useEntityPreviewSearcher(document);
  const showResults = parentData?.showSearchResultsSection ?? false;
  const visualAutocompleteConfig = React.useMemo(() => {
    return createVisualAutocompleteConfig(
      enableVisualAutoComplete,
      visualAutoCompleteVerticalKey,
      limit,
      entityPreviewSearcher
    );
  }, [
    enableVisualAutoComplete,
    visualAutoCompleteVerticalKey,
    limit,
    entityPreviewSearcher,
  ]);
  const heightClass = !showResults ? getHeight(height) : "";
  const layoutClasses = !showResults
    ? `${getWidth(width)} ${getAlignment(align)}`
    : "w-full";
  const recognitionRef = React.useRef<BrowserSpeechRecognition | null>(null);
  const [isListening, setIsListening] = React.useState(false);

  const handleTranscript = React.useCallback((transcript: string) => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const searchTerm = transcript.trim();

    if (searchTerm) {
      url.searchParams.set("searchTerm", searchTerm);
    } else {
      url.searchParams.delete("searchTerm");
    }

    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const handleVoiceSearch = React.useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = document.locale || "en";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .flatMap((result) => Array.from(result))
        .map((result) => result.transcript)
        .join(" ");

      handleTranscript(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [document.locale, handleTranscript, isListening]);

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleSearch = React.useCallback(
    ({ query: nextQuery }: { query?: string; verticalKey?: string }) => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);

      if (nextQuery?.trim()) {
        url.searchParams.set("searchTerm", nextQuery.trim());
      } else {
        url.searchParams.delete("searchTerm");
      }

      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    []
  );

  return (
    <div
      className={`relative w-full flex my-2 items-center ${puck.isEditing ? "pt-4" : ""}`}
    >
      <div className={`relative ${layoutClasses} ${heightClass} `}>
        <SearchBar
          onSearch={handleSearch}
          visualAutocompleteConfig={visualAutocompleteConfig}
          placeholder={isTypingEffect ? placeholder : "Search here...."}
          customCssClasses={{
            searchBarContainer: `h-16 ${getRounded(rounded)} !mb-0 relative ${
              isTypingEffect ? "isTypingEffect" : ""
            } w-full`,
            searchButtonContainer: `${voiceSearch ? `ml-14 my-auto` : showIcon ? `` : `hidden`}`,
            searchButton: `${showIcon ? `h-8 w-8 text-palette-primary-dark` : `hidden`}`,
            inputElement: `text-lg h-12 outline-none focus:outline-none focus:ring-0 focus:border-none px-5 py-2.5 rounded-[inherit]`,
          }}
        />
        {voiceSearch && (
          <button
            type="button"
            onClick={handleVoiceSearch}
            aria-label={t("voiceSearch", "Voice Search")}
            className={`${
              showIcon ? "right-14" : "right-4"
            } absolute inset-y-0 z-50 flex items-center justify-center text-palette-primary-dark`}
          >
            {isListening && (
              <>
                <span className="absolute h-8 w-8 rounded-full bg-palette-primary/20 animate-ping" />
                <span className="absolute h-10 w-10 rounded-full bg-palette-primary/10 animate-pulse" />
              </>
            )}
            <FaMicrophone
              className={`relative h-6 w-6 ${
                isListening ? "opacity-100 text-palette-primary" : "opacity-80"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export const SearchBarSlot: ComponentConfig<{ props: SearchBarSlotProps }> = {
  label: msg("components.searchBarSlot", "SearchBar Slot"),
  fields: searchBarSlotFields,
  defaultProps: defaultSearchData,
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(searchBarSlotFields, data);
    const isVisualAutoEnabled = !!data?.props?.styles?.enableVisualAutoComplete;
    setDeep(
      updatedFields,
      "styles.objectFields.visualAutoCompleteVerticalKey.visible",
      isVisualAutoEnabled
    );
    setDeep(
      updatedFields,
      "styles.objectFields.limit.visible",
      isVisualAutoEnabled
    );

    const showResults =
      data?.props?.parentData?.showSearchResultsSection ?? false;

    const showLayoutControls = !showResults;

    setDeep(
      updatedFields,
      "styles.objectFields.height.visible",
      showLayoutControls
    );
    setDeep(
      updatedFields,
      "styles.objectFields.width.visible",
      showLayoutControls
    );
    setDeep(
      updatedFields,
      "styles.objectFields.align.visible",
      showLayoutControls
    );
    setDeep(updatedFields, "data", false);
    return updatedFields;
  },
  render: (props) => <SearchBarSlotInternal {...props} />,
};
