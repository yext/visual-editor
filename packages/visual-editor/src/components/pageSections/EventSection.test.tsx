import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  EventSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const eventsData = {
  events: [
    {
      cta: {
        label: "Learn More",
        link: "https://yext.com",
        linkType: "URL",
      },
      dateTime: "2025-06-01T10:00",
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our hands-on </span><b><strong style="font-weight: bold;">cooking class</strong></b><span> to learn delicious recipes and </span><i><em style="font-style: italic;">unleash</em></i><span> your inner chef. </span><u><span style="text-decoration: underline; background-color: #ffc107;">Perfect for all levels!</span></u></p>',
      },
      image: {
        alternateText: "cooking class",
        height: 1554,
        thumbnails: [
          {
            height: 1554,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
            width: 2048,
          },
          {
            height: 1442,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/1900x1442.jpg",
            width: 1900,
          },
          {
            height: 470,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/619x470.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/593x450.jpg",
            width: 593,
          },
          {
            height: 149,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/196x149.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
        width: 2048,
      },
      title: "Cooking Class",
    },
    {
      cta: {
        label: "Sign Up",
        link: "sumo@yext.com",
        linkType: "EMAIL",
      },
      dateTime: "2026-06-30T08:00",
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our group for a refreshing hike on local trails! Enjoy:</span></p><ul style="padding: 0; margin: 0; margin-left: 16px; list-style-type: disc; list-style-position: inside;"><li value="1" style="margin: 0 32px;"><span>nature</span></li><li value="2" style="margin: 0 32px;"><span>good company</span></li><li value="3" style="margin: 0 32px;"><span>fresh air together</span></li></ul>',
      },
      image: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
        width: 2048,
      },
      title: "Hike",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...EventSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_events: eventsData },
    props: { ...EventSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { c_events: eventsData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Upcoming Events",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        events: {
          field: "c_events",
          constantValue: { events: [{}] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 5,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { c_events: eventsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Upcoming",
          constantValueEnabled: true,
        },
        events: {
          field: "c_exampleEvents",
          constantValue: {
            events: [
              { title: "Event 1" },
              {
                image: { url: "https://placehold.co/600x400" },
                title: "Event 2",
                dateTime: "2020-02-02T10:10",
                description: "Test Description",
                cta: { label: "Test CTA", link: "https://yext.com" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 7 props with entity values",
    document: { c_events: eventsData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Upcoming Events",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        events: {
          field: "c_events",
          constantValue: { events: [{}] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 3,
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
    version: 7,
  },
  {
    name: "version 7 props with constant value",
    document: { c_events: eventsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Upcoming",
          constantValueEnabled: true,
        },
        events: {
          field: "c_exampleEvents",
          constantValue: {
            events: [
              { title: "Event 1" },
              {
                image: { url: "https://placehold.co/600x400" },
                title: "Event 2",
                dateTime: "2020-02-02T10:10",
                description: "Test Description",
                cta: { label: "Test CTA", link: "https://yext.com" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 3,
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
    version: 7,
  },
  {
    name: "version 14 props with missing ctaType",
    document: { c_events: eventsData },
    props: {
      data: {
        events: {
          field: "c_events",
          constantValue: [
            {
              image: { url: "https://placehold.co/600x400" },
              title: "Event 1",
              dateTime: "2020-01-01T10:00",
              description: "Test Description",
              cta: {
                label: "Test CTA",
                // Missing link, linkType, and ctaType - should be added by migration
              },
            },
            {
              image: { url: "https://placehold.co/600x400" },
              title: "Event 2",
              dateTime: "2020-02-02T10:10",
              description: "Test Description",
              cta: {
                label: "Test CTA 2",
                link: "https://yext.com",
                // Missing linkType and ctaType - should be added by migration
              },
            },
          ],
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 3,
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
    version: 14,
  },
  {
    name: "version 14 props with nested events structure and missing ctaType",
    document: { c_events: eventsData },
    props: {
      data: {
        events: {
          field: "c_events",
          constantValue: {
            events: [
              {
                image: { url: "https://placehold.co/600x400" },
                title: "Event 1",
                dateTime: "2020-01-01T10:00",
                description: "Test Description",
                cta: {
                  label: "Test CTA",
                  // Missing link, linkType, and ctaType - should be added by migration
                },
              },
              {
                image: { url: "https://placehold.co/600x400" },
                title: "Event 2",
                dateTime: "2020-02-02T10:10",
                description: "Test Description",
                cta: {
                  label: "Test CTA 2",
                  link: "https://yext.com",
                  linkType: "URL",
                  // Missing ctaType - should be added by migration
                },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 3,
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
    version: 14,
  },
];

describe("EventSection", async () => {
  const puckConfig: Config = {
    components: { EventSection },
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
              type: "EventSection",
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
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(
        `EventSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `EventSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
