import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  BannerSection,
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
    props: { ...BannerSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: {
      name: "test",
    },
    props: {
      text: {
        field: "",
        constantValue: "Constant Text",
        constantValueEnabled: true,
      },
      textAlignment: "left",
      backgroundColor: {
        bgColor: "bg-palette-primary-dark",
        textColor: "text-white",
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: {
      name: "test",
    },
    props: {
      text: {
        field: "name",
        constantValue: "Constant Text",
      },
      textAlignment: "right",
      backgroundColor: {
        bgColor: "bg-palette-secondary-dark",
        textColor: "text-white",
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 1 props with entity values",
    document: {
      name: "test",
    },
    props: {
      data: {
        text: {
          field: "",
          constantValue: "Constant Text",
          constantValueEnabled: true,
        },
      },
      styles: {
        textAlignment: "left",
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
      },
      liveVisibility: true,
    },
    version: 1,
  },
  {
    name: "version 1 props with constant value",
    document: {
      name: "test",
    },
    props: {
      data: {
        text: {
          field: "name",
          constantValue: "Constant Text",
        },
      },
      styles: {
        textAlignment: "right",
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
      },
      liveVisibility: true,
    },
    version: 1,
  },
  {
    name: "version 1 props with blank value",
    document: {
      name: "test",
    },
    props: {
      data: {
        text: {
          field: "name",
          constantValue: "",
          constantValueEnabled: true,
        },
      },
      styles: {
        textAlignment: "center",
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
      },
      liveVisibility: true,
    },
    version: 1,
  },
];

describe("BannerSection", async () => {
  const puckConfig: Config = {
    components: { BannerSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      name,
      document,
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
              type: "BannerSection",
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
        `BannerSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `BannerSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
