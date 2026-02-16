import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { useSearchActions, useSearchState } from "@yext/search-headless-react";
import { UniversalResults, VerticalResults } from "@yext/search-ui-react";
import React, { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import Cards from "./Cards.tsx";
import {
  defaultSearchResultsProps,
  VerticalConfigProps,
} from "./propsAndTypes.ts";
import {
  buildUniversalLimit,
  buildVerticalConfigMap,
  isValidVerticalConfig,
} from "./utils.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/index.ts";

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
  } = props;
  // const { appState } = usePuck();
  // const arrayState = appState.ui.arrayState;

  // const arrayKey = Object.keys(arrayState || {}).find((key) =>
  //   key.includes("_object_data_verticals")
  // );

  // let selectedVerticalIndex: number | null = null;

  // if (arrayKey) {
  //   const verticalArrayState = arrayState[arrayKey];
  //   const openId = verticalArrayState?.openId;

  //   const selectedItem = verticalArrayState?.items?.find(
  //     (item) => item._arrayId === openId
  //   );

  //   selectedVerticalIndex = selectedItem?._currentIndex ?? null;
  // }

  // console.log("Selected vertical index:", selectedVerticalIndex);

  const searchActions = useSearchActions();
  const isLoading = useSearchState((s) => s.searchStatus.isLoading);
  const searchTerm = useSearchState((s) => s.query.input) ?? " ";
  const [verticalKey, setVerticalKey] = useState<string | undefined>();

  const verticalConfigMap = React.useMemo(
    () => buildVerticalConfigMap(verticals),
    [verticals]
  );

  const universalLimit = React.useMemo(
    () => buildUniversalLimit(verticals),
    [verticals]
  );

  React.useEffect(() => {
    if (!isValidVerticalConfig(verticals)) {
      console.warn("Skipping search: invalid vertical config", verticals);
      return;
    } else {
      if (verticalKey) {
        const verticalLimit = verticals.find(
          (item) => item.verticalKey === verticalKey
        )?.verticalLimit;
        searchActions.setVertical(verticalKey);
        searchActions.setVerticalLimit(verticalLimit!);
        searchActions.executeVerticalQuery();
      } else {
        searchActions.setUniversal();
        // searchActions.setQuery("faq");
        searchActions.setUniversalLimit(universalLimit);
        searchActions.executeUniversalQuery();
      }
    }
  }, [verticals, searchTerm, universalLimit, searchActions, verticalKey]);

  return (
    <div className="  pt-8">
      <div className="border-b flex justify-start items-center">
        <ul className="flex items-center">
          {verticals.map((item) => (
            <li key={item.verticalKey ?? item.label}>
              <a
                onClick={() => setVerticalKey(item.verticalKey)}
                className="px-5 pt-1.5 pb-1 tracking-[1.1px] mb-0 hover:cursor-pointer"
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
          <VerticalResults
            customCssClasses={{
              verticalResultsContainer:
                "flex flex-col mt-12 border rounded-md divide-y",
            }}
            CardComponent={(props) => (
              <Cards
                {...props}
                cardType={
                  verticals.find((item) => item.verticalKey === verticalKey)
                    ?.cardType
                }
              />
            )}
          />
        ) : (
          <UniversalResults
            verticalConfigMap={verticalConfigMap}
            customCssClasses={{
              sectionHeaderIconContainer: "hidden",
              sectionHeaderLabel: "!pl-0",
            }}
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
