import { UniversalLimit, VerticalResults } from "@yext/search-headless-react";
import {
  DefaultRawDataType,
  FocusedItemData,
  VerticalConfigMap,
} from "@yext/search-ui-react";
import Cards from "./Cards.tsx";
import { LayoutSection } from "./LayoutSections.tsx";
import { VerticalConfigProps } from "./defaultPropsAndTypes.ts";
import { renderEntityPreviews } from "./searchVisualAutoComplete.tsx";

export const buildVerticalConfigMap = (
  verticals: VerticalConfigProps[]
): VerticalConfigMap<Record<string, DefaultRawDataType>> => {
  return verticals.reduce(
    (acc, v) => {
      if (!v.verticalKey) return acc;
      const layoutType = v.layout ?? "Flex";
      const cardType = v.cardType ?? "Standard";
      acc[v.verticalKey] = {
        label: v.label,
        viewAllButton: true,
        SectionComponent: (props) => (
          <LayoutSection
            resultsCount={v.universalLimit ?? 4}
            {...props}
            layoutType={layoutType}
          />
        ),
        CardComponent: (props) => <Cards {...props} cardType={cardType} />,
      };
      return acc;
    },
    {} as VerticalConfigMap<Record<string, DefaultRawDataType>>
  );
};

export const buildUniversalLimit = (
  verticals: {
    label: string;
    verticalKey?: string;
    universalLimit?: number;
  }[]
): UniversalLimit => {
  return verticals.reduce<UniversalLimit>((acc, v) => {
    if (!v.verticalKey || typeof v.universalLimit !== "number") {
      return acc;
    }
    acc[v.verticalKey] = v.universalLimit;
    // acc[v.verticalKey] = 50;
    return acc;
  }, {});
};

const isValidVertical = (v: any): boolean => {
  if (!v || typeof v !== "object") return false;
  if (v.pageType === "universal") {
    return typeof v.label === "string";
  }
  return (
    typeof v.label === "string" &&
    typeof v.verticalKey === "string" &&
    (v.layout === "Grid" || v.layout === "Flex" || v.layout === "Map") &&
    typeof v.universalLimit === "number" &&
    typeof v.verticalLimit === "number"
  );
};

export const isValidVerticalConfig = (verticals: any[]): boolean => {
  return (
    Array.isArray(verticals) &&
    verticals.length > 0 &&
    verticals.every(isValidVertical)
  );
};

export const createPreviews = (verticalKey: string) => {
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

export const updateSearchUrl = (params: {
  vertical?: string | null;
  searchTerm?: string;
}) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);

  if (params.vertical && params.vertical.trim()) {
    url.searchParams.set("vertical", params.vertical);
  } else {
    url.searchParams.delete("vertical");
  }

  const st = (params.searchTerm ?? "").trim();
  if (st.length > 0) {
    url.searchParams.set("searchTerm", st);
  } else {
    url.searchParams.delete("searchTerm");
  }

  window.history.replaceState({}, "", url.toString());
};

export const readInitialUrlParams = (): {
  vertical: string | null;
  searchTerm: string;
} => {
  if (typeof window === "undefined") {
    return { vertical: null, searchTerm: "" };
  }

  const url = new URL(window.location.href);

  return {
    vertical: url.searchParams.get("vertical"),
    searchTerm: url.searchParams.get("searchTerm") ?? "",
  };
};
