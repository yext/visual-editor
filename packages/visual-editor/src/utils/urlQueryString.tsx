/**
 * Retrieves the value of a query string param from the URL's query string. If it doesn't exist,
 * return null.
 */
export function getValueFromQueryString(
  name: string,
  queryString: string
): string | null {
  return getValuesFromQueryString(queryString)[name];
}

/** Converts a URL query string into an object */
export const getValuesFromQueryString = (
  queryString: string
): Record<string, string> => {
  return queryString
    .substring(1)
    .split("&")
    .map((keyValueString) => keyValueString.split("="))
    .reduce((acc, cur) => {
      if (cur.length === 2) {
        // We need to re-encode the '+' symbols as '%20' because that is what the decodeURIComponent function
        // expects spaces to be encoded as.
        return {
          ...acc,
          [cur[0]]: decodeURIComponent(cur[1].replace(/\+/g, "%20")),
        };
      }
      return acc;
    }, {});
};
