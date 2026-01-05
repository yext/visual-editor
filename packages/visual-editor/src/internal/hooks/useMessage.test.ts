import { describe, it, expect } from "vitest";
import { isOriginAllowed } from "./useMessage.ts";

describe("isOriginAllowed", () => {
  describe("exact matches with target origins", () => {
    it("should return false for origins not in TARGET_ORIGINS", () => {
      expect(isOriginAllowed("https://example.com")).toBe(false);
      expect(isOriginAllowed("https://unknown.yext.com")).toBe(false);
    });

    it("should work with TARGET_ORIGINS constant", () => {
      expect(isOriginAllowed("http://localhost")).toBe(true);
      expect(isOriginAllowed("https://dev.yext.com")).toBe(true);
      expect(isOriginAllowed("https://qa.yext.com")).toBe(true);
      expect(isOriginAllowed("https://sandbox.yext.com")).toBe(true);
      expect(isOriginAllowed("https://www.yext.com")).toBe(true);
      expect(isOriginAllowed("https://app-qa.eu.yext.com")).toBe(true);
      expect(isOriginAllowed("https://app.eu.yext.com")).toBe(true);
    });
  });

  describe("optimizelocation.com pattern matching", () => {
    it("should return true for http://xyz.optimizelocation.com", () => {
      expect(isOriginAllowed("http://xyz.optimizelocation.com")).toBe(true);
    });

    it("should return true for https://xyz.optimizelocation.com", () => {
      expect(isOriginAllowed("https://xyz.optimizelocation.com")).toBe(true);
    });

    it("should return true for various subdomains with http", () => {
      expect(isOriginAllowed("http://subdomain.optimizelocation.com")).toBe(
        true
      );
      expect(isOriginAllowed("http://test.optimizelocation.com")).toBe(true);
      expect(isOriginAllowed("http://abc123.optimizelocation.com")).toBe(true);
    });

    it("should return true for various subdomains with https", () => {
      expect(isOriginAllowed("https://subdomain.optimizelocation.com")).toBe(
        true
      );
      expect(isOriginAllowed("https://test.optimizelocation.com")).toBe(true);
      expect(isOriginAllowed("https://abc123.optimizelocation.com")).toBe(true);
    });

    it("should return true for optimizelocation.com (no subdomain)", () => {
      expect(isOriginAllowed("http://optimizelocation.com")).toBe(true);
      expect(isOriginAllowed("https://optimizelocation.com")).toBe(true);
    });

    it("should return false for domains that are not optimizelocation.com", () => {
      expect(isOriginAllowed("http://xyz.example.com")).toBe(false);
      expect(isOriginAllowed("https://subdomain.otherdomain.com")).toBe(false);
    });

    it("should return true for optimizelocation.com with path", () => {
      // Note: URL constructor will parse this, but the origin check should still work
      // The origin is just the protocol + hostname + port, paths don't affect it
      const url = new URL("http://xyz.optimizelocation.com/path");
      expect(isOriginAllowed(url.origin)).toBe(true);
    });
  });

  describe("combined scenarios", () => {
    it("should allow both exact matches and pattern matches", () => {
      expect(isOriginAllowed("https://dev.yext.com")).toBe(true);
      expect(isOriginAllowed("http://xyz.optimizelocation.com")).toBe(true);
      expect(isOriginAllowed("https://abc.optimizelocation.com")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should return false for invalid URLs", () => {
      expect(isOriginAllowed("not-a-url")).toBe(false);
      expect(isOriginAllowed("")).toBe(false);
      expect(isOriginAllowed("://invalid")).toBe(false);
    });
  });
});
