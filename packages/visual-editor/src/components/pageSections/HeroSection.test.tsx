import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  transformTests,
  delay,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  HeroSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props with no data",
    document: {},
    props: { ...HeroSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with data",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
    },
    props: { ...HeroSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props using entity values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
    },
    props: {
      data: {
        businessName: {
          field: "name",
          constantValue: "Constant Name",
        },
        localGeoModifier: {
          field: "address.city",
          constantValue: "Geomodifier Name",
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          field: "c_hero",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            primaryCta: { label: "Call To Action", link: "#", linkType: "URL" },
            secondaryCta: {
              label: "Call To Action",
              link: "#",
              linkType: "URL",
            },
          },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        imageOrientation: "left",
        businessNameLevel: 3,
        localGeoModifierLevel: 1,
        primaryCTA: "primary",
        secondaryCTA: "link",
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props using constant values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
    },
    props: {
      data: {
        businessName: {
          field: "name",
          constantValue: "Constant Name",
          constantValueEnabled: true,
        },
        localGeoModifier: {
          field: "address.city",
          constantValue: "Geomodifier Name",
          constantValueEnabled: true,
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          constantValueOverride: {
            image: true,
            primaryCta: true,
            secondaryCta: true,
          },
          field: "c_hero",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            primaryCta: {
              label: "Call To Action 1",
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: "Call To Action 2",
              link: "#",
              linkType: "URL",
            },
          },
        },
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        imageOrientation: "right",
        businessNameLevel: 6,
        localGeoModifierLevel: 3,
        primaryCTA: "secondary",
        secondaryCTA: "primary",
      },
      liveVisibility: true,
    },
    version: 0,
  },
];

describe("HeroSection", async () => {
  const puckConfig: Config = {
    components: { HeroSection },
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
              type: "HeroSection",
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
      await delay(600);

      await expect(`HeroSection/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `HeroSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
