import { afterEach, describe, expect, it } from "vitest";
import { isLocalDev } from "./isLocalDev.ts";

const initialUrl = window.location.href;

afterEach(() => {
  window.history.replaceState({}, "", initialUrl);
});

describe("isLocalDev", () => {
  it("checks the current window location", () => {
    window.history.replaceState({}, "", "/local-editor");
    expect(isLocalDev()).toBe(true);

    window.history.replaceState({}, "", "/edit");
    expect(isLocalDev()).toBe(false);

    window.history.replaceState({}, "", "/dev-locator/locator-slug");
    expect(isLocalDev()).toBe(true);

    window.history.replaceState({}, "", "/edit");
    expect(isLocalDev()).toBe(false);
  });
});
