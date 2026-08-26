/** The config passed to Puck AI will be filtered to the components listed here. */
export const enabledAiComponents = ["TestHero", "TestBanner"] as const;

export const enabledAiComponentSet = new Set<string>(enabledAiComponents);

/** A server-safe reference used when the host config has no AI-enabled components. */
export const aiReferenceComponents = {
  TestHero: {
    label: "Test Hero",
    fields: {
      title: {
        type: "testEntityField",
        label: "Title",
        filter: { types: ["type.string"] },
        output: "plainText",
      },
      description: {
        type: "testRichText",
        label: "Description",
        filter: { types: ["type.string", "type.rich_text_v2"] },
      },
      image: {
        type: "testImage",
        label: "Image",
        filter: { types: ["type.image"] },
      },
      primarycta: { type: "testCTA", label: "Primary CTA" },
      secondarycta: { type: "testCTA", label: "Secondary CTA" },
    },
    defaultProps: {
      title: {
        field: "name",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "",
        constantValue: "<p>Discover what makes [[name]] worth the trip.</p>",
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
          alternateText: "",
        },
        constantValueEnabled: true,
      },
      primarycta: {
        field: "",
        constantValue: {
          ctaType: "textAndLink",
          label: "Book Now",
          link: "/book",
          linkType: "URL",
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
      secondarycta: {
        field: "",
        constantValue: {
          ctaType: "textAndLink",
          label: "Learn More",
          link: "/learn-more",
          linkType: "URL",
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
    },
  },
  TestBanner: {
    label: "Test Banner",
    fields: {
      title: {
        type: "testEntityField",
        label: "Title",
        filter: { types: ["type.string"] },
        output: "plainText",
      },
      description: {
        type: "testRichText",
        label: "Description",
        filter: { types: ["type.string", "type.rich_text_v2"] },
      },
      primarycta: { type: "testCTA", label: "Primary CTA" },
    },
    defaultProps: {
      title: {
        field: "name",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "",
        constantValue:
          "<p>Use this compact banner as a reference for generated banner sections.</p>",
        constantValueEnabled: true,
      },
      primarycta: {
        field: "",
        constantValue: {
          ctaType: "textAndLink",
          label: "Get Started",
          link: "/get-started",
          linkType: "URL",
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
    },
  },
};
