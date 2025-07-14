import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testSite,
  transformTests,
  delay,
} from "./testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  Footer,
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
    props: { ...Footer.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { _site: testSite },
    props: { ...Footer.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props",
    document: { _site: testSite },
    props: {
      backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
      analytics: {
        scope: "footer",
      },
    },
    version: 0,
  },
];

describe("Footer", async () => {
  const puckConfig: Config = {
    components: { Footer },
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
              type: "Footer",
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
      await delay(300);

      await expect(`Footer/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `Footer/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
