import {
  Facets,
  ResultsCount,
  StandardCard,
  VerticalResults,
} from "@yext/search-ui-react";
import React from "react";
import { FaSlidersH, FaTimes } from "react-icons/fa";
import { Body } from "../../atoms/body.tsx";
import Cards from "./Cards.tsx";
import { MapComponent } from "./MapComponent.tsx";
import { VerticalConfigProps } from "./defaultPropsAndTypes.ts";
import { useTranslation } from "react-i18next";

interface VerticalResultsSectionProps {
  verticalKey: string;
  verticals: VerticalConfigProps[];
  currentVerticalConfig?: VerticalConfigProps;
  puck: any;
  facetsLength: number;
}

export const VerticalResultsSection = ({
  verticalKey,
  verticals,
  currentVerticalConfig,
  puck,
  facetsLength,
}: VerticalResultsSectionProps) => {
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const { t } = useTranslation();
  if (currentVerticalConfig?.layout === "Map") {
    return (
      <div className="components flex h-screen w-full mx-auto gap-2">
        <div className="relative h-screen w-full md:w-2/4 flex flex-col ">
          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="p-4 text-body-fontSize border-y border-gray-300 inline-block">
              <div className="flex flex-row justify-between">
                <ResultsCount
                  customCssClasses={{ resultsCountContainer: "!-mb-4" }}
                />
                <button
                  className="inline-flex justify-between items-center gap-2 bg-white text-palette-primary-dark font-bold font-body-fontFamily text-body-sm-fontSize"
                  onClick={() => setShowFilterModal((prev) => !prev)}
                >
                  {t("filter", "Filter")}
                  {<FaSlidersH />}
                </button>
              </div>
            </div>
            <div id="innerDiv" className="overflow-y-auto">
              <VerticalResults CardComponent={StandardCard} />
            </div>
            {facetsLength && showFilterModal && (
              <div
                id="popup"
                className="absolute md:top-4 -top-20 z-50 md:w-80 w-full flex flex-col bg-white md:left-full md:ml-2 rounded-md shadow-lg max-h-[calc(100%-2rem)]"
                ref={popupRef}
              >
                <div className="inline-flex justify-between items-center px-6 py-4 gap-4">
                  <Body className="font-bold">
                    {t("refineYourSearch", "Refine Your Search")}
                  </Body>
                  <button
                    className="text-palette-primary-dark"
                    onClick={() => setShowFilterModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="flex flex-col p-6 gap-6 overflow-y-auto">
                  <div className="flex flex-col gap-8">
                    <Facets
                      customCssClasses={{
                        divider: "bg-white",
                        titleLabel: "font-bold text-md font-body-fontFamily",
                        optionInput: "h-4 w-4 accent-palette-primary-dark",
                        optionLabel:
                          "text-md font-body-fontFamily font-body-fontWeight",
                        option: "space-x-4 font-body-fontFamily",
                      }}
                    />
                  </div>
                </div>
                <div className="border-y border-gray-300 justify-center align-middle">
                  <button
                    className="w-full py-4 text-center text-palette-primary-dark font-bold font-body-fontFamily text-body-fontSize"
                    onClick={() => {}}
                  >
                    {t("clearAll", "Clear All")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="md:flex-1 md:flex hidden relative">
          <MapComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex flex-grow pt-8">
      <div
        className={`w-[200px] mr-6 ${
          !puck.isEditing ? "-ml-[224px]" : ""
        } ${facetsLength ? "" : "none"}`}
      >
        <Facets
          customCssClasses={{ facetsContainer: "!text-lg w-[200px]" }}
          searchOnChange
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
                verticals.find((v) => v.verticalKey === verticalKey)?.cardType
              }
            />
          )}
        />
      </div>
    </div>
  );
};
