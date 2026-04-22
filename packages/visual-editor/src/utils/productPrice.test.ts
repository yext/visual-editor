import { describe, expect, it } from "vitest";
import { formatCurrency, formatProductPrice } from "./productPrice.ts";

describe("productPrice", () => {
  it("formats structured USD prices", () => {
    expect(
      formatProductPrice({ value: 49.95, currencyCode: "USD" }, "en-US")
    ).toBe("$49.95");
  });

  it("formats structured GBP prices", () => {
    expect(
      formatProductPrice({ value: 49.95, currencyCode: "GBP" }, "en-GB")
    ).toBe("£49.95");
  });

  it("formats legacy translatable prices", () => {
    expect(formatProductPrice({ defaultValue: "$10.00" }, "en-US")).toBe(
      "$10.00"
    );
  });

  it("returns undefined for incomplete structured prices", () => {
    expect(formatProductPrice({ value: 49.95 }, "en-US")).toBeUndefined();
    expect(
      formatProductPrice({ currencyCode: "USD" }, "en-US")
    ).toBeUndefined();
  });

  it("falls back to value and currency code for invalid currency codes", () => {
    expect(formatCurrency(49.95, "INVALID", "en-US")).toBe("49.95 INVALID");
  });
});
