import {
  provideHeadless,
  VerticalResults as VerticalResultsData,
} from "@yext/search-headless-react";
import { DropdownItem, FocusedItemData } from "@yext/search-ui-react";
import { searchConfig } from "./Search.tsx";

export const entityPreviewSearcher = provideHeadless({
  ...searchConfig,
  headlessId: "entity-preview-searcher",
});

export const renderImagePreview = (
  result: any,
  imageField: any
): JSX.Element => {
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

export const renderEntityPreviews = (
  verticalKey: string,
  autocompleteLoading: boolean,
  verticalKeyToResults: Record<string, VerticalResultsData>,
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
