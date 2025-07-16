import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  TestimonialSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const testimonialData = {
  testimonials: [
    {
      contributionDate: "2024-04-02T15:23",
      contributorName: "Jane",
      description: {
        html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>This burger is a flavor explosion! The juicy patty, nestled in a soft bun, boasts a perfect sear. Crisp lettuce, ripe tomatoes, and a tangy sauce complete this culinary masterpiece. A must-try for any burger enthusiast!</span></p>`,
      },
    },
    {
      contributionDate: "2010-02-02T11:00",
      contributorName: "Sam",
      description: {
        html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>The Galaxy Grill burger is out of this world! It's savory, satisfying, and simply delicious. From the first bite to the last, this burger delivers a taste experience that's truly unforgettable. Don't miss out on this cosmic culinary adventure!</span></p>`,
      },
    },
    {
      contributionDate: "2024-11-11T17:00",
      contributorName: "John",
      description: {
        html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Absolutely incredible! This burger is pure perfection. Juicy, flavorful, and everything just works together. The bun is soft, the toppings are fresh, and the overall taste is out of this world. A definite must-get!</span></p>`,
      },
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...TestimonialSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_testimonials: testimonialData },
    props: { ...TestimonialSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { c_testimonials: testimonialData, name: "Test Name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        headingLevel: 6,
      },
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: { testimonials: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { c_testimonials: testimonialData },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: true,
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: {
            testimonials: [
              {
                description: "Description",
                contributorName: "Name",
                contributionDate: "2025-01-01",
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 1 props with constant value",
    document: { c_testimonials: testimonialData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: true,
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: {
            testimonials: [
              {
                description: "Description",
                contributorName: "Name",
                contributionDate: "2025-01-01",
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
      },
      liveVisibility: true,
    },
    version: 1,
  },
  {
    name: "version 7 props with constant value",
    document: { c_testimonials: testimonialData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: true,
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: {
            testimonials: [
              {
                description: "Description",
                contributorName: "Name",
                contributionDate: "2025-01-01",
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 7 props with entity values",
    document: { c_testimonials: testimonialData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: { testimonials: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 4,
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
];

describe("TestimonialSection", async () => {
  const puckConfig: Config = {
    components: { TestimonialSection },
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
              type: "TestimonialSection",
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
