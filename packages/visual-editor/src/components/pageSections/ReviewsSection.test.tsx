import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../testing/componentTests.setup.ts";
import {
  act,
  render as reactRender,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  ReviewsSection,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const interactionsDelay = 750;

// Based on reviews data from https://www.yext.com/s/70452/entity/edit3?entityIds=25897322
const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: {
      ...ReviewsSection.defaultProps,
    },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: {
      businessId: 70452,
      _env: {
        YEXT_VISUAL_EDITOR_REVIEWS_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_REVIEWS_APP_API_KEY,
      },
      uid: 25897322,
      ref_reviewsAgg: [
        {
          averageRating: 3.7142856,
          publisher: "FIRSTPARTY",
          reviewCount: 7,
        },
      ],
      _yext: { contentDeliveryAPIDomain: "https://cdn.yextapis.com" },
    },
    props: {
      ...ReviewsSection.defaultProps,
    },
    version: migrationRegistry.length,
    interactions: async (page) => {
      const expandButton = page.getByText("Show More");
      await act(async () => {
        await expandButton.click();
      });
      await delay(interactionsDelay);
    },
  },
  {
    name: "version 10 props with empty document",
    document: {},
    props: {
      backgroundColor: {
        bgColor: "bg-palette-primary-dark",
        textColor: "text-white",
      },
      analytics: {
        scope: "reviewsSection",
      },
    },
    version: 10,
  },
  {
    name: "version 10 props with document data",
    document: {
      businessId: 70452,
      _env: {
        YEXT_VISUAL_EDITOR_REVIEWS_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_REVIEWS_APP_API_KEY,
      },
      uid: 25897322,
      ref_reviewsAgg: [
        {
          averageRating: 3.7142856,
          publisher: "FIRSTPARTY",
          reviewCount: 7,
        },
      ],
      _yext: { contentDeliveryAPIDomain: "https://cdn.yextapis.com" },
    },
    props: {
      backgroundColor: {
        bgColor: "bg-palette-primary-dark",
        textColor: "text-white",
      },
      analytics: {
        scope: "reviewsSection",
      },
    },
    version: 10,
    interactions: async (page) => {
      const expandButton = page.getByText("Show More");
      await act(async () => {
        await expandButton.click();
      });
      await delay(interactionsDelay);
    },
  },
];

describe("ReviewsSection", async () => {
  const puckConfig: Config = {
    components: { ReviewsSection },
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
              type: "ReviewsSection",
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
      if (!name.includes("empty document")) {
        await waitFor(() => {
          screen.getAllByText("Kyle D");
        });
      }

      await expect(
        `ReviewsSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `ReviewsSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
