import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
  delay,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  PhotoGallerySection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const photoGalleryData = [
  {
    image: {
      height: 2048,
      thumbnails: [
        {
          height: 2048,
          url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
          width: 2048,
        },
        {
          height: 1900,
          url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/1900x1900.jpg",
          width: 1900,
        },
        {
          height: 619,
          url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/619x619.jpg",
          width: 619,
        },
        {
          height: 450,
          url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/450x450.jpg",
          width: 450,
        },
        {
          height: 196,
          url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/196x196.jpg",
          width: 196,
        },
      ],
      url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
      width: 2048,
    },
  },
  {
    image: {
      height: 2048,
      thumbnails: [
        {
          height: 2048,
          url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
          width: 2048,
        },
        {
          height: 1900,
          url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/1900x1900.jpg",
          width: 1900,
        },
        {
          height: 619,
          url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/619x619.jpg",
          width: 619,
        },
        {
          height: 450,
          url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/450x450.jpg",
          width: 450,
        },
        {
          height: 196,
          url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/196x196.jpg",
          width: 196,
        },
      ],
      url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
      width: 2048,
    },
  },
  {
    image: {
      height: 2048,
      thumbnails: [
        {
          height: 2048,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
          width: 2048,
        },
        {
          height: 1900,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/1900x1900.jpg",
          width: 1900,
        },
        {
          height: 619,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/619x619.jpg",
          width: 619,
        },
        {
          height: 450,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/450x450.jpg",
          width: 450,
        },
        {
          height: 196,
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/196x196.jpg",
          width: 196,
        },
      ],
      url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
      width: 2048,
    },
  },
  {
    image: {
      height: 2048,
      thumbnails: [
        {
          height: 2048,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/2048x2048.jpg",
          width: 2048,
        },
        {
          height: 1900,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/1900x1900.jpg",
          width: 1900,
        },
        {
          height: 619,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/619x619.jpg",
          width: 619,
        },
        {
          height: 450,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/450x450.jpg",
          width: 450,
        },
        {
          height: 196,
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/196x196.jpg",
          width: 196,
        },
      ],
      url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/2048x2048.jpg",
      width: 2048,
    },
  },
];

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...PhotoGallerySection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { photoGallery: photoGalleryData },
    props: { ...PhotoGallerySection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { photoGallery: photoGalleryData, name: "Test Name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
      },
      sectionHeading: {
        text: {
          field: "name",
          constantValue: "Gallery",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        level: 2,
      },
      images: {
        images: {
          field: "photoGallery",
          constantValue: [
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
          ],
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        imageStyle: {
          layout: "auto",
          height: 570,
          width: 1000,
          aspectRatio: 1.25,
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { photoGallery: photoGalleryData },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
      },
      sectionHeading: {
        text: {
          field: "name",
          constantValue: "Gallery",
          constantValueEnabled: true,
        },
        level: 5,
      },
      images: {
        images: {
          field: "photoGallery",
          constantValue: [
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
            {
              height: 570,
              width: 1000,
              url: "https://placehold.co/1000x570/png",
            },
          ],
          constantValueEnabled: true,
        },
        imageStyle: {
          layout: "fixed",
          height: 50,
          width: 50,
          aspectRatio: 1.25,
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 1 props with entity values",
    document: { photoGallery: photoGalleryData, name: "Test Name" },
    props: {
      data: {
        heading: {
          constantValue: "Gallery",
          constantValueEnabled: false,
          constantValueOverride: {},
          field: "name",
        },
        images: {
          constantValue: [
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
          ],
          constantValueEnabled: false,
          constantValueOverride: {},
          field: "photoGallery",
        },
      },
      liveVisibility: true,
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        headingLevel: 2,
        imageStyle: {
          aspectRatio: 1.25,
          height: 570,
          layout: "auto",
          width: 1000,
        },
      },
    },
    version: 1,
  },
  {
    name: "version 0 props with constant value",
    document: { photoGallery: photoGalleryData },
    props: {
      data: {
        heading: {
          constantValue: "Gallery",
          constantValueEnabled: true,
          field: "name",
        },
        images: {
          constantValue: [
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
            {
              height: 570,
              url: "https://placehold.co/1000x570/png",
              width: 1000,
            },
          ],
          constantValueEnabled: true,
          field: "photoGallery",
        },
      },
      liveVisibility: true,
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 5,
        imageStyle: {
          aspectRatio: 1.25,
          height: 50,
          layout: "fixed",
          width: 50,
        },
      },
    },
    version: 1,
  },
];

describe("PhotoGallerySection", async () => {
  const puckConfig: Config = {
    components: { PhotoGallerySection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      document,
      name,
      props,
      interactions,
      version,
      viewport: { width, height, name: viewportName },
    }) => {
      const data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "PhotoGallerySection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig
      );

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      await delay(1000);

      await expect(
        `PhotoGallerySection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `PhotoGallerySection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
