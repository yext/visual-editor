import * as React from "react";
import { describe, expect, it } from "vitest";
import { render as reactRender, waitFor } from "@testing-library/react";
import { FAQSection } from "./FAQsSection/FAQsSection.tsx";
import { PhotoGallerySection } from "./PhotoGallerySection/PhotoGallerySection.tsx";
import { PhotoGalleryWrapper } from "./PhotoGallerySection/PhotoGalleryWrapper.tsx";
import { TestimonialSection } from "./TestimonialSection/TestimonialSection.tsx";
import { TestimonialCardsWrapper } from "./TestimonialSection/TestimonialCardsWrapper.tsx";
import { ProductSection } from "./ProductSection/ProductSection.tsx";
import { ProductCardsWrapper } from "./ProductSection/ProductCardsWrapper.tsx";
import { TeamSection } from "./TeamSection/TeamSection.tsx";
import { TeamCardsWrapper } from "./TeamSection/TeamCardsWrapper.tsx";
import { EventSection } from "./EventSection/EventSection.tsx";
import { EventCardsWrapper } from "./EventSection/EventCardsWrapper.tsx";
import { InsightSection } from "./InsightSection/InsightSection.tsx";
import { InsightCardsWrapper } from "./InsightSection/InsightCardsWrapper.tsx";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { EntityFieldSectionEmptyStateBox } from "./EntityFieldSectionEmptyState.tsx";
import {
  EmptyStateMarker,
  EMPTY_STATE_MARKER_SELECTOR,
} from "./emptyStateMarker.tsx";

const cloneValue = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

const createSlot = (content: React.ReactNode) => {
  return (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props}>{content}</div>;
  };
};

const createSectionHeadingSlot = () => createSlot("Section Heading");
const createCardsSlot = (content: React.ReactNode) => createSlot(content);

const SectionRenderer = ({
  sectionConfig,
  props,
}: {
  sectionConfig: { render?: (props: any) => React.ReactNode };
  props: Record<string, any>;
}) => {
  return <>{sectionConfig.render?.(props)}</>;
};

const renderSection = ({
  sectionConfig,
  props,
  document = { locale: "en" },
}: {
  sectionConfig: { render?: (props: any) => React.ReactNode };
  props: Record<string, any>;
  document?: Record<string, any>;
}) => {
  return reactRender(
    <VisualEditorProvider templateProps={{ document }}>
      <SectionRenderer sectionConfig={sectionConfig} props={props} />
    </VisualEditorProvider>
  );
};

type DirectSectionCase = {
  sectionName: string;
  sectionConfig: typeof FAQSection | typeof PhotoGallerySection;
  createMappedProps: () => Record<string, any>;
  createConstantEmptyProps: () => Record<string, any>;
  emptyDocument: Record<string, any>;
  populatedDocument: Record<string, any>;
  createRenderProps: (options: {
    isMappedContentEmpty: boolean;
    isEditing: boolean;
  }) => Record<string, any>;
  visibleContentText: string;
};

