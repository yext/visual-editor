import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { useSearchActions, useSearchState } from "@yext/search-headless-react";
import {
  Facets,
  GenerativeDirectAnswer,
  StandardCard,
  UniversalResults,
  VerticalResults,
} from "@yext/search-ui-react";
import React, { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/index.ts";
import Cards from "./Cards.tsx";
import { MapComponent } from "./MapComponent.tsx";
import {
  defaultSearchResultsProps,
  VerticalConfigProps,
} from "./propsAndTypes.ts";
import SourceCard from "./SourceCard.tsx";
import {
  buildUniversalLimit,
  buildVerticalConfigMap,
  isValidVerticalConfig,
} from "./utils.tsx";
//@ts-ignore
import "./search.css";

export interface SearchResultsSlotProps {
  data: { verticals: VerticalConfigProps[] };
  styles: { enableGenerativeDirectAnswer: boolean };
}

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

  // React.useEffect(() => {
  //   if (!puck?.isEditing) return;

  //   const arrayState = puck.appState?.ui?.arrayState;
  //   if (!arrayState) return;

  //   // safe logic here
  // }, [puck]);
  const searchActions = useSearchActions();
  const isLoading = useSearchState((s) => s.searchStatus.isLoading);
  const searchTerm = useSearchState((s) => s.query.input);
  const gdaLoading = useSearchState((s) => s.generativeDirectAnswer.isLoading);
  const facetsLength = useSearchState((s) => s.filters.facets)?.length;
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
    } else {
      if (searchTerm) {
        searchActions.setQuery(searchTerm);
      }
      if (verticalKey) {
        const verticalLimit = verticals.find(
          (item) => item.verticalKey === verticalKey
        )?.verticalLimit;
        searchActions.setVertical(verticalKey);
        searchActions.setVerticalLimit(verticalLimit!);
        searchActions.executeVerticalQuery();
      } else {
        searchActions.setUniversal();
        searchActions.setUniversalLimit(universalLimit);
        searchActions.executeUniversalQuery();
      }
    }
  }, [verticals, searchTerm, universalLimit, searchActions, verticalKey]);

  // React.useEffect(() => {
  //   if (!arrayKey || !puck.isEditing) return;

  //   const verticalArrayState = arrayState[arrayKey];
  //   const openId = verticalArrayState?.openId;

  //   const selectedItem = verticalArrayState?.items?.find(
  //     (item) => item._arrayId === openId
  //   );

  //   const index = selectedItem?._currentIndex;
  //   if (typeof index !== "number") return;

  //   const selectedConfig = verticals[index];

  //   const nextKey =
  //     selectedConfig?.pageType === "universal"
  //       ? null
  //       : (selectedConfig?.verticalKey ?? null);

  //   if (nextKey !== verticalKey) {
  //     setVerticalKey(nextKey);
  //   }
  // }, [arrayKey, arrayState, verticals, verticalKey, puck.isEditing]);

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
            More
          </button>
        </div>
      </div>
      {isLoading && <div>Loading......</div>}
      {!isLoading &&
        (verticalKey ? (
          <>
            {currentVerticalConfig?.layout === "Map" ? (
              <>
                <div className="h-80 mb-4">
                  <MapComponent />
                </div>
                <VerticalResults CardComponent={StandardCard} />
              </>
            ) : (
              <div className="relative mx-auto flex flex-grow pt-8">
                <div
                  className={`mr-6 ${!puck.isEditing && `w-[200px] -ml-[224px]`} ${facetsLength ? `` : `none`}`}
                >
                  <Facets
                    customCssClasses={{ facetsContainer: "!text-lg w-[200px]" }}
                    searchOnChange={true}
                  />
                </div>
                <div className="flex-grow">
                  <VerticalResults
                    customCssClasses={{
                      verticalResultsContainer:
                        "flex flex-col border rounded-md divide-y",
                    }}
                    CardComponent={(props) => (
                      <Cards
                        {...props}
                        cardType={
                          verticals.find(
                            (item) => item.verticalKey === verticalKey
                          )?.cardType
                        }
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {props.styles.enableGenerativeDirectAnswer && !!searchTerm && (
              <>
                {gdaLoading && (
                  <section
                    className="p-6 my-8 border border-gray-200 rounded-lg shadow-sm centered-container"
                    aria-busy="true"
                    aria-label="Loading content"
                  >
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-6 py-1">
                        <div
                          className="h-4 bg-slate-700 rounded w-1/4"
                          aria-hidden="true"
                        ></div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div
                              className="h-2 bg-slate-700 rounded col-span-3"
                              aria-hidden="true"
                            ></div>
                            <div
                              className="h-2 bg-slate-700 rounded col-span-3"
                              aria-hidden="true"
                            ></div>
                          </div>
                          <div
                            className="h-2 bg-slate-700 rounded"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="h-2 bg-slate-700 rounded"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="h-2 bg-slate-700 rounded"
                            aria-hidden="true"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
                <GenerativeDirectAnswer
                  CitationCard={SourceCard}
                  customCssClasses={{ container: "my-4", divider: "!py-5" }}
                />
              </>
            )}
            <UniversalResults
              verticalConfigMap={verticalConfigMap}
              customCssClasses={{
                sectionHeaderIconContainer: "hidden",
                sectionHeaderLabel: "!pl-0",
              }}
            />
          </>
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
