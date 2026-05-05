import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { FAQSection } from "./FAQsSection.tsx";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";
import { MainContent } from "../../structure/MainContent.tsx";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory.tsx";

const faqData = {
  faqs: [
    {
      answer: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>We offer Delivery, Catering, Take Out, and Dine In.</span></p>',
      },
      question: "What services do you offer?",
    },
    {
      answer: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Yes. There are a limited number of spots in front and we validate parking at </span><a href="https://" rel="noopener" style="color: rgb(33, 111, 219); text-decoration: none;"><span>these garages</span></a><span>.</span></p>',
      },
      question: "Do you have parking available?",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {
      locale: "en",
    },
    props: { ...FAQSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { locale: "en", c_faq: faqData },
    props: { ...FAQSection.defaultProps },
    version: migrationRegistry.length,
  },
];

const screenshotThreshold = 10;
// ignore differences in default browser link styling
const ignoredScreenshotDifferences = [420, 422];

describe("FAQSection", async () => {
  const puckConfig: Config = {
    components: { FAQSection, MainContent, ...SlotsCategoryComponents },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
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
              type: "FAQSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      const updatedData = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render
            config={puckConfig}
            data={updatedData}
            metadata={{ streamDocument: document }}
          />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

      await expect(`FAQsSection/[${viewportName}] ${name}`).toMatchScreenshot({
        ignoreExact: ignoredScreenshotDifferences,
        customThreshold: screenshotThreshold,
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `FAQsSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({
          ignoreExact: ignoredScreenshotDifferences,
          customThreshold: screenshotThreshold,
        });
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
