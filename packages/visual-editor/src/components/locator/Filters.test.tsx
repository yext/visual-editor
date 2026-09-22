import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as Dialog from "@radix-ui/react-dialog";
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

vi.mock("@yext/search-ui-react", async () => {
  const actual = await vi.importActual<typeof import("@yext/search-ui-react")>(
    "@yext/search-ui-react"
  );

  return {
    ...actual,
    AppliedFilters: () => null,
    Facets: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    StandardFacet: ({
      fieldId,
      label,
    }: {
      fieldId: string;
      label?: string;
    }) => (
      <div
        data-testid={`facet-${fieldId}`}
        data-label={label}
        data-type="standard"
      />
    ),
    NumericalFacet: ({
      fieldId,
      label,
    }: {
      fieldId: string;
      label?: string;
    }) => (
      <div
        data-testid={`facet-${fieldId}`}
        data-label={label}
        data-type="numerical"
      />
    ),
  };
});

const renderFilterModal = (
  keywordsDisplayName?: React.ComponentProps<
    typeof FilterModal
  >["keywordsDisplayName"],
  defaultOpen = true
) =>
  render(
    <Dialog.Root defaultOpen={defaultOpen} modal>
      <Dialog.Trigger asChild>
        <button>Filter</button>
      </Dialog.Trigger>
      <FilterModal
        showOpenNowOption={false}
        isOpenNowSelected={false}
        showDistanceOptions={false}
        selectedDistanceOption={null}
        handleOpenNowClick={vi.fn()}
        handleDistanceClick={vi.fn()}
        handleClearFiltersClick={vi.fn()}
        accentColorCssValue="#000"
        keywordsDisplayName={keywordsDisplayName}
      />
    </Dialog.Root>
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

  it("moves, traps, and restores focus for the filter dialog", async () => {
    renderFilterModal(undefined, false);

    const filterButton = screen.getByRole("button", { name: "Filter" });
    fireEvent.click(filterButton);

    const dialog = screen.getByRole("dialog");
    const title = screen.getByText("Refine Your Search");
    const closeButton = screen.getByRole("button", { name: "Close" });
    const clearAllButton = screen.getByRole("button", { name: "Clear All" });
    expect(filterButton.getAttribute("aria-controls")).toBe(dialog.id);
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    await waitFor(() => expect(closeButton).toHaveFocus());

    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(clearAllButton).toHaveFocus();

    fireEvent.keyDown(clearAllButton, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(closeButton, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(filterButton).toHaveFocus();
    });

    fireEvent.click(filterButton);
    const reopenedCloseButton = screen.getByRole("button", { name: "Close" });
    await waitFor(() => expect(reopenedCloseButton).toHaveFocus());
    fireEvent.click(reopenedCloseButton);
    await waitFor(() => expect(filterButton).toHaveFocus());
  });
});
