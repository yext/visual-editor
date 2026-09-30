import React from "react";
import { render, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { page } from "@vitest/browser/context";
import "../../testing/componentTests.css";
import "../../../../dist/style.css";
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

  it.each([
    {
      viewport: 375,
      imageWidth: 1000,
      parentData: { variant: "gallery" as const },
    },
    {
      viewport: 800,
      imageWidth: 1000,
      parentData: { variant: "gallery" as const },
    },
    {
      viewport: 1440,
      imageWidth: 1000,
      parentData: { variant: "gallery" as const },
    },
    {
      viewport: 375,
      imageWidth: 100,
      parentData: { variant: "gallery" as const },
    },
    {
      viewport: 800,
      imageWidth: 100,
      parentData: { variant: "gallery" as const },
    },
    {
      viewport: 1440,
      imageWidth: 100,
      parentData: { variant: "gallery" as const },
    },
    {
      viewport: 375,
      imageWidth: 1000,
      parentData: { variant: "carousel" as const },
    },
    {
      viewport: 800,
      imageWidth: 1000,
      parentData: { variant: "carousel" as const },
    },
    {
      viewport: 1440,
      imageWidth: 1000,
      parentData: { variant: "carousel" as const },
    },
    {
      viewport: 375,
      imageWidth: 100,
      parentData: { variant: "carousel" as const },
    },
    {
      viewport: 800,
      imageWidth: 100,
      parentData: { variant: "carousel" as const },
    },
    {
      viewport: 1440,
      imageWidth: 100,
      parentData: { variant: "carousel" as const },
    },
  ])(
    "when $parentData.variant images have links at $viewport px then their $imageWidth px size stays the same",
    async ({ viewport, imageWidth, parentData }): Promise<void> => {
      await page.viewport(viewport, 900);
      const { container, rerender } = render(<></>);
      let unlinkedSizes: { width: number; height: number }[] = [];

      for (const linkField of ["", "cta", "cta.link"]) {
        rerender(
          <VisualEditorProvider
            templateProps={{
              document: {
                locale: "en",
                c_brands: Array.from({ length: 3 }, () => ({
                  logo: {
                    url: "https://example.com/brand.jpg",
                    width: 1000,
                    height: 570,
                    alternateText: "Brand",
                  },
                  cta: { label: "Brand", link: "/brand", linkType: "URL" },
                })),
              },
            }}
          >
            <PhotoGalleryWrapper.render
              id="sized-gallery"
              data={{
                images: {
                  ...photoGallerySource.defaultValue,
                  field: "c_brands",
                  constantValueEnabled: false,
                  mappings: {
                    image: {
                      field: "logo",
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
              }}
              styles={{
                image: { width: imageWidth, aspectRatio: 1.78 },
                carouselImageCount: 3,
              }}
              parentData={parentData}
              puck={{
                isEditing: false,
                dragRef: null,
                metadata: {},
                renderDropZone: () => <div />,
              }}
            />
          </VisualEditorProvider>
        );

        await waitFor(() => {
          if (parentData.variant === "carousel") {
            // Wait for ResizeObserver to set the slide count before measuring.
            expect(
              within(container).getAllByRole("option", { selected: true })
            ).toHaveLength(viewport < 750 ? 1 : 3);
          }
          const sizes = within(container)
            .getAllByAltText("Brand")
            .map((image) => image.getBoundingClientRect())
            .filter(({ width }) => width > 0);
          expect(sizes).toHaveLength(3);
          sizes.forEach(({ width, height }, index) => {
            expect(width).toBeLessThanOrEqual(Math.min(imageWidth, viewport));
            expect(height).toBeGreaterThan(0);
            if (linkField) {
              expect(width).toBeCloseTo(unlinkedSizes[index].width, 1);
              expect(height).toBeCloseTo(unlinkedSizes[index].height, 1);
            }
          });
          if (!linkField) {
            unlinkedSizes = sizes;
          }
        });
      }
    }
  );
  it.each([
    {
      parentData: { variant: "gallery" as const },
      isEditing: false,
      copies: 1,
    },
    {
      parentData: { variant: "carousel" as const },
      isEditing: false,
      copies: 2,
    },
    { parentData: { variant: "gallery" as const }, isEditing: true, copies: 1 },
    {
      parentData: { variant: "carousel" as const },
      isEditing: true,
      copies: 2,
    },
  ])(
    "when team CTAs use different link types and edit mode is $isEditing then $parentData keeps the images and link actions",
    ({ parentData, isEditing, copies }): void => {
      const { container } = render(
        <VisualEditorProvider
          templateProps={{
            document: {
              locale: "en",
              c_team: {
                people: [
                  {
                    headshot: {
                      url: "https://example.com/jane.jpg",
                      width: 100,
                      height: 100,
                      alternateText: "Jane",
                    },
                    cta: { link: "jane@example.com", linkType: "EMAIL" },
                  },
                  {
                    headshot: {
                      url: "https://example.com/john.jpg",
                      width: 100,
                      height: 100,
                    },
                    cta: {
                      link: "+12125550100",
                      linkType: "PHONE",
                      label: "Call John",
                    },
                  },
                  {
                    headshot: {
                      url: "https://example.com/jill.jpg",
                      width: 100,
                      height: 100,
                      alternateText: "Jill",
                    },
                    cta: { link: "/Team/Jill", linkType: "URL" },
                  },
                  {
                    headshot: {
                      url: "https://example.com/jack.jpg",
                      width: 100,
                      height: 100,
                      alternateText: "Jack",
                    },
                    cta: { link: " ", linkType: "URL" },
                  },
                ],
              },
            },
          }}
        >
          <PhotoGalleryWrapper.render
            id="team-links"
            data={{
              images: {
                ...photoGallerySource.defaultValue,
                field: "c_team.people",
                constantValueEnabled: false,
                mappings: {
                  image: {
                    field: "headshot",
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
              carouselImageCount: 1,
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
      expect(container.querySelectorAll("img")).toHaveLength(4 * copies);
      expect(container.querySelectorAll("a")).toHaveLength(
        isEditing ? 0 : 3 * copies
      );
      if (!isEditing) {
        for (const image of within(container).getAllByAltText("Jane")) {
          // The shared CTA masks email addresses in the HTML link.
          expect(atob(image.closest("a")!.getAttribute("href")!)).toBe(
            "mailto:jane@example.com"
          );
        }
        for (const link of container.querySelectorAll(
          'a[aria-label="Call John"]'
        )) {
          expect(link.getAttribute("href")).toBe("tel:+12125550100");
        }
        expect(
          container.querySelectorAll('a[aria-label="Call John"]')
        ).toHaveLength(copies);
        for (const image of within(container).getAllByAltText("Jill")) {
          expect(image.closest("a")!.getAttribute("href")).toBe("/Team/Jill");
        }
      }
      for (const image of within(container).getAllByAltText("Jack")) {
        expect(image.closest("a")).toBeNull();
      }
    }
  );

  it("when a carousel source changes from three images to one then the last image stays visible", async (): Promise<void> => {
    await page.viewport(1440, 900);
    const props = {
      id: "changing-gallery",
      data: {
        images: {
          ...photoGallerySource.defaultValue,
          field: "photoGallery",
          constantValueEnabled: false,
          mappings: {
            link: {
              field: "",
              constantValueEnabled: false,
              constantValue: undefined,
            },
            image: {
              field: "$item",
              constantValueEnabled: false,
              constantValue: undefined,
            },
          },
        },
      },
      styles: { image: { width: 100, aspectRatio: 1 }, carouselImageCount: 3 },
      parentData: { variant: "carousel" as const },
      puck: {
        isEditing: false,
        dragRef: null,
        metadata: {},
        renderDropZone: (): React.ReactElement => <div />,
      },
    };
    const { container, rerender } = render(
      <VisualEditorProvider
        templateProps={{
          document: {
            photoGallery: [
              {
                url: "https://example.com/one.jpg",
                width: 100,
                height: 100,
                alternateText: "One",
              },
              {
                url: "https://example.com/two.jpg",
                width: 100,
                height: 100,
                alternateText: "Two",
              },
              {
                url: "https://example.com/three.jpg",
                width: 100,
                height: 100,
                alternateText: "Three",
              },
            ],
          },
        }}
      >
        <PhotoGalleryWrapper.render {...props} />
      </VisualEditorProvider>
    );
    await waitFor(() =>
      expect(
        container.querySelectorAll(".carousel__slide--visible")
      ).toHaveLength(6)
    );
    rerender(
      <VisualEditorProvider
        templateProps={{
          document: {
            photoGallery: [
              {
                url: "https://example.com/one.jpg",
                width: 100,
                height: 100,
                alternateText: "One",
              },
            ],
          },
        }}
      >
        <PhotoGalleryWrapper.render {...props} />
      </VisualEditorProvider>
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".carousel__slide--visible")
      ).toHaveLength(2);
      const image = within(container).getAllByAltText("One")[0];
      expect(image.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(
        image.closest(".carousel__slide")!.getAttribute("aria-selected")
      ).toBe("true");
      expect(
        container.querySelectorAll(
          ".carousel__back-button:enabled, .carousel__next-button:enabled"
        )
      ).toHaveLength(0);
    });
  });
});