const directSectionCases: DirectSectionCase[] = [
  {
    sectionName: "FAQ Section",
    sectionConfig: FAQSection,
    createMappedProps: () => {
      const props = cloneValue(FAQSection.defaultProps!);
      props.data.field = "c_faq";
      props.data.constantValueEnabled = false;
      props.data.constantValue = [];
      return props;
    },
    createConstantEmptyProps: () => {
      const props = cloneValue(FAQSection.defaultProps!);
      props.data.field = "";
      props.data.constantValueEnabled = true;
      props.data.constantValue = [];
      props.slots.CardSlot = [];
      return props;
    },
    emptyDocument: {
      locale: "en",
    },
    populatedDocument: {
      locale: "en",
      c_faq: {
        faqs: [
          {
            question: "What services do you offer?",
            answer: { html: "<p>Delivery and dine in.</p>" },
          },
        ],
      },
    },
    createRenderProps: ({ isMappedContentEmpty, isEditing }) => {
      const props = cloneValue(FAQSection.defaultProps!);
      return {
        ...props,
        id: "FAQSection-test",
        conditionalRender: isMappedContentEmpty
          ? { isMappedContentEmpty: true }
          : undefined,
        puck: { isEditing },
        slots: {
          HeadingSlot: createSectionHeadingSlot(),
          CardSlot: createCardsSlot("FAQ Cards"),
        },
      };
    },
    visibleContentText: "FAQ Cards",
  },
  {
    sectionName: "Photo Gallery Section",
    sectionConfig: PhotoGallerySection,
    createMappedProps: () => {
      const props = cloneValue(PhotoGallerySection.defaultProps!);
      props.slots.PhotoGalleryWrapper[0].props.data.images.field =
        "photoGallery";
      props.slots.PhotoGalleryWrapper[0].props.data.images.constantValueEnabled = false;
      props.slots.PhotoGalleryWrapper[0].props.data.images.constantValue = [];
      return props;
    },
    createConstantEmptyProps: () => {
      const props = cloneValue(PhotoGallerySection.defaultProps!);
      props.slots.PhotoGalleryWrapper[0].props.data.images.field = "";
      props.slots.PhotoGalleryWrapper[0].props.data.images.constantValueEnabled = true;
      props.slots.PhotoGalleryWrapper[0].props.data.images.constantValue = [];
      return props;
    },
    emptyDocument: {
      locale: "en",
      photoGallery: [],
    },
    populatedDocument: {
      locale: "en",
      photoGallery: [
        {
          image: {
            url: "https://example.com/gallery.jpg",
            width: 1000,
            height: 570,
          },
        },
      ],
    },
    createRenderProps: ({ isMappedContentEmpty, isEditing }) => {
      const props = cloneValue(PhotoGallerySection.defaultProps!);
      return {
        ...props,
        id: "PhotoGallerySection-test",
        conditionalRender: isMappedContentEmpty
          ? { isMappedContentEmpty: true }
          : undefined,
        puck: { isEditing },
        slots: {
          HeadingSlot: createSectionHeadingSlot(),
          PhotoGalleryWrapper: createCardsSlot(
            isMappedContentEmpty ? (
              <EntityFieldSectionEmptyStateBox showEmptyStateMarker />
            ) : (
              "Gallery Images"
            )
          ),
        },
      };
    },
    visibleContentText: "Gallery Images",
  },
];

describe.each(directSectionCases)(
  "$sectionName resolveData",
  ({
    sectionConfig,
    createMappedProps,
    createConstantEmptyProps,
    emptyDocument,
    populatedDocument,
  }) => {
    it("marks mapped empty entity data as hidden", () => {
      const resolved = sectionConfig.resolveData?.(
        {
          type: sectionConfig.label,
          props: createMappedProps(),
        } as any,
        {
          metadata: {
            streamDocument: emptyDocument,
          },
        } as any
      ) as any;

      expect(resolved.props.conditionalRender?.isMappedContentEmpty).toBe(true);
    });

    it("keeps mapped sections visible when entity data exists", () => {
      const resolved = sectionConfig.resolveData?.(
        {
          type: sectionConfig.label,
          props: createMappedProps(),
        } as any,
        {
          metadata: {
            streamDocument: populatedDocument,
          },
        } as any
      ) as any;

      expect(resolved.props.conditionalRender).toBeUndefined();
    });

    it("does not auto-hide constant-value mode", () => {
      const resolved = sectionConfig.resolveData?.(
        {
          type: sectionConfig.label,
          props: createConstantEmptyProps(),
        } as any,
        {
          metadata: {
            streamDocument: emptyDocument,
          },
        } as any
      ) as any;

      expect(resolved.props.conditionalRender).toBeUndefined();
    });
  }
);

describe.each(directSectionCases)(
  "$sectionName render",
  ({ sectionConfig, createRenderProps, visibleContentText }) => {
    it("renders nothing on the live page when mapped data is empty", async () => {
      const result = renderSection({
        sectionConfig,
        props: createRenderProps({
          isMappedContentEmpty: true,
          isEditing: false,
        }),
      });

      await waitFor(() => {
        expect(result.container.childElementCount).toBe(0);
      });
    });

    it("shows the editor empty state when mapped data is empty", async () => {
      const result = renderSection({
        sectionConfig,
        props: createRenderProps({
          isMappedContentEmpty: true,
          isEditing: true,
        }),
      });

      await waitFor(() => {
        expect(
          result.getByText(/Section hidden for this/i)
        ).toBeInTheDocument();
      });
      expect(result.getByText(/mapped field is empty/i)).toBeInTheDocument();
      expect(result.getByText("Section Heading")).toBeInTheDocument();
    });

    it("renders normally when mapped data exists", async () => {
      const result = renderSection({
        sectionConfig,
        props: createRenderProps({
          isMappedContentEmpty: false,
          isEditing: false,
        }),
      });

      await waitFor(() => {
        expect(result.getByText(visibleContentText)).toBeInTheDocument();
      });
      expect(result.queryByText(/Section hidden for this/i)).toBeNull();
    });
  }
);

