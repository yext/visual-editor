import React from "react";
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGetPuck, type Config, type Fields } from "@puckeditor/core";
import { InternalLayoutEditor } from "../../../internal/components/InternalLayoutEditor.tsx";
import { generateTemplateMetadata } from "../../../internal/types/templateMetadata.ts";
import { type LayoutSaveState } from "../../../internal/types/saveState.ts";
import { toPuckFields } from "../../../fields/fields.ts";
import { page } from "@vitest/browser/context";
import { axe, viewports } from "../../testing/componentTests.setup.ts";
import {
  PhotoGalleryWrapper,
  type PhotoGalleryWrapperProps,
} from "./PhotoGalleryWrapper.tsx";
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

  it.each([viewports.desktop, viewports.tablet, viewports.mobile])(
    "$name item source with optional image links",
    async ({ name, width, height }): Promise<void> => {
      await page.viewport(width, height);
      const { container } = render(
        <VisualEditorProvider
          templateProps={{
            document: {
              locale: "en",
              c_brands: [
                {
                  logo: {
                    url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
                    width: 2048,
                    height: 2048,
                    alternateText: "Varilux",
                  },
                  cta: {
                    label: "View Varilux",
                    link: "/varilux",
                    linkType: "URL",
                  },
                },
                {
                  logo: {
                    url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
                    width: 2048,
                    height: 2048,
                    alternateText: "Crizal",
                  },
                  cta: {
                    label: "View Crizal",
                    link: "/crizal",
                    linkType: "URL",
                  },
                },
                {
                  logo: {
                    url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
                    width: 2048,
                    height: 2048,
                    alternateText: "Essilor",
                  },
                },
              ],
            },
          }}
        >
          <PhotoGalleryWrapper.render
            id="mapped-gallery-screenshot"
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
                    field: "cta",
                    constantValueEnabled: false,
                    constantValue: undefined,
                  },
                },
              },
            }}
            styles={{
              image: { width: 200, aspectRatio: 1 },
              carouselImageCount: 3,
            }}
            parentData={{ variant: "gallery" }}
            puck={{
              isEditing: false,
              dragRef: null,
              metadata: {},
              renderDropZone: (): React.ReactElement => <div />,
            }}
          />
        </VisualEditorProvider>
      );

      await waitFor(
        () => {
          const images = Array.from(container.querySelectorAll("img"));
          expect(images).toHaveLength(3);
          for (const image of images) {
            expect(image.complete).toBe(true);
            expect(image.naturalWidth).toBeGreaterThan(0);
          }
        },
        { timeout: 5000 }
      );
      expect(
        within(container)
          .getByRole("link", { name: "Varilux" })
          .getAttribute("href")
      ).toBe("/varilux");
      expect(
        within(container)
          .getByRole("link", { name: "Crizal" })
          .getAttribute("href")
      ).toBe("/crizal");
      expect(within(container).getByAltText("Essilor").closest("a")).toBeNull();
      await expect(
        `PhotoGalleryWrapper/[${name}] item source with optional image links`
      ).toMatchScreenshot();
      expect(await axe(container)).toHaveNoViolations();
    }
  );
  it.each([0, 1])(
    "when a gallery constant value is saved in sidebar %i then the open array item keeps focus",
    async (sidebarIndex: number): Promise<void> => {
      const onChange = vi.fn();
      const SelectGallery = (): React.JSX.Element => {
        const getPuck = useGetPuck();
        return (
          <button
            onClick={() =>
              getPuck().dispatch({
                type: "setUi",
                ui: { itemSelector: getPuck().getSelectorForId("gallery") },
              })
            }
          >
            Select gallery
          </button>
        );
      };
      const puckConfig: Config = {
        components: {
          PhotoGalleryWrapper: {
            ...PhotoGalleryWrapper,
            fields: toPuckFields(PhotoGalleryWrapper.fields!),
            render: (props) => (
              <>
                <SelectGallery />
                {PhotoGalleryWrapper.render(
                  props as Parameters<typeof PhotoGalleryWrapper.render>[0]
                )}
              </>
            ),
          },
        },
      };
      const Editor = (): React.JSX.Element => {
        const [layoutSaveState, setLayoutSaveState] =
          React.useState<LayoutSaveState>();
        return (
          <InternalLayoutEditor
            puckConfig={puckConfig}
            puckInitialHistory={{
              appendData: false,
              histories: [
                {
                  state: {
                    data: {
                      root: {},
                      content: [
                        {
                          type: "PhotoGalleryWrapper",
                          props: {
                            ...PhotoGalleryWrapper.defaultProps,
                            id: "gallery",
                            parentData: { variant: "gallery" },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }}
            clearHistory={vi.fn()}
            templateMetadata={{
              ...generateTemplateMetadata(),
              isDevMode: false,
            }}
            layoutSaveState={layoutSaveState}
            saveLayoutSaveState={({ payload }) => {
              const history = JSON.parse(payload.history);
              onChange(history.data);
              setLayoutSaveState({ history, hash: payload.hash });
            }}
            publishLayout={vi.fn()}
            sendLayoutForApproval={vi.fn()}
            sendDevSaveStateData={vi.fn()}
            buildVisualConfigLocalStorageKey={() => "gallery-focus-test"}
            localDev={false}
          />
        );
      };
      const { container } = render(
        <VisualEditorProvider
          templateProps={{ document: { locale: "en" } }}
          entityFields={null}
          tailwindConfig={{}}
        >
          <Editor />
        </VisualEditorProvider>
      );
      await waitFor(
        () => {
          const body = container.querySelector("iframe")?.contentDocument?.body;
          expect(body).toBeDefined();
          fireEvent.click(within(body!).getByText("Select gallery"));
        },
        { timeout: 5000 }
      );
      fireEvent.click(
        (await within(container).findAllByText("Item 1"))[sidebarIndex]
      );
      const input = within(container).getByRole("textbox", {
        name: "",
        hidden: true,
      });
      input.focus();
      fireEvent.change(input, { target: { value: "/brand" } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(
          onChange.mock.lastCall?.[0].content[0].props.data.images
            .constantValue[0].link.constantValue.en
        ).toBe("/brand");
      });
      await act(async (): Promise<void> => {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      });
      await waitFor(() => {
        expect(
          within(container).getByRole("textbox", { name: "", hidden: true })
        ).toBe(input);
        expect(within(container).getByDisplayValue("/brand")).toBe(input);
      });
    }
  );

  it.each([
    { variant: "gallery" as const, carouselControlsVisible: false },
    { variant: "carousel" as const, carouselControlsVisible: true },
  ])(
    "when the variant is $variant then Image Fill Type is available",
    async ({ variant, carouselControlsVisible }): Promise<void> => {
      // This resolver only reads component props, so no editor context is needed.
      const fields = await (
        PhotoGalleryWrapper.resolveFields as (data: {
          props: PhotoGalleryWrapperProps;
        }) =>
          | Fields<PhotoGalleryWrapperProps>
          | Promise<Fields<PhotoGalleryWrapperProps>>
      )({
        props: {
          ...PhotoGalleryWrapper.defaultProps,
          data: { images: photoGallerySource.defaultValue },
          styles: { image: { aspectRatio: 1.78 }, carouselImageCount: 1 },
          parentData: { variant },
        },
      });
      expect(fields.styles.type).toBe("object");
      if (fields.styles.type !== "object") {
        throw new Error("Expected an object field for gallery styles");
      }
      expect(fields.styles.objectFields.imageFillType).toMatchObject({
        type: "custom",
        options: [
          expect.objectContaining({ value: "fill" }),
          expect.objectContaining({ value: "fit" }),
        ],
      });
      expect(fields.styles.objectFields.imageFillType).not.toMatchObject({
        visible: false,
      });
      expect(fields.styles.objectFields.carouselImageCount).toMatchObject({
        visible: carouselControlsVisible,
      });
      expect(fields.styles.objectFields.accentColor).toMatchObject({
        visible: carouselControlsVisible,
      });
    }
  );

  it.each([
    {
      variant: "gallery" as const,
      imageFillType: "fit" as const,
      objectFit: "contain",
    },
    {
      variant: "gallery" as const,
      imageFillType: "fill" as const,
      objectFit: "cover",
    },
    {
      variant: "carousel" as const,
      imageFillType: "fit" as const,
      objectFit: "contain",
    },
    {
      variant: "carousel" as const,
      imageFillType: "fill" as const,
      objectFit: "cover",
    },
  ])(
    "when $variant uses $imageFillType then wide and tall images use $objectFit",
    ({ variant, imageFillType, objectFit }): void => {
      const { container } = render(
        <VisualEditorProvider
          templateProps={{
            document: {
              locale: "en",
              photos: [
                {
                  url: "https://example.com/wide.jpg",
                  width: 1200,
                  height: 100,
                  alternateText: "Wide",
                  clickthroughUrl: "/wide",
                },
                {
                  url: "https://example.com/tall.jpg",
                  width: 100,
                  height: 1200,
                  alternateText: "Tall",
                },
              ],
            },
          }}
        >
          <PhotoGalleryWrapper.render
            id="image-fit-gallery"
            data={{
              images: {
                ...photoGallerySource.defaultValue,
                field: "photos",
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
            }}
            styles={{
              image: { width: 200, aspectRatio: 1 },
              imageFillType,
              carouselImageCount: 1,
            }}
            parentData={{ variant }}
            puck={{
              isEditing: false,
              dragRef: null,
              metadata: {},
              renderDropZone: () => <div />,
            }}
          />
        </VisualEditorProvider>
      );
      for (const alt of ["Wide", "Tall"]) {
        const images = within(container).getAllByAltText(alt);
        for (const image of images) {
          expect(getComputedStyle(image).objectFit).toBe(objectFit);
          if (alt === "Wide") {
            expect(image.closest("a")).toHaveAttribute("href", "/wide");
          } else {
            expect(image.closest("a")).toBeNull();
          }
        }
      }
    }
  );
});
