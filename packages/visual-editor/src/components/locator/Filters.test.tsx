import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterModal } from "./Filters.tsx";

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (_key: string, defaultValue: string) => defaultValue,
      i18n: { language: "fr" },
    }),
  };
});

vi.mock("@yext/search-headless-react", async () => {
  const actual = await vi.importActual<
    typeof import("@yext/search-headless-react")
  >("@yext/search-headless-react");
  return {
    ...actual,
    useSearchState: (selector: (state: any) => unknown) =>
      selector({
        filters: {
          facets: [
            {
              fieldId: "keywords",
              options: [{ matcher: actual.Matcher.Equals, value: "retail" }],
            },
            {
              fieldId: "services",
              options: [{ matcher: actual.Matcher.Equals, value: "delivery" }],
            },
            {
              fieldId: "languages",
              options: [{ matcher: actual.Matcher.Equals, value: "French" }],
            },
            {
              fieldId: "yearsOfExperience",
              options: [
                {
                  matcher: actual.Matcher.Between,
                  value: {
                    start: {
                      matcher: actual.Matcher.GreaterThanOrEqualTo,
                      value: 5,
                    },
                  },
                },
              ],
            },
          ],
        },
      }),
  };
});

vi.mock("@yext/search-ui-react", () => ({
  AppliedFilters: () => null,
  Facets: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  StandardFacet: ({ fieldId, label }: { fieldId: string; label?: string }) => (
    <div
      data-testid={`facet-${fieldId}`}
      data-label={label}
      data-type="standard"
    />
  ),
  NumericalFacet: ({ fieldId, label }: { fieldId: string; label?: string }) => (
    <div
      data-testid={`facet-${fieldId}`}
      data-label={label}
      data-type="numerical"
    />
  ),
}));

const renderFilterModal = (
  keywordsDisplayName?: React.ComponentProps<
    typeof FilterModal
  >["keywordsDisplayName"]
) =>
  render(
    <FilterModal
      showFilterModal={true}
      showOpenNowOption={false}
      isOpenNowSelected={false}
      showDistanceOptions={false}
      selectedDistanceOption={null}
      handleCloseModalClick={vi.fn()}
      handleOpenNowClick={vi.fn()}
      handleDistanceClick={vi.fn()}
      handleClearFiltersClick={vi.fn()}
      accentColorCssValue="#000"
      closeButtonRef={React.createRef<HTMLButtonElement>()}
      keywordsDisplayName={keywordsDisplayName}
    />
  );

describe("FilterModal", () => {
  it("uses the current-locale display name only for the Keywords facet", () => {
    renderFilterModal({
      en: "Store Type",
      fr: "Type de magasin",
      hasLocalizedValue: "true",
    });

    expect(screen.getByTestId("facet-keywords").dataset.label).toBe(
      "Type de magasin"
    );
    expect(screen.getByTestId("facet-services").dataset.label).toBeUndefined();
    expect(screen.getByTestId("facet-languages").dataset.label).toBeUndefined();
    expect(screen.getByTestId("facet-yearsOfExperience").dataset).toMatchObject(
      {
        type: "numerical",
      }
    );
  });

  it("leaves the Keywords label undefined when the current locale is missing", () => {
    renderFilterModal({
      en: "Store Type",
      hasLocalizedValue: "true",
    });

    expect(screen.getByTestId("facet-keywords").dataset.label).toBeUndefined();
  });
});
