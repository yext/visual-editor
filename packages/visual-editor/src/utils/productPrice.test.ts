import { describe, expect, it } from "vitest";
import { formatCurrency } from "./productPrice.ts";

describe("productPrice", () => {
  it("formats structured USD prices", () => {
    expect(formatCurrency(49.95, "USD", "en-US")).toBe("$49.95");
  });

  it("formats structured GBP prices", () => {
    expect(formatCurrency(49.95, "GBP", "en-GB")).toBe("£49.95");
  });

  it("returns undefined for incomplete structured prices", () => {
    expect(formatCurrency(49.95, undefined, "en-US")).toBeUndefined();
    expect(formatCurrency(undefined, "USD", "en-US")).toBeUndefined();
  });

  it("falls back to value and currency code for invalid currency codes", () => {
    expect(formatCurrency(49.95, "INVALID", "en-US")).toBe("49.95 INVALID");
  });

  it("falls back safely for malformed locales", () => {
    expect(formatCurrency(49.95, "INVALID", "en_US")).toBe("49.95 INVALID");
  });
});
