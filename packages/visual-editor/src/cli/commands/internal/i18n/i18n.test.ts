import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import type { CliIo } from "../../../command.ts";
import { findMissingPlatformTranslations } from "./completeness.ts";
import { loadLibraryLocales } from "./config.ts";
import {
  repairInterpolations,
  repairInterpolationValue,
} from "./interpolation.ts";
import {
  flattenTranslations,
  loadFlatTranslations,
  saveTranslations,
  translationPath,
  type FlatTranslations,
  type TranslationObject,
  unflattenTranslations,
} from "./json.ts";
import { expandKeysForLocale, findSourceValue } from "./plurals.ts";
import { propagatePlatformToPage } from "./propagate.ts";
import { finalizeI18n, prepareI18n } from "./i18n.ts";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "__fixtures__",
  "section-library"
);
const tempRoots: string[] = [];
const testLocales = ["en", "fr"];

const createRoot = (): string => {
  const rootDir = fs.mkdtempSync(path.join(process.cwd(), ".i18n-test-"));
  tempRoots.push(rootDir);
  return rootDir;
};

const copyFixture = (): string => {
  const rootDir = createRoot();
  fs.copySync(fixtureRoot, rootDir);
  return rootDir;
};

const writeLibraryMetadata = (rootDir: string, locales: unknown): void => {
  fs.outputJsonSync(path.join(rootDir, "src", "library", "library.json"), {
    schemaVersion: 1,
    id: "i18n-test-library",
    displayName: "i18n Test Library",
    locales,
  });
};

const createIo = () => {
  let stdout = "";
  let stderr = "";
  const io: CliIo = {
    stdout: {
      isTTY: false,
      write: (value) => {
        stdout += value;
        return true;
      },
    },
    stderr: {
      isTTY: false,
      write: (value) => {
        stderr += value;
        return true;
      },
    },
  };
  return { io, output: () => ({ stdout, stderr }) };
};

const readFlat = async (
  rootDir: string,
  kind: "platform" | "page",
  locale: string
): Promise<FlatTranslations> =>
  loadFlatTranslations(translationPath(rootDir, kind, locale));

afterEach(() => {
  for (const rootDir of tempRoots.splice(0)) {
    fs.removeSync(rootDir);
  }
});

describe("i18n preparation", () => {
  it("extracts distinct platform and page resources and preserves authored values", async () => {
    const rootDir = copyFixture();
    await saveTranslations(translationPath(rootDir, "platform", "fr"), {
      "editor.label": "Libellé",
    });
    const { io, output } = createIo();

    await prepareI18n(rootDir, io);

    const platformEn = await readFlat(rootDir, "platform", "en");
    const pageEn = await readFlat(rootDir, "page", "en");
    const platformFr = await readFlat(rootDir, "platform", "fr");
    expect(platformEn).toMatchObject({
      "editor.description": "Editor description",
      "editor.label": "Editor label",
      "page.greeting": "Hello {{name}}",
      "page.member": "Member translation",
      "page.wildcard": "Wildcard translation",
    });
    expect(pageEn).toMatchObject({
      "page.greeting": "Hello {{name}}",
      "page.member": "Member translation",
      "page.wildcard": "Wildcard translation",
    });
    expect(pageEn).not.toHaveProperty("editor.label");
    expect(platformFr["editor.label"]).toBe("Libellé");
    expect(platformEn).not.toHaveProperty("ignored.generated");
    expect(
      fs
        .readdirSync(path.join(rootDir, "src", "library", "i18n", "platform"))
        .sort()
    ).toEqual(["en.json", "fr.json", "pl.json"]);
    expect(
      fs
        .readdirSync(path.join(rootDir, "src", "library", "i18n", "page"))
        .sort()
    ).toEqual(["en.json", "fr.json", "pl.json"]);
    expect(output().stdout).toContain("Missing ");
  });

  it("accepts canonical locale codes without restricting the locale set", async () => {
    const rootDir = createRoot();
    writeLibraryMetadata(rootDir, ["en", "es", "en-GB", "fil", "xx"]);

    await expect(loadLibraryLocales(rootDir)).resolves.toEqual([
      "en",
      "es",
      "en-GB",
      "fil",
      "xx",
    ]);
  });

  it("requires the configured locales to include the English source locale", async () => {
    const rootDir = createRoot();
    writeLibraryMetadata(rootDir, ["en-US", "fr"]);

    await expect(loadLibraryLocales(rootDir)).rejects.toThrow(
      'must include "en" as the source locale'
    );
  });

  it.each([
    { locales: undefined, expected: "must be a string array" },
    { locales: "en", expected: "must be a string array" },
    { locales: ["en", 2], expected: "must be a string array" },
    { locales: ["en_gb"], expected: "Invalid locale" },
    { locales: ["en-gb"], expected: "Invalid locale" },
  ])(
    "rejects invalid library locales: $locales",
    async ({ locales, expected }) => {
      const rootDir = createRoot();
      writeLibraryMetadata(rootDir, locales);

      await expect(loadLibraryLocales(rootDir)).rejects.toThrow(expected);
    }
  );

  it("reports every locale-specific plural form with its English fallback", async () => {
    const rootDir = createRoot();
    await saveTranslations(translationPath(rootDir, "platform", "en"), {
      cart_one: "{{count}} item",
      cart_other: "{{count}} items",
    });
    await saveTranslations(translationPath(rootDir, "platform", "pl"), {
      cart_one: "element",
    });

    const missing = await findMissingPlatformTranslations(rootDir, [
      "en",
      "pl",
    ]);
    const polish = missing.filter((entry) => entry.locale === "pl");
    expect(polish.map((entry) => entry.key)).toEqual([
      "cart_few",
      "cart_many",
      "cart_other",
    ]);
    expect(polish.every((entry) => entry.source.includes("items"))).toBe(true);
  });

  it("rejects malformed translation JSON with its file path", async () => {
    const rootDir = createRoot();
    const filePath = translationPath(rootDir, "platform", "en");
    fs.outputFileSync(filePath, "{");

    await expect(
      findMissingPlatformTranslations(rootDir, ["en"])
    ).rejects.toThrow(`Malformed JSON in ${filePath}`);
  });

  it("preserves prototype-like keys without traversing object prototypes", async () => {
    const rootDir = createRoot();
    const filePath = translationPath(rootDir, "platform", "en");
    const source = JSON.parse(
      '{"__proto__":"Prototype","constructor":{"prototype":{"label":"Constructor"}}}'
    ) as TranslationObject;

    const flat = flattenTranslations(source);
    expect(Object.getPrototypeOf(flat)).toBeNull();
    expect(flat).toHaveProperty("__proto__", "Prototype");

    const nested = unflattenTranslations(flat);
    const constructorTranslations = nested["constructor"] as TranslationObject;
    const prototypeTranslations = constructorTranslations[
      "prototype"
    ] as TranslationObject;
    expect(Object.getPrototypeOf(nested)).toBeNull();
    expect(Object.getPrototypeOf(constructorTranslations)).toBeNull();
    expect(Object.getPrototypeOf(prototypeTranslations)).toBeNull();
    expect(Object.prototype).not.toHaveProperty("label");

    await saveTranslations(filePath, flat);
    expect(fs.readJsonSync(filePath)).toEqual(source);
  });
});

