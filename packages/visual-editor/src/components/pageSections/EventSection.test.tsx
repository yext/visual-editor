import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
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
                    text: "Join our hands-on ",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 1,
                    mode: "normal",
                    style: "",
                    text: "cooking class",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: " to learn delicious recipes and ",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 2,
                    mode: "normal",
                    style: "",
                    text: "unleash",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: " your inner chef. ",
                    type: "text",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 8,
                    mode: "normal",
                    style: "background-color: #ffc107;",
                    text: "Perfect for all levels!",
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
                    text: "Join our group for a refreshing hike on local trails! Enjoy:",
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
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "nature",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "listitem",
                    value: 1,
                    version: 1,
                  },
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "good company",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "listitem",
                    value: 2,
                    version: 1,
                  },
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "fresh air together",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "listitem",
                    value: 3,
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                listType: "bullet",
                start: 1,
                tag: "ul",
                type: "list",
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
    tests: async (page) => {
      expect(page.getByText("Upcoming Events")).toBeVisible();
    },
  },
  {
    name: "default props with document data",
    document: { c_events: eventsData },
    props: { ...EventSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Upcoming Events")).toBeVisible();
      expect(document.body.textContent).not.toContain("Hike");
    },
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
    tests: async (page) => {
      expect(page.getByText("Test Name")).toBeVisible();
      expect(
        page.getByRole("heading", { name: "Cooking Class" })
      ).toBeVisible();
      expect(page.getByRole("heading", { name: "Hike" })).toBeVisible();
      expect(page.getByText("2025")).toBeVisible();
      expect(page.getByText("2026")).toBeVisible();
      expect(page.getByText("Learn More")).toBeVisible();
      expect(page.getByText("Sign Up")).toBeVisible();
      expect(page.getByText("inner chef")).toBeVisible();
      expect(page.getByText("local trails")).toBeVisible();
    },
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
    tests: async (page) => {
      expect(page.getByText("Upcoming")).toBeVisible();
      expect(page.getByText("Event 1")).toBeVisible();
      expect(page.getByText("Event 2")).toBeVisible();
      expect(page.getByText("2020")).toBeVisible();
      expect(page.getByText("Test Description")).toBeVisible();
      expect(page.getByText("Test CTA")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
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
      await page.screenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      await tests(page);
    }
  );
});
