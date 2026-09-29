import { describe, expect, it } from "vitest";
import { getPhotoGalleryImageData } from "./photoGalleryUtils.ts";

describe("getPhotoGalleryImageData", () => {
  it("returns no renderable images for an empty list", () => {
    expect(
      getPhotoGalleryImageData({
        resolvedItems: [],
        locale: "en",
        isEditing: false,
      })
    ).toEqual({
      galleryImages: [],
      hasRenderableImages: false,
    });
  });

  it("treats blank image urls as empty", () => {
    const result = getPhotoGalleryImageData({
      resolvedItems: [
        {
          image: {
            image: {
              url: "   ",
              width: 100,
              height: 100,
            },
          },
        },
      ],
      locale: "en",
      isEditing: false,
    });

    expect(result.galleryImages).toEqual([]);
    expect(result.hasRenderableImages).toBe(false);
  });

  it("keeps valid images while filtering invalid ones on live", () => {
    const result = getPhotoGalleryImageData({
      resolvedItems: [
        {
          image: {
            image: {
              url: "",
              width: 100,
              height: 100,
            },
          },
        },
        {
          image: {
            image: {
              url: "https://example.com/gallery.jpg",
              width: 200,
              height: 120,
            },
          },
        },
      ],
      locale: "en",
      isEditing: false,
    });

    expect(result.galleryImages).toHaveLength(1);
    expect(result.galleryImages[0]?.image.url).toBe(
      "https://example.com/gallery.jpg"
    );
    expect(result.hasRenderableImages).toBe(true);
  });

  it("keeps empty image entries in editing mode", () => {
    const result = getPhotoGalleryImageData({
      resolvedItems: [
        {
          image: {
            image: {
              url: "",
              width: 100,
              height: 100,
            },
          },
        },
      ],
      locale: "en",
      isEditing: true,
    });

    expect(result.galleryImages).toHaveLength(1);
    expect(result.galleryImages[0]?.isEmpty).toBe(true);
    expect(result.hasRenderableImages).toBe(false);
  });

  it("resolves localized asset images for the requested locale", () => {
    const result = getPhotoGalleryImageData({
      resolvedItems: [
        {
          image: {
            assetImage: {
              en: {
                url: "https://example.com/en.jpg",
                width: 100,
                height: 100,
              },
              fr: {
                url: "https://example.com/fr.jpg",
                width: 120,
                height: 120,
              },
              hasLocalizedValue: "true",
            } as any,
          },
        },
      ],
      locale: "fr",
      isEditing: false,
    });

    expect(result.galleryImages).toHaveLength(1);
    expect(result.galleryImages[0]?.image.url).toBe(
      "https://example.com/fr.jpg"
    );
    expect(result.galleryImages[0]?.image.width).toBe(120);
    expect(result.galleryImages[0]?.image.height).toBe(120);
    expect(result.hasRenderableImages).toBe(true);
  });

  it("uses clickthroughUrl unless an explicit link mapping is selected", () => {
    const resolvedItems = [
      {
        image: {
          image: {
            url: "https://example.com/gallery.jpg",
            width: 200,
            height: 120,
          },
          clickthroughUrl: "/gallery",
        },
      },
    ];

    expect(
      getPhotoGalleryImageData({
        resolvedItems,
        locale: "en",
        isEditing: false,
      }).galleryImages[0]?.href
    ).toBe("/gallery");
    expect(
      getPhotoGalleryImageData({
        resolvedItems,
        locale: "en",
        isEditing: false,
        hasExplicitLinkMapping: true,
      }).galleryImages[0]?.href
    ).toBeUndefined();
    expect(
      getPhotoGalleryImageData({
        resolvedItems: [{ ...resolvedItems[0], link: "/mapped" }],
        locale: "en",
        isEditing: false,
        hasExplicitLinkMapping: true,
      }).galleryImages[0]?.href
    ).toBe("/mapped");
  });

  it("keeps images without valid links visible", () => {
    const result = getPhotoGalleryImageData({
      resolvedItems: [
        {
          image: {
            url: "https://example.com/gallery.jpg",
            width: 200,
            height: 120,
          },
          link: { defaultValue: "javascript:alert(1)" },
        },
        {
          image: {
            url: "https://example.com/second.jpg",
            width: 200,
            height: 120,
          },
          link: { defaultValue: "https://example.com/page" },
        },
      ],
      locale: "en",
      isEditing: false,
    });

    expect(result.galleryImages).toHaveLength(2);
    expect(result.galleryImages.map((item) => item.href)).toEqual([
      undefined,
      "https://example.com/page",
    ]);
  });
});
