import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { BannerSection } from "./Banner.tsx";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { Render, Config } from "@puckeditor/core";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...BannerSection.defaultProps },
    version: migrationRegistry.length,
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
  {
    name: "version 67 props with constant RTF value",
    document: {
      name: "Galaxy Grill",
    },
    props: {
      id: "BannerSection-85b90f9c-f8a3-4796-9dc4-18160b9972b6",
      data: {
        text: {
          field: "",
          constantValue: {
            en: {
              json: '{"root":{"children":[{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Banner Link","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"link","version":1,"rel":"noopener","target":null,"url":"https://yext.com"}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Plain Text","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"bold","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":2,"mode":"normal","style":"","text":"italic","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2},{"children":[{"detail":0,"format":4,"mode":"normal","style":"","text":"strikethrough","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":3},{"children":[{"detail":0,"format":64,"mode":"normal","style":"","text":"superscript","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":4}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"bullet","start":1,"tag":"ul"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"embedded field: [[name]]","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
              html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><a href="https://yext.com" rel="noopener" style="color: rgb(33, 111, 219); text-decoration: none;"><span>Banner Link</span></a></p><p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Plain Text</span></p><ul style="padding: 0; margin: 0; margin-left: 16px; list-style-type: disc; list-style-position: inside;"><li value="1" style="margin: 0 32px;"><b><strong style="font-weight: bold;">bold</strong></b></li><li value="2" style="margin: 0 32px;"><i><em style="font-style: italic;">italic</em></i></li><li value="3" style="margin: 0 32px;"><s><span style="text-decoration: line-through;">strikethrough</span></s></li><li value="4" style="margin: 0 32px;"><sup><span style="font-size: 0.8em; vertical-align: super;">superscript</span></sup></li></ul><p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>embedded field: [[name]]</span></p>',
            },
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        textAlignment: "center",
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
      },
      liveVisibility: true,
      ignoreLocaleWarning: ["data.text"],
    },
    version: 67,
  },
];

describe("BannerSection", async () => {
  const puckConfig: Config = {
    components: { BannerSection },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
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
        puckConfig,
        document
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
