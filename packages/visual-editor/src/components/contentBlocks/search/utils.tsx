import {
  CloudRegion,
  Environment,
  provideHeadless,
  SearchConfig,
  VerticalResults,
} from "@yext/search-headless-react";
import { DropdownItem, FocusedItemData } from "@yext/search-ui-react";
import React from "react";
import { useDocument } from "../../../hooks/useDocument.tsx";
import {
  SearchBarAlignProps,
  SearchBarHeightProps,
  SearchBarRoundedProps,
  SearchBarWidthProps,
} from "./defaultPropsAndTypes.ts";

export const buildSearchConfigFromDocument = (document: any): SearchConfig => {
  return {
    apiKey: document?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY ?? "",
    experienceKey: document?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY ?? "",
    locale: document?.locale ?? "en",
    experienceVersion: "PRODUCTION",
    cloudRegion: CloudRegion.US,
    environment: Environment.PROD,
  };
};

export const useEntityPreviewSearcher = (document: any) => {
  return React.useMemo(() => {
    const config = buildSearchConfigFromDocument(document);

    if (!config.apiKey || !config.experienceKey) {
      return undefined;
    }

    return provideHeadless({
      ...config,
      headlessId: "entity-preview-searcher",
    });
  }, [document]);
};

export const useTypingEffect = ({
  env,
  enabled = false,
  locale = "en",
}: {
  env: "PRODUCTION" | "SANDBOX";
  enabled?: boolean;
  locale?: string;
}) => {
  const [queryPrompts, setQueryPrompts] = React.useState<string[]>([]);
  const [placeholder, setPlaceholder] = React.useState("");
  const document = useDocument();

  const indexRef = React.useRef(0);
  const charIndexRef = React.useRef(0);
  const isDeletingRef = React.useRef(false);

  React.useEffect(() => {
    if (!enabled) return;

    const fetchPrompts = async () => {
      const base = env === "PRODUCTION" ? "cdn" : "sbx-cdn";
      const url = `https://${base}.yextapis.com/v2/accounts/me/search/autocomplete?v=20250101&api_key=${document?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY}&sessionTrackingEnabled=false&experienceKey=${document?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY}&locale=${locale}&input=`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setQueryPrompts(data.response.results.map((item: any) => item.value));
      } catch (err) {
        console.error("TypingEffect fetch failed:", err);
      }
    };

    fetchPrompts();
  }, [
    document?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY,
    document?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY,
    enabled,
    env,
    locale,
  ]);

  React.useEffect(() => {
    if (queryPrompts.length === 0) return;

    const interval = window.setInterval(() => {
      const currentWord = queryPrompts[indexRef.current];
      if (!currentWord) return;

      if (!isDeletingRef.current) {
        charIndexRef.current += 1;
        setPlaceholder(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current === currentWord.length) {
          isDeletingRef.current = true;
        }
      } else {
        charIndexRef.current -= 1;
        setPlaceholder(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current === 0) {
          isDeletingRef.current = false;
          indexRef.current = (indexRef.current + 1) % queryPrompts.length;
        }
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [queryPrompts]);

  return { placeholder };
};

const renderImagePreview = (result: any, imageField: any): JSX.Element => {
  const imageData = imageField?.image || imageField;
  const numThumbnails = imageData?.thumbnails?.length || 0;
  const imageThumbnail =
    numThumbnails > 0 ? imageData.thumbnails[numThumbnails - 1] : imageData;

  return (
    <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100">
      {imageThumbnail && (
        <img
          className="w-32"
          src={imageThumbnail.url}
          alt={`${result.name} thumbnail`}
        />
      )}
      <div className="font-semibold pl-3">{result.name}</div>
    </div>
  );
};

const renderEntityPreviews = (
  verticalKey: string,
  autocompleteLoading: boolean,
  verticalKeyToResults: Record<string, VerticalResults>,
  dropdownItemProps: {
    onClick: (
      value: string,
      _index: number,
      itemData?: FocusedItemData
    ) => void;
    ariaLabel: (value: string) => string;
  }
): JSX.Element | null => {
  if (!verticalKey || !(verticalKey in verticalKeyToResults)) {
    return null;
  }

  const results = verticalKeyToResults[verticalKey]?.results?.map(
    (result) => result.rawData
  ) as any[] | undefined;

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div key={verticalKey} className="flex flex-col gap-2 px-8">
      <div
        className={`grid grid-cols-2 md:grid-cols-4 ${
          autocompleteLoading ? "opacity-50" : ""
        }`}
      >
        {results.map((result) => (
          <DropdownItem
            key={result.id}
            value={result.name}
            onClick={() =>
              history.pushState(null, "", `${result.landingPageUrl}`)
            }
            ariaLabel={dropdownItemProps.ariaLabel}
          >
            {renderImagePreview(
              result,
              result.primaryPhoto ||
                result.headshot ||
                result.photoGallery?.[0] ||
                null
            )}
          </DropdownItem>
        ))}
      </div>
    </div>
  );
};

const createPreviews = (verticalKey: string) => {
  return (
    autocompleteLoading: boolean,
    verticalKeyToResults: Record<string, VerticalResults>,
    dropdownItemProps: {
      onClick: (
        value: string,
        _index: number,
        itemData?: FocusedItemData
      ) => void;
      ariaLabel: (value: string) => string;
    }
  ) => {
    return renderEntityPreviews(
      verticalKey,
      autocompleteLoading,
      verticalKeyToResults,
      dropdownItemProps
    );
  };
};

export const createVisualAutocompleteConfig = (
  enable: boolean,
  verticalKey: string,
  limit: number,
  entityPreviewSearcher: any
) => {
  if (!enable || !verticalKey || limit < 1 || !entityPreviewSearcher) {
    return undefined;
  }

  return {
    entityPreviewSearcher,
    includedVerticals: [verticalKey],
    renderEntityPreviews: createPreviews(verticalKey),
    universalLimit: { [verticalKey]: limit },
    entityPreviewsDebouncingTime: 300,
  };
};

export const getRounded = (val: SearchBarRoundedProps) => {
  switch (val) {
    case "small":
      return "[&>div]:rounded-sm";
    case "medium":
      return "[&>div]:rounded-md";
    case "large":
      return "[&>div]:rounded-xl";
    case "pill":
      return "[&>div]:rounded-3xl";
    default:
      return "[&>div]:rounded-none";
  }
};

export const getWidth = (val: SearchBarWidthProps) => {
  switch (val) {
    case "small":
      return "w-1/2";
    case "half":
      return "w-3/4";
    default:
      return "w-full";
  }
};

export const getHeight = (val: SearchBarHeightProps) => {
  switch (val) {
    case "large":
      return "h-24";
    case "extraLarge":
      return "h-48";
    default:
      return "h-14";
  }
};

export const getAlignment = (val: SearchBarAlignProps) => {
  switch (val) {
    case "center":
      return "mx-auto";
    case "right":
      return "ml-auto mr-0";
    default:
      return "ml-0 mr-auto";
  }
};
