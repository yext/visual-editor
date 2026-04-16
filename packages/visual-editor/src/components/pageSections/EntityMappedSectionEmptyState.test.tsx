import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render as reactRender,
  waitFor,
} from "@testing-library/react";
const { mockSelectEditorItem } = vi.hoisted(() => ({
  mockSelectEditorItem: vi.fn(),
}));

vi.mock("./useSelectEditorItem.ts", () => ({
  useSelectEditorItem: () => mockSelectEditorItem,
}));

import { FAQSection } from "./FAQsSection/FAQsSection.tsx";
import { PhotoGallerySection } from "./PhotoGallerySection/PhotoGallerySection.tsx";
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
import { EntityFieldSectionEmptyState } from "./EntityFieldSectionEmptyState.tsx";
import { getEditorItemId } from "./entityFieldSectionUtils.ts";

beforeEach(() => {
  mockSelectEditorItem.mockReset();
  mockSelectEditorItem.mockReturnValue(true);
});

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
    hasMappedContent: boolean;
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
    createRenderProps: ({ hasMappedContent, isEditing }) => {
      const props = cloneValue(FAQSection.defaultProps!);
      return {
        ...props,
        id: "FAQSection-test",
        conditionalRender: { hasMappedContent },
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
    createRenderProps: ({ hasMappedContent, isEditing }) => {
      const props = cloneValue(PhotoGallerySection.defaultProps!);
      return {
        ...props,
        id: "PhotoGallerySection-test",
        conditionalRender: {
          hasMappedContent,
          mappedFieldOwnerId: "PhotoGalleryWrapper-test",
        },
        puck: { isEditing },
        slots: {
          HeadingSlot: createSectionHeadingSlot(),
          PhotoGalleryWrapper: createCardsSlot("Gallery Images"),
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

      expect(resolved.props.conditionalRender.hasMappedContent).toBe(false);
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

      expect(resolved.props.conditionalRender.hasMappedContent).toBe(true);
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

      expect(resolved.props.conditionalRender.hasMappedContent).toBe(true);
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
          hasMappedContent: false,
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
          hasMappedContent: false,
          isEditing: true,
        }),
      });

      await waitFor(() => {
        expect(
          result.getByText(/Section hidden for this/i)
        ).toBeInTheDocument();
      });
      expect(result.getByText(/mapped field is empty/i)).toBeInTheDocument();
    });

    it("renders normally when mapped data exists", async () => {
      const result = renderSection({
        sectionConfig,
        props: createRenderProps({
          hasMappedContent: true,
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
    cardsWrapperContent: React.ReactNode;
    mappedFieldOwnerId?: string;
  }
) => {
  const props = cloneValue(sectionConfig.defaultProps!);
  return {
    ...props,
    id: `${sectionConfig.label}-test`,
    conditionalRender: {
      watchForMappedContentEmptyState: options.watchForMappedContentEmptyState,
      mappedFieldOwnerId: options.mappedFieldOwnerId ?? "CardsWrapperSlot-test",
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

      expect(resolved.props.conditionalRender.hasMappedContent).toBe(false);
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

      expect(resolved.props.conditionalRender.hasMappedContent).toBe(true);
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

      expect(resolved.props.conditionalRender.hasMappedContent).toBe(true);
    });

    it("renders an empty-state marker when mapped data is empty", () => {
      const result = reactRender(
        <>
          {wrapperConfig.render?.({
            ...createMappedWrapperProps(wrapperConfig, mappedField),
            conditionalRender: { hasMappedContent: false },
            slots: {
              CardSlot: createCardsSlot("Cards"),
            },
          } as any)}
        </>
      );

      expect(
        result.container.querySelector('[data-empty-state="true"]')
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
        cardsWrapperContent: <div data-empty-state="true" />,
      }),
    });

    await waitFor(() => {
      expect(result.container.childElementCount).toBe(0);
    });
  });

  it("shows the editor empty state when the mapped wrapper is empty", async () => {
    const result = renderSection({
      sectionConfig,
      props: createCardsSectionRenderProps(sectionConfig, {
        isEditing: true,
        watchForMappedContentEmptyState: true,
        cardsWrapperContent: <div data-empty-state="true" />,
      }),
    });

    await waitFor(() => {
      expect(result.getByText(/Section hidden for this/i)).toBeInTheDocument();
    });
    expect(result.getByText(/mapped field is empty/i)).toBeInTheDocument();
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
        cardsWrapperContent: <div data-empty-state="true" />,
      }),
    });

    await waitFor(() => {
      expect(result.getByText("Section Heading")).toBeInTheDocument();
    });
    expect(result.queryByText(/Section hidden for this/i)).toBeNull();
  });
});

