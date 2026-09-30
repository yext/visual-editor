import { TOptions } from "i18next";
import { useTranslation } from "react-i18next";
import {
  i18nPlatformInstance,
  VISUAL_EDITOR_NAMESPACE,
} from "./i18nInstances.ts";

export { i18nPlatformInstance } from "./i18nInstances.ts";

export const usePlatformTranslation = () => {
  return useTranslation(VISUAL_EDITOR_NAMESPACE, {
    i18n: i18nPlatformInstance,
  });
};

export type MsgString = string & { __brand: "i18nPlatform" };

/**
 * msg marks strings for translation in config JSON such
 * as Puck fields or the theme config. The TOptions are
 * stringified in the config and dynamically replaced
 * upon render.
 */
export const msg = (
  key: string,
  defaultValue: string,
  options?: TOptions
): MsgString => {
  return JSON.stringify({ key, defaultValue, options }) as MsgString;
};

/**
 * pt translates strings based on the platform i18n. It can
 * operate as a normal TFunction or handle configurations that
 * have been stringified by msg.
 */
export const pt = (
  keyOrEncodedValue: string | MsgString,
  optionsOrDefault?: string | TOptions,
  options?: TOptions
): string => {
  const t = i18nPlatformInstance.t;

  if (!Array.isArray(keyOrEncodedValue)) {
    try {
      const translationOptions = JSON.parse(keyOrEncodedValue);
      return t(translationOptions.key, translationOptions.defaultValue, {
        ...translationOptions.options,
        returnObjects: false,
      }) as string;
    } catch {
      // continue
    }
  }

  if (
    keyOrEncodedValue &&
    optionsOrDefault &&
    options &&
    typeof optionsOrDefault === "string"
  ) {
    return t(keyOrEncodedValue, optionsOrDefault, options);
  } else if (
    keyOrEncodedValue &&
    optionsOrDefault &&
    typeof optionsOrDefault === "string"
  ) {
    return t(keyOrEncodedValue, optionsOrDefault);
  } else if (
    keyOrEncodedValue &&
    optionsOrDefault &&
    typeof optionsOrDefault === "object"
  ) {
    return t(keyOrEncodedValue, optionsOrDefault);
  } else {
    return t(keyOrEncodedValue);
  }
};
