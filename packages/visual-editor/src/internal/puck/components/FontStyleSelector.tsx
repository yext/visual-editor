import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FieldLabel } from "@puckeditor/core";
import { StyleSelectOption } from "../../../utils/themeResolver.ts";
import {
  PUCK_PREVIEW_IFRAME_ID,
  THEME_STYLE_TAG_ID,
} from "../../../utils/applyTheme.ts";
import "../ui/puck.css";

type FontStyleSelectorProps = {
  label: string;
  options: StyleSelectOption[] | (() => StyleSelectOption[]);
  value: string;
  onChange: (value: any) => void;
};

const resolveOptions = (
  options: StyleSelectOption[] | (() => StyleSelectOption[])
) => {
  if (typeof options === "function") {
    return options();
  }
  return options;
};

export const FontStyleSelector = ({
  label,
  onChange,
  value,
  options,
}: FontStyleSelectorProps) => {
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
      const iframeDocument =
        iframe?.contentDocument ?? iframe?.contentWindow?.document ?? null;
      const styleTag = iframeDocument?.getElementById(
        THEME_STYLE_TAG_ID
      ) as HTMLStyleElement | null;

      if (styleTag) {
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

      iframeObserver?.disconnect();
      iframeObserver = new MutationObserver(() => {
        attachStyleObserver();
      });
      iframeObserver.observe(iframeDocument ?? document, {
        childList: true,
        subtree: true,
      });
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
