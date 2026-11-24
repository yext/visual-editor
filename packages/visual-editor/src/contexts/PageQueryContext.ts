import { createContext } from "react";

export const PageQueryContext = createContext("");

const excludedPageQueryKeys = new Set([
  "q",
  "initialLocation",
  "draft",
  "history",
  "xYextDebugPage",
]);

/**
 * Adds page query parameters to an HTTP(S) link. Keeps the destination query,
 * the original encoding of each added pair, and the destination fragment.
 */
export const mergePageQueryParameters = (
  href: string,
  pageQuery: string,
  baseUrl: string | undefined = typeof document === "undefined"
    ? undefined
    : document.baseURI
): string => {
  const link = href.trim();
  if (!pageQuery || !link || link.startsWith("#")) {
    return href;
  }

  let destination: URL;
  try {
    destination = new URL(link, baseUrl);
  } catch {
    return href;
  }
  if (destination.protocol !== "http:" && destination.protocol !== "https:") {
    return href;
  }

  const usedKeys = new Set(destination.searchParams.keys());
  const pageKeys = new URLSearchParams(pageQuery).keys();
  const pairsToAppend: string[] = [];

  // Compare decoded keys and copy the original pairs.
  for (const pair of pageQuery.replace(/^\?/, "").split("&")) {
    if (!pair) {
      continue;
    }
    const { value: key, done } = pageKeys.next();
    if (!done && !usedKeys.has(key) && !excludedPageQueryKeys.has(key)) {
      usedKeys.add(key);
      pairsToAppend.push(pair);
    }
  }
  if (pairsToAppend.length === 0) {
    return href;
  }

  const fragmentIndex = link.indexOf("#");
  const beforeFragment =
    fragmentIndex < 0 ? link : link.slice(0, fragmentIndex);
  const fragment = fragmentIndex < 0 ? "" : link.slice(fragmentIndex);
  const separator = !beforeFragment.includes("?")
    ? "?"
    : beforeFragment.endsWith("?") || beforeFragment.endsWith("&")
      ? ""
      : "&";

  return beforeFragment + separator + pairsToAppend.join("&") + fragment;
};
