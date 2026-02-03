import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FieldLabel } from "@puckeditor/core";
import { StyleSelectOption } from "../../../utils/themeResolver.ts";
import {
  PUCK_PREVIEW_IFRAME_ID,
  THEME_STYLE_TAG_ID,
} from "../../../utils/applyTheme.ts";
import "../ui/puck.css";

type FontWeightSelectorProps = {
  label: string;
  options: StyleSelectOption[] | (() => StyleSelectOption[]);
  value: string;
  onChange: (value: any) => void;
};

const resolveOptions = (
  options: StyleSelectOption[] | (() => StyleSelectOption[])
) => {
  // Allow options to be a function so we can re-evaluate against the latest theme CSS.
  if (typeof options === "function") {
    return options();
  }
  return options;
};

export const FontWeightSelector = ({
  label,
  onChange,
  value,
  options,
}: FontWeightSelectorProps) => {
  const [availableOptions, setAvailableOptions] = useState<StyleSelectOption[]>(
    () => resolveOptions(options)
  );

  const updateOptions = useCallback(() => {
    setAvailableOptions(resolveOptions(options));
  }, [options]);

  useEffect(() => {
    if (!availableOptions.length) {
      return;
    }

    const isValid = availableOptions.some((option) => option.value === value);
    if (!isValid) {
      // If the existing font weight value is no longer valid, reset to the first available option
      onChange(availableOptions[0].value);
    }
  }, [availableOptions, onChange, value]);

  useEffect(() => {
    let styleObserver: MutationObserver | null = null;
    let iframeObserver: MutationObserver | null = null;

    const attachStyleObserver = () => {
      const iframe = document.getElementById(
        PUCK_PREVIEW_IFRAME_ID
      ) as HTMLIFrameElement | null;
      const styleTag = iframe?.contentDocument?.getElementById(
        THEME_STYLE_TAG_ID
      ) as HTMLStyleElement | null;

      if (styleTag) {
        // Recompute available weights whenever the preview iframe's theme CSS changes.
        updateOptions();
        styleObserver?.disconnect();
        styleObserver = new MutationObserver(() => {
          updateOptions();
        });
        styleObserver.observe(styleTag, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        iframeObserver?.disconnect();
        return;
      }

      if (!iframeObserver) {
        iframeObserver = new MutationObserver(() => {
          attachStyleObserver();
        });
        iframeObserver.observe(document, {
          childList: true,
          subtree: true,
        });
      }
    };

    attachStyleObserver();

    return () => {
      styleObserver?.disconnect();
      iframeObserver?.disconnect();
    };
  }, [updateOptions]);

  const selectedValue = useMemo(() => value ?? "", [value]);

  return (
    <FieldLabel label={label} el="div">
      <select
        className="puck-select"
        value={selectedValue}
        onChange={(event) => onChange(event.target.value)}
      >
        {availableOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
};
