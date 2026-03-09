import {
  ComponentConfig,
  Fields,
  PuckComponent,
  usePuck,
} from "@puckeditor/core";
import { useSearchActions, useSearchState } from "@yext/search-headless-react";
import React, { useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import {
  defaultSearchResultsProps,
  SearchResultsSlotProps,
} from "./defaultPropsAndTypes.ts";
import { UniversalResultsSection } from "./UniversalResultsSection.tsx";
import {
  buildUniversalLimit,
  buildVerticalConfigMap,
  isValidVerticalConfig,
  readInitialUrlParams,
  updateSearchUrl,
} from "./utils.tsx";
import { VerticalResultsSection } from "./VerticalResultsSection.tsx";

const SearchResultsSlotFields: Fields<SearchResultsSlotProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      verticals: {
        label: msg("fields.verticals", "Verticals"),
        type: "array",
        defaultItemProps: {
          label: "",
          verticalKey: "",
          layout: "Flex",
          cardType: "Standard",
          universalLimit: 5,
          verticalLimit: 5,
          pageType: "vertical",
        },
        arrayFields: {
          label: YextField(msg("fields.label", "Label"), { type: "text" }),
          pageType: YextField(msg("fields.pageType", "Page Type"), {
            type: "radio",
            options: [
              { label: "Universal", value: "universal" },
              { label: "Vertical", value: "vertical" },
            ],
            visible: false,
          }),
          verticalKey: YextField(msg("fields.verticalKey", "Vertical Key"), {
            type: "text",
          }),
          layout: YextField(msg("fields.layout", "Layout"), {
            type: "radio",
            options: [
              { label: "Grid", value: "Grid" },
              { label: "Flex", value: "Flex" },
              { label: "Map", value: "Map" },
            ],
          }),
          cardType: YextField(msg("fields.cardType", "Card Type"), {
            type: "radio",
            options: [
              { label: "Standard", value: "Standard" },
              { label: "Accordion", value: "Accordion" },
            ],
          }),
          universalLimit: YextField(
            msg("fields.universalLimit", "Universal Limit"),
            { type: "number" }
          ),
          verticalLimit: YextField(
            msg("fields.verticalLimit", "Vertical Limit"),
            { type: "number" }
          ),
        },
        getItemSummary: (item) => item?.label || "Vertical",
      },
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      enableGenerativeDirectAnswer: YextField(
        msg("fields.enableGenerativeDirectAnswer", "Generative Direct Answer"),
        {
          type: "radio",
          options: "SHOW_HIDE",
        }
      ),
    },
  }),
};

