import {
  ComponentConfig,
  Fields,
  PuckComponent,
  usePuck,
} from "@puckeditor/core";
import { useSearchActions, useSearchState } from "@yext/search-headless-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaEllipsisV } from "react-icons/fa";
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
  updateSearchUrl,
  useSearchUrlParams,
} from "./utils.tsx";
import { VerticalResultsSection } from "./VerticalResultsSection.tsx";
import { getThemeColorCssValue } from "../../../utils/colors.ts";

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
          enableGenerativeDirectAnswer: false,
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
          enableGenerativeDirectAnswer: YextField(
            msg(
              "fields.enableGenerativeDirectAnswer",
              "Generative Direct Answer"
            ),
            {
              type: "radio",
              options: "SHOW_HIDE",
            }
          ),
        },
        getItemSummary: (item) => item?.label || "Vertical",
      },
    },
  }),
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      ctaStyles: {
        type: "object",
        label: msg("fields.buttonStyles", "Button Styles"),
        objectFields: {
          background: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              options: "SITE_COLOR",
            }
          ),
          textColor: YextField(msg("fields.textColor", "Text Color"), {
            type: "select",
            options: "SITE_COLOR",
          }),
        },
      },
      headingStyles: {
        type: "object",
        label: msg("fields.headingStyles", "Heading Styles"),
        objectFields: {
          headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          color: YextField(msg("fields.color", "Color"), {
            type: "select",
            options: "SITE_COLOR",
          }),
        },
      },
      activeVerticalColor: {
        type: "object",
        label: msg("fields.activeVerticalColor", "Active Vertical Color"),
        objectFields: {
          color: YextField(msg("fields.color", "Color"), {
            type: "select",
            options: "SITE_COLOR",
          }),
        },
      },
    },
  },
};

