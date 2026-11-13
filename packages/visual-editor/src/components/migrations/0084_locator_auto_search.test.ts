import { describe, expect, it } from "vitest";
import { addLocatorAutoSearch } from "./0084_locator_auto_search.ts";

describe("addLocatorAutoSearch", () => {
  it.each([
    { props: { id: "locator" }, expected: false },
    { props: { id: "locator", autoSearchOnMapMove: false }, expected: false },
    { props: { id: "locator", autoSearchOnMapMove: true }, expected: true },
  ])(
    "when settings are $props then the saved value is $expected",
    ({ props, expected }) => {
      expect(addLocatorAutoSearch.Locator.propTransformation(props)).toEqual({
        ...props,
        autoSearchOnMapMove: expected,
      });
    }
  );
});
