import {
  ComponentConfig,
  Fields,
  PuckComponent,
  usePuck,
} from "@puckeditor/core";
import { useSearchActions, useSearchState } from "@yext/search-headless-react";
import React, { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/index.ts";
import {
  defaultSearchResultsProps,
  SearchResultsSlotProps,
} from "./defaultPropsAndTypes.ts";
import { UniversalResultsSection } from "./UniversalResultsSection.tsx";
import {
  buildUniversalLimit,
  buildVerticalConfigMap,
  isValidVerticalConfig,
} from "./utils.tsx";
import { VerticalResultsSection } from "./VerticalResultsSection.tsx";
import { t } from "i18next";

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
        },
        arrayFields: {
          label: YextField(msg("fields.label", "Label"), { type: "text" }),
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
            {
              type: "number",
            }
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
          options: [
            { label: msg("fields.options.show", "Show"), value: true },
            { label: msg("fields.options.hide", "Hide"), value: false },
          ],
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

  const searchActions = useSearchActions();
  const isLoading = useSearchState((s) => s.searchStatus.isLoading);
  const searchTerm = useSearchState((s) => s.query.input);
  const gdaLoading =
    useSearchState((s) => s.generativeDirectAnswer.isLoading) || false;
  const facetsLength = useSearchState((s) => s.filters.facets);
  const [verticalKey, setVerticalKey] = useState<string | null>(null);
  const verticalConfigMap = React.useMemo(
    () => buildVerticalConfigMap(verticals),
    [verticals]
  );

  const universalLimit = React.useMemo(
    () => buildUniversalLimit(verticals),
    [verticals]
  );

  const currentVerticalConfig = React.useMemo(
    () => verticals.find((v) => v.verticalKey === verticalKey),
    [verticals, verticalKey]
  );

  React.useEffect(() => {
    if (!isValidVerticalConfig(verticals)) {
      console.warn("Skipping search: invalid vertical config", verticals);
      return;
    }

    if (searchTerm) {
      searchActions.setQuery(searchTerm);
    }

    if (verticalKey && currentVerticalConfig) {
      searchActions.setVertical(verticalKey);

      if (typeof currentVerticalConfig.verticalLimit === "number") {
        searchActions.setVerticalLimit(currentVerticalConfig.verticalLimit);
      }

      searchActions.executeVerticalQuery();
      return;
    }

    searchActions.setUniversal();
    searchActions.setUniversalLimit(universalLimit);
    searchActions.executeUniversalQuery();
  }, [
    verticals,
    searchTerm,
    universalLimit,
    verticalKey,
    currentVerticalConfig,
    searchActions,
  ]);

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
          {verticals.map((item) => (
            <li key={item.verticalKey ?? item.label}>
              <a
                onClick={() =>
                  setVerticalKey(
                    item.pageType === "universal"
                      ? null
                      : (item.verticalKey ?? null)
                  )
                }
                className={`px-5 pt-1.5 pb-3 tracking-[1.1px] mb-0 hover:cursor-pointer ${
                  item.pageType === "universal"
                    ? verticalKey === null
                      ? "border-b-2 border-black"
                      : ""
                    : verticalKey === item.verticalKey
                      ? "border-b-2 border-black"
                      : ""
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
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
        (verticalKey ? (
          <VerticalResultsSection
            verticalKey={verticalKey}
            verticals={verticals}
            currentVerticalConfig={currentVerticalConfig}
            puck={puck}
            facetsLength={facetsLength}
          />
        ) : (
          <UniversalResultsSection
            enableGDA={props.styles.enableGenerativeDirectAnswer}
            searchTerm={searchTerm}
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