const SearchResultsSlotInternal: PuckComponent<SearchResultsSlotProps> = (
  props
) => {
  const {
    data: { verticals },
    styles,
    puck,
  } = props;
  const puckStore = useOptionalPuckStore();
  const arrayState = puckStore?.appState?.ui?.arrayState;
  const urlParams = useSearchUrlParams();

  const arrayKey = React.useMemo(() => {
    if (!arrayState || !puck.isEditing) return undefined;

    return Object.keys(arrayState).find((key) =>
      key.includes("_object_data_verticals")
    );
  }, [arrayState, puck.isEditing]);
  const hasInitialized = React.useRef(false);

  const { t } = useTranslation();
  const searchActions = useSearchActions();
  const hasUniversalTab = React.useMemo(
    () => verticals.some((v) => v.pageType === "universal"),
    [verticals]
  );
  const firstVerticalKey = React.useMemo(() => {
    return (
      verticals.find(
        (v) => v.pageType !== "universal" && Boolean(v.verticalKey)
      )?.verticalKey ?? null
    );
  }, [verticals]);
  const [verticalKey, setVerticalKey] = useState<string | null>(() =>
    hasUniversalTab ? null : firstVerticalKey
  );
  const committedSearchTerm = useSearchState((s) => s.query.input ?? "");
  const activeVerticalKey = useSearchState(
    (s: any) => s.vertical?.verticalKey ?? null
  );
  const resolvedVerticalKey = verticalKey ?? activeVerticalKey;
  const isUniversalActive = resolvedVerticalKey == null;

  const gdaLoading = useSearchState(
    (s) => s.generativeDirectAnswer.isLoading ?? false
  );

  const facetsLength = useSearchState((s) => {
    const facets: unknown = (s as any).filters?.facets;
    return Array.isArray(facets) ? facets.length : 0;
  });

  const verticalConfigMap = React.useMemo(
    () =>
      buildVerticalConfigMap(
        verticals,
        styles?.ctaStyles,
        styles.headingStyles
      ),
    [verticals, styles]
  );

  const universalLimit = React.useMemo(
    () => buildUniversalLimit(verticals),
    [verticals]
  );

  const currentVerticalConfig = React.useMemo(() => {
    if (!resolvedVerticalKey) return undefined;
    return verticals.find((v) => v.verticalKey === resolvedVerticalKey);
  }, [verticals, resolvedVerticalKey]);

  const runSearch = React.useCallback(
    (nextVerticalKey: string | null, query: string) => {
      if (!isValidVerticalConfig(verticals)) {
        return;
      }

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

      if (!puck.isEditing) {
        updateSearchUrl({
          vertical: nextVerticalKey,
          searchTerm: query,
        });
      }
    },
    [verticals, universalLimit, searchActions, puck.isEditing]
  );

  React.useEffect(() => {
    if (puck.isEditing) return;
    if (typeof window === "undefined") return;
    if (!verticals?.length) return;
    const { vertical, searchTerm } = urlParams;

    const validVertical =
      vertical && verticals.some((v) => v.verticalKey === vertical);
    const nextVertical = validVertical
      ? vertical
      : hasUniversalTab
        ? null
        : firstVerticalKey;

    setVerticalKey(nextVertical);
    runSearch(nextVertical, searchTerm);
    if (!validVertical && !hasUniversalTab && firstVerticalKey) {
      updateSearchUrl({ vertical: firstVerticalKey, searchTerm });
    }
    hasInitialized.current = true;
  }, [verticals, urlParams, firstVerticalKey]);

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

  React.useEffect(() => {
    if (puck.isEditing) {
      runSearch(verticalKey, "");
    }
  }, [verticalKey, puck.isEditing]);

  React.useEffect(() => {
    if (puck.isEditing) return;
    if (!hasInitialized.current) return;
    if (committedSearchTerm) {
      updateSearchUrl({
        vertical: activeVerticalKey,
        searchTerm: committedSearchTerm,
      });
    }
  }, [committedSearchTerm, activeVerticalKey]);

  return (
    <div className="pt-8">
      <div className="border-b flex justify-start items-center">
        <ul className="flex items-center">
          {verticals.map((item, idx) => {
            const isActive =
              item.pageType === "universal"
                ? verticalKey === null
                : item.verticalKey === verticalKey;
            const activeColor =
              styles?.activeVerticalColor?.color?.contrastingColor;
            const activeColorValue = activeColor
              ? `var(--colors-${getThemeColorCssValue(activeColor)})`
              : undefined;

            return (
              <li key={`${item.verticalKey ?? "no-key"}:${item.label}:${idx}`}>
                <a
                  onClick={() => {
                    const nextVertical =
                      item.pageType === "universal"
                        ? null
                        : (item.verticalKey ?? null);

                    setVerticalKey(nextVertical);
                    !puck.isEditing &&
                      runSearch(nextVertical, committedSearchTerm);
                  }}
                  className={`px-5 pt-1.5 pb-3 tracking-[1.1px] mb-0 hover:cursor-pointer ${
                    isActive ? "border-b-2 " : ""
                  }`}
                  style={
                    isActive
                      ? {
                          color: activeColorValue,
                          borderColor: activeColorValue,
                        }
                      : undefined
                  }
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

      {!isUniversalActive && resolvedVerticalKey ? (
        <VerticalResultsSection
          verticalKey={resolvedVerticalKey}
          verticals={verticals}
          currentVerticalConfig={currentVerticalConfig}
          puck={puck}
          facetsLength={facetsLength}
          enableGDA={
            currentVerticalConfig?.enableGenerativeDirectAnswer ?? false
          }
          searchTerm={committedSearchTerm}
          gdaLoading={gdaLoading}
          ctaStyles={styles.ctaStyles}
          headingStyles={styles.headingStyles}
        />
      ) : (
        <UniversalResultsSection
          enableGDA={
            currentVerticalConfig?.enableGenerativeDirectAnswer ?? true
          }
          searchTerm={committedSearchTerm}
          gdaLoading={gdaLoading}
          verticalConfigMap={verticalConfigMap}
        />
      )}
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
