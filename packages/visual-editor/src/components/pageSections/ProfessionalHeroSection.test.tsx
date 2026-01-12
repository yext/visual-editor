import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  ProfessionalHeroSection,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";

const defaultProps = ProfessionalHeroSection.defaultProps!;

const testDocument = {
  locale: "en",
  name: "Dr. Jane Doe",
  address: {
    line1: "123 Main St",
    city: "New York",
    postalCode: "10001",
    countryCode: "US",
  },
  mainPhone: "+15551234567",
  emails: ["jane.doe@example.com"],
  ref_reviewsAgg: [
    {
      averageRating: 4.8,
      publisher: "FIRSTPARTY",
      reviewCount: 150,
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with no data",
    document: {
      locale: "en",
    },
    props: { ...defaultProps },
    version: 0,
  },
  {
    name: "default props with data",
    document: testDocument,
    props: { ...defaultProps },
    version: 0,
  },
  {
    name: "no image",
    document: testDocument,
    props: {
      ...defaultProps,
      styles: {
        ...defaultProps.styles,
        showImage: false,
      },
    },
    version: 0,
  },
  {
    name: "image right desktop, image bottom mobile",
    document: testDocument,
    props: {
      ...defaultProps,
      styles: {
        ...defaultProps.styles,
        desktopImagePosition: "right",
        mobileImagePosition: "bottom",
      },
    },
    version: 0,
  },
  {
    name: "hide average review",
    document: testDocument,
    props: {
      ...defaultProps,
      styles: {
        ...defaultProps.styles,
        showAverageReview: false,
      },
    },
    version: 0,
  },
];

describe("ProfessionalHeroSection", () => {
  transformTests(tests).forEach((test) => {
    it(test.name, async () => {
      const config: Config = {
        components: {
          ProfessionalHeroSection,
          ...SlotsCategoryComponents,
        },
      };

      const data = {
        root: { props: { title: "Test" } },
        content: [
          {
            type: "ProfessionalHeroSection",
            props: test.props,
          },
        ],
      };

      const resolvedData = await resolveAllData(data, config, {
        metadata: {
          streamDocument: test.document,
        },
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document: test.document }}>
          <Render config={config} data={resolvedData} />
        </VisualEditorProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Basic assertions
      if (test.props.styles.showImage !== false) {
        expect(container.querySelector("img")).toBeInTheDocument();
      }

      expect(container).toBeInTheDocument();
    });
  });
});