type WrapperCase = {
  sectionName: string;
  sectionConfig:
    | typeof TestimonialSection
    | typeof ProductSection
    | typeof TeamSection
    | typeof EventSection
    | typeof InsightSection;
  wrapperName: string;
  wrapperConfig:
    | typeof TestimonialCardsWrapper
    | typeof ProductCardsWrapper
    | typeof TeamCardsWrapper
    | typeof EventCardsWrapper
    | typeof InsightCardsWrapper;
  mappedField: string;
  populatedDocument: Record<string, any>;
};

const wrapperCases: WrapperCase[] = [
  {
    sectionName: "Testimonial Section",
    sectionConfig: TestimonialSection,
    wrapperName: "Testimonial Cards Wrapper",
    wrapperConfig: TestimonialCardsWrapper,
    mappedField: "c_testimonials",
    populatedDocument: {
      locale: "en",
      c_testimonials: {
        testimonials: [
          {
            contributorName: "Jane",
            contributionDate: "2025-01-01",
            description: { html: "<p>Excellent service.</p>" },
          },
        ],
      },
    },
  },
  {
    sectionName: "Product Section",
    sectionConfig: ProductSection,
    wrapperName: "Product Cards Wrapper",
    wrapperConfig: ProductCardsWrapper,
    mappedField: "c_products",
    populatedDocument: {
      locale: "en",
      c_products: {
        products: [{ name: "Galaxy Burger" }],
      },
    },
  },
  {
    sectionName: "Team Section",
    sectionConfig: TeamSection,
    wrapperName: "Team Cards Wrapper",
    wrapperConfig: TeamCardsWrapper,
    mappedField: "c_team",
    populatedDocument: {
      locale: "en",
      c_team: {
        people: [{ name: "Captain Cosmo" }],
      },
    },
  },
  {
    sectionName: "Event Section",
    sectionConfig: EventSection,
    wrapperName: "Event Cards Wrapper",
    wrapperConfig: EventCardsWrapper,
    mappedField: "c_events",
    populatedDocument: {
      locale: "en",
      c_events: {
        events: [{ title: "Cooking Class" }],
      },
    },
  },
  {
    sectionName: "Insight Section",
    sectionConfig: InsightSection,
    wrapperName: "Insight Cards Wrapper",
    wrapperConfig: InsightCardsWrapper,
    mappedField: "c_insights",
    populatedDocument: {
      locale: "en",
      c_insights: {
        insights: [{ title: "Menu Trends" }],
      },
    },
  },
];

const createMappedWrapperProps = (
  wrapperConfig: WrapperCase["wrapperConfig"],
  mappedField: string
) => {
  const props = cloneValue(wrapperConfig.defaultProps!);
  props.data.field = mappedField;
  props.data.constantValueEnabled = false;
  props.data.constantValue = [];
  return props;
};

const createConstantEmptyWrapperProps = (
  wrapperConfig: WrapperCase["wrapperConfig"]
) => {
  const props = cloneValue(wrapperConfig.defaultProps!);
  props.data.field = "";
  props.data.constantValueEnabled = true;
  props.data.constantValue = [];
  props.slots.CardSlot = [];
  return props;
};

const createCardsSectionRenderProps = (
  sectionConfig: WrapperCase["sectionConfig"],
  options: {
    isEditing: boolean;
    watchForMappedContentEmptyState: boolean;
    initialMappedContentEmpty?: boolean;
    cardsWrapperContent: React.ReactNode;
  }
) => {
  const props = cloneValue(sectionConfig.defaultProps!);
  return {
    ...props,
    id: `${sectionConfig.label}-test`,
    conditionalRender: {
      watchForMappedContentEmptyState: options.watchForMappedContentEmptyState,
      initialMappedContentEmpty: options.initialMappedContentEmpty,
    },
    puck: { isEditing: options.isEditing },
    slots: {
      SectionHeadingSlot: createSectionHeadingSlot(),
      CardsWrapperSlot: createCardsSlot(options.cardsWrapperContent),
    },
  };
};

