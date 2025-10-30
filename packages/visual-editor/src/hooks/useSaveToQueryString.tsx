import { useRef, useEffect } from "react";
import {
  getValueFromQueryString,
  getValuesFromQueryString,
} from "../utils/urlQueryString";

/**
 * A custom effect hook that saves state to the URL query string and calls onChangeState on pop
 * events to restore state.
 */
export const useSaveToQueryString = (
  state: string | null,
  onChangeState: (state: string) => void,
  stateKey: string,
  isWindowUndefined: boolean = false
) => {
  // Window is not defined during page generation, so no-op because we can't access the URL
  if (isWindowUndefined) {
    return;
  }

  const oldHistory = useRef({ ...window.history.state });

  useEffect(() => {
    const handleOnPopState = () => {
      const newValue = getValueFromQueryString(
        stateKey,
        window.location.search
      );
      if (
        newValue !== null &&
        String(newValue) !== String(oldHistory.current[stateKey])
      ) {
        onChangeState(newValue);
      }
    };
    window.addEventListener("popstate", handleOnPopState);

    return () => window.removeEventListener("popstate", handleOnPopState);
  }, []);

  useEffect(() => {
    const newHistory = { ...window.history.state, [stateKey]: state };
    const newQueryString = toQueryString(newHistory, window.location.search);
    if (window.history.state && window.history.state[stateKey] !== state) {
      window.history.pushState(newHistory, "", newQueryString);
    } else {
      window.history.replaceState(newHistory, "", newQueryString);
    }
    oldHistory.current = newHistory;
  }, [state]);
};

/** Converts an object into a URL query string, merging with existing query string params */
function toQueryString(
  params: Record<string, string>,
  currentQueryString: string = ""
): string {
  const existingParams = getValuesFromQueryString(currentQueryString);
  const stringifiedParams = stringifyParams({
    ...existingParams,
    ...params,
  });
  return "?" + stringifiedParams.join("&");
}

/** Converts an object into an array of key=value strings */
const stringifyParams = (params: Record<string, unknown>): string[] => {
  return Object.entries(params)
    .filter(([, value]) => !!value)
    .map(([key, value]) => `${key}=${value}`);
};
