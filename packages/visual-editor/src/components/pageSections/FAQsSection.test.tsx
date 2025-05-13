import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { FAQSection, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("FAQSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { FAQSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };

  it("should pass wcag with default props", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "FAQSection",
                props: { id: "abc", ...FAQSection.defaultProps },
              },
            ],
          }}
        />
      </VisualEditorProvider>
    );

    await page.viewport(width, height);
    await page.screenshot();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should pass wcag with faqs", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            c_faqsSection: {
              faqs: [
                {
                  question: "What is Yext?",
                  answer: {
                    html: "<strong>Yext</strong> is a digital presence platform.",
                  },
                },
                {
                  question: "How does it work?",
                  answer:
                    "It works by helping businesses manage their digital presence.",
                },
              ],
            },
          },
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "FAQSection",
                props: {
                  id: "abc",
                  ...FAQSection.defaultProps,
                  data: {
                    ...FAQSection.defaultProps!.data,
                    faqs: {
                      field: "c_faqsSection",
                      constantValue: {},
                    },
                  },
                },
              },
            ],
          }}
        />
      </VisualEditorProvider>
    );

    await page.viewport(width, height);
    await page.screenshot();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
