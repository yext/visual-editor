import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { act, render as reactRender } from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  ReviewsSection,
  VisualEditorProvider,
  SlotsCategoryComponents,
  injectTranslations,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";

const interactionsDelay = 750;

const testDocument = {
  // Based on reviews data from https://www.yext.com/s/70452/entity/edit3?entityIds=25897322
  ref_reviewsAgg: [
    {
      averageRating: 3.7142856,
      publisher: "FIRSTPARTY",
      reviewCount: 7,
      topReviews: [
        {
          authorName: "Kyle B",
          content: "Decent Castle",
          rating: 3,
          reviewDate: "2025-06-30T01:17:29.641Z",
          reviewId: 1534364531,
        },
        {
          authorName: "Kyle A",
          content: "Pretty good castle",
          rating: 4,
          reviewDate: "2025-06-30T01:17:12.023Z",
          reviewId: 1534364511,
        },
        {
          authorName: "Kyle C",
          content: "This was an awesome castle!",
          rating: 5,
          reviewDate: "2025-06-30T01:18:12.715Z",
          reviewId: 1534364564,
        },
        {
          authorName: "Kyle G",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          rating: 4,
          reviewDate: "2025-06-27T03:38:17.297Z",
          reviewId: 1533706271,
        },
        {
          authorName: "Bamboo Man",
          content: "Pretty good bamboo castle",
          rating: 4,
          reviewDate: "2025-06-22T04:01:49.024Z",
          reviewId: 1532737374,
        },
        {
          authorName: "Kyle E",
          content: "Fine castle",
          rating: 4,
          reviewDate: "2025-01-01T01:17:12.023Z",
          reviewId: 1534364512,
        },
      ],
    },
  ],
  locale: "en",
};

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
    document: testDocument,
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
    document: testDocument,
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
  {
    name: "version 10 props with French locale",
    document: { ...testDocument, locale: "fr" },
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
      const expandButton = page.getByText("Montrer plus");
      await act(async () => {
        await expandButton.click();
      });
      await delay(interactionsDelay);
    },
  },
  {
    name: "version 39 props with empty document",
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    cs: "Nedávné recenze",
                    da: "Nylige anmeldelser",
                    de: "Neuere Bewertungen",
                    en: "Recent Reviews",
                    "en-GB": "Recent Reviews",
                    es: "Revisiones recientes",
                    et: "Viimased ülevaated",
                    fi: "Viimeaikaiset arvostelut",
                    fr: "Revues récentes",
                    hr: "Nedavne recenzije",
                    hu: "Legutóbbi vélemények",
                    it: "Recensioni recenti",
                    ja: "最近のレビュー",
                    lt: "Naujausios apžvalgos",
                    lv: "Nesenie pārskati",
                    nb: "Nyere anmeldelser",
                    nl: "Recente beoordelingen",
                    pl: "Ostatnie recenzje",
                    pt: "Revisões recentes",
                    ro: "Recenzii recente",
                    sk: "Posledné recenzie",
                    sv: "Senaste recensioner",
                    tr: "Son İncelemeler",
                    zh: "最近的评论",
                    "zh-TW": "最近的評論",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "center" },
            },
          },
        ],
      },
      analytics: {
        scope: "reviewsSection",
      },
      liveVisibility: true,
    },
    version: 39,
  },
  {
    name: "version 39 props with document data",
    document: testDocument,
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    cs: "Nedávné recenze",
                    da: "Nylige anmeldelser",
                    de: "Neuere Bewertungen",
                    en: "Recent Reviews",
                    "en-GB": "Recent Reviews",
                    es: "Revisiones recientes",
                    et: "Viimased ülevaated",
                    fi: "Viimeaikaiset arvostelut",
                    fr: "Revues récentes",
                    hr: "Nedavne recenzije",
                    hu: "Legutóbbi vélemények",
                    it: "Recensioni recenti",
                    ja: "最近のレビュー",
                    lt: "Naujausios apžvalgos",
                    lv: "Nesenie pārskati",
                    nb: "Nyere anmeldelser",
                    nl: "Recente beoordelingen",
                    pl: "Ostatnie recenzje",
                    pt: "Revisões recentes",
                    ro: "Recenzii recente",
                    sk: "Posledné recenzie",
                    sv: "Senaste recensioner",
                    tr: "Son İncelemeler",
                    zh: "最近的评论",
                    "zh-TW": "最近的評論",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "center" },
            },
          },
        ],
      },
      analytics: {
        scope: "reviewsSection",
      },
      liveVisibility: true,
    },
    version: 39,
    interactions: async (page) => {
      const expandButton = page.getByText("Show more");
      await act(async () => {
        await expandButton.click();
      });
      await delay(interactionsDelay);
    },
  },
];

describe("ReviewsSection", async () => {
  const puckConfig: Config = {
    components: { ReviewsSection, ...SlotsCategoryComponents },
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
      let data = migrate(
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
        puckConfig,
        document
      );

      data = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const translations = await injectTranslations(document);

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document, translations }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

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
