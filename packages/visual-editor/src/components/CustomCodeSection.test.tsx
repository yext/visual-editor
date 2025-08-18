import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "./testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  CustomCodeSection,
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
    props: { ...CustomCodeSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "with custom HTML, CSS, and JS interaction to change color",
    document: {},
    props: {
      ...CustomCodeSection.defaultProps,
      html: `
        <button id="color-btn" onclick="changeColor(this)">
          Change Color
        </button>
      `,
      css: `
        #color-btn {
          background-color: white;
          color: black;
          border: 1px solid #ccc;
          padding: 10px;
        }
      `,
      javascript: `
        function changeColor(el) {
          el.style.cssText = "background-color: darkblue; color: white;";
        }
      `,
    },
    version: migrationRegistry.length,
    interactions: async (page) => {
      await page.getByRole("button", { name: "Change Color" }).click();
    },
  },
];

describe("CustomCodeSection", async () => {
  const puckConfig: Config = {
    components: { CustomCodeSection },
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
              type: "CustomCodeSection",
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
        `CustomCodeSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `CustomCodeSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
