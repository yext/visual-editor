import React from "react";
import { toMeters } from "../../../utils/i18n/distance.ts";
import type { DistanceUnit } from "./DistanceUnits.ts";

type RadiusOptions = {
  preferredUnit: DistanceUnit;
  selectedDistanceOption: number | null;
  defaultRadius: number;
  apiFilterRadius: React.MutableRefObject<number | null>;
  /** Null for supplied radii; otherwise the minimum for a generated radius. */
  generatedRadiusMinimum: React.MutableRefObject<number | null>;
  onRadiusChange: (radius: number) => void;
};

export const useLocatorRadiusOnUnitChange = ({
  preferredUnit,
  selectedDistanceOption,
  defaultRadius,
  apiFilterRadius,
  generatedRadiusMinimum,
  onRadiusChange,
}: RadiusOptions) => {
  const previousUnit = React.useRef(preferredUnit);
  React.useEffect(() => {
    if (previousUnit.current === preferredUnit) {
      return;
    }
    previousUnit.current = preferredUnit;

    if (
      generatedRadiusMinimum.current !== null &&
      apiFilterRadius.current !== null
    ) {
      const generatedRadius = Math.max(
        generatedRadiusMinimum.current,
        toMeters(defaultRadius, preferredUnit)
      );
      const radiusChanged = apiFilterRadius.current !== generatedRadius;
      // Keep the radius restored by clearing a distance selection current.
      apiFilterRadius.current = generatedRadius;
      if (selectedDistanceOption === null) {
        if (radiusChanged) {
          onRadiusChange(generatedRadius);
        }
        return;
      }
    }
    if (selectedDistanceOption === null) {
      return;
    }

    onRadiusChange(toMeters(selectedDistanceOption, preferredUnit));
  }, [
    preferredUnit,
    selectedDistanceOption,
    defaultRadius,
    apiFilterRadius,
    generatedRadiusMinimum,
    onRadiusChange,
  ]);
};
