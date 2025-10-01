import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  VideoSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...VideoSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 22 props with entity heading text and no video",
    document: { name: "Test Name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 4,
          align: "center",
        },
      },
      data: {
        heading: {
          field: "name",
          constantValue: { en: "Test Name", hasLocalizedValue: "true" },
          constantValueEnabled: false,
        },
        assetVideo: {},
      },
      liveVisibility: true,
    },
    version: 22,
  },
  {
    name: "version 22 props with constant heading text and video",
    document: { name: "Test Name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
      },
      data: {
        heading: {
          field: "name",
          constantValue: { en: "Video Heading", hasLocalizedValue: "true" },
          constantValueEnabled: true,
        },
        assetVideo: {
          video: {
            embeddedUrl: "https://www.youtube.com/embed/test",
            title: "Test Video",
          },
        },
      },
      liveVisibility: true,
    },
    version: 22,
  },
];

describe("VideoSection", async () => {
  const puckConfig: Config = {
    components: { VideoSection },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
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
              type: "VideoSection",
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
      if (props?.data?.assetVideo?.video?.embeddedUrl) {
        await delay(1000);
      }

      await expect(
        `VideoSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `VideoSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
