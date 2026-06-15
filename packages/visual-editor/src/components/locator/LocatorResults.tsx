import { CardProps } from "@yext/search-ui-react";
import { Result } from "@yext/search-headless-react";
import { useTranslation } from "react-i18next";
import { getPreferredDistanceUnit } from "../../utils/i18n/distance.ts";
import { Body } from "../atoms/body.tsx";
import { Button } from "../atoms/button.tsx";
import { Location } from "./LocatorResultCard.tsx";
import { translateDistanceUnit } from "./locatorUtils.ts";

export type SearchState = "not started" | "loading" | "complete";

interface MobileLocatorResultsSectionProps {
  CardComponent: React.ComponentType<CardProps<Location>>;
  results: Result<Location>[];
  hasMoreResults: boolean;
  handleShowMoreResults: () => void;
}

export const MobileLocatorResultsSection = ({
  CardComponent,
  results,
  hasMoreResults,
  handleShowMoreResults,
}: MobileLocatorResultsSectionProps) => {
  const { t } = useTranslation();

  return (
    <>
      {results.length > 0 && (
        <div>
          {results.map((result, position) => (
            <div
              key={
                result.rawData?.id ??
                result.id ??
                `${result.index ?? "result"}-${position}`
              }
            >
              <CardComponent result={result} />
            </div>
          ))}
        </div>
      )}
      {hasMoreResults && (
        // Mobile replaces numbered pagination with incremental loading.
        <div className="px-8 py-4">
          <Button
            className="w-full justify-center"
            onClick={handleShowMoreResults}
          >
            {t("showMoreLocations", "Show more locations")}
          </Button>
        </div>
      )}
    </>
  );
};

interface ResultsCountSummaryProps {
  searchState: SearchState;
  resultCount: number;
  selectedDistanceOption: number | null;
  filterDisplayName?: string;
}

export const ResultsCountSummary = ({
  searchState,
  resultCount,
  selectedDistanceOption,
  filterDisplayName,
}: ResultsCountSummaryProps) => {
  const { t, i18n } = useTranslation();

  if (resultCount === 0) {
    if (searchState === "not started") {
      return (
        <Body>
          {t(
            "useOurLocatorToFindALocationNearYou",
            "Use our locator to find a location near you"
          )}
        </Body>
      );
    }

    if (searchState === "complete") {
      return (
        <Body>
          {t("noResultsFoundForThisArea", "No results found for this area")}
        </Body>
      );
    }

    return <div />;
  }

  if (filterDisplayName) {
    if (selectedDistanceOption) {
      const unit = getPreferredDistanceUnit(i18n.language);
      return (
        <Body>
          {t("locationsWithinDistanceOf", {
            count: resultCount,
            distance: selectedDistanceOption,
            unit: translateDistanceUnit(t, unit, selectedDistanceOption),
            name: filterDisplayName,
          })}
        </Body>
      );
    }

    return (
      <Body>
        {t("locationsNear", {
          count: resultCount,
          name: filterDisplayName,
        })}
      </Body>
    );
  }

  return (
    <Body>
      {t("locationWithCount", {
        count: resultCount,
      })}
    </Body>
  );
};
