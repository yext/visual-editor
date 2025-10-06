import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testSite,
  transformTests,
  viewports,
} from "../testing/componentTests.setup.ts";
import { act, render as reactRender, waitFor } from "@testing-library/react";
import {
  Header,
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
    props: { ...Header.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { _site: testSite },
    props: { ...Header.defaultProps },
    version: migrationRegistry.length,
    viewport: viewports.desktop,
  },
  {
    name: "default props with document data",
    document: { _site: testSite },
    props: { ...Header.defaultProps },
    version: migrationRegistry.length,
    viewport: viewports.mobile,
    interactions: async (page) => {
      const button = page.getByRole("button");
      await act(async () => {
        await button.click();
      });
    },
  },

  {
    name: "version 2 props",
    document: { _site: testSite },
    props: {
      logoWidth: 80,
      enableLanguageSelector: false,
      analytics: {
        scope: "header",
      },
    },
    version: 2,
    viewport: viewports.desktop,
  },
  {
    name: "version 2 props",
    document: { _site: testSite },
    props: {
      logoWidth: 80,
      enableLanguageSelector: false,
      analytics: {
        scope: "header",
      },
    },
    version: 2,
    viewport: viewports.mobile,
    interactions: async (page) => {
      const button = page.getByRole("button");
      await act(async () => {
        await button.click();
      });
    },
  },
];

describe("Header", async () => {
  const puckConfig: Config = {
    components: { Header },
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
              type: "Header",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(`Header/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `Header/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
