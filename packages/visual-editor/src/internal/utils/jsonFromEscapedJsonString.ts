/**
 * jsonFromEscapedJsonString parses a string into a JSON object,
 * and fixes escaped "" characters
 * @param escapedJsonString a stringified JSON object
 * @returns a parsed JSON object
 */
export const jsonFromEscapedJsonString = (escapedJsonString: string) => {
  return JSON.parse(escapedJsonString.replace(/\\"/g, '"'));
};
