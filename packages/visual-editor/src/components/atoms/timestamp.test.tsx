import { describe, it, expect } from "vitest";
import { timestampFormatter, TimestampOption } from "./timestamp.tsx";

describe("timestampFormatter", () => {
  it("formats DATE", () => {
    const date = new Date("2024-01-01T00:00:00");
    const result = timestampFormatter({ date, option: TimestampOption.DATE });
    expect(result).toBe("Jan 1, 2024");
  });

  it("formats DATE with override present", () => {
    const date = new Date("2024-01-01T00:00:00");
    const override: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    const result = timestampFormatter({
      date,
      option: TimestampOption.DATE,
      dateFormatOverride: override,
    });
    expect(result).toBe("January 1, 2024");
  });

  it("formats DATE with locale and override", () => {
    const date = new Date("2025-06-27T00:00:00");
    const override: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    const result = timestampFormatter({
      date,
      option: TimestampOption.DATE,
      locale: "es",
      dateFormatOverride: override,
    });
    expect(result).toBe("27 de junio de 2025");
  });

  it("formats DATE_TIME", () => {
    const date = new Date("2024-01-01T08:00:00");
    const result = timestampFormatter({
      date,
      option: TimestampOption.DATE_TIME,
      hideTimeZone: true,
    });
    expect(result).toBe("Jan 1, 2024, 8:00 AM");
  });

  it("formats DATE_RANGE", () => {
    const date = new Date("2024-01-01T00:00:00");
    const endDate = new Date("2024-01-05T00:00:00");
    const result = timestampFormatter({
      date,
      endDate,
      option: TimestampOption.DATE_RANGE,
      hideTimeZone: true,
    });
    expect(result).toEqual("Jan 1 – 5, 2024");
  });

  it("formats DATE_TIME_RANGE on the same day", () => {
    const date = new Date("2024-01-01T08:00:00");
    const endDate = new Date("2024-01-01T12:00:00");
    const result = timestampFormatter({
      date,
      endDate,
      option: TimestampOption.DATE_TIME_RANGE,
      hideTimeZone: true,
    });
    expect(result).toEqual("Jan 1, 2024 | 8:00 AM - 12:00 PM");
  });

  it("formats DATE_TIME_RANGE on different days", () => {
    const date = new Date("2024-01-01T08:00:00");
    const endDate = new Date("2024-01-02T12:00:00");
    const result = timestampFormatter({
      date,
      endDate,
      option: TimestampOption.DATE_TIME_RANGE,
      hideTimeZone: true,
    });
    expect(result).toEqual("Jan 1, 2024 - Jan 2, 2024 | 8:00 AM - 12:00 PM");
  });

  it("formats DATE_TIME_RANGE on different days with same time", () => {
    const date = new Date("2024-01-01T08:00:00");
    const endDate = new Date("2024-01-02T08:00:00");
    const result = timestampFormatter({
      date,
      endDate,
      option: TimestampOption.DATE_TIME_RANGE,
      hideTimeZone: true,
    });
    expect(result).toEqual("Jan 1, 2024 - Jan 2, 2024 | 8:00 AM - 8:00 AM");
  });
});
