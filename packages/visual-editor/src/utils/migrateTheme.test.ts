import { describe, expect, it } from "vitest";
import { migrateTheme, THEME_VERSION_KEY } from "./migrateTheme.ts";

describe("migrateTheme", () => {
  it("removes legacy custom font preloads", () => {
    const migratedTheme = migrateTheme({
      "--fontFamily-body-fontFamily": "'Alpha', sans-serif",
      "--fontWeight-body-fontWeight": "700",
      "--fontStyle-body-fontStyle": "normal",
      __customFontPreloads: ["/y-fonts/alpha-regular.woff2"],
    });

    expect(migratedTheme).toEqual({
      "--fontFamily-body-fontFamily": "'Alpha', sans-serif",
      "--fontWeight-body-fontWeight": "700",
      "--fontStyle-body-fontStyle": "normal",
      [THEME_VERSION_KEY]: 1,
    });
  });

  it("stamps the current theme version when no migration work is needed", () => {
    const migratedTheme = migrateTheme({
      "--fontFamily-body-fontFamily": "'Helvetica', sans-serif",
      [THEME_VERSION_KEY]: 1,
    });

    expect(migratedTheme).toEqual({
      "--fontFamily-body-fontFamily": "'Helvetica', sans-serif",
      [THEME_VERSION_KEY]: 1,
    });
  });
});
