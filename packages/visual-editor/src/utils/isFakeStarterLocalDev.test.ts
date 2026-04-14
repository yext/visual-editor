import { afterEach, describe, expect, it } from "vitest";
import {
  isFakeStarterLocalDev,
  isFakeStarterLocalDevRoute,
} from "./isFakeStarterLocalDev.ts";

const initialUrl = window.location.href;

afterEach(() => {
  window.history.replaceState({}, "", initialUrl);
});

describe("isFakeStarterLocalDevRoute", () => {
  it("matches fake starter dev routes", () => {
    expect(
      isFakeStarterLocalDevRoute("http://localhost:5173/dev-locator/example")
    ).toBe(true);
    expect(isFakeStarterLocalDevRoute("/dev-location/example")).toBe(true);
  });

  it("does not match non-fake-starter routes", () => {
    expect(isFakeStarterLocalDevRoute("http://localhost:5173/edit")).toBe(
      false
    );
    expect(isFakeStarterLocalDevRoute("/locator/example")).toBe(false);
  });
});

describe("isFakeStarterLocalDev", () => {
  it("checks the current window location", () => {
    window.history.replaceState({}, "", "/dev-locator/locator-slug");
    expect(isFakeStarterLocalDev()).toBe(true);

    window.history.replaceState({}, "", "/edit");
    expect(isFakeStarterLocalDev()).toBe(false);
  });
});