describe("empty-state editor selection", () => {
  it("selects the FAQ section when the empty state is clicked", async () => {
    const result = renderSection({
      sectionConfig: FAQSection,
      props: directSectionCases[0].createRenderProps({
        hasMappedContent: false,
        isEditing: true,
      }),
    });

    const emptyState = await result.findByRole("button");
    fireEvent.click(emptyState);

    expect(mockSelectEditorItem).toHaveBeenCalledWith("FAQSection-test");
  });

  it("selects the photo gallery wrapper when the empty state is clicked", async () => {
    const result = renderSection({
      sectionConfig: PhotoGallerySection,
      props: directSectionCases[1].createRenderProps({
        hasMappedContent: false,
        isEditing: true,
      }),
    });

    const emptyState = await result.findByRole("button");
    fireEvent.click(emptyState);

    expect(mockSelectEditorItem).toHaveBeenCalledWith(
      "PhotoGalleryWrapper-test"
    );
  });

  it("selects the cards wrapper for wrapper-backed sections", async () => {
    const result = renderSection({
      sectionConfig: ProductSection,
      props: createCardsSectionRenderProps(ProductSection, {
        isEditing: true,
        watchForMappedContentEmptyState: true,
        cardsWrapperContent: <div data-empty-state="true" />,
        mappedFieldOwnerId: "ProductCardsWrapper-test",
      }),
    });

    const emptyState = await result.findByRole("button");
    fireEvent.click(emptyState);

    expect(mockSelectEditorItem).toHaveBeenCalledWith(
      "ProductCardsWrapper-test"
    );
  });

  it("supports keyboard activation with Enter and Space", () => {
    const result = reactRender(
      <VisualEditorProvider templateProps={{ document: { locale: "en" } }}>
        <EntityFieldSectionEmptyState targetItemId="FAQSection-test" />
      </VisualEditorProvider>
    );

    const emptyState = result.getByRole("button");
    fireEvent.keyDown(emptyState, { key: "Enter" });
    fireEvent.keyDown(emptyState, { key: " " });

    expect(mockSelectEditorItem).toHaveBeenNthCalledWith(1, "FAQSection-test");
    expect(mockSelectEditorItem).toHaveBeenNthCalledWith(2, "FAQSection-test");
  });

  it("prevents parent native click handlers from overriding the empty-state selection", () => {
    const parentClickHandler = vi.fn();

    const ParentWrapper = () => {
      const parentRef = React.useRef<HTMLDivElement>(null);

      React.useEffect(() => {
        const element = parentRef.current;

        if (!element) {
          return;
        }

        element.addEventListener("click", parentClickHandler);

        return () => {
          element.removeEventListener("click", parentClickHandler);
        };
      }, []);

      return (
        <div ref={parentRef}>
          <VisualEditorProvider templateProps={{ document: { locale: "en" } }}>
            <EntityFieldSectionEmptyState targetItemId="FAQSection-test" />
          </VisualEditorProvider>
        </div>
      );
    };

    const result = reactRender(<ParentWrapper />);

    fireEvent.click(result.getByRole("button"));

    expect(parentClickHandler).not.toHaveBeenCalled();
    expect(mockSelectEditorItem).toHaveBeenCalledWith("FAQSection-test");
  });

  it("stays non-interactive when no target item id is available", () => {
    const result = reactRender(
      <VisualEditorProvider templateProps={{ document: { locale: "en" } }}>
        <EntityFieldSectionEmptyState />
      </VisualEditorProvider>
    );

    expect(result.queryByRole("button")).toBeNull();
    expect(result.getByText(/Section hidden for this/i)).toBeInTheDocument();
  });
});

describe("getEditorItemId", () => {
  it("prefers props.id because that is the id Puck uses for selection", () => {
    expect(
      getEditorItemId({
        id: "top-level-id",
        props: {
          id: "props-id",
        },
      })
    ).toBe("props-id");
  });
});
