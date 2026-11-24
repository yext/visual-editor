import type { LinkType } from "@yext/pages-components";
import { useEffect, useState } from "react";
import { isNonNormalizableLinkType } from "../../utils/normalizeLink.ts";

const NON_UTM_TRACKING_PARAMS = [
  "gclid",
  "gclsrc",
  "gbraid",
  "wbraid",
  "dclid",
  "fbclid",
  "msclkid",
  "ttclid",
  "twclid",
  "li_fat_id",
  "ScCid",
  "epik",
  "rdt_cid",
  "srsltid",
];

/** Adds tracking parameters from the page URL after the component mounts. */
export const useCtaTrackingLink = (
  href: string | undefined,
  linkType?: LinkType
): string | undefined => {
  const [pageParams, setPageParams] = useState<Map<string, string> | null>(
    null
  );

  useEffect((): void => {
    const params = new Map<string, string>();
    for (const [key, value] of new URLSearchParams(window.location.search)) {
      if (
        !params.has(key) &&
        (key.startsWith("utm_") || NON_UTM_TRACKING_PARAMS.includes(key))
      ) {
        params.set(key, value);
      }
    }
    if (params.size > 0) {
      setPageParams(params);
    }
  }, []);

  if (
    pageParams === null ||
    !href?.trim() ||
    /^\s*(?:#|mailto:|tel:)/i.test(href) ||
    isNonNormalizableLinkType(linkType)
  ) {
    return href;
  }

  const fragmentIndex = href.indexOf("#");
  const destination =
    fragmentIndex === -1 ? href : href.slice(0, fragmentIndex);
  const fragment = href.slice(destination.length);
  const queryIndex = destination.indexOf("?");
  const path =
    queryIndex === -1 ? destination : destination.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : destination.slice(queryIndex + 1);

  // Keep the original encoding of the other query parameters.
  const params = query
    ? query.split("&").filter((param): boolean => {
        const key = new URLSearchParams(`?${param}`).keys().next().value;
        return key === undefined || !pageParams.has(key);
      })
    : [];
  params.push(new URLSearchParams([...pageParams]).toString());

  return `${path}?${params.join("&")}${fragment}`;
};
