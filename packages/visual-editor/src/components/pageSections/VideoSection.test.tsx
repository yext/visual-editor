import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  VideoSection,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props",
    document: {},
    props: { ...VideoSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 19 props with video",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        heading: { level: 2, align: "center" },
      },
      data: {
        video: "https://www.youtube.com/embed/lJIrF4YjHfQ?si=nMnHcm447B2ZmkvA",
        heading: {
          field: "",
          constantValue: { en: "My Video", hasLocalizedValue: "true" },
          constantValueEnabled: true,
        },
      },
      liveVisibility: true,
    },
    version: 19,
  },
];

describe("VideoSection", async () => {
  const puckConfig: Config = {
    components: { VideoSection },
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

      await expect(
        `TestimonialSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `TestimonialSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
