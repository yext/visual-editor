import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
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
        json: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "This burger is a flavor explosion! The juicy patty, nestled in a soft bun, boasts a perfect sear. Crisp lettuce, ripe tomatoes, and a tangy sauce complete this culinary masterpiece. A must-try for any burger enthusiast!",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        },
      },
    },
    {
      contributionDate: "2010-02-02T11:00",
      contributorName: "Sam",
      description: {
        json: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "The Galaxy Grill burger is out of this world! It’s savory, satisfying, and simply delicious. From the first bite to the last, this burger delivers a taste experience that’s truly unforgettable. Don’t miss out on this cosmic culinary adventure!",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        },
      },
    },
    {
      contributionDate: "2024-11-11T17:00",
      contributorName: "John",
      description: {
        json: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Absolutely incredible! This burger is pure perfection. Juicy, flavorful, and everything just works together. The bun is soft, the toppings are fresh, and the overall taste is out of this world. A definite must-get!",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        },
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
    tests: async (page) => {
      expect(page.getByText("Featured Testimonials")).toBeVisible();
    },
  },
  {
    name: "default props with document data",
    document: { c_testimonials: testimonialData },
    props: { ...TestimonialSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Featured Testimonials")).toBeVisible();
      expect(document.body.textContent).not.toContain("Jane");
    },
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
    tests: async (page) => {
      expect(page.getByText("Test Name")).toBeVisible();
      expect(page.getByText("Jane")).toBeVisible();
      expect(page.getByText("Sam")).toBeVisible();
      expect(page.getByText("John")).toBeVisible();
      expect(page.getByText("flavor explosion")).toBeVisible();
      expect(page.getByText("cosmic culinary")).toBeVisible();
      expect(page.getByText("Absolutely incredible!")).toBeVisible();
      expect(page.getByText("Apr 2, 2024")).toBeVisible();
      expect(page.getByText("Feb 2, 2010")).toBeVisible();
      expect(page.getByText("Nov 11, 2024")).toBeVisible();
    },
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
    tests: async (page) => {
      expect(page.getByText("Featured Testimonials")).toBeVisible();
      expect(page.getByText("Name")).toBeVisible();
      expect(page.getByText("Description")).toBeVisible();
      expect(page.getByText("Jan 1, 2025")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
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
  it.each(testsWithViewports)(
    "renders $name $viewport.name",
    async ({
      document,
      props,
      tests,
      version,
      viewport: { width, height } = viewports[0],
    }) => {
      const data = migrate(
        {
          root: { version },
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
      await page.screenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      await tests(page);
    }
  );
});