describe("i18n finalization helpers", () => {
  it("repairs one variable substitution but leaves ambiguous mismatches", () => {
    expect(
      repairInterpolationValue(
        "Hello {{firstName}}, you have {{count, number}} items",
        "Bonjour {{firstName}}, vous avez {{amount, number}} éléments"
      )
    ).toBe("Bonjour {{firstName}}, vous avez {{count, number}} éléments");
    expect(
      repairInterpolationValue("{{first}} {{last}}", "{{one}} {{two}}")
    ).toBeUndefined();
  });

  it("writes safe repairs and reports ambiguous mismatches with file and line", async () => {
    const rootDir = createRoot();
    for (const kind of ["platform", "page"] as const) {
      await saveTranslations(translationPath(rootDir, kind, "en"), {
        ambiguous: "{{first}} {{last}}",
        safe: "Hello {{name}}",
      });
      for (const locale of testLocales.filter((locale) => locale !== "en")) {
        await saveTranslations(translationPath(rootDir, kind, locale), {
          ambiguous: locale === "fr" ? "{{one}} {{two}}" : "{{first}} {{last}}",
          safe: locale === "fr" ? "Bonjour {{nom}}" : "Hello {{name}}",
        });
      }
    }
    const { io, output } = createIo();

    await expect(
      repairInterpolations(rootDir, io, testLocales)
    ).rejects.toThrow("require manual review");
    expect((await readFlat(rootDir, "platform", "fr")).safe).toBe(
      "Bonjour {{name}}"
    );
    expect(output().stderr).toMatch(
      /src\/library\/i18n\/platform\/fr\.json:\d+: interpolation mismatch/
    );
  });

  it("uses page membership and propagates locale plural families", async () => {
    const rootDir = createRoot();
    await saveTranslations(translationPath(rootDir, "page", "en"), {
      cart_one: "item",
      cart_other: "items",
      pageOnly: "Page",
    });
    const locales = ["en", "pl"];
    for (const locale of locales) {
      const source = {
        cart_one: "one",
        cart_other: "other",
        pageOnly: "page",
        platformOnly: "platform",
      };
      const expanded: FlatTranslations = {};
      for (const key of expandKeysForLocale(Object.keys(source), locale)) {
        expanded[key] = findSourceValue(key, source) ?? "";
      }
      await saveTranslations(
        translationPath(rootDir, "platform", locale),
        expanded
      );
      if (locale !== "en") {
        const page: FlatTranslations = { pageOnly: "old" };
        for (const key of expandKeysForLocale(
          ["cart_one", "cart_other"],
          locale
        )) {
          page[key] = "old";
        }
        await saveTranslations(translationPath(rootDir, "page", locale), page);
      }
    }

    await propagatePlatformToPage(rootDir, createIo().io, locales);

    const polish = await readFlat(rootDir, "page", "pl");
    expect(Object.keys(polish)).toEqual([
      "cart_few",
      "cart_many",
      "cart_one",
      "cart_other",
      "pageOnly",
    ]);
    expect(polish).not.toHaveProperty("platformOnly");
    expect(polish.cart_few).toBe("other");
  });

  it("renders lint failures without terminating the process", async () => {
    const rootDir = createRoot();
    writeLibraryMetadata(rootDir, testLocales);
    fs.outputFileSync(
      path.join(rootDir, "src", "library", "Bad.tsx"),
      "export const Bad = () => <div>Hardcoded sentence</div>;\n"
    );
    const english = { page: "Page" };
    for (const locale of testLocales) {
      await saveTranslations(
        translationPath(rootDir, "platform", locale),
        english
      );
      await saveTranslations(translationPath(rootDir, "page", locale), english);
    }
    const { io, output } = createIo();

    await expect(finalizeI18n(rootDir, io)).rejects.toThrow("lint failed");
    expect(output().stderr).toMatch(/Bad\.tsx:\d+: error: Hardcoded sentence/);
  });
});
