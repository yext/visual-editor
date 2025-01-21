import { describe, it, expect } from "vitest";
import { validateSlug, normalizeSlug } from "./slugifier.ts";

describe("Slugify", () => {
  describe("validateSlug", () => {
    it("should throw an error if content is null", () => {
      expect(() => validateSlug(null as any)).toThrowError(
        "Content cannot be null"
      );
    });

    it("should return false for an empty string", () => {
      expect(validateSlug("")).toBe(false);
    });

    it("should return false for a slug with illegal characters", () => {
      expect(validateSlug("hello>world")).toBe(false);
    });

    it("should return true for a valid slug", () => {
      expect(validateSlug("valid-slug-123-日本語")).toBe(true);
      expect(validateSlug("slug_with_valid@characters")).toBe(true);
    });
  });

  describe("normalizeSlug", () => {
    it("should throw an error if content is null", () => {
      expect(() => normalizeSlug(null as any)).toThrowError(
        "Content cannot be null"
      );
    });

    it("should return an empty string if content is empty", () => {
      expect(normalizeSlug("")).toBe("");
    });

    it("should convert all characters to lowercase", () => {
      expect(normalizeSlug("Hello World")).toBe("hello-world");
    });

    it("should replace '?' and '#' with '-'", () => {
      expect(normalizeSlug("hello?world")).toBe("hello-world");
      expect(normalizeSlug("slug#with#special?characters")).toBe(
        "slug-with-special-characters"
      );
    });

    it("should replace spaces with hyphens", () => {
      expect(normalizeSlug("hello world")).toBe("hello-world");
      expect(normalizeSlug("slug with spaces")).toBe("slug-with-spaces");
    });

    it("should remove all illegal characters", () => {
      expect(normalizeSlug("illegal>char<")).toBe("illegalchar");
    });

    it("should remove repeated hyphens and replace with a single hyphen", () => {
      expect(normalizeSlug("slug--with---hyphens")).toBe("slug-with-hyphens");
    });

    it("should remove dangling hyphens", () => {
      expect(normalizeSlug("slug-")).toBe("slug");
      expect(normalizeSlug("slug-hello--")).toBe("slug-hello");
      expect(normalizeSlug("slug-/with/slashes-")).toBe("slug/with/slashes");
    });

    it("should normalize complex slugs correctly", () => {
      expect(normalizeSlug("Hello!  @World#  -/--abc ")).toBe(
        "hello-@world/-abc"
      );
      expect(normalizeSlug("Hello!  ?#  ---abc;;")).toBe("hello-abc;;");
      expect(normalizeSlug("valid~[slug]with*various_$_chars日本語123")).toBe(
        "valid~[slug]with*various_$_chars日本語123"
      );
    });
  });
});
