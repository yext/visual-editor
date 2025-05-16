import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  FAQSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const faqData = {
  faqs: [
    {
      answer: {
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
                    text: "We offer Delivery, Catering, Take Out, and Dine In.",
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
      question: "What services do you offer?",
    },
    {
      answer: {
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
                    text: "Yes. There are a limited number of spots in front and we validate parking at ",
                    type: "text",
                    version: 1,
                  },
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "these garages",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    rel: "noopener",
                    type: "link",
                    url: "https://",
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: ".",
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
      question: "Do you have parking available?",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...FAQSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Frequently Asked Questions")).toBeVisible();
      expect(document.body.textContent).not.toContain("parking");
    },
  },
  {
    name: "default props with document data",
    document: { c_faq: faqData },
    props: { ...FAQSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Frequently Asked Questions")).toBeVisible();
      expect(document.body.textContent).not.toContain("parking");
    },
  },
  {
    name: "version 0 props with entity values",
    document: { c_faq: faqData, name: "test name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Frequently Asked Questions",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        faqs: {
          field: "c_faq",
          constantValue: { faqs: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      const q1 = page.getByText("What services do you offer?");
      const q2 = page.getByText("Do you have parking available?");
      expect(page.getByText("test name")).toBeVisible();
      expect(q1).toBeVisible();
      expect(q2).toBeVisible();
      await q1.click();
      expect(page.getByText("delivery")).toBeVisible();
      await q2.click();
      expect(page.getByText("limited")).toBeVisible();
    },
  },
  {
    name: "version 0 props with constant value",
    document: { c_faq: faqData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Frequently Asked Questions",
          constantValueEnabled: true,
          constantValueOverride: {},
        },
        faqs: {
          field: "c_faq",
          constantValue: {
            faqs: [
              { question: "Test Question 1", answer: "Answer 1" },
              { question: "Test Question 2", answer: "Answer 2" },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 5,
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      const q1 = page.getByText("Test Question 1");
      const q2 = page.getByText("Test Question 2");
      expect(page.getByText("Frequently Asked Questions")).toBeVisible();
      expect(q1).toBeVisible();
      expect(q2).toBeVisible();
      await q1.click();
      expect(page.getByText("Answer 1")).toBeVisible();
      await q2.click();
      expect(page.getByText("Answer 2")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
];

describe("FAQSection", async () => {
  const puckConfig: Config = {
    components: { FAQSection },
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
              type: "FAQSection",
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
