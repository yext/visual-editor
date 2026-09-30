import React from "react";
import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhotoGalleryWrapper } from "./PhotoGalleryWrapper.tsx";
import { photoGallerySource } from "./photoGallerySource.ts";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";

describe("PhotoGalleryWrapper", () => {
  it.each([
    {
      name: "gallery",
      parentData: { variant: "gallery" as const },
      isEditing: false,
      copies: 1,
    },
    {
      name: "desktop and mobile carousels",
      parentData: { variant: "carousel" as const },
      isEditing: false,
      copies: 2,
    },
    {
      name: "editor",
      parentData: { variant: "gallery" as const },
      isEditing: true,
      copies: 1,
    },
  ])(
    "when brands have optional links then the $name shows each brand",
    ({ parentData, isEditing, copies }) => {
      const { container } = render(
        <VisualEditorProvider
          templateProps={{
            document: {
              locale: "en",
              c_brands: [
                {
                  logo: {
                    url: "https://example.com/varilux.jpg",
                    width: 100,
                    height: 100,
                    alternateText: "Varilux",
                  },
                  cta: {
                    label: "Varilux",
                    link: "https://example.com/varilux",
                  },
                },
                {
                  logo: {
                    url: "https://example.com/crizal.jpg",
                    width: 100,
                    height: 100,
                    alternateText: "Crizal",
                  },
                  cta: { label: "Crizal", link: "https://example.com/crizal" },
                },
                {
                  logo: {
                    url: "https://example.com/essilor.jpg",
                    width: 100,
                    height: 100,
                    alternateText: "Essilor",
                  },
                },
              ],
            },
          }}
        >
          <PhotoGalleryWrapper.render
            id="brands"
            data={{
              images: {
                field: "c_brands",
                constantValueEnabled: false,
                constantValue: [],
                mappings: {
                  image: {
                    field: "logo",
                    constantValueEnabled: false,
                    constantValue: undefined,
                  },
                  link: {
                    field: "cta",
                    constantValueEnabled: false,
                    constantValue: undefined,
                  },
                },
              },
            }}
            styles={{
              image: { width: 100, aspectRatio: 1 },
              carouselImageCount: 3,
            }}
            parentData={parentData}
            puck={{
              isEditing,
              dragRef: null,
              metadata: {},
              renderDropZone: () => <div />,
            }}
          />
        </VisualEditorProvider>
      );

      for (const [name, href] of [
        ["Varilux", "https://example.com/varilux"],
        ["Crizal", "https://example.com/crizal"],
        ["Essilor", null],
      ] as const) {
        const images = within(container).getAllByAltText(name);
        expect(images).toHaveLength(copies);
        for (const image of images) {
          expect(image.closest("a")?.getAttribute("href") ?? null).toBe(
            isEditing ? null : href
          );
        }
      }
      expect(container.querySelectorAll("a")).toHaveLength(
        isEditing ? 0 : 2 * copies
      );
    }
  );

  it("when a manual image has a link then it uses the page language and entity values", () => {
    const { container } = render(
      <VisualEditorProvider
        templateProps={{ document: { name: "Paris", slug: "paris" } }}
      >
        <PhotoGalleryWrapper.render
          id="manual-gallery"
          data={{
            images: {
              ...photoGallerySource.defaultValue,
              constantValue: [
                {
                  image: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: {
                      defaultValue: {
                        url: "https://example.com/brand.jpg",
                        width: 100,
                        height: 100,
                        alternateText: { defaultValue: "Brand [[name]]" },
                      },
                    },
                  },
                  link: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: { defaultValue: "/[[slug]]" },
                  },
                },
              ],
            },
          }}
          styles={{
            image: { width: 100, aspectRatio: 1 },
            carouselImageCount: 3,
          }}
          parentData={{ variant: "gallery" }}
          puck={{
            isEditing: false,
            dragRef: null,
            metadata: {},
            renderDropZone: () => <div />,
          }}
        />
      </VisualEditorProvider>
    );

    expect(
      within(container)
        .getByRole("link", { name: "Brand Paris" })
        .getAttribute("href")
    ).toBe("/paris");
  });
});
