import { AppliedFilters, Facets } from "@yext/search-ui-react";
import React from "react";
import { useCollapse } from "react-collapsed";
import { useTranslation } from "react-i18next";
import { FaChevronUp, FaDotCircle, FaRegCircle, FaTimes } from "react-icons/fa";
import { getPreferredDistanceUnit } from "../../utils/i18n/distance.ts";
import { Body } from "../atoms/body.tsx";
import {
  COUNTRY_CODE_FIELD,
  LOCATION_FIELD,
  translateDistanceUnit,
} from "./locatorUtils.ts";

interface FilterModalProps {
  showFilterModal: boolean;
  showOpenNowOption: boolean; // whether to show the Open Now filter option
  isOpenNowSelected: boolean; // whether the Open Now filter is currently selected by the user
  showDistanceOptions: boolean; // whether to show the Distance filter option
  selectedDistanceOption: number | null;
  handleCloseModalClick: () => void;
  handleOpenNowClick: (selected: boolean) => void;
  handleDistanceClick: (
    distance: number,
    distanceUnit: "mile" | "kilometer"
  ) => void;
  handleClearFiltersClick: () => void;
  accentColorCssValue: string;
  closeButtonRef: React.Ref<HTMLButtonElement>;
}

export const FilterModal = ({
  showFilterModal,
  showOpenNowOption,
  isOpenNowSelected,
  showDistanceOptions,
  selectedDistanceOption,
  handleCloseModalClick,
  handleOpenNowClick,
  handleDistanceClick,
  handleClearFiltersClick,
  accentColorCssValue,
  closeButtonRef,
}: FilterModalProps) => {
  const { t } = useTranslation();
  const popupRef = React.useRef<HTMLDivElement>(null);

  return showFilterModal ? (
    <div
      id="locator-filter-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locator-filter-modal-title"
      className="absolute md:top-4 -top-20 z-50 md:w-80 w-full flex flex-col bg-white md:left-full md:ml-2 rounded-md shadow-lg max-h-[calc(100%-2rem)]"
      style={
        {
          "--locator-filter-accent-color": accentColorCssValue,
        } as React.CSSProperties
      }
      ref={popupRef}
    >
      <div className="inline-flex justify-between items-center px-6 py-4 gap-4">
        <Body className="font-bold" id="locator-filter-modal-title">
          {t("refineYourSearch", "Refine Your Search")}
        </Body>
        <button
          ref={closeButtonRef}
          style={{ color: accentColorCssValue }}
          onClick={handleCloseModalClick}
          aria-label={t("close", "Close")}
        >
          <FaTimes />
        </button>
      </div>
      <div className="px-6 border-b border-gray-300">
        <AppliedFilters
          hiddenFields={[LOCATION_FIELD, COUNTRY_CODE_FIELD]}
          customCssClasses={{
            removableFilter: "text-md font-normal",
            clearAllButton: "hidden",
          }}
        />
      </div>
      <div className="flex flex-col p-6 gap-6 overflow-y-auto">
        <div className="flex flex-col gap-8">
          {showOpenNowOption && (
            <OpenNowFilter
              isSelected={isOpenNowSelected}
              onChange={handleOpenNowClick}
            />
          )}
          {showDistanceOptions && (
            <DistanceFilter
              onChange={handleDistanceClick}
              selectedDistanceOption={selectedDistanceOption}
              accentColorCssValue={accentColorCssValue}
            />
          )}
          <Facets
            customCssClasses={{
              divider: "bg-white",
              titleLabel: "font-bold text-md font-body-fontFamily",
              optionInput:
                "h-4 w-4 [accent-color:var(--locator-filter-accent-color)]",
              optionLabel: "text-md font-body-fontFamily font-body-fontWeight",
              option: "space-x-4 font-body-fontFamily",
            }}
          />
        </div>
      </div>
      <div className="border-y border-gray-300 justify-center align-middle">
        <button
          className="w-full py-4 text-center font-bold font-body-fontFamily text-body-fontSize"
          style={{ color: accentColorCssValue }}
          onClick={handleClearFiltersClick}
        >
          {t("clearAll", "Clear All")}
        </button>
      </div>
    </div>
  ) : null;
};

interface OpenNowFilterProps {
  isSelected: boolean;
  onChange: (selected: boolean) => void;
}

const OpenNowFilter = ({ isSelected, onChange }: OpenNowFilterProps) => {
  const { t } = useTranslation();
  const { isExpanded, getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: true,
  });
  const iconClassName = isExpanded
    ? "w-3 text-gray-400"
    : "w-3 text-gray-400 transform rotate-180";

  const openNowCheckBoxId = "openNowCheckBox";
  return (
    <div className="flex flex-col gap-4">
      <button
        className="w-full flex justify-between items-center font-bold font-body-fontFamily text-body-fontSize"
        {...getToggleProps()}
      >
        {t("hours", "Hours")}
        <FaChevronUp className={iconClassName} />
      </button>
      <div className="flex flex-row gap-1" {...getCollapseProps()}>
        <div className="inline-flex items-center gap-4">
          <input
            type="checkbox"
            id={openNowCheckBoxId}
            checked={isSelected}
            className={
              "w-4 h-4 form-checkbox cursor-pointer border border-gray-300" +
              " rounded-sm text-primary focus:ring-primary [accent-color:var(--locator-filter-accent-color)]"
            }
            onChange={() => onChange(!isSelected)}
          />
          <label htmlFor={openNowCheckBoxId}>
            <Body>{t("openNow", "Open Now")}</Body>
          </label>
        </div>
      </div>
    </div>
  );
};

interface DistanceFilterProps {
  onChange: (distance: number, unit: "mile" | "kilometer") => void;
  selectedDistanceOption: number | null;
  accentColorCssValue: string;
}

const DistanceFilter = ({
  onChange,
  selectedDistanceOption,
  accentColorCssValue,
}: DistanceFilterProps) => {
  const { t, i18n } = useTranslation();
  const { isExpanded, getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: true,
  });
  const iconClassName = isExpanded
    ? "w-3 text-gray-400"
    : "w-3 text-gray-400 transform rotate-180";
  const distanceOptions = [5, 10, 25, 50];
  const unit = getPreferredDistanceUnit(i18n.language);

  return (
    <div className="flex flex-col gap-4">
      <button
        className="w-full flex justify-between items-center font-bold font-body-fontFamily text-body-fontSize"
        {...getToggleProps()}
      >
        {t("distance", "Distance")}
        <FaChevronUp className={iconClassName} />
      </button>
      <div {...getCollapseProps()}>
        {distanceOptions.map((distanceOption) => (
          <div
            className="flex flex-row gap-4 items-center"
            id={`distanceOption-${distanceOption}`}
            key={distanceOption}
          >
            <button
              className="inline-flex bg-white"
              onClick={() => onChange(distanceOption, unit)}
              aria-label={`${t("selectDistanceLessThan", "Select distance less than")} ${distanceOption} ${translateDistanceUnit(t, unit, distanceOption)}`}
            >
              <div style={{ color: accentColorCssValue }}>
                {selectedDistanceOption === distanceOption ? (
                  <FaDotCircle />
                ) : (
                  <FaRegCircle />
                )}
              </div>
            </button>
            <Body className="inline-flex">
              {`< ${distanceOption} ${translateDistanceUnit(t, unit, distanceOption)}`}
            </Body>
          </div>
        ))}
      </div>
    </div>
  );
};
