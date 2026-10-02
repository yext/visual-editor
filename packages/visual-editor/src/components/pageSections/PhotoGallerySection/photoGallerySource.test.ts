import { describe, expect, it } from "vitest";
import { photoGallerySource } from "./photoGallerySource.ts";
import { getPhotoGalleryImageData } from "./photoGalleryUtils.ts";
import { migrate } from "../../../utils/migrate.ts";
import { photoGalleryItemSource } from "../../migrations/0083_photo_gallery_item_source.ts";
import { type StreamDocument } from "../../../utils/types/StreamDocument.ts";

describe("photoGallerySource", () => {
  it.each([
    {
      name: "an image list",
      field: "photoGallery",
      imageField: "$item",
      linkField: "",
      streamDocument: {
        locale: "en",
        photoGallery: [
          { url: "https://example.com/one.jpg" },
          {
            image: { url: "https://example.com/two.jpg" },
            clickthroughUrl: "/two",
          },
        ],
      },
      expected: [
        { url: "https://example.com/one.jpg", href: undefined },
        { url: "https://example.com/two.jpg", href: "/two" },
      ],
    },
    {
      name: "brands with CTA objects",
      field: "c_brands",
      imageField: "logo",
      linkField: "cta",
      streamDocument: {
        locale: "en",
        c_brands: [
          {
            logo: { url: "https://example.com/varilux.jpg" },
            cta: { label: "Varilux", link: "https://example.com/varilux" },
          },
          {
            logo: { url: "https://example.com/crizal.jpg" },
            cta: { label: "Crizal", link: "https://example.com/crizal" },
          },
          { logo: { url: "https://example.com/essilor.jpg" } },
          { cta: { label: "No image", link: "/missing" } },
        ],
      },
      expected: [
        {
          url: "https://example.com/varilux.jpg",
          href: "https://example.com/varilux",
        },
        {
          url: "https://example.com/crizal.jpg",
          href: "https://example.com/crizal",
        },
        { url: "https://example.com/essilor.jpg", href: undefined },
      ],
    },
    {
      name: "a different entity with a nested CTA link",
      field: "c_brands",
      imageField: "logo",
      linkField: "cta.link",
      streamDocument: {
        locale: "en",
        c_brands: [
          {
            logo: { url: "https://example.com/eyezen.jpg" },
            cta: { label: "Eyezen", link: "/eyezen" },
          },
        ],
      },
      expected: [{ url: "https://example.com/eyezen.jpg", href: "/eyezen" }],
    },
    {
      name: "an entity with no brands",
      field: "c_brands",
      imageField: "logo",
      linkField: "cta",
      streamDocument: { locale: "en" },
      expected: [],
    },
  ])(
    "when the source is $name then each image keeps its own link",
    ({ field, imageField, linkField, streamDocument, expected }) => {
      const resolvedItems = photoGallerySource.resolveItems(
        {
          field,
          constantValueEnabled: false,
          constantValue: [],
          mappings: {
            image: {
              field: imageField,
              constantValueEnabled: false,
              constantValue: undefined,
            },
            link: {
              field: linkField,
              constantValueEnabled: false,
              constantValue: undefined,
            },
          },
        },
        streamDocument
      );
      const { galleryImages } = getPhotoGalleryImageData({
        resolvedItems,
        locale: "en",
        streamDocument,
        isEditing: false,
        hasExplicitLinkMapping: !!linkField,
      });

      expect(
        galleryImages.map(({ image, href }) => ({ url: image.url, href }))
      ).toEqual(expected);
    }
  );

  it.each([
    {
      locale: "fr",
      expectedUrl: "https://example.com/fr.jpg",
      expectedAlt: "Marque Paris",
    },
    {
      locale: "de",
      expectedUrl: "https://example.com/default.jpg",
      expectedAlt: "Brand Paris",
    },
  ])(
    "when saved images are migrated then $locale images and links remain visible",
    ({ locale, expectedUrl, expectedAlt }) => {
      const migratedData = migrate(
        {
          root: { props: { version: 0 } },
          content: [
            {
              type: "PhotoGalleryWrapper",
              props: {
                id: "gallery",
                data: {
                  images: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: [
                      {
                        assetImage: {
                          hasLocalizedValue: "true",
                          defaultValue: {
                            url: "https://example.com/default.jpg",
                            alternateText: { defaultValue: "Brand [[name]]" },
                          },
                          fr: {
                            url: "https://example.com/fr.jpg",
                            alternateText: { defaultValue: "Marque [[name]]" },
                          },
                        },
                        clickthroughUrl: "/brand",
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
        [photoGalleryItemSource],
        { components: {} },
        { locale }
      );
      const streamDocument: StreamDocument = { locale, name: "Paris" };
      const resolvedItems = photoGallerySource.resolveItems(
        migratedData.content[0].props.data.images,
        streamDocument
      );
      const { galleryImages } = getPhotoGalleryImageData({
        resolvedItems,
        locale,
        streamDocument,
        isEditing: false,
      });

      expect(galleryImages).toHaveLength(1);
      expect(galleryImages[0]).toMatchObject({
        image: { url: expectedUrl, alternateText: expectedAlt },
        href: "/brand",
      });
    }
  );
});