const SearchResultsSlotInternal: PuckComponent<SearchResultsSlotProps> = (
  props
) => {
  const {
    data: { verticals },
    puck,
  } = props;
  const puckStore = useOptionalPuckStore();
  const arrayState = puckStore?.appState?.ui?.arrayState;

  const arrayKey = React.useMemo(() => {
    if (!arrayState || !puck.isEditing) return undefined;

    return Object.keys(arrayState).find((key) =>
      key.includes("_object_data_verticals")
    );
  }, [arrayState, puck.isEditing]);

  const { t } = useTranslation();
  const searchActions = useSearchActions();
  const [verticalKey, setVerticalKey] = useState<string | null>(null);
  const isLoading = useSearchState((s) => s.searchStatus.isLoading);
  const committedSearchTerm = useSearchState((s) => s.query.input ?? "");
  const activeVerticalKey = useSearchState(
    (s: any) => s.vertical?.verticalKey ?? null
  );
  const searchType = useSearchState((s: any) => s.meta?.searchType ?? null);
  const isUniversalActive = searchType
    ? searchType === "universal"
    : activeVerticalKey == null;

  const gdaLoading = useSearchState(
    (s) => s.generativeDirectAnswer.isLoading ?? false
  );

  const facetsLength = useSearchState((s) => {
    const facets: unknown = (s as any).filters?.facets;
    return Array.isArray(facets) ? facets.length : 0;
  });

  const verticalConfigMap = React.useMemo(
    () => buildVerticalConfigMap(verticals),
    [verticals]
  );

  const universalLimit = React.useMemo(
    () => buildUniversalLimit(verticals),
    [verticals]
  );

  const currentVerticalConfig = React.useMemo(() => {
    if (!activeVerticalKey) return undefined;
    return verticals.find((v) => v.verticalKey === activeVerticalKey);
  }, [verticals, activeVerticalKey]);

  const runSearch = (nextVerticalKey: string | null) => {
    if (!isValidVerticalConfig(verticals)) return;

    const query = committedSearchTerm ?? "";

    searchActions.setQuery(query);

    if (nextVerticalKey) {
      searchActions.setVertical(nextVerticalKey);

      const cfg = verticals.find((v) => v.verticalKey === nextVerticalKey);

      if (cfg?.verticalLimit) {
        searchActions.setVerticalLimit(cfg.verticalLimit);
      }

      searchActions.executeVerticalQuery();
    } else {
      searchActions.setUniversal();
      searchActions.setUniversalLimit(universalLimit);
      searchActions.executeUniversalQuery();
    }

    updateSearchUrl({
      vertical: nextVerticalKey,
      searchTerm: query,
    });
  };

  useEffect(() => {
    if (!isValidVerticalConfig(verticals)) return;
    runSearch(verticalKey);
  }, [verticalKey]);
  React.useEffect(() => {
    const { vertical, searchTerm } = readInitialUrlParams();

    searchActions.setQuery(searchTerm);

    const validVertical =
      vertical && verticals.some((v) => v.verticalKey === vertical);

    setVerticalKey(validVertical ? vertical! : null);
  }, [verticals, searchActions]);

  React.useEffect(() => {
    if (!arrayKey || !puck.isEditing || !arrayState) return;

    const verticalArrayState = arrayState[arrayKey];
    const openId = verticalArrayState?.openId;

    const selectedItem = verticalArrayState?.items?.find(
      (item) => item._arrayId === openId
    );

    const index = selectedItem?._currentIndex;
    if (typeof index !== "number") return;

    const selectedConfig = verticals[index];

    const nextKey =
      selectedConfig?.pageType === "universal"
        ? null
        : (selectedConfig?.verticalKey ?? null);

    if (nextKey !== verticalKey) {
      setVerticalKey(nextKey);
    }
  }, [arrayKey, arrayState, verticals, verticalKey, puck.isEditing]);

  return (
    <div className="pt-8">
      <div className="border-b flex justify-start items-center">
        <ul className="flex items-center">
          {verticals.map((item, idx) => {
            const isActive =
              item.pageType === "universal"
                ? verticalKey === null
                : item.verticalKey === verticalKey;

            return (
              <li key={`${item.verticalKey ?? "no-key"}:${item.label}:${idx}`}>
                <a
                  onClick={() =>
                    setVerticalKey(
                      item.pageType === "universal"
                        ? null
                        : (item.verticalKey ?? null)
                    )
                  }
                  className={`px-5 pt-1.5 pb-3 tracking-[1.1px] mb-0 hover:cursor-pointer ${
                    isActive ? "border-b-2 border-black" : ""
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto relative flex">
          <button className="px-5 pt-1.5 pb-1 tracking-[1.1px] visible mb-0 flex gap-2 items-center">
            <FaEllipsisV className="flex my-2.5 mr-[0.4375rem]" />
            {t("more", "More")}
          </button>
        </div>
      </div>

      {isLoading && <div>{t("loadingResults", "Loading Results...")}</div>}

      {!isLoading &&
        (!isUniversalActive && activeVerticalKey ? (
          <VerticalResultsSection
            verticalKey={activeVerticalKey}
            verticals={verticals}
            currentVerticalConfig={currentVerticalConfig}
            puck={puck}
            facetsLength={facetsLength}
          />
        ) : (
          <UniversalResultsSection
            enableGDA={props.styles?.enableGenerativeDirectAnswer ?? true}
            searchTerm={committedSearchTerm}
            gdaLoading={gdaLoading}
            verticalConfigMap={verticalConfigMap}
          />
        ))}
    </div>
  );
};

export const SearchResultsSlot: ComponentConfig<{
  props: SearchResultsSlotProps;
}> = {
  label: msg("components.SearchResultsSlot", "Search Results Slot"),
  fields: SearchResultsSlotFields,
  defaultProps: defaultSearchResultsProps,
  render: (props) => <SearchResultsSlotInternal {...props} />,
};

const useOptionalPuckStore = () => {
  try {
    return usePuck();
  } catch {
    return undefined;
  }
};