describe.each(wrapperCases)(
  "$wrapperName resolveData",
  ({ wrapperConfig, mappedField, populatedDocument }) => {
    it("marks mapped empty entity data as hidden", () => {
      const resolved = wrapperConfig.resolveData?.(
        {
          type: wrapperConfig.label,
          props: createMappedWrapperProps(wrapperConfig, mappedField),
        } as any,
        {
          metadata: {
            streamDocument: { locale: "en" },
          },
        } as any
      ) as any;

      expect(resolved.props.conditionalRender?.isMappedContentEmpty).toBe(true);
      expect(resolved.props.slots.CardSlot).toEqual([]);
    });

    it("keeps mapped wrappers visible when entity data exists", () => {
      const resolved = wrapperConfig.resolveData?.(
        {
          type: wrapperConfig.label,
          props: createMappedWrapperProps(wrapperConfig, mappedField),
        } as any,
        {
          metadata: {
            streamDocument: populatedDocument,
          },
        } as any
      ) as any;

      expect(resolved.props.conditionalRender).toBeUndefined();
      expect(resolved.props.slots.CardSlot.length).toBeGreaterThan(0);
    });

    it("does not auto-hide constant-value mode", () => {
      const resolved = wrapperConfig.resolveData?.(
        {
          type: wrapperConfig.label,
          props: createConstantEmptyWrapperProps(wrapperConfig),
        } as any,
        {
          metadata: {
            streamDocument: { locale: "en" },
          },
        } as any
      ) as any;

      expect(resolved.props.conditionalRender).toBeUndefined();
    });

    it("renders an empty-state marker when mapped data is empty", () => {
      const result = reactRender(
        <>
          {wrapperConfig.render?.({
            ...createMappedWrapperProps(wrapperConfig, mappedField),
            conditionalRender: { isMappedContentEmpty: true },
            puck: { isEditing: false },
            slots: {
              CardSlot: createCardsSlot("Cards"),
            },
          } as any)}
        </>
      );

      expect(
        result.container.querySelector(EMPTY_STATE_MARKER_SELECTOR)
      ).not.toBeNull();
    });
  }
);

describe.each(wrapperCases)("$sectionName render", ({ sectionConfig }) => {
  it("renders nothing on the live page when the mapped wrapper is empty", async () => {
    const result = renderSection({
      sectionConfig,
      props: createCardsSectionRenderProps(sectionConfig, {
        isEditing: false,
        watchForMappedContentEmptyState: true,
        initialMappedContentEmpty: true,
        cardsWrapperContent: <EmptyStateMarker />,
      }),
    });

    expect(result.queryByText("Section Heading")).toBeNull();
    expect(result.queryByText(/Section hidden for this/i)).toBeNull();

    await waitFor(() => {
      expect(result.queryByText("Section Heading")).toBeNull();
      expect(result.queryByText(/Section hidden for this/i)).toBeNull();
    });
  });

  it("shows the editor empty state when the mapped wrapper is empty", async () => {
    const result = renderSection({
      sectionConfig,
      props: createCardsSectionRenderProps(sectionConfig, {
        isEditing: true,
        watchForMappedContentEmptyState: true,
        cardsWrapperContent: (
          <EntityFieldSectionEmptyStateBox showEmptyStateMarker />
        ),
      }),
    });

    await waitFor(() => {
      expect(result.getByText(/Section hidden for this/i)).toBeInTheDocument();
    });
    expect(result.getByText(/mapped field is empty/i)).toBeInTheDocument();
    expect(result.getByText("Section Heading")).toBeInTheDocument();
  });

  it("renders normally when the mapped wrapper has content", async () => {
    const result = renderSection({
      sectionConfig,
      props: createCardsSectionRenderProps(sectionConfig, {
        isEditing: false,
        watchForMappedContentEmptyState: true,
        cardsWrapperContent: <div>Cards</div>,
      }),
    });

    await waitFor(() => {
      expect(result.getByText("Cards")).toBeInTheDocument();
    });
    expect(result.queryByText(/Section hidden for this/i)).toBeNull();
  });

  it("does not auto-hide when mapped empty-state watching is disabled", async () => {
    const result = renderSection({
      sectionConfig,
      props: createCardsSectionRenderProps(sectionConfig, {
        isEditing: false,
        watchForMappedContentEmptyState: false,
        cardsWrapperContent: (
          <EntityFieldSectionEmptyStateBox showEmptyStateMarker />
        ),
      }),
    });

    await waitFor(() => {
      expect(result.getByText("Section Heading")).toBeInTheDocument();
    });
    expect(result.getByText(/Section hidden for this/i)).toBeInTheDocument();
  });
});

describe("Photo Gallery Wrapper render", () => {
  it("shows the empty-state box in the editor when mapped images are empty", () => {
    const props = cloneValue(PhotoGalleryWrapper.defaultProps!);
    props.data.images.field = "photoGallery";
    props.data.images.constantValueEnabled = false;
    props.data.images.constantValue = [];

    const result = reactRender(
      <VisualEditorProvider
        templateProps={{ document: { locale: "en", photoGallery: [] } }}
      >
        {PhotoGalleryWrapper.render?.({
          ...props,
          puck: { isEditing: true },
        } as any)}
      </VisualEditorProvider>
    );

    expect(result.getByText(/Section hidden for this/i)).toBeInTheDocument();
    expect(
      result.container.querySelector(EMPTY_STATE_MARKER_SELECTOR)
    ).not.toBeNull();
  });
});
